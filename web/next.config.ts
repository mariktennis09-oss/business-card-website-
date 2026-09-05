import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Корень трассировки — папка web, а не корень монорепозитория: иначе Next
  // находит второй package-lock.json (бэкенда) и тянет в трассировку чужие
  // зависимости.
  outputFileTracingRoot: process.cwd(),
  // Сборка падает на ошибках типов и линта, а не выкатывает сломанное молча.
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },
};

export default nextConfig;
