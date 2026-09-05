// Вершинный шейдер точек. Геометрия хранит не координаты, а ссылку в текстуру
// симуляции: позиция читается оттуда, поэтому буфер вершин между кадрами
// не трогается вовсе.

uniform sampler2D uPositions;
uniform float uPointSize;
uniform float uPixelRatio;

attribute vec2 aReference;

varying float vLife;

void main() {
  vec4 data = texture2D(uPositions, aReference);

  vec4 viewPosition = modelViewMatrix * vec4(data.xyz, 1.0);
  gl_Position = projectionMatrix * viewPosition;

  vLife = data.a;

  // Перспективное уменьшение: дальние частицы мельче, ближние крупнее.
  gl_PointSize = uPointSize * uPixelRatio * (1.0 / max(-viewPosition.z, 0.001));
}
