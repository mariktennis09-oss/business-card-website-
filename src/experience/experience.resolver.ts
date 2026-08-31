import { Int, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Achievement, Experience } from '@prisma/client';
import { GqlContext } from '../common/graphql-context';
import { GqlLoaders } from '../common/gql-loaders.decorator';
import { AchievementModel, ExperienceModel } from './experience.model';
import { durationInMonths, formatPeriod, isCurrent } from './experience.period';

@Resolver(() => ExperienceModel)
export class ExperienceResolver {
  /** Единственное поле схемы, которому нужен батчинг: родителей здесь N > 1. */
  @ResolveField(() => [AchievementModel])
  achievements(
    @Parent() experience: Experience,
    @GqlLoaders() loaders: GqlContext['loaders'],
  ): Promise<Achievement[]> {
    return loaders.achievementsByExperienceId.load(experience.id);
  }

  @ResolveField(() => Boolean, { description: 'Работа над проектом продолжается.' })
  isCurrent(@Parent() experience: Experience): boolean {
    return isCurrent(experience);
  }

  @ResolveField(() => Int, {
    description: 'Длительность в месяцах, включая начальный и конечный месяцы.',
  })
  durationMonths(@Parent() experience: Experience): number {
    return durationInMonths(experience);
  }

  @ResolveField(() => String, {
    description: 'Период работы одной строкой — хелпер поверх startDate/endDate.',
  })
  period(@Parent() experience: Experience): string {
    return formatPeriod(experience);
  }
}
