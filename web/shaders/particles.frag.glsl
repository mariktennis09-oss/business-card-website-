// Фрагментный шейдер точек: круглая частица с мягким краем, гаснущая
// на концах жизни. Без вспышек на рождении и обрывов на смерти — иначе
// поле мерцает.

precision highp float;

uniform vec3 uColor;
uniform float uOpacity;

varying float vLife;

void main() {
  vec2 offset = gl_PointCoord - 0.5;
  float squaredDistance = dot(offset, offset);

  // Квадратный спрайт превращается в круг; за пределами радиуса фрагмент
  // отбрасывается, чтобы не платить за прозрачные пиксели.
  if (squaredDistance > 0.25) {
    discard;
  }

  float edge = smoothstep(0.25, 0.02, squaredDistance);

  // Жизнь идёт от 1 к 0: появление в начале, угасание в конце.
  float fadeIn = smoothstep(1.0, 0.92, vLife);
  float fadeOut = smoothstep(0.0, 0.12, vLife);

  gl_FragColor = vec4(uColor, edge * fadeIn * fadeOut * uOpacity);
}
