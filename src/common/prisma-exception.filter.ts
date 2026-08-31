import { Catch, Logger } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { Prisma } from '@prisma/client';
import { GraphQLError } from 'graphql';

/**
 * Известные ошибки Prisma наружу не протекают: клиент GraphQL получает
 * доменный код ошибки, а не текст с именами таблиц и SQL.
 */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements GqlExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError): GraphQLError {
    this.logger.warn(`Prisma ${exception.code}: ${exception.message.split('\n').pop()}`);

    if (exception.code === 'P2025') {
      return new GraphQLError('Запрошенная запись не найдена', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    return new GraphQLError('Ошибка обращения к базе данных', {
      extensions: { code: 'DATABASE_ERROR' },
    });
  }
}
