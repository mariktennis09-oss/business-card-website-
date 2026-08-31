import { INestApplication } from '@nestjs/common';

/**
 * Общая проводка приложения. main.ts (обычный сервер) и api/index.ts
 * (serverless-функция на Vercel) поднимают один и тот же AppModule и применяют
 * одни и те же настройки: форк конфигурации между двумя средами запуска был бы
 * источником расхождений.
 *
 * Глобального ValidationPipe здесь нет намеренно: входных DTO у read-only API
 * нет, а единственный аргумент (`skills(category:)`) валидирует сам GraphQL
 * по типу enum — пайп поверх этого ничего бы не проверял.
 */
export function configureApp(app: INestApplication): INestApplication {
  app.enableShutdownHooks();

  return app;
}
