"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import styles from "./CanvasShader.module.css";

/**
 * The living canvas — every route, mounted once as `AppCanvas` in
 * app/layout.tsx.
 *
 * ⚠️ NOT IN FIGMA. Figma paints every screen with `gradient/canvas-mobile` /
 * `-desktop`, a static three-stop linear gradient. This replaces it with a
 * WebGL fragment shader that moves the same stops around. It was asked for
 * directly as an experiment; it is a candidate treatment, not an approved one,
 * and it is still owed a decision in Figma.
 *
 * ⚠️ IT WAS OPT-IN PER SCREEN UNTIL 12 Sep 2026, AND THIS COMMENT USED TO FORBID
 * WHAT HAPPENED NEXT. Welcome and `/check` each rendered their own canvas; it
 * was then asked for directly on every route. It is mounted once in the root
 * layout rather than per screen, so it survives navigation instead of
 * rebuilding its context and fading in again on each one. The contrast bound
 * below is STRUCTURAL — a floor on the colour — so it carries to every route,
 * but the measurements quoted were taken on Welcome and `/check`, and the field
 * can put the floor colour higher up a screen than the linear gradient ever
 * did. Text on bare canvas lighter than `text/secondary` wants measuring.
 *
 * Placement: it sits BEHIND `.screen` at z-index -1, and `.screen` goes
 * transparent only once it has drawn — see CanvasShader.module.css.
 *
 * ⚠️ TWO VARIANTS. `flow` (the default) is the original drift; nothing renders
 * it now, and it is kept so going back is one word in `AppCanvas`. `film` —
 * asked for on 12 Sep 2026 with monopo.vn as the reference — keeps the same
 * five tokens and the same floor but trades the drift for that site's
 * language: larger, slower forms held in the darker part of the ramp, and film
 * grain. Its own notes sit on `FRAG_FILM`. The reference is a DARK site and
 * this is not; it cannot be without breaking the floor below.
 *
 * ⚠️ THE RAMP MAY ONLY BE WIDENED UPWARDS, AND THAT IS A CONTRAST CONSTRAINT,
 * NOT A TASTE ONE. Roughly 200 lines of `globals.css` derive colours by sampling
 * this gradient at an element's own position, and the darkest value any of them
 * assumes is `--color-gradient-canvas-end-mobile` (#acc5cc). The disclaimer on
 * this screen is `text/secondary` (#4b4b57) sitting on BARE canvas, and it
 * measures 4.75:1 on that floor — a pass with 0.25 to spare. Taking the shader
 * one step darker, to `gradient/brand-start` (#a2b9bf), drops the same text to
 * 4.19:1 and fails AA.
 *
 * So the DARK end is frozen at #acc5cc and contrast is bought at the LIGHT end,
 * where a lighter background can only ever help dark text. All five are LUX
 * tokens:
 *
 *     bg/progress-track   #ecf8f9   (lightest — highlight cores only)
 *     bg/nav              #dbeded   (the signature LUX cyan)
 *     canvas-start        #dce7ea
 *     canvas-mid          #cedee2
 *     canvas-end-mobile   #acc5cc   (the floor — NOTHING goes below it)
 *
 * ⚠️ THAT MAKES THE WORST CASE STRUCTURAL RATHER THAN A MEASUREMENT. Because
 * #acc5cc is the darkest colour the ramp can emit, no amount of retuning the
 * noise can put anything darker under a glyph — the disclaimer cannot drop
 * below 4.75:1 however the field moves. Widening the ramp DOWNWARDS would throw
 * that guarantee away, which is the whole reason it is written as a floor
 * rather than a stop.
 *
 * and they are read from the CSS custom properties at runtime, so retuning the
 * tokens retunes the shader. Do not hardcode a colour here, and do not widen
 * the ramp without re-measuring the disclaimer.
 *
 * ⚠️ THE CLAMP BOUNDS THE COLOUR, NOT THE PLACE — AND THAT COSTS SOMETHING. The
 * linear gradient only reaches its darkest stop at the BOTTOM of the screen, so
 * an element halfway up has always sat on something lighter than the floor. The
 * shader can put the floor colour anywhere, so any given element can now see a
 * darker background than it used to. Measured on the disclaimer, shader off vs
 * on, sampling its own rows beside the glyphs:
 *
 *     mobile 440    5.24:1 -> 5.11:1
 *     desktop 1440  5.81:1 -> 4.97:1
 *
 * measured on the narrower first ramp. The floor bound above is what actually
 * holds it: 4.75:1 is the worst any retune can reach.
 *
 * ⚠️ AXE CANNOT CHECK ANY OF THIS — `color-contrast` degrades to INCOMPLETE on
 * a gradient background, and a canvas element is fully opaque to it. Same
 * standing as the rest of the canvas: measure by hand.
 *
 * INTENT. A vertical term still carries most of the value — light at the top,
 * `#acc5cc` at the bottom — so the screen reads as the same composition Figma
 * drew. A domain-warped noise field only perturbs it.
 *
 * The drift runs at 0.130 of a noise unit per second, roughly 3x where it
 * started, which is slow enough to never draw the eye off the orb and fast
 * enough to be visibly alive while you read the screen. Motion board 04b's
 * "LUX motion is calm. Nothing snaps" is about transitions arriving and
 * settling; this is ambient and continuous, which the board does not cover, so
 * it is a decided-here value rather than a token.
 *
 * FALLBACK. `.screen` keeps its CSS gradient until the first real draw stamps
 * `data-canvas-ready` on <html>. No WebGL context, a lost context, or a failed
 * compile never sets it (or removes it), and the token gradient is simply what
 * you see.
 * `prefers-reduced-motion` draws one frame and never schedules another.
 */

