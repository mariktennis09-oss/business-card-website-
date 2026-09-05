import { Field, ID, ObjectType } from '@nestjs/graphql';
import { DateTimeScalar } from '../common/date-time.scalar';

@ObjectType('Achievement', { description: 'Конкретный результат, достигнутый на месте работы.' })
export class AchievementModel {
  @Field(() => ID)
  id!: string;

  @Field()
  text!: string;
}

/**
 * Поля `isCurrent`, `durationMonths` и `period` в классе отсутствуют намеренно:
 * они вычисляются из startDate/endDate и объявлены как @ResolveField в резолвере.
 * Хранить производные значения — значит завести второй источник правды.
 */
@ObjectType('Experience', { description: 'Запись об опыте работы.' })
export class ExperienceModel {
  @Field(() => ID)
  id!: string;

  @Field()
  company!: string;

  @Field()
  position!: string;

  @Field(() => DateTimeScalar, { description: 'Начало работы, точность — до месяца.' })
  startDate!: Date;

  @Field(() => DateTimeScalar, {
    nullable: true,
    description: 'Окончание работы; null — работа продолжается.',
  })
  endDate!: Date | null;
}
