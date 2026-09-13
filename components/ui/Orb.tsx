import { LUX_SYMBOL, LogoDepthFilter } from "./LuxLogo";
import { SiriOrb } from "./siri-orb";

/**
 * The LUX orb — the AI avatar.
 *
 * Exported verbatim from the Figma component `chat-ball-3x` (219:795) rather
 * than recreated: the frosted sphere is a radial gradient behind a four-layer
 * neumorphic filter, and the mark inside is the real brand lockup. Do not
 * redraw it by hand.
 *
 * ⚠️ THE MARK IS THE MASTER SYMBOL'S OWN PATHS AS OF 13 Sep 2026 — `LUX_SYMBOL`
 * from LuxLogo.tsx, drawn through ONE transform onto this 129 grid — and no
 * longer the chat-ball export's copy of them. Asked for directly, so the
 * entrance's symbol lands on this mark to the pixel (see "THE HAND-OFF" in
 * globals.css). The export's mark was the same two small strokes at 0.3374 and
 * a centre stroke drawn ~12% flatter; the transform below keeps the export's
 * footprint (58 wide, centred on 65,65) so nothing else about the orb moved.
 * The three gradients keep the export's coordinates verbatim and reach the
 * transformed paths through `gradientTransform`, the inverse of that one
 * transform — so the ink is still the chat-ball's, only the geometry is the
 * master's.
 *
 * ⚠️ EACH STROKE IS `<g class><g transform><path/></g></g>`, AND THE ORDER OF
 * THOSE TWO WRAPPERS IS LOAD-BEARING. The Spiral Assemble and thinking tracks
 * translate in 129-grid units (`translate(-20px, -13px)`); on the path, inside
 * the 0.342 transform, that would be a 7px move. The animated `<g>` sits
 * OUTSIDE the transform so the keyframes mean what they always meant.
 *
 * Size comes from the `size/orb-*` tokens: sm 48, md 80, lg 129, xl 140.
 *
 * `animateIn` plays the "Spiral Assemble" entrance (Figma 670:31, Brand page) on
 * the sphere as it appears — see `.orb-assemble` in globals.css.
 *
 * `halo` wraps the orb in an ambient line of light travelling along its rim —
 * see `.orb-halo` in globals.css. 00 Welcome and the CHECK landing only, and
 * ⚠️ NOT IN FIGMA. ⚠️ IT RUNS IN THE DEFAULT STATE and hover does nothing: it
 * was hover-only until 5 Sep 2026, which meant it never existed at all on
 * touch. The wrapper survives because the clipped SVG cannot hang the light off
 * itself — it is no longer a hit region, and it never transforms.
 *
 * ⚠️ WELCOME'S ORB IS HANDED ITS MARK BY THE ENTRANCE, AND `animateIn` TOO.
 * `<Orb animateIn halo className="orb-from-entrance">` there, and the rules
 * under "The orb's side of the hand-off" in globals.css: the orb grows from
 * 0.04 behind the entrance's symbol (the grow replaces `.reveal-hero`'s fade
 * by specificity) while its mark Spiral-Assembles into exactly the spot the
 * symbol is arriving at, and the symbol fades over it on the way.
 *
 * ⚠️ A CALLER THAT SPACES THE ORB WITH `> svg` MUST ALSO MATCH `> .orb-halo`,
 * or the wrapper breaks the selector and the orb silently loses its margin.
 * CheckScreen.module.css records the trap.
 *
 * The timeline has THREE tracks and the mark is three paths, so each track
 * drives one part: mark1 <- L, mark2 <- U, mark3 <- X, with the authored
 * 0 / 120 / 240ms stagger. The sphere assembles underneath them.
 *
 * ⚠️ The sphere sits inside a filter with a FIXED region and the whole group is
 * clipped to 129x129, so nothing may travel far. Distances are scaled to the
 * orb (~0.33 of the wordmark's) and the sphere itself does not translate at all.
 *
 * ⚠️ DESIGN TRIAL, 12 Sep 2026 — NOT IN FIGMA. `ORB_RENDERER` swaps the whole
 * orb for `SiriOrb` (21st.dev `siri-orb`, blurred conic gradients) on every
 * screen at once. Set it back to "svg" to restore the Figma export. It replaced
 * a WebGL shader orb tried and rejected the same day. The trial orb is a
 * `span.lux-orb`, not an `svg`, so every `> svg` spacing rule also matches
 * `> :global(.lux-orb)`. The brand mark sits on top as its own SVG on the 129
 * grid, so it keeps its L → U → X entrance and thinking pulse; the sphere's
 * `orb-assemble` has no equivalent, so the wrapper takes `.reveal-hero`.
 * It floats — a slow drift, breath and near-circle morph (`.lux-orb-float`,
 * `.siri-orb--lux` in globals.css). `halo` puts `.orb-halo` on the float layer
 * INSIDE `.lux-orb` rather than around it, so the rim light floats with it.
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
   - c1, the two LARGE wedges: `gradient/canvas` mobile end #acc5cc at 45% — a
     deeper grey-blue that gives the sphere form without shading it
   - c2, the two SMALL wedges: `gradient/brand` start #657792 at 30% — the
     button's indigo as a faint tint (22% until asked for "a tiny bit more")
   ⚠️ THE DARK TWO ARE TRANSLUCENT ON PURPOSE. At full strength they covered
   the light body and the orb read dark; at these alphas they tint it. The body
   itself is `.siri-orb--lux` in globals.css.
   ⚠️ `contrast` and `saturation` are pinned to 1 below. The component's own
   contrast(1.8) saturate(1.2) would push every token off its value — #657792
   toward a saturated blue, #acc5cc toward white. */
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
  /**
   * ⚠️ NOT IN FIGMA. Wrap the orb in the ambient rim light — 00 Welcome and the
   * CHECK landing only. It has to be a wrapper: the sphere fills its 129x129
   * viewBox to within 8px and the group is clipped to that box, so a light
   * straddling the edge has nowhere to go INSIDE the SVG. That is now the only
   * reason it exists — it was the hover region and it carried a hover scale, and
   * both are gone. See `.orb-halo` in globals.css; the keyframes MUST live
   * there, not in a module.
   */
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
            {/* ⚠️ NOT IN FIGMA — the lockup's depth, inside the transform so
                it is in master units and matches the entrance's symbol. See
                "THE DEPTH" in LuxLogo.tsx. */}
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
