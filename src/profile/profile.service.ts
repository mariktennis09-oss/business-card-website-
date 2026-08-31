import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Profile, ProfileLink } from '@prisma/client';
import { PROFILE_SLUG } from './profile.constants';
import { ProfileRepository } from './profile.repository';

@Injectable()
export class ProfileService {
  constructor(private readonly repository: ProfileRepository) {}

  /**
   * Визитка — singleton, поэтому корневой запрос не принимает аргументов:
   * какой именно профиль отдавать, решает приложение, а не клиент.
   */
  async getProfile(): Promise<Profile> {
    try {
      return await this.repository.findBySlugOrThrow(PROFILE_SLUG);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        // Пустая база — это не «внутренняя ошибка Prisma», а не выполненный сид.
        throw new NotFoundException(
          `Профиль «${PROFILE_SLUG}» не найден: база не заполнена. Выполните npm run db:seed.`,
        );
      }

      throw error;
    }
  }

  getLinks(profileId: string): Promise<ProfileLink[]> {
    return this.repository.findLinksByProfileId(profileId);
  }
}
