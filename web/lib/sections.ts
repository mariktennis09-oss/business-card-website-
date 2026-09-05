/**
 * Разделы страницы и их адреса. Один список — источник и для меню,
 * и для хеш-роутинга, и для нумерации внизу: рассинхронизировать нечего.
 */
export const SECTIONS = [
  { id: 'index', hash: '#/', label: 'Index' },
  { id: 'work', hash: '#/work', label: 'Work' },
  { id: 'about', hash: '#/about', label: 'About' },
  { id: 'contact', hash: '#/contact', label: 'Contact' },
] as const;

export type SectionId = (typeof SECTIONS)[number]['id'];

export const DEFAULT_SECTION: SectionId = 'index';

export function sectionIndex(id: SectionId): number {
  return SECTIONS.findIndex((section) => section.id === id);
}
