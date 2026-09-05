'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_SECTION, SECTIONS, type SectionId } from './sections';

function parseHash(hash: string): SectionId {
  return SECTIONS.find((section) => section.hash === hash)?.id ?? DEFAULT_SECTION;
}

/**
 * Текущий раздел живёт в адресе, а не в состоянии компонента: прямая ссылка
 * на `#/work` открывает нужный раздел, «назад» в браузере работает, а меню
 * остаётся обычными ссылками, которые можно открыть в новой вкладке.
 *
 * На сервере хеша не существует, поэтому первый рендер всегда отдаёт раздел
 * по умолчанию, а синхронизация происходит после монтирования. Флаг
 * `settled` позволяет вызывающему не проигрывать переход на этой первой
 * синхронизации — иначе прямая ссылка открывалась бы с анимацией из
 * чужого раздела.
 */
export function useHashSection(): { section: SectionId; settled: boolean } {
  const [section, setSection] = useState<SectionId>(DEFAULT_SECTION);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const sync = () => setSection(parseHash(window.location.hash));

    sync();
    setSettled(true);

    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  return { section, settled };
}
