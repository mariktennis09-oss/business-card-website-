'use client';

import { useCallback, useState } from 'react';
import { ParticleCanvas } from '@/components/particles/particle-canvas';
import { PARTICLES } from '@/lib/animation-constants';

/**
 * Изолированный стенд для поля частиц: ничего, кроме canvas и приборов.
 * Нужен, чтобы крутить симуляцию и мерить кадр до того, как поверх ляжет
 * контент и переходы. В продакшен-страницу не входит.
 */
export default function ParticlesLabPage() {
  const [textureSize, setTextureSize] = useState<number>(PARTICLES.textureSize.high);
  const [fps, setFps] = useState<number | null>(null);

  const onStats = useCallback((stats: { fps: number }) => setFps(stats.fps), []);

  return (
    <main className="relative h-dvh w-full">
      <ParticleCanvas
        key={textureSize}
        className="absolute inset-0"
        textureSize={textureSize}
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
        </div>
      </div>
    </main>
  );
}
