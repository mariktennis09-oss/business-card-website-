'use client';

import { Canvas } from '@react-three/fiber';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { CAMERA, PALETTE } from '@/lib/animation-constants';
import { GlitchPass } from '../effects/glitch-pass';
import { ParticleField, type ParticleFieldProps } from './particle-field';

type ParticleCanvasProps = ParticleFieldProps & {
  className?: string;
  /** Интенсивность глитча. Без неё проход не подключается вовсе. */
  glitch?: RefObject<{ value: number }>;
};

/**
 * Обёртка сцены. Отвечает за то, когда цикл вообще крутится: считать поле
 * в скрытой вкладке или за пределами экрана — значит греть видеокарту впустую.
 */
export function ParticleCanvas({ className, glitch, ...fieldProps }: ParticleCanvasProps) {
  const container = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [onScreen, setOnScreen] = useState(true);

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

  return (
    <div ref={container} className={className}>
      <Canvas
        frameloop={visible && onScreen ? 'always' : 'never'}
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
        {glitch ? <GlitchPass intensity={glitch} /> : null}
      </Canvas>
    </div>
  );
}
