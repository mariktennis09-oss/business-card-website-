'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, type RefObject } from 'react';
import { Group, MeshStandardMaterial } from 'three';
import { OBJECT, SURFACE } from '@/lib/scene-constants';
import type { PointerNdc } from '@/lib/use-pointer-ndc';

/**
 * Центральный объект — гексагональный кристалл: призма с двумя пирамидами.
 *
 * Собран из примитивов, а не загружен моделью. Внешнего файла нет, значит
 * нечего грузить, нечего сжимать и нечем ошибиться на прелоаде; полигонов
 * при этом меньше сотни. Плоское затенение обязательно — иначе грани
 * сливаются и огранка не читается.
 *
 * Материал почти чёрный и матовый: силуэт держится контрастом с яркой
 * заливкой, а не бликами.
 */
export function Crystal({
  pointer,
  lift,
  reducedMotion = false,
}: {
  /** Курсор в NDC. Читается в кадровом цикле, перерисовок React не вызывает. */
  pointer?: RefObject<PointerNdc>;
  /** 0 — объект в центре, 1 — уехал вверх за край. Ведёт таймлайн панели. */
  lift?: RefObject<{ value: number }>;
  reducedMotion?: boolean;
}) {
  const group = useRef<Group>(null);
  const tilt = useRef({ x: 0, y: 0 });

  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: SURFACE.object,
        roughness: 0.85,
        metalness: 0.05,
        flatShading: true,
      }),
    [],
  );

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
      element.rotation.y += OBJECT.idleRotationSpeed * delta;
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
      tilt.current.x += (-target.y * OBJECT.tiltMax - tilt.current.x) * factor;
      tilt.current.y += (target.x * OBJECT.tiltMax - tilt.current.y) * factor;
    }

    element.rotation.x = tilt.current.x;
    element.rotation.z = tilt.current.y * 0.4;
  });

  return (
    <group ref={group}>
      {/* Призма */}
      <mesh material={material}>
        <cylinderGeometry args={[0.62, 0.62, 1.15, 6]} />
      </mesh>

      {/* Верхняя пирамида */}
      <mesh material={material} position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0, 0.62, 0.55, 6]} />
      </mesh>

      {/* Нижняя, короче верхней: несимметричность читается при вращении */}
      <mesh material={material} position={[0, -0.775, 0]}>
        <cylinderGeometry args={[0.62, 0, 0.4, 6]} />
      </mesh>
    </group>
  );
}
