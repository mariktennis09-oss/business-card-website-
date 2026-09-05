import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Сборка падает на ошибках типов и линта, а не выкатывает сломанное молча.
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },
  // Корень трассировки — папка web, а не корень монорепозитория: иначе Next
  // находит второй package-lock.json (бэкенда) и тянет в трассировку чужие
  // зависимости.
  outputFileTracingRoot: process.cwd(),

  /**
   * Шейдеры лежат в .glsl файлах и импортируются строками. `asset/source` —
   * встроенный тип webpack, отдельный загрузчик не нужен.
   *
   * Здесь настроен только webpack: и `next dev`, и `next build` идут через
   * него. Если проект переедет на Turbopack, тот же приём нужно будет
   * продублировать в ключе `turbopack.rules`.
   */
  webpack(config) {
    config.module.rules.push({
      test: /\.glsl$/,
      type: 'asset/source',
    });

    return config;
  },
};

export default nextConfig;