/* Five LUX tokens, lightest to darkest — see the palette note above. The two
   at the top are NOT canvas tokens: they are `bg/progress-track` and `bg/nav`,
   pulled in to widen the ramp for contrast. They are on the SAFE side —
   lighter can only help dark text — and the dark end is untouched, which is
   what keeps the 4.75:1 bound.

   ⚠️ NOT `bg/frost-light` (#f4feff), WHICH IS THE OBVIOUS PICK AND THE WRONG
   ONE. It is the lightest token in the app and it gave the most range, but at
   (244,254,255) it is very nearly achromatic — mixing toward it desaturated
   every highlight and the whole canvas read as smoke grey rather than LUX.
   `bg/nav` (#dbeded) is the app's signature cyan and `bg/progress-track`
   (#ecf8f9) is a paler version of the same hue, so the ramp gains its range
   without losing the colour. Range beat hue on the first attempt; it should
   not. */
const RAMP_TOKENS = [
  "--color-bg-progress-track", /* #ecf8f9 */
  "--color-bg-nav", /* #dbeded — the signature LUX cyan */
  "--color-gradient-canvas-start", /* #dce7ea */
  "--color-gradient-canvas-mid", /* #cedee2 */
  "--color-gradient-canvas-end-mobile", /* #acc5cc — the floor */
] as const;

/* A smooth low-frequency field carries no detail worth a retina buffer, and the
   noise is the whole cost per pixel. Capping total pixels rather than DPR keeps
   a phone and a 1440 desktop at the same budget. 1.6M ~= 1440x1110. */
const MAX_PIXELS = 1_600_000;

/* ⚠️ 60, NOT THE 30 THIS STARTED AT. At the original drift a half-rate loop was
   free — nothing moved fast enough to show the missing frames. The drift is now
   ~3x that and the motion is the point, so 30fps reads as a faint stutter on a
   field with no edges to hide it. The octave cut above paid for the extra
   frames: this shader is 4 simplex evaluations per pixel where it used to be 7,
   so it costs less per second at 60fps than the old one did at 30. */
const FRAME_MS = 1000 / 60;

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

/* The uniforms, noise, ramp and dither both variants share. */
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

const FRAG_FLOW = `${COMMON}
/* ⚠️ ONE DOMINANT OCTAVE PLUS A WHISPER, NOT A FULL FBM. Three octaves at
   0.5/0.25/0.125 put as much energy in the small detail as in the large forms,
   and on a palette this narrow that detail cannot read as shading — it reads as
   PATCHES. The second octave is kept at a quarter of the first purely to stop
   the field looking like a single smooth blob; anything above ~0.25 brings the
   blotching straight back. There is deliberately no third. */
float field(vec3 p) { return snoise(p) * 0.80 + snoise(p * 2.10 + 9.3) * 0.20; }

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;

  /* aspect-correct so the forms do not stretch between 440 and 1440 */
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / min(u_res.x, u_res.y);

  float t = u_time;

  /* Domain warp — this is what makes the bands curl instead of sliding. Both
     the warp and the field run at LOW frequency (0.75 / 0.80 rather than the
     1.15 / 1.35 they started at) so the forms are a good fraction of the screen
     each. Small forms on a five-stop ramp this narrow is exactly what "patchy"
     was. The warp is also gentler (0.38, was 0.62): a strong warp folds the
     field back on itself and manufactures the blotches it is supposed to
     smooth. */
  vec2 q = vec2(
    snoise(vec3(p * 0.75,       t * 0.100)),
    snoise(vec3(p * 0.75 + 4.1, t * 0.100 + 2.7))
  );
  float n = field(vec3(p * 0.80 + q * 0.38, t * 0.130 + 3.7));

  /* The vertical term still leads, so the screen keeps the top-light /
     bottom-#acc5cc reading of the token gradient — but the noise now carries
     nearly as much, which is what makes light and dark sit next to each other
     instead of only stacking down the screen. Clamping at both ends is
     deliberate: the bottom settles on the pure floor stop, exactly as the
     linear gradient does, and the brightest cores clip to the pale cyan. */
  float k = clamp((1.0 - uv.y) * 0.54 + n * 0.50 + 0.23, 0.0, 1.0);

  vec3 col = ramp(k);
  col += (hash12(gl_FragCoord.xy) - 0.5) / 255.0;

  gl_FragColor = vec4(col, 1.0);
}
`;

