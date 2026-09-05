/**
 * Запасной фон для случая, когда WebGL 2 недоступен. Не имитация частиц,
 * а честная замена: спокойная растяжка в тех же цветах чертежа. Содержимое
 * страницы от этого не меняется — canvas и был только фоном.
 */
export function StaticBackdrop({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={className}
      style={{
        background:
          'radial-gradient(120% 80% at 70% 20%, color-mix(in srgb, var(--color-blueprint) 10%, transparent), transparent 60%), var(--color-paper)',
      }}
    />
  );
}
