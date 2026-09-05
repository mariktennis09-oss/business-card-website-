import type { ReactNode } from 'react';
import { ScrambleText } from '../text/scramble-text';

/**
 * Рамка с врезанной подписью и засечками по углам — основной приём подачи
 * «Чертёж». Ничего не анимирует и ничего не знает про данные: это оболочка,
 * в которую кладут содержимое раздела.
 */
export function BlueprintFrame({
  label,
  note,
  children,
  className = '',
}: {
  /** Подпись, врезанная в верхнюю линию рамки. */
  label: string;
  /** Выноска под рамкой — как аннотация на чертеже. */
  note?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="relative border border-line">
        <ScrambleText text={label} className="label absolute -top-[9px] left-5 bg-paper px-2" />

        <CornerTick className="-top-px -left-px border-t border-l" />
        <CornerTick className="-top-px -right-px border-t border-r" />
        <CornerTick className="-bottom-px -left-px border-b border-l" />
        <CornerTick className="-right-px -bottom-px border-r border-b" />

        <div className="px-5 py-6 sm:px-8 sm:py-8">{children}</div>
      </div>

      {note ? (
        <p className="label mt-2 ml-5 flex items-center gap-2">
          <span className="inline-block h-3 w-px bg-graphite" />
          <span className="inline-block h-px w-4 bg-graphite" />
          {note}
        </p>
      ) : null}
    </div>
  );
}

function CornerTick({ className }: { className: string }) {
  return <span aria-hidden className={`absolute h-3 w-3 border-ink ${className}`} />;
}

/**
 * Размерная линия: так на чертеже подписывают протяжённость.
 * Здесь ею показан период работы.
 */
export function DimensionLine({ children }: { children: ReactNode }) {
  return (
    <div className="label flex items-center gap-2">
      <span className="h-2.5 w-px shrink-0 bg-graphite" />
      <span className="h-px flex-1 bg-graphite" />
      <span className="shrink-0">{children}</span>
      <span className="h-px flex-1 bg-graphite" />
      <span className="h-2.5 w-px shrink-0 bg-graphite" />
    </div>
  );
}
