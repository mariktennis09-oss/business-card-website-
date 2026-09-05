'use client';

import gsap from 'gsap';
import { useEffect, useRef, useState } from 'react';
import { CURSOR_VISUAL } from '@/lib/animation-constants';

/** Что считается интерактивным: над этим кольцо растёт и инвертирует фон. */
const INTERACTIVE_SELECTOR = 'a, button, [data-cursor="interactive"]';

/**
 * Собственный курсор: точка, идущая почти вровень с мышью, и кольцо,
 * отстающее заметно сильнее. Разница в запаздывании и создаёт ощущение веса.
 *
 * Позиции гонит gsap.quickTo, а не собственный requestAnimationFrame: у GSAP
 * один общий тикер на всю страницу, и заводить ради курсора третий цикл
 * рядом с ним и со сценой незачем.
 *
 * На тач-устройствах компонент не монтируется вовсе — подменять там курсор
 * нечего, а нативный трогать нельзя.
 */
export function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(hover: hover) and (pointer: fine)');
    const sync = () => setEnabled(query.matches);

    sync();
    query.addEventListener('change', sync);

    return () => query.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const dotElement = dot.current;
    const ringElement = ring.current;

    if (!enabled || !dotElement || !ringElement) {
      return;
    }

    document.body.classList.add('cursor-hidden');

    const moveDot = {
      x: gsap.quickTo(dotElement, 'x', { duration: CURSOR_VISUAL.dotDuration, ease: 'power3' }),
      y: gsap.quickTo(dotElement, 'y', { duration: CURSOR_VISUAL.dotDuration, ease: 'power3' }),
    };
    const moveRing = {
      x: gsap.quickTo(ringElement, 'x', { duration: CURSOR_VISUAL.ringDuration, ease: 'power3' }),
      y: gsap.quickTo(ringElement, 'y', { duration: CURSOR_VISUAL.ringDuration, ease: 'power3' }),
    };

    const onPointerMove = (event: PointerEvent) => {
      moveDot.x(event.clientX);
      moveDot.y(event.clientY);
      moveRing.x(event.clientX);
      moveRing.y(event.clientY);
    };

    const setVisible = (visible: boolean) => {
      gsap.to([dotElement, ringElement], { opacity: visible ? 1 : 0, duration: 0.2 });
    };

    const onPointerOver = (event: PointerEvent) => {
      const interactive = (event.target as Element | null)?.closest?.(INTERACTIVE_SELECTOR);
      ringElement.classList.toggle('cursor-ring--active', Boolean(interactive));
      gsap.to(ringElement, {
        scale: interactive ? CURSOR_VISUAL.ringHoverScale : 1,
        duration: 0.25,
        ease: 'power3.out',
      });
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerover', onPointerOver, { passive: true });
    document.addEventListener('pointerleave', () => setVisible(false));
    document.addEventListener('pointerenter', () => setVisible(true));

    return () => {
      document.body.classList.remove('cursor-hidden');
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerover', onPointerOver);
      gsap.killTweensOf([dotElement, ringElement]);
    };
  }, [enabled]);

  if (!enabled) {
    return null;
  }

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50">
      <div
        ref={ring}
        className="cursor-ring absolute top-0 left-0 rounded-full border border-ink"
        style={{
          width: CURSOR_VISUAL.ringSize,
          height: CURSOR_VISUAL.ringSize,
          marginLeft: -CURSOR_VISUAL.ringSize / 2,
          marginTop: -CURSOR_VISUAL.ringSize / 2,
        }}
      />
      <div
        ref={dot}
        className="absolute top-0 left-0 rounded-full bg-ink"
        style={{
          width: CURSOR_VISUAL.dotSize,
          height: CURSOR_VISUAL.dotSize,
          marginLeft: -CURSOR_VISUAL.dotSize / 2,
          marginTop: -CURSOR_VISUAL.dotSize / 2,
        }}
      />
    </div>
  );
}