/* ⚠️ THE FILM VARIANT — EVERY ROUTE, AND NOT IN FIGMA. monopo.vn's language
   translated onto LUX's light ground rather than copied off its dark one.

   WHAT CARRIES THE LOOK, since none of it is the colour:
     · scale — a heavily warped octave at ~0.95, so a form is most of a phone
       screen;
     · grain — static, like the flow variant's dither but ~16x louder, because
       the reference reads as film and a moving grain is not calm.

   ⚠️ IT STARTED WITH A GLASS SPHERE, A LAVENDER ACCENT AND A HARDER SWING TO
   THE PALE END, AND ALL THREE WERE CUT THE SAME DAY — asked for directly: "tone
   down the colours, less white, the big circle is not needed" — and then
   "even less white". So `k` is now held in the DARKER 55% OF THE RAMP
   (0.45..1.00): the lightest a core can get is roughly `canvas-start` into
   `canvas-mid`, the two pale stops (`bg/progress-track`, `bg/nav`) barely
   register, and the noise swing is softened so the forms sit in the canvas's
   own mid tones. It was 0.30 for an hour and still read as too white. Do not
   restore the range to "add life" — that is exactly the white that was
   removed.

   ⚠️ THE FLOOR STILL HOLDS, AND STRUCTURALLY. Every colour is a mix of the five
   ramp stops, all at or above #acc5cc per channel, EXCEPT the grain, which can
   dip a few levels under it — so the last line clamps each channel to the floor
   after the grain is added, and the disclaimer's 4.75:1 bound survives. Holding
   `k` higher moves the field TOWARD that floor — the bound is still structural,
   but the disclaimer now sits much nearer 4.75:1 far more of the time.

   ⚠️ THE POINTER WARP IS WELCOME'S ALONE — asked for directly, "subtle and only
   on welcome". Around the cursor the field is pulled in slightly (a soft bulge)
   and dragged along by the pointer's recent velocity, both falling off over
   about a quarter of the short side. It moves WHERE the field is sampled, never
   what colour comes out, so the floor is untouched. u_pull fades it in on "/"
   and back out when you leave the route or the window; touch never drives it,
   and reduced motion never runs the loop that eases it. */
