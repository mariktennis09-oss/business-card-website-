'use client';

import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { PMREMGenerator } from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/**
 * Карта окружения для огранки.
 *
 * Без отражений грани кристалла отличаются друг от друга только тем, под
 * каким углом на них падает единственный источник, — получается тёмная
 * многоугольная заготовка. Отражения дают ребру блик, а плёнке — перелив.
 *
 * Комната берётся процедурная, из состава three: внешняя HDR-панорама
 * означала бы бинарный файл в репозитории и ещё одну загрузку перед первым
 * кадром. Карта считается один раз при монтировании — сцена одна и живёт
 * всё время работы страницы.
 */
export function SceneEnvironment() {
  const renderer = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    const pmrem = new PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const target = pmrem.fromScene(room, 0.04);

    scene.environment = target.texture;

    return () => {
      scene.environment = null;
      target.dispose();
      pmrem.dispose();
      room.dispose();
    };
  }, [renderer, scene]);

  return null;
}
