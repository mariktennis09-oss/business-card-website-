// Шаг симуляции. Выполняется во фрагментном шейдере над всей текстурой
// позиций: один тексель — одна частица, RGB — позиция, A — остаток жизни.
// CPU в симуляции не участвует.
//
// `texturePosition` и `resolution` объявляет GPUComputationRenderer,
// поэтому здесь их нет.

uniform float uTime;
uniform float uDelta;
uniform sampler2D uOrigin;

uniform float uCurlScale;
uniform float uCurlDrift;
uniform float uSpeed;
uniform float uLifeDecay;

uniform vec3 uCursor;
uniform float uCursorRadius;
uniform float uCursorStrength;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;

  vec4 data = texture2D(texturePosition, uv);
  vec3 position = data.xyz;
  float life = data.a;

  life -= uLifeDecay * uDelta;

  if (life <= 0.0) {
    // Возрождение в исходной точке: облако держит форму, сколько бы циклов
    // ни прошло, и не расползается по экрану. Фазы частиц разведены при
    // засеве, поэтому гасить их одновременно нечему.
    position = texture2D(uOrigin, uv).xyz;
    life = 1.0;
  } else {
    vec3 noiseInput = position * uCurlScale + vec3(0.0, 0.0, uTime * uCurlDrift);
    vec3 velocity = curlNoise(noiseInput);

    // Отталкивание от курсора: сила спадает по гауссиане, поэтому у границы
    // радиуса нет скачка, за который цеплялся бы глаз.
    vec2 away = position.xy - uCursor.xy;
    float distance = length(away);
    float falloff = exp(-(distance * distance) / (uCursorRadius * uCursorRadius));
    velocity += vec3(normalize(away + vec2(1e-5)), 0.0) * falloff * uCursorStrength;

    position += velocity * uSpeed * uDelta;
  }

  gl_FragColor = vec4(position, life);
}
