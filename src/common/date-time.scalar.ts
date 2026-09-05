import { GraphQLISODateTime } from '@nestjs/graphql';
import { GraphQLScalarType } from 'graphql';

/**
 * Тот же скаляр даты, что и встроенный в NestJS, но с описанием на русском:
 * англоязычное описание из коробки — единственный текст схемы, который мы не
 * писали сами, а в Sandbox он виден рядом с полями startDate и endDate.
 *
 * Логика разбора и сериализации берётся у оригинала целиком, переопределяется
 * ровно описание.
 */
export const DateTimeScalar = new GraphQLScalarType({
  ...GraphQLISODateTime.toConfig(),
  description: 'Дата и время в формате ISO 8601, UTC. Например: 2025-03-01T00:00:00.000Z',
});
