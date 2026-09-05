'use client';

import { Canvas } from '@react-three/fiber';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { CAMERA, PALETTE } from '@/lib/animation-constants';
import { supportsWebGl2 } from '@/lib/device';
import { GlitchPass } from '../effects/glitch-pass';
import { ParticleField, type ParticleFieldProps } from './particle-field';
import { StaticBackdrop } from './static-backdrop';

type ParticleCanvasProps = ParticleFieldProps & {
  className?: string;
  /** Интенсивность глитча. Без неё проход не подключается вовсе. */
  glitch?: RefObject<{ value: number }>;
  /** Системная настройка «меньше движения». */
  reducedMotion?: boolean;
};

/**
 * Обёртка сцены. Отвечает за три вещи, которых не должно быть в самой
 * симуляции: есть ли вообще WebGL, когда цикл крутится и крутится ли он.
 */
export function ParticleCanvas({
  className,
  glitch,
  reducedMotion = false,
  ...fieldProps
}: ParticleCanvasProps) {
  const container = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [onScreen, setOnScreen] = useState(true);
  const [webglReady, setWebglReady] = useState<boolean | null>(null);

  // Проверка идёт после монтирования: на сервере canvas создать негде,
  // а решать до гидратации нельзя — разметка разойдётся.
  useEffect(() => setWebglReady(supportsWebGl2()), []);

  useEffect(() => {
    const onVisibilityChange = () => setVisible(!document.hidden);

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  useEffect(() => {
    const element = container.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), {
      threshold: 0,
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  if (webglReady === false) {
    return <StaticBackdrop className={className} />;
  }

  return (
    <div ref={container} className={className}>
      {webglReady ? (
        <Canvas
          /*
           * `demand` при «меньше движения»: кадр рисуется один раз, поле
           * замирает на исходном облаке. Сцена остаётся, но не двигается —
           * это мягче, чем убирать её совсем.
           */
          frameloop={reducedMotion ? 'demand' : visible && onScreen ? 'always' : 'never'}
          camera={{
            position: [...CAMERA.position],
            fov: CAMERA.fov,
            near: CAMERA.near,
            far: CAMERA.far,
          }}
          // Сглаживание точкам не нужно — мягкий край рисует сам шейдер.
          gl={{ antialias: false, alpha: false }}
          dpr={[1, 2]}
          onCreated={({ gl }) => gl.setClearColor(PALETTE.paper)}
        >
          <ParticleField {...fieldProps} />
          {glitch && !reducedMotion ? <GlitchPass intensity={glitch} /> : null}
        </Canvas>
      ) : null}
    </div>
  );
}
