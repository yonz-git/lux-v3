import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Headline } from "../components/Type";
import { C, clamp, EASE_IN, EASE_OUT } from "../theme";
import { FIVE, RING, RING_SIZE } from "./TooMuch";

/**
 * Beat 1's second shot, as the first intro drew it: your five in a ring round
 * "You use five products. Where do you start?" ("Your skin flared up." stays
 * with the photo only, asked for), then the
 * ring and the lines dissolve together for the orb.
 *
 * ⚠️ It REPLACED the product wall on 2 Oct 2026 (asked for: "it's not
 * needed"). TooMuch.tsx still holds the wall, and its standalone composition
 * still renders it, but LuxNext no longer plays it.
 */
export const RING_LEN = 90;
/* the hold after the question is short (trimmed 3 Oct 2026, asked for) */
const OUT = [60, 82] as const;

export const Ring: React.FC = () => {
  const f = useCurrentFrame();
  const out = interpolate(f, OUT, [0, 1], { ...clamp, easing: EASE_IN });
  return (
    <AbsoluteFill>
      {FIVE.map((photo, slot) => {
        const k = interpolate(f, [slot * 3, slot * 3 + 20], [0, 1], { ...clamp, easing: EASE_OUT });
        const o = k * (1 - out);
        if (o <= 0) return null;
        return (
          <div
            key={photo}
            style={{
              position: "absolute",
              left: 960 + RING[slot].x - RING_SIZE / 2,
              top: 540 + RING[slot].y - RING_SIZE / 2,
              width: RING_SIZE,
              height: RING_SIZE,
              borderRadius: RING_SIZE * 0.24,
              background: "rgba(255,255,255,0.42)",
              border: `1px solid ${C.glassEdge}`,
              boxShadow: `inset 0 1px 0 ${C.panelRim}, 0 28px 44px -20px rgba(44,69,70,0.38)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: o,
              filter: `blur(${(1 - k) * 8 + out * 8}px)`,
              transform: `translateY(${out * 24}px) scale(${0.86 + 0.14 * k})`,
            }}
          >
            <Img src={staticFile(`products/${photo}.webp`)} style={{ height: RING_SIZE * 0.72, maxWidth: RING_SIZE * 0.72, width: "auto", objectFit: "contain" }} />
          </div>
        );
      })}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", paddingTop: 20 }}>
        <Headline text="You use five products." size={62} at={10} out={OUT[0]} />
        <Headline text="**Where** do you start?" size={62} at={24} out={OUT[0] + 4} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
