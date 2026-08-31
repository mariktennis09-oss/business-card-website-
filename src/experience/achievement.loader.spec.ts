import { Test } from '@nestjs/testing';
import { Achievement } from '@prisma/client';
import { AchievementLoaderFactory } from './achievement.loader';
import { AchievementRepository } from './achievement.repository';

function achievement(id: string, experienceId: string, order: number): Achievement {
  return { id, experienceId, text: `Достижение ${id}`, order };
}

describe('AchievementLoaderFactory', () => {
  const repository = { findByExperienceIds: jest.fn() };

  async function createFactory(): Promise<AchievementLoaderFactory> {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AchievementLoaderFactory,
        { provide: AchievementRepository, useValue: repository },
      ],
    }).compile();

    return moduleRef.get(AchievementLoaderFactory);
  }

  beforeEach(() => {
    repository.findByExperienceIds.mockReset();
  });

  it('собирает несколько загрузок в один запрос к базе и раскладывает результат по родителям', async () => {
    repository.findByExperienceIds.mockResolvedValue([
      achievement('a1', 'exp-1', 0),
      achievement('b1', 'exp-2', 0),
      achievement('a2', 'exp-1', 1),
    ]);

    const loader = (await createFactory()).create();

    const [first, second] = await Promise.all([loader.load('exp-1'), loader.load('exp-2')]);

    // Ровно один поход в базу на оба места работы — это и есть защита от N+1.
    expect(repository.findByExperienceIds).toHaveBeenCalledTimes(1);
    expect(repository.findByExperienceIds).toHaveBeenCalledWith(['exp-1', 'exp-2']);
    expect(first.map((item) => item.id)).toEqual(['a1', 'a2']);
    expect(second.map((item) => item.id)).toEqual(['b1']);
  });

  it('отдаёт пустой список для места работы без достижений', async () => {
    repository.findByExperienceIds.mockResolvedValue([achievement('a1', 'exp-1', 0)]);

    const loader = (await createFactory()).create();

    const [, second] = await Promise.all([loader.load('exp-1'), loader.load('exp-2')]);

    expect(second).toEqual([]);
  });

  it('создаёт независимые экземпляры: кэш лоадера не переживает запрос', async () => {
    repository.findByExperienceIds.mockResolvedValue([achievement('a1', 'exp-1', 0)]);
    const factory = await createFactory();

    await factory.create().load('exp-1');
    await factory.create().load('exp-1');

    expect(repository.findByExperienceIds).toHaveBeenCalledTimes(2);
  });
});
