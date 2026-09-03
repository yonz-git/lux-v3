import { useId } from "react";

/**
 * ⚠️ NOT IN FIGMA — the sample capture inside a check-in's photo well.
 *
 * `Check-in detail` (556:1330 / 557:1353) draws each photo well as a camera
 * glyph on `surface/data-strong`, because the comps had no photography to
 * place. That is the same hole `ProductThumb` had, and it fails the same way:
 * the PHOTOS card is the one card on the screen whose whole content is the
 * picture, so a card that draws a camera icon says only "there is no picture
 * here" — on a record whose point is that the user took one.
 *
 * So the well carries a DRAWN photograph: a soft close-up of skin, with the
 * flushed patch the investigation is about. Decided here under the
 * prototype-leads rule, exactly as `ProductArt` was, and Figma catches up.
 *
 * **It is an illustration, and it is not anyone's face.** No feature is drawn —
 * it is a crop of skin, a blush and the light falling across it. Nothing here
 * is a photograph of a person, and nothing claims to be a diagnosis.
 *
 * **The pigments are literals, and they must not become tokens.** `02 Color`
 * has no skin-tone role and it should not grow one to serve a placeholder;
 * binding a cheek to `bg/brand` would repaint the artwork every time the brand
 * colour moved. Same rule `ProductArt` states for its bottle glass.
 *
 * ⚠️ EVERY CAPTURE SURFACE IN LUX IS A PLACEHOLDER — the selfie tray, the
 * products scan view and the check-in's camera all draw a viewfinder rather
 * than calling `getUserMedia`, so that walking the prototype never demands a
 * permission. This is the same decision one step later: the record of a photo
 * that was never really taken.
 *
 * ⚠️ THE VARIANT IS KEYED ON THE DAY, NEVER RANDOM. Two check-ins a week apart
 * should not look like the same photograph, and one check-in should not change
 * its photograph between two renders of the same screen — the same rule
 * `ProductArt` follows with its FNV-1a hash of the product id.
 */

/* FNV-1a, the same small hash ProductArt uses — stable across renders and
   across reloads, which `Math.random()` is not. */
function hash(value: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return Math.abs(h);
}

/**
 * Three lighting/tone variants. Warm skin over a cool LUX-adjacent shadow, so
 * the picture belongs to this app rather than looking like stock photography
 * dropped into it.
 */
const TONES = [
  { light: "#f6ded0", mid: "#e8c3ac", shadow: "#c99a80", blush: "#d97b6c" },
  { light: "#f7e4d6", mid: "#eccdb6", shadow: "#c59a7f", blush: "#cf7466" },
  { light: "#f2d8c6", mid: "#e2bba2", shadow: "#bd9077", blush: "#d5806f" },
];

export function CheckInPhotoArt({
  seed,
  className,
}: {
  /** the day this capture belongs to — its whole identity */
  seed: string;
  className?: string;
}) {
  /* ⚠️ ids MUST be instance-unique: two of these on one page with a shared
     gradient id would both paint with the first one's fill. */
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const h = hash(seed);
  const tone = TONES[h % TONES.length];

  /* the blush sits a little differently on each day, within the middle of the
     frame so the crop never cuts it in half */
  const bx = 44 + (h % 5) * 6;
  const by = 40 + ((h >> 3) % 5) * 5;

  const skin = `skin-${uid}`;
  const blush = `blush-${uid}`;
  const soften = `soften-${uid}`;
  const vignette = `vignette-${uid}`;
  const grain = `grain-${uid}`;

  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      /* `slice`, not `meet` — this stands in for a PHOTOGRAPH, and a photo in a
         120-tall letterbox well is cropped to fill it, never letterboxed with
         the card's own fill showing through at the sides. */
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
      focusable="false"
      aria-hidden="true"
    >
      <defs>
        {/* the light falls from the upper left, as it does in every other
            drawn surface in the app */}
        <linearGradient id={skin} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor={tone.light} />
          <stop offset="0.45" stopColor={tone.mid} />
          <stop offset="1" stopColor={tone.shadow} />
        </linearGradient>

        <radialGradient id={blush}>
          <stop offset="0" stopColor={tone.blush} stopOpacity="0.55" />
          <stop offset="0.6" stopColor={tone.blush} stopOpacity="0.22" />
          <stop offset="1" stopColor={tone.blush} stopOpacity="0" />
        </radialGradient>

        <radialGradient id={vignette}>
          <stop offset="0.55" stopColor="#2e2a3f" stopOpacity="0" />
          <stop offset="1" stopColor="#2e2a3f" stopOpacity="0.22" />
        </radialGradient>

        {/* a real close-up has no hard edges — everything drawn on top of the
            skin is blurred rather than outlined */}
        <filter id={soften} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" />
        </filter>

        {/* ⚠️ THE GRAIN IS WHAT MAKES IT READ AS A PHOTOGRAPH. Without it the
            well holds three overlapping gradients, and a gradient in a picture
            frame looks like a loading state rather than a capture. Fractal
            noise at a high frequency is skin texture at this crop, and it is
            the only thing on the drawing that is not a smooth ramp. */}
        <filter id={grain} x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="3"
            seed={h % 100}
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>

      <rect width="120" height="120" fill={`url(#${skin})`} />

      {/* the curve of the cheek: a broad soft highlight, then the falloff */}
      <g filter={`url(#${soften})`}>
        <ellipse cx="42" cy="38" rx="34" ry="28" fill={tone.light} opacity="0.5" />
        <ellipse cx="96" cy="92" rx="38" ry="34" fill={tone.shadow} opacity="0.45" />
      </g>

      {/* the flushed patch — the reason the photo is in the record at all */}
      <circle cx={bx} cy={by} r="30" fill={`url(#${blush})`} />
      <g filter={`url(#${soften})`} opacity="0.5">
        <circle cx={bx - 9} cy={by + 7} r="4" fill={tone.blush} />
        <circle cx={bx + 8} cy={by - 5} r="3" fill={tone.blush} />
        <circle cx={bx + 3} cy={by + 12} r="2.5" fill={tone.blush} />
      </g>

      <rect
        width="120"
        height="120"
        filter={`url(#${grain})`}
        opacity="0.16"
        style={{ mixBlendMode: "overlay" }}
      />

      <rect width="120" height="120" fill={`url(#${vignette})`} />
    </svg>
  );
}
