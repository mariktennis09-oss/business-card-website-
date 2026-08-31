import type { Achievement } from '@prisma/client';
import type DataLoader from 'dataloader';

/**
 * Request-scoped контекст GraphQL.
 * Лоадеры создаются на каждый запрос — батчинг не должен переживать запрос,
 * иначе это кэш с неограниченным временем жизни.
 */
export interface GqlContext {
  loaders: {
    achievementsByExperienceId: DataLoader<string, Achievement[]>;
  };
}
