'use client';

import { useEffect, useRef, type RefObject } from 'react';

export interface PointerNdc {
  /** Координаты в NDC: [-1, 1] по обеим осям, Y вверх. */
  x: number;
  y: number;
  /** Курсор находится над окном. */
  active: boolean;
}

/**
 * Позиция курсора живёт в ref, а не в состоянии: движение мыши не должно
 * перерисовывать React-дерево шестьдесят раз в секунду. Сглаживание здесь
 * не делается — оно принадлежит тому циклу, который эти координаты читает.
 */
export function usePointerNdc(): RefObject<PointerNdc> {
  const pointer = useRef<PointerNdc>({ x: 0, y: 0, active: false });

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((event.clientY / window.innerHeight) * 2 - 1);
      pointer.current.active = true;
    };

    const onPointerLeave = () => {
      pointer.current.active = false;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('blur', onPointerLeave);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('blur', onPointerLeave);
    };
  }, []);

  return pointer;
}
