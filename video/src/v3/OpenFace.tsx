import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Headline } from "../components/Type";
import { clamp, EASE_IN_OUT, EASE_OUT, URBANIST } from "../theme";

/**
 * Beat 1's opening shot: the skin itself, before any product shows up.
 * A portrait card on the left with the line beside it; then the card glides
 * back and dissolves as your five arrive in their ring.
 *
 * The three callouts animate in one by one: dot, line, then the lens growing
 * at its place, then its label. The photo underneath is a clean plate with
 * the callouts painted out; each lens is cut from the original photo.
 *
 * ⚠️ The photo is a reference image (Pinterest) with its headline and
 * callouts painted out (OpenCV inpaint). Same caveat as the face art: replace before public use.
 */
export const OPEN_LEN = 96;
/** film frame where TooMuch takes over */
export const OPEN_HANDOFF = 80;

const CARD_H = 860;
const CARD_W = Math.round((CARD_H * 735) / 918);
const GAP = 90;
const LINE_W = 500;
const LEFT = (1920 - (CARD_W + GAP + LINE_W)) / 2;

export const OpenFace: React.FC = () => {
  const f = useCurrentFrame();
  const enter = interpolate(f, [0, 16], [0, 1], { ...clamp, easing: EASE_OUT });
  const go = interpolate(f, [56, 84], [0, 1], { ...clamp, easing: EASE_IN_OUT });
  const fade = interpolate(f, [62, 84], [1, 0], clamp);
  if (f >= OPEN_LEN) return null;

  /* the card's centre glides from the left column to the frame's centre,
     and its height falls to the held tile's (96 px at 2.85x) */
  const cx0 = LEFT + CARD_W / 2;
  const cx = cx0 + (960 - cx0) * go * 0.35;
  const s = (1 - 0.18 * go) * (0.97 + 0.03 * enter);
  const push = 1 + 0.06 * interpolate(f, [0, 80], [0, 1], clamp);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: cx - CARD_W / 2,
          top: 540 - CARD_H / 2,
          width: CARD_W,
          height: CARD_H,
          borderRadius: 32 / Math.max(s, 0.4),
          overflow: "hidden",
          opacity: enter * fade,
          filter: `blur(${(1 - enter) * 10 + go * 4}px)`,
          transform: `scale(${s})`,
          boxShadow: "0 44px 90px -46px rgba(44,69,70,0.5)",
        }}
      >
        <div style={{ position: "absolute", inset: 0, transform: `scale(${push})`, transformOrigin: "72% 42%" }}>
          <Img src={staticFile("app/open/plate.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          {CALLOUTS.map((c) => (
            <Callout key={c.label} c={c} f={f} />
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", left: LEFT + CARD_W + GAP, top: 0, height: 1080, width: LINE_W, display: "flex", alignItems: "center" }}>
        <Headline text="Your skin flared up." size={64} at={8} out={56} align="left" width={LINE_W} />
      </div>
    </AbsoluteFill>
  );
};

/* in the photo's own pixels (735 × 918) */
const K = CARD_H / 918;
type Co = { label: string; cx: number; cy: number; r: number; dx: number; dy: number; ly: number; at: number };
const CALLOUTS: Co[] = [
  { label: "Redness", cx: 570, cy: 352, r: 80, dx: 409, dy: 343, ly: 455, at: 12 },
  { label: "Itching", cx: 414, cy: 710, r: 79, dx: 342, dy: 543, ly: 812, at: 22 },
  { label: "Dry skin", cx: 152, cy: 768, r: 79, dx: 234, dy: 636, ly: 872, at: 32 },
];

const Callout: React.FC<{ c: Co; f: number }> = ({ c, f }) => {
  /* each callout plays 1.35× (asked for: the opener a bit faster) */
  const t = (f - c.at) * 1.35;
  const dot = interpolate(t, [0, 8], [0, 1], { ...clamp, easing: EASE_OUT });
  const halo = interpolate(t, [2, 22], [0, 1], { ...clamp, easing: EASE_OUT });
  const line = interpolate(t, [4, 16], [0, 1], { ...clamp, easing: EASE_IN_OUT });
  const lens = interpolate(t, [12, 30], [0, 1], { ...clamp, easing: EASE_OUT });
  const ring = interpolate(t, [12, 32], [0, 1], { ...clamp, easing: EASE_IN_OUT });
  const label = interpolate(t, [22, 34], [0, 1], { ...clamp, easing: EASE_OUT });
  if (t < 0) return null;

  /* the line stops at the lens's rim */
  const len = Math.hypot(c.cx - c.dx, c.cy - c.dy);
  const ex = c.cx - ((c.cx - c.dx) / len) * c.r;
  const ey = c.cy - ((c.cy - c.dy) / len) * c.r;
  const L = len - c.r;
  const C2 = 2 * Math.PI * c.r;

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: (c.cx - c.r) * K,
          top: (c.cy - c.r) * K,
          width: 2 * c.r * K,
          height: 2 * c.r * K,
          borderRadius: "50%",
          overflow: "hidden",
          opacity: lens,
          transform: `scale(${0.55 + 0.45 * lens})`,
          filter: `blur(${(1 - lens) * 6}px)`,
          boxShadow: `0 10px 24px -12px rgba(30,20,15,${0.55 * lens})`,
        }}
      >
        <Img
          src={staticFile(`app/open/lens-${c.cx}.png`)}
          style={{ width: "100%", height: "100%", transform: `scale(${1.25 - 0.25 * lens})` }}
        />
      </div>
      <svg viewBox="0 0 735 918" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
        <circle cx={c.dx} cy={c.dy} r={4 + 14 * halo} fill="none" stroke="white" strokeWidth={1.2} opacity={(1 - halo) * 0.8} />
        <circle cx={c.dx} cy={c.dy} r={4.6 * dot} fill="white" />
        <line x1={c.dx} y1={c.dy} x2={c.dx + (ex - c.dx) * line} y2={c.dy + (ey - c.dy) * line} stroke="white" strokeWidth={1.4} opacity={L > 0 ? 0.92 : 0} />
        <circle
          cx={c.cx}
          cy={c.cy}
          r={c.r - 0.8}
          fill="none"
          stroke="white"
          strokeWidth={1.6}
          strokeDasharray={C2}
          strokeDashoffset={C2 * (1 - ring)}
          transform={`rotate(${(Math.atan2(ey - c.cy, ex - c.cx) * 180) / Math.PI} ${c.cx} ${c.cy})`}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: c.cx * K - 100,
          width: 200,
          top: (c.ly - 13) * K + (1 - label) * 8,
          textAlign: "center",
          fontFamily: URBANIST,
          fontWeight: 500,
          fontSize: 21 * K,
          color: "white",
          opacity: label,
          textShadow: "0 1px 6px rgba(30,20,15,0.45)",
        }}
      >
        {c.label}
      </div>
    </>
  );
};
