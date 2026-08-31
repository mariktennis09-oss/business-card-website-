import { validateEnv } from './env.schema';

const validUrl = 'postgresql://card:card@localhost:5432/card?schema=public';

describe('validateEnv', () => {
  it('подставляет умолчания для необязательных переменных', () => {
    const env = validateEnv({ DATABASE_URL: validUrl });

    expect(env.NODE_ENV).toBe('development');
    expect(env.PORT).toBe(3000);
  });

  it('приводит PORT из строки к числу', () => {
    const env = validateEnv({ DATABASE_URL: validUrl, PORT: '8080' });

    expect(env.PORT).toBe(8080);
  });

  it('падает без DATABASE_URL — приложение не должно стартовать вслепую', () => {
    expect(() => validateEnv({})).toThrow(/DATABASE_URL/);
  });

  it('отвергает DATABASE_URL с чужой схемой', () => {
    expect(() => validateEnv({ DATABASE_URL: 'mysql://localhost:3306/card' })).toThrow(/postgres/);
  });

  it('не требует DIRECT_URL: он нужен только Prisma CLI, а не рантайму', () => {
    expect(() => validateEnv({ DATABASE_URL: validUrl })).not.toThrow();
  });
});
