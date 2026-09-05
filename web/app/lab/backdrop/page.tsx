'use client';

import gsap from 'gsap';
import { useRef, useState } from 'react';
import { Backdrop } from '@/components/scene/backdrop';
import { BACKDROP, SECTION_COLORS, SURFACE, type SectionColorKey } from '@/lib/scene-constants';

const KEYS = Object.keys(SECTION_COLORS) as SectionColorKey[];

/**
 * Стенд шага 2: только заливка, зерно и смена цвета по кнопке-заглушке.
 * Кнопки здесь временные — на странице цвет будет вести тот же таймлайн,
 * что двигает панель секции.
 */
export default function BackdropLabPage() {
  const fill = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<SectionColorKey>('home');

  function switchTo(key: SectionColorKey) {
    setActive(key);

    if (fill.current) {
      gsap.to(fill.current, {
        backgroundColor: SECTION_COLORS[key],
        duration: BACKDROP.duration,
        ease: BACKDROP.ease,
      });
    }
  }

  return (
    <main className="relative h-dvh w-full" style={{ color: SURFACE.text }}>
      <Backdrop fillRef={fill} initialColor={SECTION_COLORS.home} />

      <div className="flex h-full flex-col justify-between p-6 sm:p-8">
        <p className="font-mono text-xs tracking-[0.16em] uppercase">Backdrop — isolated</p>

        <div className="flex flex-wrap gap-3">
          {KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => switchTo(key)}
              className={`font-mono text-xs tracking-[0.16em] uppercase transition-opacity ${
                key === active ? 'opacity-100' : 'opacity-55 hover:opacity-100'
              }`}
              style={{
                border: `1px solid ${SURFACE.text}`,
                padding: '6px 14px',
                borderStyle: key === active ? 'solid' : 'dashed',
              }}
            >
              {key} · {SECTION_COLORS[key]}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
