"use client";

import { useEffect, useRef } from "react";
import styles from "./WelcomeShader.module.css";

/**
 * 00 — Welcome · the living canvas.
 *
 * ⚠️ NOT IN FIGMA. Figma paints Welcome with `gradient/canvas-mobile` /
 * `-desktop`, a static three-stop linear gradient. This replaces it, on `/`
 * ONLY, with a WebGL fragment shader that flows the same stops around. It was
 * asked for directly as an experiment; it is a candidate treatment, not an
 * approved one, and it must be raised in Figma before it spreads to a second
 * route.
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
 * FALLBACK. The canvas paints OVER `.screen`'s existing CSS gradient and never
 * replaces it. No WebGL context, a lost context, or a failed compile means the
 * component renders nothing and the token gradient is simply what you see.
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

const FRAG = `
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

/* ⚠️ ONE DOMINANT OCTAVE PLUS A WHISPER, NOT A FULL FBM. Three octaves at
   0.5/0.25/0.125 put as much energy in the small detail as in the large forms,
   and on a palette this narrow that detail cannot read as shading — it reads as
   PATCHES. The second octave is kept at a quarter of the first purely to stop
   the field looking like a single smooth blob; anything above ~0.25 brings the
   blotching straight back. There is deliberately no third. */
float field(vec3 p) { return snoise(p) * 0.80 + snoise(p * 2.10 + 9.3) * 0.20; }

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

export function WelcomeShader() {
  const ref = useRef<HTMLCanvasElement>(null);

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
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
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
       canvas is opaque and covers the viewport, so a lost context composites as
       a sheet of WHITE over the gradient it was meant to enrich — the whole
       screen goes blank while the DOM underneath is perfectly fine. Dropping
       `data-ready` fades the canvas back out and the token gradient returns, so
       the worst case is the Figma design rather than a white page. */
    const onLost = (event: Event) => {
      event.preventDefault();
      cancelAnimationFrame(raf);
      raf = 0;
      ready = false;
      delete canvas.dataset.ready;
    };
    canvas.addEventListener("webglcontextlost", onLost);

    return () => {
      cancelAnimationFrame(raf);
      motion.removeEventListener("change", sync);
      canvas.removeEventListener("webglcontextlost", onLost);
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
  }, []);

  return <canvas ref={ref} className={styles.shader} aria-hidden="true" />;
}
