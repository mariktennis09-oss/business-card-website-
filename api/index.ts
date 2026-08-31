import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Express, Request, Response } from 'express';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/bootstrap';

/**
 * Точка входа для Vercel. Модуль приложения и его настройка те же, что и в
 * main.ts, — здесь отличается только способ доставки запроса: не собственный
 * listen(), а вызов express-приложения из обработчика функции.
 *
 * Express-инстанс и промис инициализации Nest живут на уровне модуля: на тёплых
 * инвокациях приложение и пул подключений Prisma переиспользуются, а не
 * создаются заново на каждый запрос.
 */
const server: Express = express();
let initialization: Promise<void> | null = null;

async function initialize(): Promise<void> {
  const app = configureApp(await NestFactory.create(AppModule, new ExpressAdapter(server)));
  await app.init();
}

export default async function handler(request: Request, response: Response): Promise<void> {
  initialization ??= initialize();
  await initialization;

  server(request, response);
}
