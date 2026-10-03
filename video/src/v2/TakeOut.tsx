import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Caption, Pulse } from "../scenes/Walkthrough";
import { TILES } from "../scenes/Hook";
import { C, clamp, EASE_IN, EASE_IN_OUT, EASE_OUT, URBANIST } from "../theme";

export const TAKEOUT_LEN = 216;

const SIZE = 180;
const GAP = 44;
const ROW_Y = 520;
const RISE = 250;
/* the routine, in the demo's own five; [3] is the BHA exfoliant, the new
   addition the analysis named — the one this beat takes out */
const PAUSED = 3;

const rowX = (slot: number, count: number) => 960 - (count * SIZE + (count - 1) * GAP) / 2 + slot * (SIZE + GAP);

/**
 * V2's payoff: the thesis as an action. The routine sits in a row; the new
 * addition is ringed, lifts out and ghosts to "Paused"; the rest close the
 * gap. Under it a week of check-ins fills, day by day — the record that will
 * say whether pausing it mattered. No outcome is drawn.
 */
export const TakeOut: React.FC = () => {
  const f = useCurrentFrame();
  const lift = interpolate(f, [70, 104], [0, 1], { ...clamp, easing: EASE_IN_OUT });
  const close = interpolate(f, [92, 126], [0, 1], { ...clamp, easing: EASE_IN_OUT });
  const out = interpolate(f, [192, 214], [0, 1], { ...clamp, easing: EASE_IN });

  return (
    <AbsoluteFill style={{ opacity: 1 - out, translate: `0 ${-out * 30}px` }}>
      <Caption text={"Pause one product,\nthen note **what happens**."} at={4} out={196} />

      {TILES.map((t, i) => {
        const k = interpolate(f, [10 + i * 6, 32 + i * 6], [0, 1], { ...clamp, easing: EASE_OUT });
        const paused = i === PAUSED;
        /* where it sits in the row before and after the gap closes */
        const before = rowX(i, 5);
        const after = rowX(i < PAUSED ? i : i - 1, 4);
        const x = paused ? before : before + (after - before) * close;
        const y = paused ? ROW_Y - RISE * lift : ROW_Y;
        return (
          <div
            key={t.src}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: SIZE,
              height: SIZE,
              borderRadius: SIZE * 0.24,
              background: C.glass,
              border: `1px solid ${C.glassEdge}`,
              boxShadow: `inset 0 1px 0 ${C.panelRim}, 0 24px 40px -22px rgba(44, 69, 70, ${paused ? 0.35 * (1 - lift) : 0.35})`,
              backdropFilter: "blur(12px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: k * (paused ? 1 - 0.62 * lift : 1),
              filter: `blur(${(1 - k) * 8 + (paused ? lift * 1.5 : 0)}px) saturate(${paused ? 1 - 0.7 * lift : 1})`,
              translate: `0 ${(1 - k) * 40}px`,
              scale: paused ? 1 - 0.14 * lift : 1,
            }}
          >
            <Img src={staticFile(t.src)} style={{ height: SIZE * 0.72, maxWidth: SIZE * 0.72, objectFit: "contain" }} />
          </div>
        );
      })}
      <Pulse x={rowX(PAUSED, 5) + SIZE / 2} y={ROW_Y + SIZE / 2} at={46} r={96} f={f} />

      {/* the ghost's label */}
      <div
        style={{
          position: "absolute",
          left: rowX(PAUSED, 5) + SIZE / 2,
          top: ROW_Y - RISE + SIZE * 0.93 + 14,
          translate: "-50% 0",
          height: 44,
          padding: "0 20px",
          borderRadius: 22,
          display: "flex",
          alignItems: "center",
          fontFamily: URBANIST,
          fontWeight: 600,
          fontSize: 26,
          letterSpacing: "0.04em",
          color: C.primary,
          background: C.glassStrong,
          border: `1.5px solid ${C.primary}`,
          opacity: interpolate(f, [100, 116], [0, 1], { ...clamp, easing: EASE_OUT }),
        }}
      >
        Paused
      </div>

      {/* a week of check-ins, filling in */}
      <div style={{ position: "absolute", left: 0, right: 0, top: ROW_Y + SIZE + 90, display: "flex", justifyContent: "center", gap: 24 }}>
        {Array.from({ length: 7 }).map((_, d) => {
          const shown = interpolate(f, [118 + d * 3, 132 + d * 3], [0, 1], { ...clamp, easing: EASE_OUT });
          const filled = interpolate(f, [134 + d * 8, 144 + d * 8], [0, 1], { ...clamp, easing: EASE_OUT });
          return (
            <div
              key={d}
              style={{
                width: 62,
                height: 62,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: URBANIST,
                fontSize: 26,
                fontWeight: 500,
                border: `1.5px solid ${filled > 0.5 ? "transparent" : C.glassEdge}`,
                background: filled > 0 ? `rgba(49, 53, 96, ${filled})` : C.glass,
                color: filled > 0.5 ? "#fff" : C.inkSecondary,
                opacity: shown,
                scale: 0.85 + 0.15 * shown,
              }}
            >
              {d + 1}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
