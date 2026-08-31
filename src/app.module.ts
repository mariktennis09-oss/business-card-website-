import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { join } from 'node:path';
import { GqlContext } from './common/graphql-context';
import { PrismaExceptionFilter } from './common/prisma-exception.filter';
import { Env, validateEnv } from './config/env.schema';
import { AchievementLoaderFactory } from './experience/achievement.loader';
import { ExperienceModule } from './experience/experience.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true, validate: validateEnv }),
    PrismaModule,

    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      // ExperienceModule нужен здесь, потому что context-фабрика создаёт
      // request-scoped DataLoader и владеет его временем жизни.
      imports: [ExperienceModule],
      inject: [AchievementLoaderFactory, ConfigService],
      useFactory: (
        loaderFactory: AchievementLoaderFactory,
        config: ConfigService<Env, true>,
      ): ApolloDriverConfig => {
        const isProduction = config.get('NODE_ENV', { infer: true }) === 'production';

        return {
          // В проде схема собирается в памяти: файловая система на Vercel
          // доступна только на чтение. Локально schema.gql пишется в корень
          // репозитория и коммитится как читаемый артефакт контракта.
          autoSchemaFile: isProduction ? true : join(process.cwd(), 'schema.gql'),
          sortSchema: true,

          // Sandbox включён и в проде намеренно: ТЗ требует, чтобы API можно
          // было исследовать по развёрнутой ссылке. API read-only, секретов нет.
          playground: false,
          introspection: true,
          plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],

          context: (): GqlContext => ({
            loaders: {
              achievementsByExperienceId: loaderFactory.create(),
            },
          }),

          // В проде наружу уходит сообщение и код, без стека и внутренностей.
          formatError: (formattedError) =>
            isProduction
              ? {
                  message: formattedError.message,
                  extensions: { code: formattedError.extensions?.code ?? 'INTERNAL_SERVER_ERROR' },
                }
              : formattedError,
        };
      },
    }),

    ProfileModule,
    HealthModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: PrismaExceptionFilter }],
})
export class AppModule {}
