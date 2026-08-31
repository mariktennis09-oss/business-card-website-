import { Injectable } from '@nestjs/common';
import { Achievement } from '@prisma/client';
import DataLoader from 'dataloader';
import { AchievementRepository } from './achievement.repository';

/**
 * Единственное место в схеме, где N+1 вообще возможен: у `Experience.achievements`
 * на своём уровне вложенности несколько родителей. Остальные вложенные коллекции
 * висят на singleton-профиле — там родитель ровно один, и лоадер был бы обрядом,
 * а не решением.
 *
 * Фабрика, а не готовый провайдер-лоадер: DataLoader кэширует, поэтому его время
 * жизни обязано совпадать с временем жизни запроса. Экземпляр создаёт
 * context-фабрика GraphQL-модуля на каждый входящий запрос.
 */
@Injectable()
export class AchievementLoaderFactory {
  constructor(private readonly repository: AchievementRepository) {}

  create(): DataLoader<string, Achievement[]> {
    return new DataLoader<string, Achievement[]>(async (experienceIds) => {
      const achievements = await this.repository.findByExperienceIds(experienceIds);

      const grouped = new Map<string, Achievement[]>(experienceIds.map((id) => [id, []]));
      for (const achievement of achievements) {
        grouped.get(achievement.experienceId)?.push(achievement);
      }

      // DataLoader требует ответ ровно той же длины и в том же порядке, что и ключи.
      return experienceIds.map((id) => grouped.get(id) ?? []);
    });
  }
}
