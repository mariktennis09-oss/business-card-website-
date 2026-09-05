'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { CanvasTexture, Mesh, MeshBasicMaterial } from 'three';
import { OBJECT, SHADOW } from '@/lib/scene-constants';

/**
 * Тень под объектом: размытое тёмное пятно, а не shadow map.
 *
 * Честные тени ради одного объекта на плоской заливке — лишний проход
 * рендера и настройка света, которой здесь неоткуда взяться: свет тут
 * ровно для того, чтобы различались грани.
 *
 * Пятно повёрнуто к камере и сплюснуто по вертикали, поэтому читается как
 * лежащее под объектом. Оно съёживается и бледнеет, когда объект уезжает
 * вверх, — иначе тень оторвётся от того, что её отбрасывает.
 */
export function GroundShadow({
  lift,
  reducedMotion = false,
}: {
  lift?: RefObject<{ value: number }>;
  reducedMotion?: boolean;
}) {
  const mesh = useRef<Mesh>(null);

  const texture = useMemo(() => createRadialTexture(), []);
  useEffect(() => () => texture?.dispose(), [texture]);

  const material = useMemo(
    () =>
      new MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        opacity: SHADOW.opacity,
      }),
    [texture],
  );

  useFrame((state) => {
    const element = mesh.current;
    if (!element) {
      return;
    }

    const lifted = lift?.current.value ?? 0;

    // Покачивание считается по той же формуле и от тех же часов, что у объекта.
    // Тянуть сюда ссылку на его group значило бы связать два компонента ради
    // числа, которое оба и так умеют посчитать.
    const bob = reducedMotion
      ? 0
      : Math.sin((state.clock.elapsedTime * Math.PI * 2) / OBJECT.bobPeriod) * OBJECT.bobAmplitude;

    // Чем выше объект, тем шире и бледнее пятно: так читается расстояние
    // до поверхности.
    const spread = 1 + lifted * SHADOW.liftResponse;
    element.scale.set(SHADOW.radiusX * spread, SHADOW.radiusY * spread, 1);

    const materialRef = element.material as MeshBasicMaterial;
    materialRef.opacity = SHADOW.opacity * (1 - lifted * SHADOW.liftResponse * 2);

    // Пятно повторяет покачивание вполсилы: полностью синхронное движение
    // выглядело бы приклеенным.
    element.position.y = SHADOW.offsetY + bob * 0.4 - lifted * OBJECT.liftDistance * 0.2;
  });

  return (
    <mesh ref={mesh} material={material} position={[0, SHADOW.offsetY, -0.4]}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
}

/** Радиальный градиент в текстуру: файла нет, рисуется один раз при монтировании. */
function createRadialTexture(): CanvasTexture | null {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext('2d');
  if (!context) {
    return null;
  }

  const gradient = context.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
  gradient.addColorStop(0.45, 'rgba(0, 0, 0, 0.5)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  return new CanvasTexture(canvas);
}
