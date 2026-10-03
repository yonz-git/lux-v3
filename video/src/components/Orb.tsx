import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { LUX_SYMBOL, LogoDepthFilter } from "./Logo";
import { clamp, EASE_OUT } from "../theme";

/* The siri-orb as lux-v3 dresses it (Orb.tsx + `.siri-orb--lux` in globals.css),
   with the turning angle and the float driven by the frame. Colours are the
   app's LUX_ORB_COLORS resolved; contrast and saturation pinned to 1 as there. */
const C1 = "rgba(177, 202, 210, 0.45)"; /* canvas-end at 45% */
const C2 = "rgba(72, 87, 128, 0.30)"; /* brand start at 30% */
const C3 = "#DBEDED"; /* bubble-ai, the body */

const MARK_STOPS = (
  <>
    <stop stopColor="#60739A" />
    <stop offset="0.331731" stopColor="#4D517B" />
    <stop offset="0.504808" stopColor="#433F6B" />
    <stop offset="0.947115" stopColor="#433F6B" />
  </>
);

/** the mark, stroke by stroke, so each can assemble on its own track */
const OrbMark: React.FC<{ p: string; assemble: number[]; pulse?: number[] }> = ({ p, assemble, pulse = [1, 1, 1] }) => {
  const grads = [`${p}_top`, `${p}_bottom`, `${p}_sweep`];
  /* where each stroke starts from, in master units: lower from down-right,
     upper from up-left, the sweep grows out of the centre */
  const from = [
    { x: 46, y: 30, r: 18, s: 0.9 },
    { x: -46, y: -30, r: 18, s: 0.9 },
    { x: 0, y: 0, r: -24, s: 0.55 },
  ];
  return (
    <svg viewBox="0 0 209 173" style={{ width: "100%", height: "auto", overflow: "visible", display: "block" }}>
      <defs>
        <LogoDepthFilter id={`${p}_depth`} region="symbol" />
        <linearGradient id={grads[0]} x1="128.093" y1="103.561" x2="80.8494" y2="177.05" gradientUnits="userSpaceOnUse">{MARK_STOPS}</linearGradient>
        <linearGradient id={grads[1]} x1="43.8843" y1="68.9359" x2="90.0273" y2="-5.1477" gradientUnits="userSpaceOnUse">{MARK_STOPS}</linearGradient>
        <linearGradient id={grads[2]} x1="62.5002" y1="36.4892" x2="121.046" y2="141.211" gradientUnits="userSpaceOnUse">{MARK_STOPS}</linearGradient>
      </defs>
      {LUX_SYMBOL.strokes.map((st, i) => {
        const k = assemble[i];
        const f = from[i];
        return (
          <g
            key={st.name}
            opacity={k * pulse[i]}
            transform={`translate(${f.x * (1 - k)} ${f.y * (1 - k)}) rotate(${f.r * (1 - k)} 85 86) translate(85 86) scale(${f.s + (1 - f.s) * k}) translate(-85 -86)`}
          >
            <path d={st.d} fill={`url(#${grads[i]})`} filter={`url(#${p}_depth)`} />
          </g>
        );
      })}
    </svg>
  );
};

/**
 * `appear` 0..1 grows the sphere; `assembleAt` is the frame (relative to this
 * component's sequence) the mark starts its L → U → X assembly; `turn` scales
 * the angle speed (the app turns once per 60s).
 */
export const Orb: React.FC<{
  size: number;
  p: string;
  assembleAt?: number;
  markOpacity?: number;
  turn?: number;
  /** the sphere's opacity, apart from the mark: 0 leaves the bare mark (the close) */
  sphere?: number;
  /** the idle float's strength, 0..1 — 0 holds the mark still for a hand-off */
  float?: number;
  /** 0..1: the app's `thinking` loop (`lux-orb-think`): each stroke dips to
      0.4 and back over 1400ms, the wave travelling L → U → X 120ms apart */
  thinking?: number;
}> = ({ size, p, assembleAt = 0, markOpacity = 1, turn = 3, sphere = 1, float = 1, thinking = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const angle = (t / 60) * 360 * turn + 40;
  const blur = Math.max(size * 0.08, 8);

  const track = (i: number) =>
    interpolate(frame, [assembleAt + i * 4, assembleAt + i * 4 + 22], [0, 1], { ...clamp, easing: EASE_OUT });

  const think = (i: number) => {
    const ph = ((((frame - i * 3.6) / 42) % 1) + 1) % 1;
    const v = ph < 0.45 ? interpolate(ph, [0, 0.45], [1, 0.4], { easing: EASE_OUT }) : interpolate(ph, [0.45, 1], [0.4, 1], { easing: EASE_OUT });
    return 1 - (1 - v) * thinking;
  };

  /* the float: a rise of 3.45% and a breath to 1.0138, on 9s and 14s */
  const rise = Math.sin((t / 9) * Math.PI * 2) * size * 0.0345 * 0.5 * float;
  const breath = 1 + (Math.sin((t / 14) * Math.PI * 2) * 0.5 + 0.5) * 0.0138 * float;
  /* the near-circle outline, never more than 2.5% off round */
  const m = (ph: number) => 50 + Math.sin(t * 0.7 + ph) * 2.5;
  const radius = `${m(0)}% ${100 - m(1)}% ${m(2)}% ${100 - m(3)}% / ${m(4)}% ${m(5)}% ${100 - m(6)}% ${100 - m(7)}%`;

  const conic = (mult: number, at: string, c: string, a: number) =>
    `conic-gradient(from ${angle * mult}deg at ${at}, ${c} 0deg, transparent ${a}deg ${360 - a}deg, ${c} 360deg)`;

  return (
    <div style={{ width: size, height: size, position: "relative", translate: `0 ${rise}px`, scale: breath }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: sphere,
          borderRadius: radius,
          overflow: "hidden",
          background: `radial-gradient(ellipse 80% 80% at 45% 42%, #F4FEFF 0%, #DBEDED 45%, #D3E4E7 100%)`,
          boxShadow: "-1px -1px 4px rgba(226, 246, 245, 0.3), 2px 4px 6px rgba(44, 69, 70, 0.125)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: radius,
            background: [
              conic(1.5, "30% 65%", C3, 45),
              conic(1, "70% 35%", C2, 60),
              conic(-1.5, "65% 75%", C1, 90),
              conic(2, "25% 25%", C2, 30),
              conic(-0.5, "80% 80%", C1, 45),
              `radial-gradient(ellipse 120% 80% at 40% 60%, ${C3} 0%, transparent 50%)`,
            ].join(", "),
            filter: `blur(${blur}px)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: radius,
            background: "radial-gradient(circle at 48% 46%, rgba(219, 237, 237, 0.75) 0%, transparent 45%)",
            boxShadow: "inset -1px -1px 10px rgba(63, 100, 102, 0.39), inset -2px -2px 4px rgba(255, 255, 255, 0.376)",
          }}
        />
      </div>
      {/* the mark: 58 of the 129 grid, centred on (65, 65) */}
      <div
        style={{
          position: "absolute",
          width: size * (58 / 129) * (209 / 169.45),
          left: size * (65 / 129) - size * (58 / 129) * (209 / 169.45) * (84.72 / 209),
          top: size * (65 / 129) - size * (58 / 129) * (209 / 169.45) * (85.97 / 209),
          opacity: markOpacity,
        }}
      >
        <OrbMark p={p} assemble={[track(0), track(1), track(2)]} pulse={[think(0), think(1), think(2)]} />
      </div>
    </div>
  );
};
