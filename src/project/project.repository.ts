import { Injectable } from '@nestjs/common';
import { Project } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByProfileId(profileId: string): Promise<Project[]> {
    return this.prisma.project.findMany({
      where: { profileId },
      orderBy: { order: 'asc' },
    });
  }
}
