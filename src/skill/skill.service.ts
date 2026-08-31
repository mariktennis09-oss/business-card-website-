import { Injectable } from '@nestjs/common';
import { Skill, SkillCategory } from '@prisma/client';
import { SkillRepository } from './skill.repository';

/**
 * Публичный контракт модуля навыков: другие модули ходят сюда, а не в репозиторий.
 * Порядок навыков курируется вручную (колонка `order`), поэтому сортировка —
 * деталь выборки и остаётся в репозитории.
 */
@Injectable()
export class SkillService {
  constructor(private readonly repository: SkillRepository) {}

  findForProfile(profileId: string, category?: SkillCategory): Promise<Skill[]> {
    return this.repository.findByProfileId(profileId, category);
  }
}
