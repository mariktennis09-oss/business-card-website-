'use client';

import { Canvas } from '@react-three/fiber';
import { useEffect, useState, type RefObject } from 'react';
import { supportsWebGl2 } from '@/lib/device';
import { LIGHTS, SCENE_CAMERA } from '@/lib/scene-constants';
import type { PointerNdc } from '@/lib/use-pointer-ndc';
import { Crystal } from './crystal';
import { Halo } from './halo';
import { SceneEnvironment } from './scene-environment';

/**
 * Единственная сцена three.js на всё приложение. Она не пересоздаётся при
 * смене секции: меняются положение объекта и цвет фона, а сцена живёт.
 *
 * Canvas прозрачный — заливка и зерно лежат под ним в DOM. Поэтому при
 * отсутствии WebGL страница теряет ровно объект и ореол, а фон, текст
 * и навигация остаются на месте.
 */
export function SceneCanvas({
  className,
  pointer,
  lift,
  reducedMotion = false,
  rotationSpeed,
  tiltMax,
}: {
  className?: string;
  pointer?: RefObject<PointerNdc>;
  lift?: RefObject<{ value: number }>;
  reducedMotion?: boolean;
  /** Подмена значений из OBJECT — нужна стенду, чтобы подбирать их глазами. */
  rotationSpeed?: number;
  tiltMax?: number;
}) {
  const [visible, setVisible] = useState(true);
  const [webglReady, setWebglReady] = useState<boolean | null>(null);

  // Проверка после монтирования: на сервере canvas создать негде, а решать
  // до гидратации нельзя — разметка разойдётся.
  useEffect(() => setWebglReady(supportsWebGl2()), []);

  useEffect(() => {
    const onVisibilityChange = () => setVisible(!document.hidden);

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  if (!webglReady) {
    return null;
  }

  return (
    <div aria-hidden className={className}>
      <Canvas
        // При «меньше движения» кадр рисуется один раз: объект стоит,
        // но остаётся на месте — убирать его незачем.
        frameloop={reducedMotion ? 'demand' : visible ? 'always' : 'never'}
        camera={{
          position: [...SCENE_CAMERA.position],
          fov: SCENE_CAMERA.fov,
          near: SCENE_CAMERA.near,
          far: SCENE_CAMERA.far,
        }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
      >
        <SceneEnvironment />

        <ambientLight intensity={LIGHTS.ambient} />
        <directionalLight intensity={LIGHTS.key} position={[...LIGHTS.keyPosition]} />

        <Halo lift={lift} reducedMotion={reducedMotion} />
        <Crystal
          pointer={pointer}
          lift={lift}
          reducedMotion={reducedMotion}
          rotationSpeed={rotationSpeed}
          tiltMax={tiltMax}
        />
      </Canvas>
    </div>
  );
}
