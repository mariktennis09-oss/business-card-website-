import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './bootstrap';
import { Env } from './config/env.schema';

async function bootstrap(): Promise<void> {
  const app = configureApp(await NestFactory.create(AppModule));

  const config = app.get(ConfigService<Env, true>);
  const port = config.get('PORT', { infer: true });

  await app.listen(port);

  Logger.log(`Apollo Sandbox: http://localhost:${port}/graphql`, 'Bootstrap');
}

void bootstrap();
