'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import {
  BufferAttribute,
  BufferGeometry,
  ClampToEdgeWrapping,
  Color,
  DataTexture,
  FloatType,
  NearestFilter,
  NormalBlending,
  Points,
  RGBAFormat,
  ShaderMaterial,
  Vector3,
  type Camera,
  type PerspectiveCamera,
  type WebGLRenderer,
} from 'three';
import type { PointerNdc } from '@/lib/use-pointer-ndc';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js';
import { CURSOR, PALETTE, PARTICLES, TRANSITION } from '@/lib/lab-constants';
import curlNoiseSource from '@/shaders/lib/curl-noise.glsl';
import simplexNoiseSource from '@/shaders/lib/simplex-noise-3d.glsl';
import particlesFragment from '@/shaders/particles.frag.glsl';
import particlesVertex from '@/shaders/particles.vert.glsl';
import simulationSource from '@/shaders/simulation-position.frag.glsl';

/**
 * Шейдеры лежат по файлам и склеиваются здесь: GLSL не знает про #include,
 * а порядок обязан быть таким — сначала шум, потом ротор, потом симуляция.
 */
const SIMULATION_FRAGMENT = [simplexNoiseSource, curlNoiseSource, simulationSource].join('\n\n');

const STATS_INTERVAL_SECONDS = 0.5;

export interface ParticleFieldProps {
  /** Сторона симуляционной текстуры: частиц будет textureSize². */
  textureSize: number;
  /** Курсор в NDC. Читается в цикле кадра, перерисовок React не вызывает. */
  pointer?: RefObject<PointerNdc>;
  /** Сила отталкивания; 0 — курсор поле не трогает. */
  cursorStrength?: number;
  /**
   * «Энергия» перехода от 0 до 1. Читается в кадровом цикле, поэтому это ref,
   * а не значение: смена раздела не должна перерисовывать сцену.
   */
  energy?: RefObject<{ value: number }>;
  /** Вызывается примерно дважды в секунду с замером кадра. */
  onStats?: (stats: { fps: number }) => void;
}

export function ParticleField({
  textureSize,
  pointer,
  cursorStrength = CURSOR.strength,
  energy,
  onStats,
}: ParticleFieldProps) {
  const renderer = useThree((state) => state.gl);
  const pixelRatio = useThree((state) => state.viewport.dpr);

  const simulation = useMemo(
    () => createSimulation(renderer, textureSize),
    [renderer, textureSize],
  );

  useEffect(() => () => simulation.dispose(), [simulation]);

  useEffect(() => {
    simulation.pointsUniforms.uPixelRatio.value = pixelRatio;
  }, [simulation, pixelRatio]);

  const frames = useRef(0);
  const elapsedSinceReport = useRef(0);
  const smoothedCursor = useRef({ x: CURSOR.parkedDistance, y: CURSOR.parkedDistance });

  useFrame((state, delta) => {
    // Симуляция и рендер идут одним циклом react-three-fiber: своего
    // requestAnimationFrame здесь нет и быть не должно.
    const step = Math.min(delta, PARTICLES.maxDeltaSeconds);
    const { simulationUniforms, pointsUniforms, gpu, positionVariable } = simulation;

    simulationUniforms.uTime.value = state.clock.elapsedTime;
    simulationUniforms.uDelta.value = step;

    const pointerState = pointer?.current;
    const pointerActive = pointerState?.active === true;

    if (pointerState) {
      const target = pointerActive
        ? ndcToWorldPlane(pointerState, state.camera, state.size.width / state.size.height)
        : { x: CURSOR.parkedDistance, y: CURSOR.parkedDistance };

      // Кадронезависимое сглаживание: на 30 fps курсор догоняет за то же
      // время, что и на 144, — иначе инерция зависела бы от железа.
      const factor = 1 - Math.pow(1 - CURSOR.lerp, delta * 60);
      smoothedCursor.current.x += (target.x - smoothedCursor.current.x) * factor;
      smoothedCursor.current.y += (target.y - smoothedCursor.current.y) * factor;

      simulationUniforms.uCursor.value.set(smoothedCursor.current.x, smoothedCursor.current.y, 0);
    }

    simulationUniforms.uCursorStrength.value = pointerActive ? cursorStrength : 0;

    // Реакция поля на переход: частицы ускоряются и завихрения мельчают.
    // Симуляция при этом не перезапускается — меняются только параметры,
    // поэтому сцена остаётся непрерывной от раздела к разделу.
    const transitionEnergy = energy?.current.value ?? 0;
    simulationUniforms.uSpeed.value =
      PARTICLES.speed * (1 + transitionEnergy * TRANSITION.turbulence);
    simulationUniforms.uCurlScale.value =
      PARTICLES.curlScale * (1 + transitionEnergy * TRANSITION.curlSpike);

    gpu.compute();
    pointsUniforms.uPositions.value = gpu.getCurrentRenderTarget(positionVariable).texture;

    if (!onStats) {
      return;
    }

    frames.current += 1;
    elapsedSinceReport.current += delta;

    if (elapsedSinceReport.current >= STATS_INTERVAL_SECONDS) {
      onStats({ fps: Math.round(frames.current / elapsedSinceReport.current) });
      frames.current = 0;
      elapsedSinceReport.current = 0;
    }
  });

  return <primitive object={simulation.points} />;
}

