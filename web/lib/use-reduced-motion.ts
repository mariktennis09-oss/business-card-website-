'use client';

import { useEffect, useState } from 'react';

/**
 * Системная настройка «меньше движения». Первый рендер всегда считает, что
 * движение разрешено: на сервере media-запросов нет, и любое другое
 * предположение расходилось бы с разметкой при гидратации.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(query.matches);

    sync();
    query.addEventListener('change', sync);

    return () => query.removeEventListener('change', sync);
  }, []);

  return reduced;
}
