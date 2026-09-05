'use client';

import gsap from 'gsap';
import { useCallback, useEffect, useRef } from 'react';
import { GLITCH } from './animation-constants';

export interface GlitchDriver {
  /** Интенсивность 0…1. Читается кадровым циклом сцены. */
  intensity: React.RefObject<{ value: number }>;
  /** Разовый всплеск: быстрый подъём, более долгий спад. */
  burst: (peak: number, duration: number) => void;
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/**
 * Управление глитчем. Интенсивность анимируется таймлайном GSAP, а не
 * дёргается случайным числом каждый кадр: иначе это не всплеск помехи,
 * а постоянный шум, и погасить его в нужный момент нечем.
 *
 * В простое всплески идут редко и с разной паузой — регулярность выдала бы
 * таймер и перестала бы читаться как сбой.
 */
export function useGlitch(enabled = true): GlitchDriver {
  const intensity = useRef({ value: 0 });

  const burst = useCallback(
    (peak: number, duration: number) => {
      if (!enabled) {
        return;
      }

      const target = intensity.current;
      gsap.killTweensOf(target);

      gsap
        .timeline()
        .to(target, { value: peak, duration: duration * 0.25, ease: 'power2.out' })
        .to(target, { value: 0, duration: duration * 0.75, ease: 'power2.in' });
    },
    [enabled],
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Объект интенсивности не меняется за жизнь хука, но захватить его
    // в переменную всё равно правильно: чистка обязана гасить твины именно
    // того объекта, который анимировала.
    const target = intensity.current;
    let pending: gsap.core.Tween | null = null;

    const schedule = () => {
      pending = gsap.delayedCall(
        randomBetween(GLITCH.idleIntervalMin, GLITCH.idleIntervalMax),
        () => {
          burst(GLITCH.idlePeak, randomBetween(GLITCH.idleDurationMin, GLITCH.idleDurationMax));
          schedule();
        },
      );
    };

    schedule();

    return () => {
      pending?.kill();
      gsap.killTweensOf(target);
    };
  }, [burst, enabled]);

  return { intensity, burst };
}
