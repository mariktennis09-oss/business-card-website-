import 'dotenv/config';
import path from 'node:path';
import { defineConfig } from 'prisma/config';

/**
 * Конфигурация Prisma CLI (пришла на смену ключу `prisma` в package.json).
 * `dotenv/config` подгружает .env — с файлом конфигурации Prisma больше не
 * делает этого сам. В Docker и на Vercel переменные приходят из окружения,
 * и dotenv просто ничего не находит.
 */
export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
});
