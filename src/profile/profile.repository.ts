import { Injectable } from '@nestjs/common';
import { Profile, ProfileLink } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Бросает Prisma P2025, если профиля нет; наверх это уходит как NOT_FOUND. */
  findBySlugOrThrow(slug: string): Promise<Profile> {
    return this.prisma.profile.findUniqueOrThrow({ where: { slug } });
  }

  findLinksByProfileId(profileId: string): Promise<ProfileLink[]> {
    return this.prisma.profileLink.findMany({
      where: { profileId },
      orderBy: { order: 'asc' },
    });
  }
}
