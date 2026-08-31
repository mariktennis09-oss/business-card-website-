// Локально строка подключения берётся из .env; в Docker и на Vercel переменные
// приходят из окружения, и dotenv просто ничего не находит.
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { seedData } from './seed-data';

/**
 * Идемпотентный сид: выполняется при каждом старте контейнера и на сборке
 * Vercel, результат от количества запусков не зависит.
 *
 * Стратегия — полный resync, а не upsert каждой записи. Upsert не удаляет то,
 * что убрали из seed-data.ts: в базе остались бы «мёртвые» строки, и API отдавал
 * бы не то, что написано в репозитории. Для визитки такое расхождение хуже, чем
 * лишний DELETE на старте.
 *
 * Сам Profile — upsert по slug: singleton не пересоздаётся, его id стабилен
 * между деплоями.
 *
 * Скрипт работает на голом PrismaClient, без контекста Nest: инициализация базы
 * не должна зависеть от того, поднимается ли приложение.
 */
const prisma = new PrismaClient();

async function seed(): Promise<void> {
  const { profile, links, skills, experience, projects } = seedData;

  assertEveryProjectHasLink();

  const { id: profileId } = await prisma.profile.upsert({
    where: { slug: profile.slug },
    update: { name: profile.name, description: profile.description },
    create: profile,
  });

  await prisma.$transaction([
    // Достижения и связанные записи уходят каскадом (onDelete: Cascade).
    prisma.skill.deleteMany({ where: { profileId } }),
    prisma.experience.deleteMany({ where: { profileId } }),
    prisma.project.deleteMany({ where: { profileId } }),
    prisma.profileLink.deleteMany({ where: { profileId } }),

    // Позиция в массиве и есть курируемый порядок вывода — отдельного
    // поля в данных нет, чтобы его нельзя было рассинхронизировать.
    prisma.skill.createMany({
      data: skills.map((skill, order) => ({ ...skill, profileId, order })),
    }),
    prisma.project.createMany({
      data: projects.map((project, order) => ({ ...project, profileId, order })),
    }),
    prisma.profileLink.createMany({
      data: links.map((link, order) => ({ ...link, profileId, order })),
    }),

    // Опыт создаётся по одной записи: у него вложенные достижения,
    // а createMany вложенных записей не умеет.
    ...experience.map(({ achievements, ...record }) =>
      prisma.experience.create({
        data: {
          ...record,
          profileId,
          achievements: {
            create: achievements.map((text, order) => ({ text, order })),
          },
        },
      }),
    ),
  ]);

  console.log(
    `Сид выполнен: профиль «${profile.slug}», навыков — ${skills.length}, ` +
      `мест работы — ${experience.length}, проектов — ${projects.length}, ссылок — ${links.length}.`,
  );
}

/**
 * Инвариант «у проекта есть хотя бы одна ссылка» гарантирован типом ProjectSeed.
 * Эта проверка — страховка на случай, если тип когда-нибудь ослабят: пустой
 * проект должен ронять сид, а не тихо попадать в API.
 */
function assertEveryProjectHasLink(): void {
  const broken = seedData.projects.filter((project) => !project.repoUrl && !project.liveUrl);

  if (broken.length > 0) {
    throw new Error(
      `У проектов нет ни repoUrl, ни liveUrl: ${broken.map((p) => p.name).join(', ')}`,
    );
  }
}

seed()
  .catch((error: unknown) => {
    console.error('Сид не выполнен:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
