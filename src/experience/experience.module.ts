import { Module } from '@nestjs/common';
import { AchievementLoaderFactory } from './achievement.loader';
import { AchievementRepository } from './achievement.repository';
import { ExperienceRepository } from './experience.repository';
import { ExperienceResolver } from './experience.resolver';
import { ExperienceService } from './experience.service';

@Module({
  providers: [
    ExperienceRepository,
    AchievementRepository,
    AchievementLoaderFactory,
    ExperienceService,
    ExperienceResolver,
  ],
  // Фабрика лоадеров экспортируется наружу, потому что экземпляр создаёт
  // context-фабрика GraphQL-модуля: она владеет временем жизни запроса.
  exports: [ExperienceService, AchievementLoaderFactory],
})
export class ExperienceModule {}
