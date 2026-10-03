import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Orb } from "../components/Orb";
import { Headline } from "../components/Type";
import { C, clamp, EASE_IN, EASE_IN_OUT, EASE_OUT } from "../theme";

export const OPENING_LEN = 330;

const PHOTOS = [
  "dropper-green",
  "jar-olive",
  "bottle-brown",
  "bottle-milky",
  "pump-milky",
  "cylinder-violet",
  "pump-grey",
  "cylinder-red",
];

/* a loose 5 × 3 grid on the right; fourteen of its cells fill, in this order,
   each a little sooner than the last — the routine piling up */
const ORDER = [7, 1, 12, 4, 9, 0, 13, 6, 2, 10, 5, 14, 3, 11];
const ENTER = [14, 32, 47, 59, 69, 78, 86, 93, 99, 104, 109, 113, 117, 121];
const jitter = (n: number) => Math.sin(n * 12.9898) * 43758.5453 - Math.floor(Math.sin(n * 12.9898) * 43758.5453);

const tiles = ORDER.map((cell, i) => {
  const c = cell % 5;
  const r = Math.floor(cell / 5);
  return {
    src: `products/${PHOTOS[i % PHOTOS.length]}.webp`,
    x: 920 + c * 200 + (jitter(cell) - 0.5) * 40,
    y: 270 + r * 245 + (jitter(cell + 7) - 0.5) * 40,
    size: 140 + jitter(cell + 3) * 36,
    at: ENTER[i],
    ph: jitter(cell + 11) * 6,
  };
});

/**
 * V2's opening: the problem as a picture. The routine piles up — one product,
 * then another, faster — until the frame is crowded; then the question that
 * turns the film: what if your skin needs less? The pile sinks back into
 * depth behind it, and the orb arrives with what LUX does about it.
 */
export const Opening: React.FC = () => {
  const f = useCurrentFrame();
  const TURN = 165;
  /* the pile recedes into depth behind the turn, then leaves */
  const recede = interpolate(f, [TURN, TURN + 34], [0, 1], { ...clamp, easing: EASE_IN_OUT });
  const gone = interpolate(f, [300, 326], [0, 1], { ...clamp, easing: EASE_IN });
  const orb = interpolate(f, [252, 282], [0, 1], { ...clamp, easing: EASE_OUT });
  const orbOut = interpolate(f, [306, 330], [0, 1], { ...clamp, easing: EASE_IN_OUT });

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          opacity: (1 - 0.72 * recede) * (1 - gone),
          filter: `blur(${recede * 9}px)`,
          scale: 1 - 0.08 * recede,
          transformOrigin: "70% 50%",
        }}
      >
        {tiles.map((t) => {
          const k = interpolate(f, [t.at, t.at + 20], [0, 1], { ...clamp, easing: EASE_OUT });
          const drift = Math.sin(f / 40 + t.ph) * 6;
          return (
            <div
              key={`${t.x}-${t.y}`}
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
                opacity: k,
                filter: `blur(${(1 - k) * 8}px)`,
                translate: `0 ${(1 - k) * -70 + drift}px`,
                scale: 0.92 + 0.08 * k,
              }}
            >
              <Img src={staticFile(t.src)} style={{ height: t.size * 0.72, maxWidth: t.size * 0.72, objectFit: "contain" }} />
            </div>
          );
        })}
      </AbsoluteFill>

      {/* the pile, in words, beside it */}
      <div style={{ position: "absolute", left: 140, top: 390, width: 680, display: "flex", flexDirection: "column", gap: 4 }}>
        <Headline text="Your skin flared up," size={67} at={8} out={TURN - 8} align="left" />
        <Headline text="so you added **another** product." size={67} at={38} out={TURN - 6} align="left" />
        <Headline text="And another." size={67} at={96} out={TURN - 4} align="left" />
      </div>

      {/* the turn */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <Headline text="What if your skin needs **less**?" size={67} at={TURN + 22} out={244} />
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          left: 960 - 100,
          top: 330,
          opacity: orb * (1 - orbOut),
          scale: (0.6 + 0.4 * orb) * (1 - 0.3 * orbOut),
          translate: `0 ${-orbOut * 90}px`,
          filter: `blur(${(1 - orb) * 10}px)`,
        }}
      >
        <Orb size={200} p="v2orb" assembleAt={262} />
      </div>
      <div style={{ position: "absolute", left: 140, right: 140, top: 600, opacity: 1 - orbOut, translate: `0 ${-orbOut * 60}px` }}>
        <Headline text="LUX helps you find **what to take out**." size={59} at={268} />
      </div>
    </AbsoluteFill>
  );
};
