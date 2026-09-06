'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { Group, MeshPhysicalMaterial } from 'three';
import { ENVIRONMENT, GEM, GEM_MATERIAL, OBJECT, SURFACE } from '@/lib/scene-constants';
import type { PointerNdc } from '@/lib/use-pointer-ndc';

/**
 * Центральный объект — огранённый кристалл каплевидного профиля: острая
 * вершина, двухступенчатая корона, узкий поясок и длинный павильон вниз.
 *
 * Собран из примитивов, а не загружен моделью. Внешнего файла нет, значит
 * нечего грузить, нечего сжимать и нечем ошибиться на прелоаде; полигонов
 * при этом меньше сотни. Плоское затенение обязательно — со сглаженными
 * нормалями грани сливаются и огранка перестаёт читаться.
 */

// Раскладка по вертикали. Считается из пропорций, а не вбита числами:
// поменять в GEM одну высоту и вручную пересчитывать остальные — способ
// однажды забыть.
const HALF_GIRDLE = GEM.girdleHeight / 2;
const CROWN_Y = HALF_GIRDLE + GEM.crownHeight / 2;
const APEX_Y = HALF_GIRDLE + GEM.crownHeight + GEM.apexHeight / 2;
const PAVILION_Y = -HALF_GIRDLE - GEM.pavilionHeight / 2;

const TOP = HALF_GIRDLE + GEM.crownHeight + GEM.apexHeight;
const BOTTOM = -HALF_GIRDLE - GEM.pavilionHeight;

// Огранка несимметрична: павильон длиннее короны, поэтому геометрический
// центр смещён вниз. Без поправки объект висел бы выше середины кадра
// и вращался бы вокруг точки внутри короны.
const CENTER_OFFSET = -(TOP + BOTTOM) / 2;

export function Crystal({
  pointer,
  lift,
  reducedMotion = false,
  rotationSpeed = OBJECT.idleRotationSpeed,
  tiltMax = OBJECT.tiltMax,
}: {
  /** Курсор в NDC. Читается в кадровом цикле, перерисовок React не вызывает. */
  pointer?: RefObject<PointerNdc>;
  /** 0 — объект в центре, 1 — уехал вверх за край. Ведёт таймлайн панели. */
  lift?: RefObject<{ value: number }>;
  reducedMotion?: boolean;
  /** Подмена значений из OBJECT — нужна стенду, чтобы подбирать их глазами. */
  rotationSpeed?: number;
  tiltMax?: number;
}) {
  const group = useRef<Group>(null);
  const tilt = useRef({ x: 0, y: 0 });

  const material = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: SURFACE.object,
        roughness: GEM_MATERIAL.roughness,
        metalness: GEM_MATERIAL.metalness,
        clearcoat: GEM_MATERIAL.clearcoat,
        clearcoatRoughness: GEM_MATERIAL.clearcoatRoughness,
        iridescence: GEM_MATERIAL.iridescence,
        iridescenceIOR: GEM_MATERIAL.iridescenceIOR,
        iridescenceThicknessRange: [
          GEM_MATERIAL.iridescenceThickness[0],
          GEM_MATERIAL.iridescenceThickness[1],
        ],
        envMapIntensity: ENVIRONMENT.intensity,
        flatShading: true,
      }),
    [],
  );

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
      <group position-y={CENTER_OFFSET}>
        {/* Вершина */}
        <mesh material={material} position={[0, APEX_Y, 0]}>
          <cylinderGeometry args={[0, GEM.shoulderRadius, GEM.apexHeight, GEM.sides]} />
        </mesh>

        {/* Корона: второй ряд граней, из-за него верх не выглядит конусом */}
        <mesh material={material} position={[0, CROWN_Y, 0]}>
          <cylinderGeometry
            args={[GEM.shoulderRadius, GEM.girdleRadius, GEM.crownHeight, GEM.sides]}
          />
        </mesh>

        {/* Поясок — самое широкое место */}
        <mesh material={material}>
          <cylinderGeometry
            args={[GEM.girdleRadius, GEM.girdleRadius, GEM.girdleHeight, GEM.sides]}
          />
        </mesh>

        {/* Павильон: длинный клин вниз, он и делает силуэт каплей */}
        <mesh material={material} position={[0, PAVILION_Y, 0]}>
          <cylinderGeometry args={[GEM.girdleRadius, 0, GEM.pavilionHeight, GEM.sides]} />
        </mesh>
      </group>
    </group>
  );
}