const FRAG_FILM = `${COMMON}
uniform vec2  u_pointer; /* shader units: centred, y up, over the short side */
uniform vec2  u_drag;    /* eased pointer velocity, already scaled by u_pull */
uniform float u_pull;    /* 0..1 — 0 on every route but Welcome */

void main() {
  float m = min(u_res.x, u_res.y);
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / m;
  float vy = gl_FragCoord.y / u_res.y;
  float t = u_time;

  /* the pointer warp, before the rotation so it stays under the cursor */
  vec2 dp = p - u_pointer;
  float fall = exp(-dot(dp, dp) / 0.06);
  p -= dp * fall * 0.22 * u_pull;
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
  col += (hash12(gl_FragCoord.xy) - 0.5) * (8.0 / 255.0);
  col = max(col, u_ramp[4]); /* the floor — see the note above */

  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

/** `#rrggbb` -> three 0..1 floats. Returns null for anything else. */
function parseHex(value: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(value.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/**
 * The one canvas the app renders, behind every route.
 *
 * ⚠️ ONLY WELCOME AND THE `/check` LANDING ANSWER THE POINTER — the two
 * screens that float an orb and one bubble on bare canvas with no card. `/check`
 * was added 13 Sep 2026, asked for directly; its sub-routes stay still. The
 * canvas persists across navigation, so the route reaches it as a PROP the
 * shader fades in and out — never as a remount, which would rebuild the WebGL
 * context on every route change.
 */
const INTERACTIVE_ROUTES = new Set(["/", "/check"]);

export function AppCanvas() {
  const pathname = usePathname();
  return (
    <CanvasShader variant="film" interactive={INTERACTIVE_ROUTES.has(pathname)} />
  );
}

export function CanvasShader({
  variant = "flow",
  interactive = false,
}: {
  /** `film` is the app-wide trial — see the variant note at the top */
  variant?: "flow" | "film";
  /** fade in the pointer warp — `film` only; see the note on FRAG_FILM */
  interactive?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  /* read by the frame loop, so a route change never re-runs the GL effect */
  const interactiveRef = useRef(interactive);
  useEffect(() => {
    interactiveRef.current = interactive;
  }, [interactive]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    /* Every failure below is silent and leaves the CSS gradient on screen —
       this is decoration, and it must never be the reason the screen is blank. */
    const gl = (canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    }) ??
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(
      gl,
      gl.FRAGMENT_SHADER,
      variant === "film" ? FRAG_FILM : FRAG_FLOW,
    );
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    /* biome-ignore lint/correctness/useHookAtTopLevel: `gl.useProgram` is the
       WebGL call, not a React hook — the rule matches on the `use` prefix and
       cannot tell the two apart. There is no hook anywhere in this effect. */
    gl.useProgram(prog);

    /* one triangle big enough to cover the clip volume — no quad, no indices */
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_res");
    const uTime = gl.getUniformLocation(prog, "u_time");

    /* read the palette from the tokens, once — see the palette note above */
    const cs = getComputedStyle(document.documentElement);
    const ramp: number[] = [];
    for (const token of RAMP_TOKENS) {
      const rgb = parseHex(cs.getPropertyValue(token));
      if (!rgb) return; /* a token moved or became non-hex: stay out of the way */
      ramp.push(...rgb);
    }
    gl.uniform3fv(gl.getUniformLocation(prog, "u_ramp[0]"), new Float32Array(ramp));

    /* the pointer warp — all three locations are null on the flow program */
    const uPointer = gl.getUniformLocation(prog, "u_pointer");
    const uDrag = gl.getUniformLocation(prog, "u_drag");
    const uPull = gl.getUniformLocation(prog, "u_pull");
    const target = { x: 0, y: 0 };
    const pos = { x: 0, y: 0 };
    const drag = { x: 0, y: 0 };
    let over = false;
    let pull = 0;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const m = Math.min(w, h);
      target.x = (event.clientX - w / 2) / m;
      target.y = -(event.clientY - h / 2) / m;
      /* entering: start AT the cursor rather than sliding in from the centre */
      if (!over) {
        pos.x = target.x;
        pos.y = target.y;
      }
      over = true;
    };
    /* `relatedTarget` is null only when the pointer leaves the window */
    const onOut = (event: PointerEvent) => {
      if (!event.relatedTarget) over = false;
    };
    if (uPointer) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerout", onOut);
    }

    let width = 0;
    let height = 0;
    let ready = false;

    /* returns whether the canvas has a usable size — NOT whether it changed.
       The caller needs "can I draw?", and an unchanged size is still drawable. */
    const resize = () => {
      const cssW = canvas.clientWidth;
      const cssH = canvas.clientHeight;
      if (cssW === 0 || cssH === 0) return false;

      let scale = Math.min(window.devicePixelRatio || 1, 2);
      const budget = Math.sqrt(MAX_PIXELS / (cssW * cssH));
      if (scale > budget) scale = budget;

      const w = Math.max(1, Math.round(cssW * scale));
      const h = Math.max(1, Math.round(cssH * scale));
      if (w !== width || h !== height) {
        width = w;
        height = h;
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
        gl.uniform2f(uRes, w, h);
      }
      return true;
    };

    /* ⚠️ `data-ready` IS SET BY THE FIRST REAL DRAW, NOT BY THE EFFECT. Setting
       it before a draw at a known size fades in whatever the buffer happens to
       hold — and with `u_res` still (0,0) that is `gl_FragCoord / 0`, a
       screenful of NaN. Nothing may reveal this canvas until it has content. */
    const draw = (seconds: number) => {
      if (width === 0) return;
      gl.uniform1f(uTime, seconds);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!ready) {
        ready = true;
        canvas.dataset.ready = "";
        /* what lets `.screen` go transparent — see globals.css */
        document.documentElement.dataset.canvasReady = "";
      }
    };

    if (resize()) draw(0);

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let raf = 0;
    let last = 0;
    const start = performance.now();

    /* ⚠️ NO `resize()` IN HERE. Reading `clientWidth` forces a layout flush, so
       sizing per frame meant 30 forced reflows a second for a canvas that only
       changes size when the window does. The ResizeObserver below owns it. */
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < FRAME_MS) return;
      last = now;
      /* eased here, not in `draw`, so reduced motion never follows the pointer.
         Per-frame factors are fine because the loop is capped at FRAME_MS. */
      if (uPointer) {
        const px = pos.x;
        const py = pos.y;
        pos.x += (target.x - pos.x) * 0.08;
        pos.y += (target.y - pos.y) * 0.08;
        drag.x += ((pos.x - px) * 6 - drag.x) * 0.1;
        drag.y += ((pos.y - py) * 6 - drag.y) * 0.1;
        const len = Math.hypot(drag.x, drag.y);
        if (len > 0.12) {
          drag.x *= 0.12 / len;
          drag.y *= 0.12 / len;
        }
        pull += ((interactiveRef.current && over ? 1 : 0) - pull) * 0.04;
        gl.uniform2f(uPointer, pos.x, pos.y);
        gl.uniform2f(uDrag, drag.x * pull, drag.y * pull);
        gl.uniform1f(uPull, pull);
      }
      draw((now - start) / 1000);
    };

    /* One static frame under reduced motion — the composition survives, the
       drift does not. `globals.css` collapses CSS durations globally, but a
       rAF loop is not a CSS duration and has to opt out by hand. */
    const sync = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      if (motion.matches) {
        if (resize()) draw(0);
        return;
      }
      raf = requestAnimationFrame(loop);
    };

    sync();
    motion.addEventListener("change", sync);

    /* clientWidth/Height drive the buffer, so watch the box, not the window.
       ⚠️ THIS IS THE ONLY THING THAT EVER CALLS `resize()` AFTER MOUNT — the
       frame loop deliberately does not (see the note on `loop`). An earlier
       version only re-sized here when the loop was STOPPED, so a window resize
       during the animation never reached the buffer and the canvas kept
       rendering at its mount size. It also fires once on observe, which is the
       safety net for mounting before the stylesheet has given the canvas a
       size. */
    const ro = new ResizeObserver(() => {
      if (!resize()) return;
      if (raf === 0) draw(motion.matches ? 0 : (performance.now() - start) / 1000);
    });
    ro.observe(canvas);

    /* ⚠️ A LOST CONTEXT IS THE ONE FAILURE THAT IS WORSE THAN NO SHADER. The
       canvas is opaque and `.screen` is transparent over it, so a lost context
       shows as a sheet of WHITE behind every screen while the DOM is perfectly
       fine. Dropping both flags fades the canvas out and hands `.screen` its
       token gradient back, so the worst case is the Figma design rather than a
       white page. */
    const onLost = (event: Event) => {
      event.preventDefault();
      cancelAnimationFrame(raf);
      raf = 0;
      ready = false;
      delete canvas.dataset.ready;
      delete document.documentElement.dataset.canvasReady;
    };
    canvas.addEventListener("webglcontextlost", onLost);

    return () => {
      cancelAnimationFrame(raf);
      motion.removeEventListener("change", sync);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onOut);
      canvas.removeEventListener("webglcontextlost", onLost);
      delete document.documentElement.dataset.canvasReady;
      ro.disconnect();
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      /* ⚠️ DO NOT `loseContext()` HERE, however tidy it looks — IT IS WHAT MADE
         THE SCREEN WHITE. A canvas hands out ONE context object per type for
         its whole life, so `getContext` on a remount returns the very context
         this cleanup killed. React Strict Mode (on by default in dev) runs
         mount → cleanup → mount, and `loseContext()` is ASYNCHRONOUS: the
         second mount got the still-live context, compiled and drew correctly —
         and then the loss scheduled by the first cleanup landed on it. The
         browser reclaims the context with the element; this call only ever
         poisons the next mount. */
    };
  }, [variant]);

  /* biome-ignore lint/a11y/noAriaHiddenOnFocusable: a <canvas> with no
     tabindex is not focusable, so this is the ordinary way to hide decoration.
     The rule counts canvas as focusable because it MAY hold focusable fallback
     content; this one holds none. Removing the attribute would put the app's
     background gradient in the accessibility tree. */
  return <canvas ref={ref} className={styles.shader} aria-hidden="true" />;
}
