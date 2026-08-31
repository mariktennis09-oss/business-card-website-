import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/bootstrap';
import { seedData } from '../prisma/seed-data';

/**
 * Запрос из технического задания — дословно. Отдельный тест ровно на него нужен,
 * чтобы соответствие условию проверялось само, а не глазами на демо.
 */
const QUERY_FROM_SPEC = `query {
  profile {
    name
    description
    skills {
      name
    }
    experience {
      company
      position
    }
    projects {
      name
    }
  }
}`;

interface GraphQLResponse<T> {
  data?: T;
  errors?: { message: string; extensions?: Record<string, unknown> }[];
}

describe('GraphQL API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();

    app = configureApp(moduleRef.createNestApplication()) as INestApplication<App>;
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  function graphql<T>(query: string, variables?: Record<string, unknown>) {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({ query, variables })
      .expect(200)
      .then((response) => response.body as GraphQLResponse<T>);
  }

  it('отвечает на запрос из ТЗ данными профиля', async () => {
    const body = await graphql<{
      profile: {
        name: string;
        description: string;
        skills: { name: string }[];
        experience: { company: string; position: string }[];
        projects: { name: string }[];
      };
    }>(QUERY_FROM_SPEC);

    expect(body.errors).toBeUndefined();

    const profile = body.data?.profile;
    expect(profile?.name).toBe(seedData.profile.name);
    expect(profile?.description).toBe(seedData.profile.description);
    expect(profile?.skills).toHaveLength(seedData.skills.length);
    expect(profile?.experience).toHaveLength(seedData.experience.length);
    expect(profile?.projects).toHaveLength(seedData.projects.length);
  });

  it('фильтрует навыки по категории, а без аргумента отдаёт все', async () => {
    const body = await graphql<{
      all: { skills: { name: string; category: string }[] };
      backend: { skills: { name: string; category: string }[] };
    }>(`
      query {
        all: profile {
          skills {
            name
            category
          }
        }
        backend: profile {
          skills(category: BACKEND) {
            name
            category
          }
        }
      }
    `);

    expect(body.errors).toBeUndefined();
    expect(body.data?.all.skills).toHaveLength(seedData.skills.length);
    expect(body.data?.backend.skills.length).toBeGreaterThan(0);
    expect(body.data?.backend.skills.every((skill) => skill.category === 'BACKEND')).toBe(true);
  });

  it('отдаёт вложенные достижения и вычисляемые поля периода', async () => {
    const body = await graphql<{
      profile: {
        experience: {
          company: string;
          startDate: string;
          endDate: string | null;
          isCurrent: boolean;
          durationMonths: number;
          period: string;
          achievements: { text: string }[];
        }[];
      };
    }>(`
      query {
        profile {
          experience {
            company
            startDate
            endDate
            isCurrent
            durationMonths
            period
            achievements {
              text
            }
          }
        }
      }
    `);

    expect(body.errors).toBeUndefined();

    const experience = body.data?.profile.experience ?? [];
    expect(experience.length).toBe(seedData.experience.length);
    expect(experience.every((item) => item.achievements.length > 0)).toBe(true);
    expect(experience.every((item) => item.durationMonths >= 1)).toBe(true);
    expect(experience.every((item) => item.isCurrent === (item.endDate === null))).toBe(true);

    // Порядок задаёт доменное правило: текущие места работы идут первыми.
    const currentFlags = experience.map((item) => item.isCurrent);
    expect([...currentFlags].sort((a, b) => Number(b) - Number(a))).toEqual(currentFlags);
  });

  it('у каждого проекта есть хотя бы одна ссылка', async () => {
    const body = await graphql<{
      profile: { projects: { name: string; repoUrl: string | null; liveUrl: string | null }[] };
    }>(`
      query {
        profile {
          projects {
            name
            repoUrl
            liveUrl
          }
        }
      }
    `);

    expect(body.errors).toBeUndefined();
    expect(body.data?.profile.projects.every((p) => p.repoUrl ?? p.liveUrl)).toBeTruthy();
  });

  it('отдаёт ошибку с кодом на несуществующее поле, а не падает', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query: '{ profile { unknownField } }' });

    const body = response.body as GraphQLResponse<unknown>;
    expect(body.errors?.[0]?.extensions?.code).toBe('GRAPHQL_VALIDATION_FAILED');
  });

  it('/health отвечает статусом ok с проверкой базы', async () => {
    const response = await request(app.getHttpServer()).get('/health').expect(200);

    expect((response.body as { status: string }).status).toBe('ok');
  });
});
