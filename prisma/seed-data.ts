import { SkillCategory } from '@prisma/client';
import { PROFILE_SLUG } from '../src/profile/profile.constants';

/**
 * Данные визитки. Единственный источник правды: то, что здесь написано, —
 * ровно то, что отдаёт API после сида (см. стратегию resync в seed.ts).
 *
 * Правило наполнения: только реальные заказчики, проекты и ссылки.
 * Стек самой визитки (NestJS, Prisma, GraphQL, Docker) в список навыков
 * намеренно не добавлен — он показан делом, а не декларацией.
 */

/** Дата с точностью до месяца: день начала фриланс-заказа — ложная точность. */
function month(value: `${number}-${number}`): Date {
  const [year, monthNumber] = value.split('-').map(Number);

  return new Date(Date.UTC(year, monthNumber - 1, 1));
}

interface SkillSeed {
  name: string;
  category: SkillCategory;
}

interface ExperienceSeed {
  company: string;
  position: string;
  startDate: Date;
  /** null — работа над заказом продолжается. */
  endDate: Date | null;
  achievements: string[];
}

/**
 * Инвариант «у проекта есть хотя бы одна ссылка» выражен типом, а не проверкой:
 * запись без repoUrl и без liveUrl не пройдёт компиляцию.
 */
type ProjectSeed = { name: string; description?: string } & (
  { repoUrl: string; liveUrl?: string } | { repoUrl?: string; liveUrl: string }
);

interface LinkSeed {
  label: string;
  url: string;
}

export interface SeedData {
  profile: { slug: string; name: string; description: string };
  links: LinkSeed[];
  skills: SkillSeed[];
  experience: ExperienceSeed[];
  projects: ProjectSeed[];
}

export const seedData: SeedData = {
  profile: {
    slug: PROFILE_SLUG,
    name: 'Mark Omelchenko',
    description:
      'Ученик лицея №23 с профильным IT-направлением, 2+ года самостоятельной веб-разработки. ' +
      'Специализируюсь на React/Next.js/TypeScript, также работаю с backend на Python. ' +
      'Есть опыт коммерческих проектов, доведённых до продакшена.',
  },

  links: [
    { label: 'GitHub', url: 'https://github.com/mariktennis09-oss' },
    { label: 'Портфолио', url: 'https://domuvmorya.ru' },
  ],

  skills: [
    { name: 'TypeScript', category: SkillCategory.FRONTEND },
    { name: 'JavaScript', category: SkillCategory.FRONTEND },
    { name: 'React', category: SkillCategory.FRONTEND },
    { name: 'Next.js (App Router)', category: SkillCategory.FRONTEND },
    { name: 'Tailwind CSS', category: SkillCategory.FRONTEND },
    { name: 'Адаптивная вёрстка', category: SkillCategory.FRONTEND },

    { name: 'Python', category: SkillCategory.BACKEND },
    { name: 'REST API', category: SkillCategory.BACKEND },
    { name: 'Серверные роуты Next.js', category: SkillCategory.BACKEND },

    { name: 'Интеграция с AI API', category: SkillCategory.AI },
    { name: 'Понимание возможностей и ограничений LLM', category: SkillCategory.AI },

    { name: 'Git', category: SkillCategory.TOOLS },
    { name: 'Vercel', category: SkillCategory.TOOLS },
    { name: 'ESLint', category: SkillCategory.TOOLS },
  ],

  // ВНИМАНИЕ: даты ниже — предварительные. Заменить на реальные месяц/год
  // перед сдачей; endDate: null означает, что работа над заказом продолжается.
  experience: [
    {
      company: 'Njord Group',
      position: 'Frontend-разработчик (фриланс)',
      startDate: month('2025-03'),
      endDate: null,
      achievements: [
        'Разработал многостраничный сайт на Next.js 15 (App Router) со строгим TypeScript и Tailwind v4.',
        'Настроил статическую генерацию страниц услуг, флота и новостей через generateStaticParams.',
        'Реализовал поиск рейсов и отслеживание груза.',
        'Написал серверный API-роут приёма заявок и подготовил интеграцию с CRM и Яндекс.Метрикой через переменные окружения.',
        'Вынес весь контент в отдельный слой (src/content): заказчик правит тексты, не трогая код.',
      ],
    },
    {
      company: '«Дом у моря»',
      position: 'Frontend-разработчик (фриланс)',
      startDate: month('2024-09'),
      endDate: month('2025-01'),
      achievements: [
        'Собрал одностраничный сайт аренды дома в Зеленоградске: галерея, видеообзоры, FAQ-аккордеон, карта, страницы активностей.',
        'Реализовал форму бронирования с выбором дат и числа гостей.',
        'Сделал адаптивную вёрстку под мобильные устройства.',
        'Довёл сайт до продакшена на domuvmorya.ru.',
      ],
    },
  ],

  projects: [
    {
      name: 'Njord Group',
      repoUrl: 'https://github.com/mariktennis09-oss/njordgroup',
    },
    {
      name: '«Дом у моря»',
      liveUrl: 'https://domuvmorya.ru',
      description: 'Сайт аренды дома в Зеленоградске. Демо: seaside-house.vercel.app',
    },
    {
      name: 'Weather App',
      repoUrl: 'https://github.com/mariktennis09-oss/weather-app',
      description: 'React + TypeScript + Vite, интеграция Visual Crossing Timeline API.',
    },
    {
      name: 'Baltartec',
      repoUrl: 'https://github.com/mariktennis09-oss/baltartec',
      description: 'Backend-проект на Python.',
    },
    {
      name: 'Бэкенд-визитка',
      repoUrl: 'https://github.com/mariktennis09-oss/digital-business-card',
      description: 'Backend-визитка на NestJS, GraphQL, Prisma и Docker — сам этот API.',
    },
  ],
};
