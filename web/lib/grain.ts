/**
 * Плёночное зерно строится фильтром feTurbulence прямо в data-URI:
 * бинарного файла нет, грузить нечего, а текстура не зависит от цвета
 * под ней.
 *
 * `baseFrequency` — размер песчинок: больше значение, мельче зерно.
 * `octaves` — сколько слоёв шума накладывается друг на друга: больше слоёв,
 * богаче структура и дороже отрисовка. Фильтр считается один раз, так что
 * это разовая цена, а не кадровая.
 */
export function grainDataUri(baseFrequency: number, octaves: number): string {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg'>` +
    `<filter id='g'>` +
    `<feTurbulence type='fractalNoise' baseFrequency='${baseFrequency}' numOctaves='${octaves}' stitchTiles='stitch'/>` +
    `</filter>` +
    `<rect width='100%' height='100%' filter='url(%23g)'/>` +
    `</svg>`;

  return `url("data:image/svg+xml,${encodeURIComponent(svg).replace(/%25/g, '%')}")`;
}
