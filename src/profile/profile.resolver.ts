import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Experience, Profile, ProfileLink, Project, Skill, SkillCategory } from '@prisma/client';
import { ExperienceModel } from '../experience/experience.model';
import { ExperienceService } from '../experience/experience.service';
import { ProjectModel } from '../project/project.model';
import { ProjectService } from '../project/project.service';
import { SkillModel } from '../skill/skill.model';
import { SkillService } from '../skill/skill.service';
import { ProfileLinkModel, ProfileModel } from './profile.model';
import { ProfileService } from './profile.service';

/**
 * Резолвер знает только про сервисы соседних модулей — репозитории чужих
 * агрегатов ему недоступны. Вложенные коллекции разрешаются лениво: запрос
 * `profile { name }` не делает ни одного лишнего похода в базу.
 *
 * DataLoader здесь не нужен: родитель у всех этих полей ровно один (singleton),
 * так что N+1 на этом уровне вложенности невозможен.
 */
@Resolver(() => ProfileModel)
export class ProfileResolver {
  constructor(
    private readonly profileService: ProfileService,
    private readonly skillService: SkillService,
    private readonly experienceService: ExperienceService,
    private readonly projectService: ProjectService,
  ) {}

  @Query(() => ProfileModel, {
    name: 'profile',
    description: 'Профиль специалиста со всеми связанными данными.',
  })
  profile(): Promise<Profile> {
    return this.profileService.getProfile();
  }

  @ResolveField(() => [ProfileLinkModel])
  links(@Parent() profile: Profile): Promise<ProfileLink[]> {
    return this.profileService.getLinks(profile.id);
  }

  @ResolveField(() => [SkillModel])
  skills(
    @Parent() profile: Profile,
    // Аргумент nullable: без него `skills { name }` обязан отдавать все навыки.
    @Args('category', { type: () => SkillCategory, nullable: true })
    category?: SkillCategory,
  ): Promise<Skill[]> {
    return this.skillService.findForProfile(profile.id, category);
  }

  @ResolveField(() => [ExperienceModel])
  experience(@Parent() profile: Profile): Promise<Experience[]> {
    return this.experienceService.findForProfile(profile.id);
  }

  @ResolveField(() => [ProjectModel])
  projects(@Parent() profile: Profile): Promise<Project[]> {
    return this.projectService.findForProfile(profile.id);
  }
}
