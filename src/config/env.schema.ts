import { z } from 'zod';

/**
 * Единственное место, где читается process.env.
 * Валидация — на старте, fail-fast: приложение не должно подниматься
 * с половиной конфигурации.
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  PORT: z.coerce.number().int().positive().default(3000),

  /** Рантайм-подключение. На Neon — pooled endpoint. */
  DATABASE_URL: z
    .string()
    .min(1)
    .refine((value) => /^postgres(ql)?:\/\//.test(value), {
      message: 'DATABASE_URL должен быть postgres:// или postgresql:// URL',
    }),

  /**
   * Прямое подключение для Prisma CLI (migrate deploy, seed).
   * В рантайме приложение его не использует, поэтому опционален.
   */
  DIRECT_URL: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(raw: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(raw);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new Error(`Некорректные переменные окружения:\n${details}`);
  }

  return parsed.data;
}
