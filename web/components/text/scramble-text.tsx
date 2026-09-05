'use client';

import { useEffect, useState } from 'react';
import { SCRAMBLE } from '@/lib/animation-constants';

/**
 * Дешифровка: символы прокручиваются через случайный набор и «схлопываются»
 * в финальный текст слева направо.
 *
 * Применяется только к коротким моноширинным лейблам. На длинном абзаце это
 * читалось бы как шум, а на пропорциональном шрифте прыгала бы ширина строки.
 *
 * Для скринридера текст всегда финальный: анимированная копия скрыта от
 * дерева доступности, настоящая строка лежит рядом.
 */
export function ScrambleText({ text, className }: { text: string; className?: string }) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    const steps = Math.ceil(SCRAMBLE.durationMs / SCRAMBLE.stepMs);
    let step = 0;

    const timer = setInterval(() => {
      step += 1;

      if (step >= steps) {
        setDisplay(text);
        clearInterval(timer);
        return;
      }

      const resolved = Math.floor((text.length * step) / steps);

      setDisplay(
        text
          .split('')
          .map((character, index) => {
            if (index < resolved || character === ' ') {
              return character;
            }

            return SCRAMBLE.glyphs[Math.floor(Math.random() * SCRAMBLE.glyphs.length)];
          })
          .join(''),
      );
    }, SCRAMBLE.stepMs);

    return () => clearInterval(timer);
  }, [text]);

  return (
    <span className={className}>
      <span aria-hidden>{display}</span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
