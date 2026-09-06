'use client';

import { useThree } from '@react-three/fiber';
import gsap from 'gsap';
import { useEffect, useRef } from 'react';
import { Color } from 'three';
import { BACKDROP, TRANSMISSION_SCALE } from '@/lib/scene-constants';

/**
 * Заливка секции внутри сцены three.
 *
 * Она дублирует ту, что лежит в DOM, и это сделано намеренно. Стекло
 * преломляет отдельный проход рендера, в котором есть только содержимое
 * сцены: элемента из DOM ему не видно, и без фона внутри three кристалл
 * пропускал бы сквозь себя пустоту.
 *
 * Заливка в DOM при этом остаётся — она отвечает за случай, когда WebGL
 * недоступен и canvas'а на странице нет вовсе.
 */
export function SceneBackground({ color }: { color: string }) {
  const scene = useThree((state) => state.scene);
  const renderer = useThree((state) => state.gl);

  // Цвет живёт в одном экземпляре Color, который сцена держит как фон:
  // GSAP правит его каналы на месте, пересборки объекта не происходит.
  const current = useRef(new Color(color));
  const mounted = useRef(false);

  useEffect(() => {
    renderer.transmissionResolutionScale = TRANSMISSION_SCALE;
  }, [renderer]);

  useEffect(() => {
    const background = current.current;
    scene.background = background;

    return () => {
      scene.background = null;
    };
  }, [scene]);

  useEffect(() => {
    const target = new Color(color);

    // Первый цвет ставится сразу: анимировать переход из ниоткуда незачем.
    if (!mounted.current) {
      mounted.current = true;
      current.current.copy(target);
      return;
    }

    const tween = gsap.to(current.current, {
      r: target.r,
      g: target.g,
      b: target.b,
      duration: BACKDROP.duration,
      ease: BACKDROP.ease,
    });

    return () => {
      tween.kill();
    };
  }, [color]);

  return null;
}
