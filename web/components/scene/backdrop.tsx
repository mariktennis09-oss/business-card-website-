'use client';

import gsap from 'gsap';
import { useEffect, type RefObject } from 'react';
import { grainDataUri } from '@/lib/grain';
import { GRAIN } from '@/lib/scene-constants';

/**
 * Фон страницы: сплошная заливка и плёночное зерно.
 *
 * Это два разных слоя, и между ними по глубине проходит canvas. Заливка
 * лежит под сценой и отвечает за случай, когда WebGL недоступен: тогда
 * страница теряет объект, но не цвет. Зерно, наоборот, лежит поверх сцены —
 * плёночное зерно на то и плёночное, что ложится на весь кадр целиком,
 * а не под то, что в нём нарисовано.
 *
 * Сам элемент заливки отдаётся наружу через `fillRef` — анимирует его
 * владелец таймлайна, а не этот компонент. Иначе смена цвета оказалась бы
 * отдельной анимацией рядом с открытием панели, а не вместе с ним.
 */
export function Backdrop({
  fillRef,
  initialColor,
  grainOpacity = GRAIN.opacity,
  grainFrequency = GRAIN.baseFrequency,
  grainOctaves = GRAIN.octaves,
}: {
  fillRef: RefObject<HTMLDivElement | null>;
  initialColor: string;
  /** Насколько зерно проступает сквозь заливку. */
  grainOpacity?: number;
  /** Размер песчинок: больше значение — мельче зерно. */
  grainFrequency?: number;
  grainOctaves?: number;
}) {
  useEffect(() => {
    if (fillRef.current) {
      gsap.set(fillRef.current, { backgroundColor: initialColor });
    }
    // Только первичная установка: дальше цветом распоряжается таймлайн.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div aria-hidden ref={fillRef} className="fixed inset-0 -z-30" />
      <div
        aria-hidden
        className="grain fixed inset-0 -z-10"
        style={{
          opacity: grainOpacity,
          backgroundImage: grainDataUri(grainFrequency, grainOctaves),
        }}
      />
    </>
  );
}
