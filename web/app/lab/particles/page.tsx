'use client';

import { useCallback, useState } from 'react';
import { CustomCursor } from '@/components/cursor/custom-cursor';
import { ParticleCanvas } from '@/components/particles/particle-canvas';
import { CURSOR, PARTICLES } from '@/lib/animation-constants';
import { usePointerNdc } from '@/lib/use-pointer-ndc';

/**
 * Изолированный стенд для поля частиц: ничего, кроме canvas и приборов.
 * Нужен, чтобы крутить симуляцию и мерить кадр до того, как поверх ляжет
 * контент и переходы. В продакшен-страницу не входит.
 */
export default function ParticlesLabPage() {
  const [textureSize, setTextureSize] = useState<number>(PARTICLES.textureSize.high);
  const [repulsion, setRepulsion] = useState(true);
  const [fps, setFps] = useState<number | null>(null);

  const pointer = usePointerNdc();
  const onStats = useCallback((stats: { fps: number }) => setFps(stats.fps), []);

  return (
    <main className="relative h-dvh w-full">
      <CustomCursor />

      <ParticleCanvas
        key={textureSize}
        className="absolute inset-0"
        textureSize={textureSize}
        pointer={pointer}
        cursorStrength={repulsion ? CURSOR.strength : 0}
        onStats={onStats}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap items-center justify-between gap-4 p-5">
        <p className="label">Particle field — isolated</p>

        <div className="pointer-events-auto flex items-center gap-4">
          <span className="label">
            {fps === null ? 'measuring…' : `${fps} fps`} · {textureSize}² ={' '}
            {(textureSize * textureSize).toLocaleString('en-US')}
          </span>

          {Object.entries(PARTICLES.textureSize).map(([tier, size]) => (
            <button
              key={tier}
              type="button"
              onClick={() => setTextureSize(size)}
              className={`label border px-3 py-1 transition-colors ${
                size === textureSize
                  ? 'border-ink !text-ink'
                  : 'border-line hover:border-ink hover:!text-ink'
              }`}
            >
              {tier}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setRepulsion((value) => !value)}
            className={`label border px-3 py-1 transition-colors ${
              repulsion ? 'border-ink !text-ink' : 'border-line hover:border-ink hover:!text-ink'
            }`}
          >
            cursor {repulsion ? 'on' : 'off'}
          </button>
        </div>
      </div>
    </main>
  );
}
