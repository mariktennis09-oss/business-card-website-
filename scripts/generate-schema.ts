import { NestFactory } from '@nestjs/core';
import { GraphQLSchemaBuilderModule, GraphQLSchemaFactory } from '@nestjs/graphql';
import { lexicographicSortSchema, printSchema } from 'graphql';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ExperienceResolver } from '../src/experience/experience.resolver';
import { ProfileResolver } from '../src/profile/profile.resolver';

/**
 * Печатает schema.gql из метаданных резолверов — без подъёма приложения и без
 * подключения к базе. Благодаря этому контракт GraphQL можно собрать и
 * проверить в CI, где никакой базы нет.
 *
 * `--check` не переписывает файл, а падает, если закоммиченная схема разошлась
 * с кодом: сгенерированный артефакт не должен молча устаревать.
 */
const SCHEMA_PATH = join(process.cwd(), 'schema.gql');

/**
 * Тот же заголовок, что дописывает GraphQLModule, когда пишет schema.gql на
 * запуске в dev-режиме. Оба генератора обязаны давать байт в байт одинаковый
 * файл, иначе schema:check начнёт ругаться после обычного npm run start:dev.
 */
const HEADER = [
  '# ------------------------------------------------------',
  '# THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)',
  '# ------------------------------------------------------',
  '',
  '',
].join('\n');

async function main(): Promise<void> {
  const app = await NestFactory.create(GraphQLSchemaBuilderModule, { logger: false });
  await app.init();

  try {
    const schemaFactory = app.get(GraphQLSchemaFactory);
    const schema = await schemaFactory.create([ProfileResolver, ExperienceResolver]);

    // lexicographicSortSchema повторяет sortSchema: true из GraphQLModule,
    // иначе порядок типов в файле зависел бы от порядка импортов.
    const printed = HEADER + printSchema(lexicographicSortSchema(schema));

    if (process.argv.includes('--check')) {
      check(printed);
      return;
    }

    writeFileSync(SCHEMA_PATH, printed, 'utf8');
    console.log('schema.gql обновлён.');
  } finally {
    await app.close();
  }
}

function check(printed: string): void {
  if (!existsSync(SCHEMA_PATH)) {
    throw new Error('schema.gql отсутствует. Выполните npm run schema:generate.');
  }

  if (readFileSync(SCHEMA_PATH, 'utf8') !== printed) {
    throw new Error('schema.gql разошёлся с кодом. Выполните npm run schema:generate.');
  }

  console.log('schema.gql соответствует коду.');
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
