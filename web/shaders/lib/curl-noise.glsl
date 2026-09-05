// Curl noise: ротор поля симплекс-шума.
//
// Ротор любого векторного поля бездивергентен, поэтому частицы не собираются
// в комки и не выметаются из объёма — движение читается как дым, а не как
// снос по градиенту.
//
// Требует snoise(vec3) из simplex-noise-3d.glsl: файлы склеиваются в TypeScript
// перед компиляцией, порядок задан там.

vec3 snoiseVec3(vec3 x) {
  return vec3(
    snoise(x),
    snoise(vec3(x.y - 19.1, x.z + 33.4, x.x + 47.2)),
    snoise(vec3(x.z + 74.2, x.x - 124.5, x.y + 99.4))
  );
}

/**
 * Центральные разности по трём осям: шесть выборок snoiseVec3, то есть
 * восемнадцать вычислений шума на частицу за кадр. Это и есть основная
 * стоимость симуляции — если кадр не укладывается, дешевле всего снижать
 * не качество шума, а число частиц.
 */
vec3 curlNoise(vec3 p) {
  const float e = 0.1;
  const float divisor = 1.0 / (2.0 * e);

  vec3 dx = vec3(e, 0.0, 0.0);
  vec3 dy = vec3(0.0, e, 0.0);
  vec3 dz = vec3(0.0, 0.0, e);

  vec3 px0 = snoiseVec3(p - dx);
  vec3 px1 = snoiseVec3(p + dx);
  vec3 py0 = snoiseVec3(p - dy);
  vec3 py1 = snoiseVec3(p + dy);
  vec3 pz0 = snoiseVec3(p - dz);
  vec3 pz1 = snoiseVec3(p + dz);

  float x = py1.z - py0.z - pz1.y + pz0.y;
  float y = pz1.x - pz0.x - px1.z + px0.z;
  float z = px1.y - px0.y - py1.x + py0.x;

  return normalize(vec3(x, y, z) * divisor);
}
