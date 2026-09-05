'use client';

import gsap from 'gsap';
import { useRef, useState } from 'react';
import { Backdrop } from '@/components/scene/backdrop';
import {
  BACKDROP,
  GRAIN,
  GRAIN_PRESETS,
  SECTION_COLORS,
  SURFACE,
  type SectionColorKey,
} from '@/lib/scene-constants';

const COLOR_KEYS = Object.keys(SECTION_COLORS) as SectionColorKey[];

/**
 * Стенд шага 2: заливка, зерно и смена цвета по кнопке-заглушке.
 *
 * Переключатели зерна нужны, чтобы подобрать его глазами: описывать
 * «крупнее/сильнее» словами и переводить в числа — лишний круг.
 * Выбранные значения переезжают в GRAIN, стенд остаётся для проверки.
 */
export default function BackdropLabPage() {
  const fill = useRef<HTMLDivElement>(null);
  const [color, setColor] = useState<SectionColorKey>('home');
  const [frequency, setFrequency] = useState<number>(GRAIN.baseFrequency);
  const [opacity, setOpacity] = useState<number>(GRAIN.opacity);

  function switchColor(key: SectionColorKey) {
    setColor(key);

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
      <Backdrop
        fillRef={fill}
        initialColor={SECTION_COLORS.home}
        grainFrequency={frequency}
        grainOpacity={opacity}
      />

      <div className="flex h-full flex-col justify-between p-6 sm:p-8">
        <p className="font-mono text-xs tracking-[0.16em] uppercase">Backdrop — isolated</p>

        <div className="flex flex-col gap-5">
          <Row label="Цвет секции">
            {COLOR_KEYS.map((key) => (
              <Chip key={key} active={key === color} onClick={() => switchColor(key)}>
                {key}
              </Chip>
            ))}
          </Row>

          <Row label="Размер зерна">
            {GRAIN_PRESETS.size.map((preset) => (
              <Chip
                key={preset.label}
                active={preset.baseFrequency === frequency}
                onClick={() => setFrequency(preset.baseFrequency)}
              >
                {preset.label} · {preset.baseFrequency}
              </Chip>
            ))}
          </Row>

          <Row label="Сила зерна">
            {GRAIN_PRESETS.strength.map((preset) => (
              <Chip
                key={preset.label}
                active={preset.opacity === opacity}
                onClick={() => setOpacity(preset.opacity)}
              >
                {preset.label} · {preset.opacity}
              </Chip>
            ))}
          </Row>
        </div>
      </div>
    </main>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="w-32 font-mono text-[11px] tracking-[0.16em] uppercase opacity-70">
        {label}
      </span>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-mono text-[11px] tracking-[0.14em] uppercase transition-opacity ${
        active ? 'opacity-100' : 'opacity-55 hover:opacity-100'
      }`}
      style={{
        border: `1px solid ${SURFACE.text}`,
        borderStyle: active ? 'solid' : 'dashed',
        padding: '5px 12px',
      }}
    >
      {children}
    </button>
  );
}
