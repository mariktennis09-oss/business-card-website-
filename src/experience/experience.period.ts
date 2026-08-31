/**
 * Чистая доменная арифметика периода работы: ни Nest, ни Prisma, ни ввода-вывода.
 * Всё, что GraphQL отдаёт как isCurrent / durationMonths / period, считается здесь.
 */

export interface WorkPeriod {
  startDate: Date;
  endDate: Date | null;
}

const MONTHS_RU = [
  'январь',
  'февраль',
  'март',
  'апрель',
  'май',
  'июнь',
  'июль',
  'август',
  'сентябрь',
  'октябрь',
  'ноябрь',
  'декабрь',
];

/** Место работы считается текущим ровно тогда, когда не проставлена дата окончания. */
export function isCurrent(period: WorkPeriod): boolean {
  return period.endDate === null;
}

/**
 * Длительность в месяцах, включая месяц начала и месяц окончания:
 * работа «март — март» это один месяц, а не ноль.
 * `now` параметризован, чтобы тест не зависел от текущей даты.
 */
export function durationInMonths(period: WorkPeriod, now: Date = new Date()): number {
  const end = period.endDate ?? now;
  const months =
    (end.getUTCFullYear() - period.startDate.getUTCFullYear()) * 12 +
    (end.getUTCMonth() - period.startDate.getUTCMonth()) +
    1;

  return Math.max(1, months);
}

/**
 * Человекочитаемая строка периода — тонкий presentational-хелпер поверх
 * структурных полей, а не замена им: startDate/endDate остаются в схеме,
 * и клиент волен форматировать период по-своему.
 */
export function formatPeriod(period: WorkPeriod): string {
  const from = formatMonth(period.startDate);

  if (period.endDate === null) {
    return from + ' — настоящее время';
  }

  return from + ' — ' + formatMonth(period.endDate);
}

function formatMonth(date: Date): string {
  return MONTHS_RU[date.getUTCMonth()] + ' ' + date.getUTCFullYear();
}
