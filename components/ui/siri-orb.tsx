/**
 * SiriOrb — a blurred, slowly turning sphere of three colours.
 *
 * ⚠️ NOT IN FIGMA. Ported 12 Sep 2026 from the 21st.dev community component
 * `siri-orb` (Umair Waheed) as a design trial for the LUX orb; `Orb.tsx`
 * switches between it and the Figma export.
 *
 * Five conic gradients and a radial one, each anchored off-centre and each
 * turning at its own multiple of one registered `--siri-orb-angle`, under a
 * blur and a contrast boost that melt them into soft blobs. Pure CSS: no canvas,
 * no dependency, and it renders on the server.
 *
 * ⚠️ THE CSS LIVES IN globals.css, NOT HERE. The original shipped a
 * `<style jsx>` block; this app has no styled-jsx, and the `@property` and the
 * `@keyframes` it needs must be global anyway — a CSS Module localizes a
 * keyframes name and it resolves to nothing. See `.siri-orb` there.
 *
 * ⚠️ `size` MUST BE A PIXEL VALUE. The blur (8% of the size, min 8) and the
 * contrast (0.3%, min 1.8) are computed from it, and a token string such as
 * `var(--size-orb-lg)` parses to NaN.
 */

export type SiriOrbColors = {
  /** @default "transparent" */
  bg?: string;
  /** @default "oklch(75% 0.15 350)" */
  c1?: string;
  /** @default "oklch(80% 0.12 200)" */
  c2?: string;
  /** @default "oklch(78% 0.14 280)" */
  c3?: string;
};

const defaultColors: Required<SiriOrbColors> = {
  bg: "transparent",
  c1: "oklch(75% 0.15 350)",
  c2: "oklch(80% 0.12 200)",
  c3: "oklch(78% 0.14 280)",
};

export function SiriOrb({
  size = "192px",
  className,
  colors,
  animationDuration = 20,
  contrast: contrastOverride,
  saturation = 1.2,
  style,
  ...rest
}: {
  /** a pixel value, e.g. "130px" */
  size?: string;
  className?: string;
  colors?: SiriOrbColors;
  /** seconds per full turn */
  animationDuration?: number;
  /**
   * Override the contrast boost. The original always derives it from the size
   * (min 1.8), which pushes any colour away from mid-grey — pass 1 to keep a
   * palette's colours as they are.
   */
  contrast?: number;
  /** @default 1.2, the original's */
  saturation?: number;
} & React.HTMLAttributes<HTMLSpanElement>) {
  const c = { ...defaultColors, ...colors };
  const px = Number.parseInt(size.replace("px", ""), 10);
  const blur = Math.max(px * 0.08, 8);
  const contrast = contrastOverride ?? Math.max(px * 0.003, 1.8);

  return (
    <span
      className={["siri-orb", className].filter(Boolean).join(" ")}
      style={
        {
          width: size,
          height: size,
          "--siri-orb-bg": c.bg,
          "--siri-orb-c1": c.c1,
          "--siri-orb-c2": c.c2,
          "--siri-orb-c3": c.c3,
          "--siri-orb-duration": `${animationDuration}s`,
          "--siri-orb-blur": `${blur}px`,
          "--siri-orb-contrast": contrast,
          "--siri-orb-saturate": saturation,
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    />
  );
}

export default SiriOrb;
