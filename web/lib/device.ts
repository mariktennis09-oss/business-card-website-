import { PARTICLES } from './lab-constants';

export type DeviceTier = 'high' | 'low';

/** Не описанное в lib.dom поле, которое отдают не все браузеры. */
interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number;
}

/**
 * Симуляция хранит позиции во float-текстуре и рендерит в неё же. В WebGL 1
 * для этого нужны расширения, которых может не быть, поэтому опорой считаем
 * WebGL 2: если его нет — сцену не поднимаем вовсе и показываем статичный фон.
 */
export function supportsWebGl2(): boolean {
  try {
    return Boolean(document.createElement('canvas').getContext('webgl2'));
  } catch {
    return false;
  }
}

/**
 * Стартовый класс устройства. Это догадка по косвенным признакам, а не
 * измерение: точное решение принимает авто-снижение по реальному кадру
 * (см. Portfolio). Догадка нужна лишь для того, чтобы слабое устройство
 * не начинало с заведомо тяжёлой сцены.
 */
export function detectTier(): DeviceTier {
  const navigatorWithMemory = navigator as NavigatorWithMemory;
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = navigatorWithMemory.deviceMemory ?? 4;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;

  return coarsePointer || cores <= 4 || memory <= 4 ? 'low' : 'high';
}

export function textureSizeForTier(tier: DeviceTier): number {
  return tier === 'high' ? PARTICLES.textureSize.high : PARTICLES.textureSize.low;
}