/**
 * NDC → мировые координаты на плоскости z = 0, где живут частицы.
 * Проецировать через raycaster избыточно: плоскость одна и перпендикулярна
 * взгляду, так что достаточно половины высоты кадра на расстоянии камеры.
 */
function ndcToWorldPlane(
  pointer: PointerNdc,
  camera: Camera,
  aspect: number,
): { x: number; y: number } {
  const perspective = camera as PerspectiveCamera;
  const halfHeight = Math.tan((perspective.fov * Math.PI) / 360) * perspective.position.z;

  return { x: pointer.x * halfHeight * aspect, y: pointer.y * halfHeight };
}

function createSimulation(renderer: WebGLRenderer, size: number) {
  const count = size * size;
  const gpu = new GPUComputationRenderer(size, size, renderer);

  // Один засев на две текстуры: рабочую, которую перезаписывает симуляция,
  // и неизменную «исходную», куда частица возвращается в конце жизни.
  const seed = seedParticles(count);

  const positionTexture = gpu.createTexture();
  (positionTexture.image.data as Float32Array).set(seed);

  const originTexture = new DataTexture(seed.slice(), size, size, RGBAFormat, FloatType);
  // Ближайшая фильтрация обязательна: линейная на float-текстурах требует
  // расширения, которого может не быть, а выборка идёт точно по текселям.
  originTexture.minFilter = NearestFilter;
  originTexture.magFilter = NearestFilter;
  originTexture.wrapS = ClampToEdgeWrapping;
  originTexture.wrapT = ClampToEdgeWrapping;
  originTexture.needsUpdate = true;

  const positionVariable = gpu.addVariable('texturePosition', SIMULATION_FRAGMENT, positionTexture);
  gpu.setVariableDependencies(positionVariable, [positionVariable]);

  const simulationUniforms = positionVariable.material.uniforms;
  simulationUniforms.uTime = { value: 0 };
  simulationUniforms.uDelta = { value: 0 };
  simulationUniforms.uOrigin = { value: originTexture };
  simulationUniforms.uCurlScale = { value: PARTICLES.curlScale };
  simulationUniforms.uCurlDrift = { value: PARTICLES.curlDrift };
  simulationUniforms.uSpeed = { value: PARTICLES.speed };
  simulationUniforms.uLifeDecay = { value: PARTICLES.lifeDecayPerSecond };
  simulationUniforms.uCursor = { value: new Vector3(1e3, 1e3, 0) };
  simulationUniforms.uCursorRadius = { value: CURSOR.radius };
  simulationUniforms.uCursorStrength = { value: CURSOR.strength };

  const error = gpu.init();
  if (error !== null) {
    throw new Error(`GPGPU не инициализировался: ${error}`);
  }

  const geometry = buildGeometry(size);

  const pointsUniforms = {
    uPositions: { value: gpu.getCurrentRenderTarget(positionVariable).texture },
    uPointSize: { value: PARTICLES.pointSize },
    uPixelRatio: { value: 1 },
    uColor: { value: new Color(PALETTE.blueprint) },
    uOpacity: { value: PARTICLES.opacity },
  };

  const material = new ShaderMaterial({
    vertexShader: particlesVertex,
    fragmentShader: particlesFragment,
    uniforms: pointsUniforms,
    transparent: true,
    // Точки копятся в плотность, а не спорят за глубину: сортировать
    // сотни тысяч прозрачных спрайтов бессмысленно и дорого.
    depthWrite: false,
    blending: NormalBlending,
  });

  const points = new Points(geometry, material);
  points.frustumCulled = false;

  return {
    gpu,
    positionVariable,
    simulationUniforms: simulationUniforms as {
      uTime: { value: number };
      uDelta: { value: number };
      uCursor: { value: Vector3 };
      uCursorStrength: { value: number };
      uSpeed: { value: number };
      uCurlScale: { value: number };
    },
    pointsUniforms,
    points,
    dispose() {
      geometry.dispose();
      material.dispose();
      originTexture.dispose();
      gpu.dispose();
    },
  };
}

/** Стартовое облако: позиция в габаритах и случайная фаза жизни. */
function seedParticles(count: number): Float32Array {
  const seed = new Float32Array(count * 4);

  for (let index = 0; index < count; index += 1) {
    const offset = index * 4;
    seed[offset] = (Math.random() * 2 - 1) * PARTICLES.bounds.x;
    seed[offset + 1] = (Math.random() * 2 - 1) * PARTICLES.bounds.y;
    seed[offset + 2] = (Math.random() * 2 - 1) * PARTICLES.bounds.z;
    // Фазы разведены, иначе всё поле возрождалось бы одним кадром.
    seed[offset + 3] = Math.random();
  }

  return seed;
}

/**
 * Геометрия не хранит координат: только ссылку в текстуру симуляции.
 * Атрибут `position` нужен three, чтобы знать число вершин, и остаётся нулевым.
 */
function buildGeometry(size: number): BufferGeometry {
  const count = size * size;
  const references = new Float32Array(count * 2);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const index = (y * size + x) * 2;
      references[index] = (x + 0.5) / size;
      references[index + 1] = (y + 0.5) / size;
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(count * 3), 3));
  geometry.setAttribute('aReference', new BufferAttribute(references, 2));

  return geometry;
}
