import { LUX_SYMBOL, LogoDepthFilter } from "./LuxLogo";
import { SiriOrb } from "./siri-orb";

/**
 * The LUX orb — the AI avatar.
 *
 * Exported verbatim from the Figma component `chat-ball-3x` (219:795) rather
 * than recreated: the frosted sphere is a radial gradient behind a four-layer
 * neumorphic filter, and the mark inside is the real brand lockup. Do not
 * redraw it by hand.
 */
const ORB_RENDERER: "svg" | "siri" = "siri";

/* THE MARK'S PLACE ON THE 129 GRID — the chat-ball export's footprint: 58 wide,
   centred on the sphere's (65, 65). The master symbol is scaled to that width
   and its bounding box centred there; every number below derives from those
   two and `LUX_SYMBOL.bbox`, so the mark cannot drift from the export's spot. */
const ORB_MARK_WIDTH = 58;
const ORB_MARK_CENTER = 65;
const MARK_SCALE = ORB_MARK_WIDTH / LUX_SYMBOL.bbox.width;
const MARK_TX = ORB_MARK_CENTER - (LUX_SYMBOL.bbox.x + LUX_SYMBOL.bbox.width / 2) * MARK_SCALE;
const MARK_TY = ORB_MARK_CENTER - (LUX_SYMBOL.bbox.y + LUX_SYMBOL.bbox.height / 2) * MARK_SCALE;
/** master space → the 129 grid (a `transform` attribute) */
const MASTER_TO_ORB = `translate(${MARK_TX} ${MARK_TY}) scale(${MARK_SCALE})`;
/** the inverse, for the gradients: 129-grid coordinates → master space */
const ORB_TO_MASTER = `scale(${1 / MARK_SCALE}) translate(${-MARK_TX} ${-MARK_TY})`;

/* which master stroke each of the export's three ramps and tracks belongs to.
   The export's `mark1` was the UPPER-LEFT stroke, which is the master's SECOND
   path; `mark2` the lower-right, the master's first. Pairing by position, never
   by index — see the hand-off note in globals.css. */
const MARK_STROKES = [
  { gradient: "lux_orb_mark1", stroke: LUX_SYMBOL.strokes[1], enter: "orb-mark-l", think: "orb-think-l" },
  { gradient: "lux_orb_mark2", stroke: LUX_SYMBOL.strokes[0], enter: "orb-mark-u", think: "orb-think-u" },
  { gradient: "lux_orb_mark3", stroke: LUX_SYMBOL.strokes[2], enter: "orb-mark-x", think: "orb-think-x" },
] as const;

/* The orb's three colours ARE LUX tokens, bound by name, so the orb sits in the
   canvas it floats on rather than glowing over it. Mapped by how much of the
   sphere each slot paints:
   - c3, the BODY (the large radial + one wedge): `bg/bubble-ai` #dbeded, the
   light blue
   - c1, the two LARGE wedges: `gradient/canvas` mobile end #9bb1b8 at 45% — a
   deeper grey-blue that gives the sphere form without shading it. */
const LUX_ORB_COLORS = {
  c1: "color-mix(in srgb, var(--color-gradient-canvas-end-mobile) 45%, transparent)",
  c2: "color-mix(in srgb, var(--color-gradient-brand-start) 30%, transparent)",
  c3: "var(--color-bg-bubble-ai)",
};

/* Picked in the component's own controls: 130px, and 60s per turn. `thinking`
   turns it three times as fast. A caller's explicit pixel size still wins —
   the chat header's is 50px — but the default token cannot reach the blur maths,
   which needs a number. */
const SIRI_ORB_SIZE = "130px";
const SIRI_ORB_DURATION = 60;
const SIRI_ORB_THINKING_DURATION = 20;

