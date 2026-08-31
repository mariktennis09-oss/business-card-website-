import { Injectable } from '@nestjs/common';
import { Experience } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExperienceRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Порядок здесь не задаётся: «сначала текущие места, затем по дате начала
   * по убыванию» — доменное правило, оно живёт в сервисе и покрыто тестом.
   */
  findByProfileId(profileId: string): Promise<Experience[]> {
    return this.prisma.experience.findMany({ where: { profileId } });
  }
}
