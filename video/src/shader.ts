/* Ported VERBATIM from lux-v3 components/layout/CanvasShader.tsx — the living canvas behind every route (the `film` variant). Do not retune here. */

export const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const COMMON = `
precision highp float;

uniform vec2  u_res;
uniform float u_time;
uniform vec3  u_ramp[5];

/* Ashima / Gustavson simplex noise, 3D. Time is the third axis so the field
   evolves in place instead of scrolling past, which would read as movement. */
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

/* Five stops, blended with overlapping smoothsteps so no seam is visible
   between them. Order is lightest -> darkest.

   ⚠️ THE WINDOWS OVERLAP BY ROUGHLY HALF THEIR WIDTH, AND THAT IS WHAT STOPS IT
   LOOKING PATCHY. Narrow windows make each stop own a slice of "k" outright, so
   the field resolves into five flat regions with visible edges between them —
   patches. Wide, overlapping windows mean two or three stops are always in play
   at once and the colour never stops changing, which reads as shading. Widen
   them further and the ramp collapses toward its own average; do not narrow
   them to "sharpen" it. */
vec3 ramp(float k) {
  vec3 c = mix(u_ramp[0], u_ramp[1], smoothstep(0.00, 0.34, k));
  c      = mix(c,         u_ramp[2], smoothstep(0.12, 0.56, k));
  c      = mix(c,         u_ramp[3], smoothstep(0.36, 0.80, k));
  c      = mix(c,         u_ramp[4], smoothstep(0.58, 1.00, k));
  return c;
}

/* Static (not time-varying) hash dither. The four stops span barely 48 levels
   of blue, so an undithered ramp bands visibly across a phone screen; a
   time-varying dither would shimmer, which is the opposite of calm. */
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
`;

export const FRAG_FILM = `${COMMON}
uniform vec2  u_pointer; /* shader units: centred, y up, over the short side */
uniform vec2  u_drag;    /* eased pointer velocity, already scaled by u_pull */
uniform float u_pull;    /* 0..1 — 0 off the interactive routes */
uniform float u_lift;    /* 0..1 — 1 while the logo entrance holds */

void main() {
  float m = min(u_res.x, u_res.y);
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / m;
  float vy = gl_FragCoord.y / u_res.y;
  float t = u_time;

  /* the pointer warp, before the rotation so it stays under the cursor */
  vec2 dp = p - u_pointer;
  float fall = exp(-dot(dp, dp) / 0.10);
  p -= dp * fall * 0.42 * u_pull;
  p -= u_drag * fall;

  /* ⚠️ ROTATED, FOR ONE REASON. A single simplex octave at this contrast shows
     the lattice it is built on — the forms came out as soft RECTANGLES square
     to the screen. Turning the domain ~34deg rounds them off. */
  p = mat2(0.83, -0.56, 0.56, 0.83) * p;
  vec2 q = vec2(
    snoise(vec3(p * 0.70,       t * 0.060)),
    snoise(vec3(p * 0.70 + 4.1, t * 0.060 + 2.7))
  );
  float n = snoise(vec3(p * 0.95 + q * 0.60, t * 0.080 + 3.7)) * 0.85
          + snoise(vec3(p * 1.90 + q * 0.30 + 9.3, t * 0.080)) * 0.15;

  /* the darker 55% of the ramp only — see "less white" above */
  float v = clamp((1.0 - vy) * 0.30 + n * 0.60 + 0.40, 0.0, 1.0);
  /* ⚠️ AN EASE-OUT, SO THE LIGHT CORES SHRINK WITHOUT GETTING ANY DARKER —
     asked for directly, "make the white parts take less space". The lightest
     value, v = 0, still maps to 0, but a field sitting halfway (0.5) now lands
     at 0.75, so only the very peaks of the noise reach the pale end and
     everything around them falls to the mid tones. NO BACKTICKS in here: this
     comment is inside a JS template literal and one ends the string. */
  v = 1.0 - (1.0 - v) * (1.0 - v);
  float k = 0.45 + 0.55 * v;

  vec3 col = ramp(k);
  /* the pointer's light — toward a lighter stop only */
  col = mix(col, u_ramp[1], fall * 0.20 * u_pull);
  /* the logo entrance — brighter only, see u_lift above */
  col = min(col * (1.0 + 0.07 * u_lift), vec3(1.0));
  col += (hash12(gl_FragCoord.xy) - 0.5) * (8.0 / 255.0);
  col = max(col, u_ramp[4]); /* the floor — see the note above */

  gl_FragColor = vec4(col, 1.0);
}
`;