export function Orb({
  size = "var(--size-orb-lg)",
  className,
  animateIn,
  thinking,
  halo,
}: {
  size?: string;
  className?: string;
  /** play the Spiral Assemble entrance on the sphere */
  animateIn?: boolean;
  /**
   * Loop the "working" state: the mark pulses L → U → X on the entrance's own
   * 120ms stagger while the sphere breathes. Used by `Check — analyzing`, where
   * the handoff asks for "the orb visibly doing the work". See `.orb-think-*`
   * in globals.css — the keyframes MUST live there, not in a module.
   */
  thinking?: boolean;
  halo?: boolean;
}) {
  /* The brand mark — the master symbol's three paths on the 129 grid, shared
     by both renderers so the logo exists once. Each carries its own entrance
     and thinking track on a wrapper OUTSIDE the master→orb transform (see the
     doc comment). */
  const mark = (
    <>
      {MARK_STROKES.map((m) => (
        <g
          key={m.gradient}
          className={
            [animateIn && m.enter, thinking && m.think]
              .filter(Boolean)
              .join(" ") || undefined
          }
        >
          <g transform={MASTER_TO_ORB}>
            <path d={m.stroke.d} fill={`url(#${m.gradient})`} filter="url(#lux_orb_mark_depth)" />
          </g>
        </g>
      ))}
    </>
  );

  /* the export's three ramps, coordinates verbatim on the 129 grid; the
     `gradientTransform` carries them into the paths' master-space units */
  const markGradients = (
    <>
      <LogoDepthFilter id="lux_orb_mark_depth" region="symbol" />
      <linearGradient id="lux_orb_mark1" x1="49.563" y1="57.3398" x2="72.0549" y2="58.2992" gradientUnits="userSpaceOnUse" gradientTransform={ORB_TO_MASTER}>
        <stop stopColor="#3F326D" />
        <stop offset="1" stopColor="#5C5E9E" />
      </linearGradient>
      <linearGradient id="lux_orb_mark2" x1="81.4025" y1="73.0781" x2="58.9291" y2="71.7594" gradientUnits="userSpaceOnUse" gradientTransform={ORB_TO_MASTER}>
        <stop stopColor="#3F326D" />
        <stop offset="1" stopColor="#5C5E9E" />
      </linearGradient>
      <linearGradient id="lux_orb_mark3" x1="36" y1="59" x2="94" y2="59" gradientUnits="userSpaceOnUse" gradientTransform={ORB_TO_MASTER}>
        <stop stopColor="#3F326D" />
        <stop offset="1" stopColor="#5C5E9E" />
      </linearGradient>
    </>
  );

  if (ORB_RENDERER === "siri") {
    const px = /^\d+(\.\d+)?px$/.test(size) ? size : SIRI_ORB_SIZE;
    const siriOrb = (
      <span
        role="img"
        aria-label="Lux"
        className={["lux-orb", animateIn && "reveal-hero", className].filter(Boolean).join(" ")}
        style={{ display: "block", position: "relative", width: px, height: px, flex: "none" }}
      >
        {/* The float layer — sphere, mark and rim light drift together (see
            `.lux-orb-float` in globals.css). On `halo` routes it IS the halo
            wrapper, so the light rides the float instead of being left behind
            by it; the outer `.lux-orb` stays still for every spacing rule. */}
        <span className={["lux-orb-float", halo && "orb-halo orb-halo--siri"].filter(Boolean).join(" ")}>
          <SiriOrb
            aria-hidden="true"
            size={px}
            className="siri-orb--lux"
            colors={LUX_ORB_COLORS}
            contrast={1}
            saturation={1}
            animationDuration={thinking ? SIRI_ORB_THINKING_DURATION : SIRI_ORB_DURATION}
          />
          <svg
            viewBox="0 0 129 129"
            fill="none"
            aria-hidden="true"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
          >
            {mark}
            <defs>{markGradients}</defs>
          </svg>
        </span>
      </span>
    );
    return siriOrb;
  }

  const orb = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 129 129"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Lux"
      style={{ display: "block", flex: "none" }}
    >
      <g clipPath="url(#lux_orb_clip)">
        <g filter="url(#lux_orb_filter)">
          <circle
            cx="65"
            cy="65"
            r="57"
            fill="url(#lux_orb_sphere)"
            className={
              [animateIn && "orb-assemble", thinking && "orb-breathe"]
                .filter(Boolean)
                .join(" ") || undefined
            }
          />
        </g>
        {mark}
      </g>
      <defs>
        <filter
          id="lux_orb_filter"
          x="3"
          y="3"
          width="127"
          height="129"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="-1" dy="-1" />
          <feGaussianBlur stdDeviation="2" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.886275 0 0 0 0 0.964706 0 0 0 0 0.960784 0 0 0 0.301961 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="2" dy="4" />
          <feGaussianBlur stdDeviation="3" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.172549 0 0 0 0 0.270588 0 0 0 0 0.27451 0 0 0 0.12549 0" />
          <feBlend mode="normal" in2="effect1_dropShadow" result="effect2_dropShadow" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="-1" dy="-1" />
          <feGaussianBlur stdDeviation="5" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.247059 0 0 0 0 0.392157 0 0 0 0 0.4 0 0 0 0.39 0" />
          <feBlend mode="normal" in2="shape" result="effect3_innerShadow" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="-2" dy="-2" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.376471 0" />
          <feBlend mode="normal" in2="effect3_innerShadow" result="effect4_innerShadow" />
        </filter>
        <radialGradient
          id="lux_orb_sphere"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(20.9545 30.0227) rotate(49.5288) scale(185.617)"
        >
          <stop offset="0.182019" stopColor="white" />
          <stop offset="0.420597" stopColor="#F0FAF9" />
          <stop offset="0.745192" stopColor="#E5F0F1" />
          <stop offset="0.967935" stopColor="#CFE6E7" />
        </radialGradient>
        {markGradients}
        <clipPath id="lux_orb_clip">
          <rect width="129" height="129" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );

  /* The halo layer is the wrapper's own ::after, so the exported SVG stays
     byte-identical and every other orb in the app renders exactly one element,
     as it did before. */
  return halo ? <span className="orb-halo">{orb}</span> : orb;
}
