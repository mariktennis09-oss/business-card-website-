import { Injectable } from '@nestjs/common';
import { HealthIndicatorResult, HealthIndicatorService } from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';

/**
 * У приложения ровно одна внешняя зависимость — база. Healthcheck проверяет
 * именно её: живой процесс без доступной БД для этого API бесполезен.
 * Этот же эндпоинт дёргает healthcheck в docker-compose.
 */
@Injectable()
export class PrismaHealthIndicator {
  constructor(
    private readonly prisma: PrismaService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async pingCheck(key: string): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check(key);

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return indicator.up();
    } catch (error) {
      return indicator.down(error instanceof Error ? error.message : 'База данных недоступна');
    }
  }
}
