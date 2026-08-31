import { Injectable } from '@nestjs/common';
import { Skill, SkillCategory } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/** Единственное место в модуле навыков, где вызывается Prisma. */
@Injectable()
export class SkillRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByProfileId(profileId: string, category?: SkillCategory): Promise<Skill[]> {
    return this.prisma.skill.findMany({
      // Отсутствие фильтра — это отсутствие условия, а не условие «любая категория».
      where: { profileId, ...(category ? { category } : {}) },
      orderBy: { order: 'asc' },
    });
  }
}
