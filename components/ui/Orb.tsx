import { SiriOrb } from "./siri-orb";

/**
 * The LUX orb — the AI avatar.
 *
 * Exported verbatim from the Figma component `chat-ball-3x` (219:795) rather
 * than recreated: the frosted sphere is a radial gradient behind a four-layer
 * neumorphic filter, and the mark inside is the real brand lockup. Do not
 * redraw it by hand.
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

/* The orb's three colours ARE LUX tokens, bound by name, so the orb sits in the
   canvas it floats on rather than glowing over it. Mapped by how much of the
   sphere each slot paints:
   - c3, the BODY (the large radial + one wedge): `bg/bubble-ai` #dbeded, the
     light blue
   - c1, the two LARGE wedges: `gradient/canvas` mobile end #acc5cc at 45% — a
     deeper grey-blue that gives the sphere form without shading it
   - c2, the two SMALL wedges: `gradient/brand` start #657792 at 22% — the
     button's indigo as a faint tint
   ⚠️ THE DARK TWO ARE TRANSLUCENT ON PURPOSE. At full strength they covered
   the light body and the orb read dark; at these alphas they tint it. The body
   itself is `.siri-orb--lux` in globals.css.
   ⚠️ `contrast` and `saturation` are pinned to 1 below. The component's own
   contrast(1.8) saturate(1.2) would push every token off its value — #657792
   toward a saturated blue, #acc5cc toward white. */
const LUX_ORB_COLORS = {
  c1: "color-mix(in srgb, var(--color-gradient-canvas-end-mobile) 45%, transparent)",
  c2: "color-mix(in srgb, var(--color-gradient-brand-start) 22%, transparent)",
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
  /* The brand mark — three paths on the 129 grid, shared by both renderers so
     the logo exists once. Each carries its own entrance and thinking track. */
  const mark = (
    <>
      <path
        d="M49.7919 51.9738C52.066 51.0909 52.7689 50.3434 60.3787 47.0662C65.7441 45.021 69.0841 46.2348 70.9634 48.5002C73.9414 52.0902 71.7688 56.8824 66.7638 57.8195C63.3896 58.2752 61.6939 57.1301 58.4879 54.6918C55.8873 52.7398 51.9802 52.0545 49.7919 51.9738Z"
        fill="url(#lux_orb_mark1)"
        className={
          [animateIn && "orb-mark-l", thinking && "orb-think-l"]
            .filter(Boolean)
            .join(" ") || undefined
        }
      />
      <path
        d="M81.0878 78.4398C78.7996 79.2912 78.0848 80.0288 70.4227 83.2003C65.0247 85.1711 61.7041 83.9115 59.8611 81.6206C56.9405 77.9904 59.1896 73.2291 64.2096 72.3614C67.591 71.9523 69.2683 73.1206 72.4354 75.6025C75.0047 77.5899 78.9008 78.329 81.0878 78.4398Z"
        fill="url(#lux_orb_mark2)"
        className={
          [animateIn && "orb-mark-u", thinking && "orb-think-u"]
            .filter(Boolean)
            .join(" ") || undefined
        }
      />
      <path
        d="M76.6615 61.6686C80.2068 59.9898 81.2174 59.5839 82.7081 59.2399C83.3838 59.0841 84.2423 59.0048 85.3044 59.0002C88.0796 58.9881 90.0735 59.6316 91.7608 61.084C93.4214 62.5134 94.2351 64.5925 93.9407 66.6542C93.7243 68.1708 93.0283 69.3792 91.716 70.5167C90.0901 71.926 87.7872 72.7136 85.3044 72.7094C83.7445 72.7068 82.4861 72.4882 80.9832 71.9588C79.9378 71.5907 79.336 71.2932 75.2758 69.1379C73.7317 68.3183 71.2522 67.3802 69.5525 66.9725C68.4148 66.6997 64.5592 66.588 63.2332 66.7895C60.5798 67.1929 58.0086 68.0822 53.4569 70.1705C47.9378 72.703 46.9904 72.9958 44.2987 72.9999C42.9011 73.0022 42.4791 72.9524 41.4975 72.6697C38.0764 71.6843 36 69.2461 36 66.2145C36 64.2657 36.9157 62.6022 38.7045 61.3012C39.768 60.5277 40.9259 60.0014 42.2956 59.6688C43.5269 59.3698 45.9961 59.3732 47.375 59.6756C48.9403 60.019 51.0464 60.9929 53.3844 62.4542C56.8571 64.6248 59.2633 65.5618 62.0142 65.8148C63.298 65.933 63.8187 65.9226 65.1557 65.7529C68.0818 65.3813 71.0349 64.3331 76.6615 61.6686Z"
        fill="url(#lux_orb_mark3)"
        className={
          [animateIn && "orb-mark-x", thinking && "orb-think-x"]
            .filter(Boolean)
            .join(" ") || undefined
        }
      />
    </>
  );

  const markGradients = (
    <>
      <linearGradient id="lux_orb_mark1" x1="49.563" y1="57.3398" x2="72.0549" y2="58.2992" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3F326D" />
        <stop offset="1" stopColor="#5C5E9E" />
      </linearGradient>
      <linearGradient id="lux_orb_mark2" x1="81.4025" y1="73.0781" x2="58.9291" y2="71.7594" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3F326D" />
        <stop offset="1" stopColor="#5C5E9E" />
      </linearGradient>
      <linearGradient id="lux_orb_mark3" x1="36" y1="59" x2="94" y2="59" gradientUnits="userSpaceOnUse">
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
