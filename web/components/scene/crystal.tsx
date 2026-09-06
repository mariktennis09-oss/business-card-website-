'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { Group, MeshPhysicalMaterial } from 'three';
import { createCrystalGeometry } from '@/lib/crystal-geometry';
import {
  CRYSTAL,
  CRYSTAL_TINTS,
  DEFAULT_TINT,
  ENVIRONMENT,
  GLASS,
  OBJECT,
  type CrystalTintKey,
} from '@/lib/scene-constants';
import type { PointerNdc } from '@/lib/use-pointer-ndc';

/**
 * Центральный объект — гранёный кристалл. Форма не смоделирована и не
 * загружена файлом, а сгенерирована: см. `createCrystalGeometry`. Зерно
 * задаёт конкретный экземпляр, всё остальное — материал и движение.
 *
 * Стекло, а не матовый камень: цвет приходит из затухания света внутри
 * тела, рёбра раскладывают его по спектру. Плоское затенение обязательно —
 * со сглаженными нормалями грани сливаются и огранка перестаёт читаться.
 */
export function Crystal({
  pointer,
  lift,
  reducedMotion = false,
  seed = CRYSTAL.seed,
  tint = DEFAULT_TINT,
  rotationSpeed = OBJECT.idleRotationSpeed,
  tiltMax = OBJECT.tiltMax,
}: {
  /** Курсор в NDC. Читается в кадровом цикле, перерисовок React не вызывает. */
  pointer?: RefObject<PointerNdc>;
  /** 0 — объект в центре, 1 — уехал вверх за край. Ведёт таймлайн панели. */
  lift?: RefObject<{ value: number }>;
  reducedMotion?: boolean;
  /** Зерно генератора формы. Меняешь — получаешь другой кристалл. */
  seed?: number;
  tint?: CrystalTintKey;
  /** Подмена значений из OBJECT — нужна стенду, чтобы подбирать их глазами. */
  rotationSpeed?: number;
  tiltMax?: number;
}) {
  const group = useRef<Group>(null);
  const tilt = useRef({ x: 0, y: 0 });

  const geometry = useMemo(() => createCrystalGeometry({ ...CRYSTAL, seed }), [seed]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const material = useMemo(() => {
    const { color, distance } = CRYSTAL_TINTS[tint];

    return new MeshPhysicalMaterial({
      // Тело белое: цвет даёт затухание внутри стекла, а не краска снаружи.
      color: '#ffffff',
      transmission: GLASS.transmission,
      thickness: GLASS.thickness,
      ior: GLASS.ior,
      roughness: GLASS.roughness,
      metalness: GLASS.metalness,
      dispersion: GLASS.dispersion,
      attenuationColor: color,
      attenuationDistance: distance,
      clearcoat: GLASS.clearcoat,
      clearcoatRoughness: GLASS.clearcoatRoughness,
      iridescence: GLASS.iridescence,
      iridescenceIOR: GLASS.iridescenceIOR,
      iridescenceThicknessRange: [GLASS.iridescenceThickness[0], GLASS.iridescenceThickness[1]],
      envMapIntensity: ENVIRONMENT.intensity,
      flatShading: true,
    });
  }, [tint]);

  useEffect(() => () => material.dispose(), [material]);

  useFrame((state, delta) => {
    const element = group.current;
    if (!element) {
      return;
    }

    const elapsed = state.clock.elapsedTime;
    const lifted = lift?.current.value ?? 0;

    // Вращение и покачивание не прекращаются никогда — кроме случая, когда
    // система просит меньше движения.
    if (!reducedMotion) {
      element.rotation.y += rotationSpeed * delta;
    }

    const bob = reducedMotion
      ? 0
      : Math.sin((elapsed * Math.PI * 2) / OBJECT.bobPeriod) * OBJECT.bobAmplitude;

    element.position.y = bob + lifted * OBJECT.liftDistance;

    // Доворот за курсором: цель считается из позиции мыши, фактический угол
    // идёт к ней через lerp — объект догоняет лениво, с запаздыванием.
    const target = pointer?.current;
    if (target?.active && !reducedMotion) {
      const factor = 1 - Math.pow(1 - OBJECT.tiltLerp, delta * 60);
      tilt.current.x += (-target.y * tiltMax - tilt.current.x) * factor;
      tilt.current.y += (target.x * tiltMax - tilt.current.y) * factor;
    }

    element.rotation.x = tilt.current.x;
    element.rotation.z = tilt.current.y * OBJECT.tiltRoll;
  });

  return (
    <group ref={group}>
      <mesh geometry={geometry} material={material} />
    </group>
  );
}
