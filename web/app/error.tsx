'use client';

import { SURFACE } from '@/lib/scene-constants';

/**
 * Граница ошибок на всё приложение.
 *
 * Без неё Next показывает одну строчку про «client-side exception» и
 * отправляет в консоль браузера — проверять сцену так неудобно, а половина
 * поломок здесь именно клиентские: WebGL, шейдеры, геометрия. Поэтому
 * текст ошибки выводится прямо на странице.
 *
 * В продакшен-сборке React не отдаёт сюда сообщение — остаётся только
 * digest, короткий идентификатор записи в логе сервера. Показываем то,
 * что есть.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      className="flex h-dvh w-full flex-col justify-center gap-6 p-6 sm:p-10"
      style={{ backgroundColor: SURFACE.panel, color: SURFACE.text }}
    >
      <p className="font-mono text-xs tracking-[0.16em] uppercase opacity-70">Ошибка на странице</p>

      <pre className="max-w-3xl font-mono text-sm leading-relaxed break-words whitespace-pre-wrap">
        {error.message || 'Сообщение недоступно в этой сборке.'}
      </pre>

      {error.digest ? (
        <p className="font-mono text-[11px] tracking-[0.14em] uppercase opacity-55">
          digest {error.digest}
        </p>
      ) : null}

      <div>
        <button
          type="button"
          onClick={reset}
          className="font-mono text-[11px] tracking-[0.14em] uppercase opacity-70 transition-opacity hover:opacity-100"
          style={{ border: `1px solid ${SURFACE.text}`, padding: '6px 14px' }}
        >
          попробовать снова
        </button>
      </div>
    </main>
  );
}
