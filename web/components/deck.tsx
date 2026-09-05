'use client';

import { Children, useCallback, useEffect, useState, type ReactNode } from 'react';

/**
 * Оболочка слайдов: шапка с меню, сами слайды и стрелки.
 *
 * Клиентский здесь только этот компонент — он держит номер текущего слайда
 * и слушает клавиши. Содержимое слайдов приходит готовым с сервера через
 * children, поэтому в бандл уезжает навигация, а не разметка визитки.
 */
export function Deck({ sections, children }: { sections: string[]; children: ReactNode }) {
  const slides = Children.toArray(children);
  const total = slides.length;
  const [current, setCurrent] = useState(0);

  const go = useCallback((next: number) => setCurrent(((next % total) + total) % total), [total]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowRight' || event.key === 'PageDown') go(current + 1);
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') go(current - 1);
      if (event.key === 'Home') go(0);
      if (event.key === 'End') go(total - 1);
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [current, go, total]);

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex shrink-0 items-baseline justify-between gap-6 border-b border-line px-6 py-5 sm:px-10">
        <button
          type="button"
          onClick={() => go(0)}
          className="label !text-ink transition-opacity hover:opacity-60"
        >
          Mark/Omelchenko
        </button>

        <nav className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
          {sections.map((section, index) => (
            <button
              key={section}
              type="button"
              onClick={() => go(index)}
              aria-current={index === current ? 'true' : undefined}
              className={`label transition-colors hover:!text-ink ${
                index === current ? '!text-ink' : ''
              }`}
            >
              {section}
            </button>
          ))}
        </nav>
      </header>

      <main className="relative min-h-0 flex-1">
        {slides.map((slide, index) => (
          <section
            key={sections[index] ?? index}
            aria-hidden={index !== current}
            inert={index !== current ? true : undefined}
            className={`absolute inset-0 overflow-y-auto px-6 py-8 transition-all duration-500 sm:px-10 sm:py-12 ${
              index === current
                ? 'translate-y-0 opacity-100'
                : 'pointer-events-none translate-y-2 opacity-0'
            }`}
          >
            {slide}
          </section>
        ))}
      </main>

      <footer className="flex shrink-0 items-center justify-between gap-6 border-t border-line px-6 py-4 sm:px-10">
        <span className="label">
          {String(current + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>

        <div className="flex items-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => go(index)}
              aria-label={`Slide ${index + 1}: ${sections[index] ?? ''}`}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                index === current ? 'bg-ink' : 'bg-ink-faint hover:bg-ink-dim'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => go(current - 1)}
            aria-label="Previous section"
            className="label !text-ink-dim transition-colors hover:!text-ink"
          >
            &#8249; Prev
          </button>
          <button
            type="button"
            onClick={() => go(current + 1)}
            aria-label="Next section"
            className="label !text-ink-dim transition-colors hover:!text-ink"
          >
            Next &#8250;
          </button>
        </div>
      </footer>
    </div>
  );
}
