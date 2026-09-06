import { Vector3, type BufferGeometry } from 'three';
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry.js';

/**
 * Генератор огранки.
 *
 * Кристалл не собирается из примитивов и не грузится файлом — он считается.
 * Берётся облако точек на сфере, каждая сдвигается по радиусу и по углу,
 * облако растягивается по вертикали, снизу и сверху добавляются одиночные
 * точки-остриё, и по всему этому строится выпуклая оболочка.
 *
 * Оболочка выпуклого облака из полутора десятков точек — это ровно то, чем
 * кристалл и является: несколько крупных плоских граней, сходящихся под
 * неправильными углами. Точек мало намеренно: возьмёшь сотню — получится
 * гладкая галька, а не огранка.
 *
 * Генератор детерминированный: одно и то же зерно даёт одну и ту же форму
 * всегда и везде. Иначе кристалл менялся бы между сервером и клиентом,
 * между сборками и между перезагрузками, и договориться о том, какой
 * из них нравится, было бы не о чем.
 */
export interface CrystalShape {
  /** Зерно генератора. Меняешь число — получаешь другой кристалл. */
  seed: number;
  /** Точек на сфере. Больше — мельче грани. */
  facetPoints: number;
  /** Разброс радиуса: от него грани перестают быть одинаковыми. */
  radiusJitter: number;
  /** Разброс по углу — чтобы точки не ложились правильной спиралью. */
  angleJitter: number;
  /** Вытягивание облака по вертикали. */
  elongation: number;
  /** Насколько нижнее остриё выступает за тело. */
  tipLength: number;
  /** То же сверху. Короче нижнего — силуэт получается каплей. */
  crownLength: number;
  /** Итоговая высота в мировых единицах: форма нормируется под неё. */
  height: number;
}

/** Угол золотого сечения: даёт равномерную спираль точек по сфере. */
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

export function createCrystalGeometry(shape: CrystalShape): BufferGeometry {
  const random = mulberry32(shape.seed);
  const points: Vector3[] = [];

  for (let index = 0; index < shape.facetPoints; index += 1) {
    // Точки раскладываются по спирали Фибоначчи — равномерно по сфере,
    // без сгущения у полюсов, которое даёт разбиение по параллелям.
    const t = (index + 0.5) / shape.facetPoints;
    const y = 1 - 2 * t;
    const ring = Math.sqrt(Math.max(0, 1 - y * y));

    const angle = index * GOLDEN_ANGLE + (random() - 0.5) * shape.angleJitter;
    const radius = 1 + (random() - 0.5) * shape.radiusJitter;

    points.push(
      new Vector3(
        Math.cos(angle) * ring * radius,
        y * radius * shape.elongation,
        Math.sin(angle) * ring * radius,
      ),
    );
  }

  // Два остриё вне облака. Выпуклая оболочка обязана их включить, и от
  // каждого к телу протянутся длинные треугольные грани — то, из-за чего
  // форма читается кристаллом, а не многогранником.
  points.push(new Vector3(0, -shape.tipLength, 0));
  points.push(new Vector3(0, shape.crownLength, 0));

  const geometry = new ConvexGeometry(points);

  // Форма нормируется по высоте: зерно меняет пропорции, но кристалл
  // обязан оставаться в тех же габаритах, иначе кадр «дышит» при каждой
  // перегенерации, а камеру и ореол пришлось бы подбирать заново.
  geometry.center();
  geometry.computeBoundingBox();

  const box = geometry.boundingBox;
  if (box) {
    const currentHeight = box.max.y - box.min.y;
    if (currentHeight > 0) {
      geometry.scale(
        shape.height / currentHeight,
        shape.height / currentHeight,
        shape.height / currentHeight,
      );
    }
  }

  return geometry;
}

/**
 * Mulberry32 — маленький генератор псевдослучайных чисел с явным состоянием.
 * Math.random здесь не годится: она не воспроизводится, а форма обязана
 * зависеть только от зерна.
 */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
