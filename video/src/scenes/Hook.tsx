import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Headline } from "../components/Type";
import { C, clamp, EASE_IN, EASE_OUT } from "../theme";
import { useLayout } from "../layout";

/* the demo library's five products, as glass tiles around the type — the
   photos ProductArt gives them in the app. [0] is the retinol serum and [3]
   the BHA exfoliant: the two the analysis names, which fly back in at 29s. */
export const TILES = [
  { src: "products/dropper-green.webp", x: 205, y: 215, size: 176, ph: 0.0 },
  { src: "products/jar-olive.webp", x: 545, y: 168, size: 150, ph: 1.7 },
  { src: "products/bottle-brown.webp", x: 875, y: 222, size: 168, ph: 3.1 },
  { src: "products/bottle-milky.webp", x: 215, y: 868, size: 160, ph: 4.4 },
  { src: "products/pump-milky.webp", x: 862, y: 878, size: 178, ph: 2.2 },
];

export const HOOK_OUT = 136;

/**
 * 0–5s. The situation, stated before anything else: a reaction, five
 * products, no idea where to start. The tiles arrive exactly as the words
 * "Five products." land, so the type and the picture say it once together.
 */
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const L = useLayout();
  return (
    <AbsoluteFill>
      {TILES.map((tile, i) => {
        const t = { ...tile, ...L.hookTiles[i] };
        const at = 26 + i * 4;
        const k = interpolate(frame, [at, at + 22], [0, 1], { ...clamp, easing: EASE_OUT });
        const o = interpolate(frame, [HOOK_OUT + 4 + i * 2, HOOK_OUT + 30 + i * 2], [0, 1], { ...clamp, easing: EASE_IN });
        const dx = (t.x - W / 2) * 0.35 * o;
        const dy = (t.y - H / 2) * 0.35 * o;
        const drift = Math.sin(frame / 38 + t.ph) * 8;
        return (
          <div
            key={t.src}
            style={{
              position: "absolute",
              left: t.x - t.size / 2,
              top: t.y - t.size / 2,
              width: t.size,
              height: t.size,
              borderRadius: t.size * 0.24,
              background: C.glass,
              border: `1px solid ${C.glassEdge}`,
              boxShadow: `inset 0 1px 0 ${C.panelRim}, 0 24px 40px -22px rgba(44, 69, 70, 0.35)`,
              backdropFilter: "blur(12px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: k * (1 - o),
              filter: `blur(${(1 - k) * 10 + o * 6}px)`,
              translate: `${dx}px ${(1 - k) * 46 + drift + dy}px`,
              scale: 0.9 + 0.1 * k,
            }}
          >
            <Img src={staticFile(t.src)} style={{ height: t.size * 0.72, maxWidth: t.size * 0.72, width: "auto", objectFit: "contain" }} />
          </div>
        );
      })}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 0 }}>
        <Headline text="Your skin flared up." size={67} at={6} out={HOOK_OUT} />
        <Headline text="You use five products." size={67} at={24} out={HOOK_OUT + 2} />
        <Headline text="**Where** do you start?" size={67} at={42} out={HOOK_OUT + 4} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
