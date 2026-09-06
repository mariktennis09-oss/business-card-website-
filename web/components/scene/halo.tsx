'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import {
  AdditiveBlending,
  CanvasTexture,
  Group,
  Mesh,
  MeshBasicMaterial,
  type Texture,
} from 'three';
import { HALO, OBJECT } from '@/lib/scene-constants';

/**
 * Ореол за кристаллом — вместо тени на полу.
 *
 * В референсе объект ни на чём не лежит: вокруг него тёмный провал, из
 * которого он выступает, и тёплое свечение по краю. Пятно под объектом
 * такой сцене противоречит — оно приписывает ей поверхность, которой нет.
 *
 * Два слоя, оба развёрнуты к камере и стоят позади объекта: тёмная масса
 * гасит заливку вокруг силуэта, светлое кольцо поверх неё добавляет
 * свечение сложением. Цвет секции остаётся виден по краям кадра, так что
 * заливка не теряется.
 *
 * Ореол едет вместе с объектом и считает покачивание по той же формуле
 * и от тех же часов. Тянуть сюда ссылку на его group значило бы связать
 * два компонента ради числа, которое оба и так умеют посчитать.
 */
export function Halo({
  lift,
  reducedMotion = false,
}: {
  lift?: RefObject<{ value: number }>;
  reducedMotion?: boolean;
}) {
  const group = useRef<Group>(null);
  const mass = useRef<Mesh>(null);
  const glow = useRef<Mesh>(null);

  // Обе текстуры — белый радиальный градиент по альфе; цвет накладывает
  // материал. Один генератор вместо двух почти одинаковых.
  const massTexture = useMemo(() => radialTexture([1, 0.72, 0.22, 0]), []);
  const glowTexture = useMemo(() => radialTexture([0.9, 0.45, 0.12, 0]), []);

  const massMaterial = useMemo(
    () => haloMaterial(massTexture, HALO.mass.color, HALO.mass.opacity, false),
    [massTexture],
  );
  const glowMaterial = useMemo(
    () => haloMaterial(glowTexture, HALO.glow.color, HALO.glow.opacity, true),
    [glowTexture],
  );

  useEffect(
    () => () => {
      massTexture?.dispose();
      glowTexture?.dispose();
      massMaterial.dispose();
      glowMaterial.dispose();
    },
    [massTexture, glowTexture, massMaterial, glowMaterial],
  );

  useFrame((state) => {
    if (!group.current || !mass.current || !glow.current) {
      return;
    }

    const elapsed = state.clock.elapsedTime;
    const lifted = lift?.current.value ?? 0;

    const bob = reducedMotion
      ? 0
      : Math.sin((elapsed * Math.PI * 2) / OBJECT.bobPeriod) * OBJECT.bobAmplitude;

    group.current.position.y = bob + lifted * OBJECT.liftDistance;

    // Медленное дыхание размера: без него ореол выглядит наклейкой,
    // приклеенной к экрану.
    const pulse = reducedMotion
      ? 1
      : 1 + Math.sin((elapsed * Math.PI * 2) / HALO.pulsePeriod) * HALO.pulseAmount;

    const fade = 1 - lifted * HALO.liftFade;

    setLayer(mass.current, HALO.mass.scale * pulse, HALO.mass.opacity * fade);
    setLayer(glow.current, HALO.glow.scale * pulse, HALO.glow.opacity * fade);
  });

  return (
    <group ref={group}>
      <mesh ref={mass} material={massMaterial} position={[0, 0, HALO.mass.z]} renderOrder={-2}>
        <planeGeometry args={[1, 1]} />
      </mesh>

      <mesh ref={glow} material={glowMaterial} position={[0, 0, HALO.glow.z]} renderOrder={-1}>
        <planeGeometry args={[1, 1]} />
      </mesh>
    </group>
  );
}

function setLayer(mesh: Mesh, scale: number, opacity: number) {
  mesh.scale.set(scale, scale, 1);
  (mesh.material as MeshBasicMaterial).opacity = opacity;
}

function haloMaterial(
  map: Texture | null,
  color: string,
  opacity: number,
  additive: boolean,
): MeshBasicMaterial {
  return new MeshBasicMaterial({
    map,
    color,
    opacity,
    transparent: true,
    // Слои не должны ни писать в буфер глубины, ни резать друг друга:
    // они не объёмы, а подсветка позади объекта.
    depthWrite: false,
    ...(additive ? { blending: AdditiveBlending } : {}),
  });
}

/**
 * Радиальный градиент в текстуру: файла нет, рисуется один раз при
 * монтировании. Остановки задаются альфой — цвет накладывает материал.
 */
function radialTexture(alphaStops: readonly number[]): CanvasTexture | null {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext('2d');
  if (!context) {
    return null;
  }

  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  alphaStops.forEach((alpha, index) => {
    gradient.addColorStop(index / (alphaStops.length - 1), `rgba(255, 255, 255, ${alpha})`);
  });

  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  return new CanvasTexture(canvas);
}
