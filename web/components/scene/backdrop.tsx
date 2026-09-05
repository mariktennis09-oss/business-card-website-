'use client';

import { useEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { GRAIN } from '@/lib/scene-constants';

/**
 * Фон страницы: сплошная заливка и плёночное зерно поверх неё.
 *
 * Живёт в DOM, а не в сцене three.js, по двум причинам. Во-первых, фон обязан
 * оставаться при отсутствии WebGL — тогда страница просто теряет объект,
 * а не цвет и текстуру. Во-вторых, цветом управляет тот же таймлайн, что
 * двигает панель: держать его на стороне GSAP и DOM дешевле, чем гонять
 * через uniform.
 *
 * Сам элемент заливки отдаётся наружу через `fillRef` — анимирует его
 * владелец таймлайна, а не этот компонент. Иначе смена цвета оказалась бы
 * отдельной анимацией, идущей рядом с открытием панели, а не вместе с ним.
 */
export function Backdrop({
  fillRef,
  initialColor,
}: {
  fillRef: RefObject<HTMLDivElement | null>;
  initialColor: string;
}) {
  useEffect(() => {
    if (fillRef.current) {
      gsap.set(fillRef.current, { backgroundColor: initialColor });
    }
    // Только первичная установка: дальше цветом распоряжается таймлайн.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div aria-hidden className="fixed inset-0 -z-20">
      <div ref={fillRef} className="absolute inset-0" />
      <div className="grain absolute inset-0" style={{ opacity: GRAIN.opacity }} />
    </div>
  );
}
