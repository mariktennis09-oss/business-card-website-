import { Test } from '@nestjs/testing';
import { Experience } from '@prisma/client';
import { ExperienceRepository } from './experience.repository';
import { ExperienceService } from './experience.service';

function experience(company: string, startDate: string, endDate: string | null): Experience {
  return {
    id: company,
    profileId: 'profile-1',
    company,
    position: 'Frontend-разработчик (фриланс)',
    startDate: new Date(startDate),
    endDate: endDate === null ? null : new Date(endDate),
  };
}

describe('ExperienceService', () => {
  const repository = { findByProfileId: jest.fn() };

  async function createService(): Promise<ExperienceService> {
    const moduleRef = await Test.createTestingModule({
      providers: [ExperienceService, { provide: ExperienceRepository, useValue: repository }],
    }).compile();

    return moduleRef.get(ExperienceService);
  }

  beforeEach(() => {
    repository.findByProfileId.mockReset();
  });

  it('ставит текущие места работы перед завершёнными', async () => {
    repository.findByProfileId.mockResolvedValue([
      experience('Завершённый заказ', '2025-06-01', '2025-09-01'),
      experience('Текущий заказ', '2024-01-01', null),
    ]);

    const result = await (await createService()).findForProfile('profile-1');

    expect(result.map((item) => item.company)).toEqual(['Текущий заказ', 'Завершённый заказ']);
  });

  it('сортирует завершённые места по дате начала по убыванию', async () => {
    repository.findByProfileId.mockResolvedValue([
      experience('Старый', '2023-05-01', '2023-08-01'),
      experience('Новый', '2024-09-01', '2025-01-01'),
      experience('Средний', '2024-02-01', '2024-04-01'),
    ]);

    const result = await (await createService()).findForProfile('profile-1');

    expect(result.map((item) => item.company)).toEqual(['Новый', 'Средний', 'Старый']);
  });

  it('не мутирует список, полученный из репозитория', async () => {
    const rows = [
      experience('Завершённый заказ', '2025-06-01', '2025-09-01'),
      experience('Текущий заказ', '2024-01-01', null),
    ];
    repository.findByProfileId.mockResolvedValue(rows);

    await (await createService()).findForProfile('profile-1');

    expect(rows.map((item) => item.company)).toEqual(['Завершённый заказ', 'Текущий заказ']);
  });
});
