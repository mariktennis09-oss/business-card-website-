import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GqlContext } from './graphql-context';

/**
 * `@GqlLoaders()` вместо `@Context()` с ручным приведением типа: резолвер
 * получает типизированные лоадеры и не знает, как устроен контекст запроса.
 */
export const GqlLoaders = createParamDecorator(
  (_data: unknown, context: ExecutionContext): GqlContext['loaders'] =>
    GqlExecutionContext.create(context).getContext<GqlContext>().loaders,
);
