import { Injectable } from '@nestjs/common';
import { Achievement } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AchievementRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Батч-выборка для DataLoader: один запрос на все места работы в GraphQL-запросе. */
  findByExperienceIds(experienceIds: readonly string[]): Promise<Achievement[]> {
    return this.prisma.achievement.findMany({
      where: { experienceId: { in: [...experienceIds] } },
      orderBy: { order: 'asc' },
    });
  }
}
