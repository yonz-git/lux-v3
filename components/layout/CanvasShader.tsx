"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import styles from "./CanvasShader.module.css";

/**
 * The living canvas — every route, mounted once as `AppCanvas` in
 * app/layout.tsx.
 */

/* Five LUX tokens, lightest to darkest — see the palette note above. The two
   at the top are NOT canvas tokens: they are `bg/progress-track` and `bg/nav`,
   pulled in to widen the ramp for contrast. They are on the SAFE side —
   lighter can only help dark text — and the floor is set by the last stop
   alone, which is what holds the 3.84:1 bound. */
const RAMP_TOKENS = [
  "--color-bg-progress-track", /* #ecf8f9, drawn x0.9 */
  "--color-bg-nav", /* #dbeded — the signature LUX cyan, drawn x0.9 */
  "--color-gradient-canvas-start", /* #c6d0d3 — globals.css override */
  "--color-gradient-canvas-mid", /* #b9c8cb — globals.css override */
  "--color-gradient-canvas-end-mobile", /* #9bb1b8 — the floor */
] as const;

const BORROWED_STOP_SCALE = 1.026;
const BORROWED_STOPS: ReadonlySet<string> = new Set([
  "--color-bg-progress-track",
  "--color-bg-nav",
]);

/* A smooth low-frequency field carries no detail worth a retina buffer, and the
   noise is the whole cost per pixel. Capping total pixels rather than DPR keeps
   a phone and a 1440 desktop at the same budget. 1.6M ~= 1440x1110. */
const MAX_PIXELS = 1_600_000;

const FRAME_MS = 1000 / 60;

const FRAME_SLACK_MS = 1;

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

/* Five stops, lightest to darkest. The windows overlap by about half their
   width; narrower ones show as flat patches. */
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
/* One dominant octave plus a faint second; more detail reads as patches. */
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
     bottom-floor reading of the token gradient — but the noise now carries
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

const FRAG_FILM = `${COMMON}
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

  /* rotated ~34deg so the simplex lattice does not show as rectangles */
  p = mat2(0.83, -0.56, 0.56, 0.83) * p;
  vec2 q = vec2(
    snoise(vec3(p * 0.70,       t * 0.060)),
    snoise(vec3(p * 0.70 + 4.1, t * 0.060 + 2.7))
  );
  float n = snoise(vec3(p * 0.95 + q * 0.60, t * 0.080 + 3.7)) * 0.85
          + snoise(vec3(p * 1.90 + q * 0.30 + 9.3, t * 0.080)) * 0.15;

  /* the darker 55% of the ramp only */
  float v = clamp((1.0 - vy) * 0.30 + n * 0.60 + 0.40, 0.0, 1.0);
  /* eased so the light cores shrink without getting darker */
  v = 1.0 - (1.0 - v) * (1.0 - v);
  float k = 0.45 + 0.55 * v;

  vec3 col = ramp(k);
  /* the pointer's light — toward a lighter stop only */
  col = mix(col, u_ramp[1], fall * 0.20 * u_pull);
  /* the logo entrance — brighter only, see u_lift above */
  col = min(col * (1.0 + 0.07 * u_lift), vec3(1.0));
  col += (hash12(gl_FragCoord.xy) - 0.5) * (8.0 / 255.0);
  col = max(col, u_ramp[4]); /* the floor */

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

/** The one canvas the app renders, behind every route. */
const INTERACTIVE_ROUTES = new Set(["/", "/check"]);

export function AppCanvas() {
  const pathname = usePathname();
  return (
    <CanvasShader variant="film" interactive={INTERACTIVE_ROUTES.has(pathname)} />
  );
}

export function CanvasShader({
  variant = "film",
  interactive = false,
}: {
  /** `film` is the main background — see the variant note at the top */
  variant?: "flow" | "film";
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

    const cs = getComputedStyle(document.documentElement);
    const ramp: number[] = [];
    for (const token of RAMP_TOKENS) {
      const rgb = parseHex(cs.getPropertyValue(token));
      if (!rgb) return; /* a token moved or became non-hex: stay out of the way */
      const scale = BORROWED_STOPS.has(token) ? BORROWED_STOP_SCALE : 1;
      ramp.push(...rgb.map((channel) => channel * scale));
    }
    gl.uniform3fv(gl.getUniformLocation(prog, "u_ramp[0]"), new Float32Array(ramp));

    /* the pointer warp — all three locations are null on the flow program */
    const uPointer = gl.getUniformLocation(prog, "u_pointer");
    const uDrag = gl.getUniformLocation(prog, "u_drag");
    const uPull = gl.getUniformLocation(prog, "u_pull");
    /* the logo-entrance lift — null on the flow program. Read off the root
       attribute each frame (an attribute read, no layout), because
       `LogoEntrance` may take the hold before or after this effect runs. */
    const uLift = gl.getUniformLocation(prog, "u_lift");
    const holding = () =>
      document.documentElement.dataset.entranceHold !== undefined;
    let lift = holding() ? 1 : 0;

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

    const draw = (seconds: number) => {
      if (width === 0) return;
      gl.uniform1f(uTime, seconds);
      if (uLift) gl.uniform1f(uLift, lift);
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

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const elapsed = now - last;
      if (elapsed < FRAME_MS - FRAME_SLACK_MS) return;
      last = elapsed > FRAME_MS ? now - (elapsed % FRAME_MS) : now;
      /* the lift SNAPS on and EASES off: the hold is only ever taken at page
         load, so easing up would visibly brighten the logo's first frames.
         0.03 a frame settles in about 1.5s once the logo hands off. */
      if (uLift) {
        const goal = holding() ? 1 : 0;
        lift = goal > lift ? goal : lift + (goal - lift) * 0.03;
        if (lift < 0.001) lift = 0;
      }
      /* eased here, not in `draw`, so reduced motion never follows the pointer.
         Per-frame factors are fine because the loop is capped at FRAME_MS. */
      if (uPointer) {
        const px = pos.x;
        const py = pos.y;
        pos.x += (target.x - pos.x) * 0.08;
        pos.y += (target.y - pos.y) * 0.08;
        drag.x += ((pos.x - px) * 10 - drag.x) * 0.1;
        drag.y += ((pos.y - py) * 10 - drag.y) * 0.1;
        const len = Math.hypot(drag.x, drag.y);
        if (len > 0.2) {
          drag.x *= 0.2 / len;
          drag.y *= 0.2 / len;
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

    /* clientWidth/Height drive the buffer, so watch the box, not the window. */
    const ro = new ResizeObserver(() => {
      if (!resize()) return;
      draw(motion.matches ? 0 : (performance.now() - start) / 1000);
    });
    ro.observe(canvas);

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
    };
  }, [variant]);

  /* biome-ignore lint/a11y/noAriaHiddenOnFocusable: a <canvas> with no
     tabindex is not focusable, so this is the ordinary way to hide decoration.
     The rule counts canvas as focusable because it MAY hold focusable fallback
     content; this one holds none. Removing the attribute would put the app's
     background gradient in the accessibility tree. */
  return <canvas ref={ref} className={styles.shader} aria-hidden="true" />;
}
