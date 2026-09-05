'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, type RefObject } from 'react';
import {
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  WebGLRenderTarget,
} from 'three';
import { GLITCH } from '@/lib/lab-constants';
import fullscreenVertex from '@/shaders/fullscreen.vert.glsl';
import glitchFragment from '@/shaders/glitch.frag.glsl';

/**
 * Постпроцесс-проход глитча, написанный руками, без библиотеки композера:
 * проход ровно один, а любой готовый композер притащил бы менеджер пассов,
 * копии буферов и свой цикл — за то, что здесь укладывается в один рендер.
 *
 * Приоритет 1 отбирает у react-three-fiber автоматический рендер: сцену
 * рисуем сами. Симуляция частиц идёт с приоритетом по умолчанию, то есть
 * раньше, — порядок гарантирован сортировкой подписок.
 */
export function GlitchPass({ intensity }: { intensity: RefObject<{ value: number }> }) {
  const size = useThree((state) => state.size);
  const dpr = useThree((state) => state.viewport.dpr);

  const pass = useMemo(() => {
    const target = new WebGLRenderTarget(1, 1);

    const material = new ShaderMaterial({
      vertexShader: fullscreenVertex,
      fragmentShader: glitchFragment,
      uniforms: {
        tDiffuse: { value: target.texture },
        uIntensity: { value: 0 },
        uTime: { value: 0 },
        uRgbSplit: { value: GLITCH.rgbSplit },
        uBlockShift: { value: GLITCH.blockShift },
        uBlockHeight: { value: GLITCH.blockHeight },
      },
      depthTest: false,
      depthWrite: false,
    });

    const mesh = new Mesh(new PlaneGeometry(2, 2), material);
    mesh.frustumCulled = false;

    const scene = new Scene();
    scene.add(mesh);

    return { target, material, mesh, scene, camera: new OrthographicCamera(-1, 1, 1, -1, 0, 1) };
  }, []);

  useEffect(() => {
    pass.target.setSize(size.width * dpr, size.height * dpr);
  }, [pass, size, dpr]);

  useEffect(
    () => () => {
      pass.target.dispose();
      pass.material.dispose();
      pass.mesh.geometry.dispose();
    },
    [pass],
  );

  useFrame(({ gl, scene, camera, clock }) => {
    const value = intensity.current.value;

    // В покое прохода нет вовсе: рендерить весь экран во второй раз ради
    // нулевого эффекта — платить за то, чего не видно.
    if (value <= 0.001) {
      gl.setRenderTarget(null);
      gl.render(scene, camera);
      return;
    }

    gl.setRenderTarget(pass.target);
    gl.render(scene, camera);
    gl.setRenderTarget(null);

    pass.material.uniforms.uIntensity.value = value;
    pass.material.uniforms.uTime.value = clock.elapsedTime;
    gl.render(pass.scene, pass.camera);
  }, 1);

  return null;
}
