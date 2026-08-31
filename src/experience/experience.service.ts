import { Injectable } from '@nestjs/common';
import { Experience } from '@prisma/client';
import { ExperienceRepository } from './experience.repository';
import { isCurrent } from './experience.period';

@Injectable()
export class ExperienceService {
  constructor(private readonly repository: ExperienceRepository) {}

  async findForProfile(profileId: string): Promise<Experience[]> {
    const experience = await this.repository.findByProfileId(profileId);

    return [...experience].sort(byRecency);
  }
}

/**
 * Порядок вывода опыта: сначала текущие места, затем завершённые — по дате начала
 * по убыванию. Это доменное правило, а не деталь хранилища: в SQL оно выражается
 * только через NULLS FIRST по endDate, и тогда правило пришлось бы вычитывать
 * из строки orderBy вместо кода.
 */
function byRecency(a: Experience, b: Experience): number {
  if (isCurrent(a) !== isCurrent(b)) {
    return isCurrent(a) ? -1 : 1;
  }

  return b.startDate.getTime() - a.startDate.getTime();
}
