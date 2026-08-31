import 'dotenv/config';
import { execSync } from 'node:child_process';

/**
 * E2E-тесты идут по настоящему стеку: HTTP → GraphQL → сервисы → Prisma → Postgres.
 * Поэтому перед запуском база приводится в то же состояние, что и при старте
 * приложения, — теми же командами, что выполняет entrypoint контейнера.
 *
 * DATABASE_URL_TEST позволяет держать отдельную базу под тесты; если он не задан,
 * используется обычный DATABASE_URL (в docker-compose это одна и та же локальная
 * база, и пересоздание данных сидом идемпотентно).
 */
export default function globalSetup(): void {
  const databaseUrl = process.env.DATABASE_URL_TEST ?? process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      'Для e2e-тестов нужна база: задайте DATABASE_URL (или DATABASE_URL_TEST). ' +
        'Локально достаточно docker compose up -d db.',
    );
  }

  const env = { ...process.env, DATABASE_URL: databaseUrl, DIRECT_URL: databaseUrl };

  execSync('npx prisma migrate deploy', { stdio: 'inherit', env });
  execSync('npx tsx prisma/seed.ts', { stdio: 'inherit', env });

  process.env.DATABASE_URL = databaseUrl;
}
