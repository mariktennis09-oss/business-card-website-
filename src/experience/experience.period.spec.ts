import { durationInMonths, formatPeriod, isCurrent } from './experience.period';

const march2025 = new Date(Date.UTC(2025, 2, 1));
const may2025 = new Date(Date.UTC(2025, 4, 1));
const january2026 = new Date(Date.UTC(2026, 0, 1));

describe('experience.period', () => {
  describe('isCurrent', () => {
    it('считает место работы текущим, когда нет даты окончания', () => {
      expect(isCurrent({ startDate: march2025, endDate: null })).toBe(true);
    });

    it('считает место работы завершённым, когда дата окончания проставлена', () => {
      expect(isCurrent({ startDate: march2025, endDate: may2025 })).toBe(false);
    });
  });

  describe('durationInMonths', () => {
    it('считает месяцы включительно: март — май это три месяца', () => {
      expect(durationInMonths({ startDate: march2025, endDate: may2025 })).toBe(3);
    });

    it('отдаёт один месяц, когда работа началась и кончилась в одном месяце', () => {
      expect(durationInMonths({ startDate: march2025, endDate: march2025 })).toBe(1);
    });

    it('считает текущую работу до переданного «сейчас», а не до даты окончания', () => {
      expect(durationInMonths({ startDate: march2025, endDate: null }, january2026)).toBe(11);
    });

    it('переживает переход через год', () => {
      expect(durationInMonths({ startDate: may2025, endDate: january2026 })).toBe(9);
    });
  });

  describe('formatPeriod', () => {
    it('форматирует завершённый период границами', () => {
      expect(formatPeriod({ startDate: march2025, endDate: may2025 })).toBe('март 2025 — май 2025');
    });

    it('помечает текущее место работы вместо даты окончания', () => {
      expect(formatPeriod({ startDate: march2025, endDate: null })).toBe(
        'март 2025 — настоящее время',
      );
    });
  });
});
