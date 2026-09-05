// Постпроцесс-проход: расхождение каналов и блочный сдвиг строк.
//
// При uIntensity = 0 шейдер — точный проброс: и сдвиг, и расхождение
// умножаются на интенсивность. Так глитч выключается полностью, а не
// «почти», и в покое кадр не отличается от исходного.

precision highp float;

uniform sampler2D tDiffuse;
uniform float uIntensity;
uniform float uTime;

uniform float uRgbSplit;
uniform float uBlockShift;
uniform float uBlockHeight;

varying vec2 vUv;

float hash(float value) {
  return fract(sin(value * 127.1) * 43758.5453123);
}

void main() {
  vec2 uv = vUv;

  // Строки рвутся полосами, а не попиксельно: полоса выбирается по номеру,
  // и её номер меняется ступенчато во времени — иначе вместо разрыва плёнки
  // получается равномерный шум.
  float block = floor(uv.y / uBlockHeight);
  float noise = hash(block + floor(uTime * 24.0));
  float torn = step(0.6, noise);
  uv.x += (noise - 0.5) * uBlockShift * torn * uIntensity;

  float split = uRgbSplit * uIntensity;

  float r = texture2D(tDiffuse, uv + vec2(split, 0.0)).r;
  float g = texture2D(tDiffuse, uv).g;
  float b = texture2D(tDiffuse, uv - vec2(split, 0.0)).b;

  gl_FragColor = vec4(r, g, b, 1.0);
}
