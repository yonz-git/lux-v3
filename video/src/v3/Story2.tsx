import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { LuxLogoMark, LuxLogoWord } from "../components/Logo";
import { Orb } from "../components/Orb";
import { Headline } from "../components/Type";
import { C, cardShadow, clamp, EASE_IN_OUT, EASE_OUT, FIGTREE, MANROPE, overline } from "../theme";
import { FiveTile, P5, Tap } from "./Story";

/**
 * Next version, beats 5–9: TIMELINE → THE ONE → TAKE IT OUT → WATCH → CLOSE.
 * Brief: lux-v3/.forge/briefs/intro-video-next.md. Film frames throughout.
 *
 * 5 · Your five come back as the familiar row and sort themselves into the
 *     app's three groups (its own labels), on a then → now axis.
 * 6 · The app's `Start analysis` button flies in under the groups and is
 *     tapped; the analysing screen runs, then the results page (4 Oct 2026,
 *     asked for: the orb used to point and explain before anything had been
 *     analysed, which put the answer before the question). The page runs in
 *     the app's order: the five scores, then what to do next (Nov 2026).
 * 7 · The row re-forms; the new addition's name is struck through, it leaves
 *     the row as a paused ghost and the rest close the gap.
 * 8 · PROGRESS's symptom trend card, as the app draws it (SymptomTrend, the
 *     deep tier) with the app's own entrance: bands sweep in, the line wipes
 *     left to right, the end dot settles. No orb (asked for 3 Oct 2026). It replaced the 14 day discs on 2 Oct 2026
 *     (asked for: "the progress graph"). The values are read off the live
 *     card at localhost:3030/progress, so its copy is the app's own.
 * 9 · The graph and the orb clear, and the full logo arrives on its own.
 *     The orb no longer glides into the mark (cut 2 Oct 2026, asked for:
 *     "orb is not needed at all here").
 */

const W = 1920;
const e = (f: number, a: number, b: number, from = 0, to = 1, easing = EASE_IN_OUT) =>
  interpolate(f, [a, b], [from, to], { ...clamp, easing });
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ── the timeline ───────────────────────────────────────────────────────── */
const P6 = P5 + 170;
/* beat 6 ends on the Analysis tab's product check (the score lives there, never on the answer) */
/* the orb's explanation holds this long before the two lift out */
const DWELL = 24;
/* then the analysing screen plays (CHECK's /check/analyzing, asked for 3 Oct
   2026): the orb takes the centre and thinks while the passes tick, and only
   then does the answer arrive. Everything after it runs AN later. */
const AN0 = P6 + DWELL + 78;
/* the button: under the groups once they have lifted, tapped, then the analysing screen */
const BTN_LIFT = 128;
const BTN_TAP = P6 + 62;
const AN = 170;
const D2 = DWELL + AN;
/* the answer card, its push in and the evidence were cut 3 Oct 2026 (asked
   for): the results page follows the analysing screen directly */
const SCORE = P6 + D2 + 66;
/* the results page runs in the app's order, the scores and then what to do
   next, and holds SCORE → P7. NEXT_AT is when the page has travelled down to
   the advice; everything on that card is timed from it. */
const NEXT_AT = 168;
const P7 = SCORE + NEXT_AT + 270;
const P8 = P7 + 156;
/* longer since the gallery joined the graph (3 Oct 2026) */
const P9 = P8 + 165;
export const NEXT_END = P9 + 200;

/* two #rrggbb colours mixed in sRGB */
const mix = (a: string, b: string, t: number) => {
  const p = (h: string, i: number) => parseInt(h.slice(1 + 2 * i, 3 + 2 * i), 16);
  return `rgb(${[0, 1, 2].map((i) => Math.round(p(a, i) + (p(b, i) - p(a, i)) * t)).join(",")})`;
};

const Caption: React.FC<{ text: string; at: number; out?: number; top?: number }> = ({ text, at, out, top = 64 }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center" }}>
    <Headline text={text} size={59} at={at} out={out} lineHeight={1.1} />
  </div>
);

/* ── 5 · the three groups, the app's own words ── */
const GROUPS = [
  { label: "Long-term products", sub: "4+ weeks", age: 3, items: ["jar-olive", "pump-milky"] },
  { label: "Recent", sub: "1–4 weeks", age: 2, items: ["bottle-brown", "dropper-green"] },
  { label: "New addition", sub: "< 1 week", age: 1, items: ["bottle-milky"] },
];
/* the Products hub's category card (MyProducts' .category) in its own CSS px,
   drawn at K5: 342 × 112, padding 16 24, radius 24, 12 between cards */
const K5 = 2;
const ROW_W = 342 * K5;
const ROW_H = 112 * K5;
const ROW_GAP = 12 * K5;
/* beat 5's caption (65) + 60 + the three rows, centred as one block */
const ROWS_CAP_TOP = Math.round((1080 - (65 + 60 + 3 * ROW_H + 2 * ROW_GAP)) / 2);
const ROWS_TOP = ROWS_CAP_TOP + 125;
/* the large primary at the same scale: 288 × 57.6, label 15 */
const BTN = { w: 288 * K5, h: 57.6 * K5, y: ROWS_TOP + 3 * ROW_H + 2 * ROW_GAP - BTN_LIFT + 44 };
/* centred (asked for 3 Oct 2026; it sat 110 left of centre until then).
   Beat 6's orb and bubble still fit to the right: the bubble ends at 1860 */
const ROWS_X = W / 2 - ROW_W / 2;
const AXIS_X = ROWS_X - 60;
const SLOT = 40 * K5;
const rowTop = (i: number) => ROWS_TOP + i * (ROW_H + ROW_GAP);
const rowMidY = (i: number) => rowTop(i) + ROW_H / 2;
/* each product's thumb: 40 square, 28 apart so they overlap, the last one
   on the card's right padding, 56 below the card's top */
const slotOf: Record<string, { x: number; y: number; group: number }> = {};
GROUPS.forEach((g, gi) =>
  g.items.forEach((p, j) => {
    const left = 318 - 40 - (g.items.length - 1 - j) * 28;
    slotOf[p] = { x: ROWS_X + (left + 20) * K5, y: rowTop(gi) + (56 + 20) * K5, group: gi };
  }),
);
/* the familiar row they come back as, bottom of frame, in their row order */
const ORDER = ["jar-olive", "bottle-milky", "dropper-green", "bottle-brown", "pump-milky"];
const backRowX = (i: number) => W / 2 + (i - 2) * 134;
/* the five come back UNDER the caption and above the rows, then drop into
   their groups (asked for 3 Oct 2026). To make room, the caption starts
   OPEN_UP higher and the rows OPEN_UP lower; both settle back to the
   centred block once the five have landed. */
const OPEN_UP = 49;
const BACK_Y = ROWS_CAP_TOP - OPEN_UP + 65 + 24 + 55;

/* ── 7–8 · the row again; the paused one leaves it ── */
/* the row sits low enough that it and its caption are one block centred on the
   frame (4 Oct 2026, asked for: the caption sat at the top, the row mid frame) */
const R7 = { size: 160, gap: 44, y: 580 };
const R7_CAP_TOP = R7.y - R7.size / 2 - 200;
const r7x = (i: number) => W / 2 + (i - 2) * (R7.size + R7.gap);
const PAUSED = "bottle-milky";
const FOUR = ORDER.filter((p) => p !== PAUSED);
const FOUR_W = 4 * R7.size + 3 * R7.gap;
const GHOST_GAP = 170;
const GHOST_S = 0.86;
const GROUP_W = FOUR_W + GHOST_GAP + R7.size * GHOST_S;
const fourX = (i: number) => W / 2 - GROUP_W / 2 + R7.size / 2 + i * (R7.size + R7.gap);
const GHOST_X = W / 2 - GROUP_W / 2 + FOUR_W + GHOST_GAP + (R7.size * GHOST_S) / 2;

/* ── 8 · the app's symptom trend card, in its own CSS px, drawn at TS ── */
/* smaller since 3 Oct 2026, so the progress gallery fits under it */
const TS = 1.25;
const TC = { w: 616, h: 276 };
/* centred under the two line caption now that the row is gone */
const TREND = { x: W / 2 - (TC.w * TS) / 2, y: 262 };
/* PROGRESS's gallery card under it, same width, same scale */
const GAL = { x: TREND.x, y: TREND.y + TC.h * TS + 24 };
/* the line's track: 482 wide from x 96, fourteen days 37 apart */
const colX = (k: number) => 96 + (k * 482) / 13;
/* the live card's line, Sep 20 → 29 (columns 1–10), card px */
const VALS: [number, number][] = [
  [1, 125], [2, 153], [3, 126], [4, 139], [5, 153], [6, 169], [7, 182], [8, 182], [9, 192], [10, 206],
];
const KNOTS = VALS.map(([k, y]) => [colX(k), y] as [number, number]);
/* the same smoothing the old chart used, sampled densely */
const bez = (a: number, b: number, c: number, d: number, t: number) =>
  (1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t ** 2 * c + t ** 3 * d;
const DENSE: [number, number][] = [KNOTS[0]];
for (let i = 1; i < KNOTS.length; i++) {
  const p0 = KNOTS[i - 2] ?? KNOTS[i - 1];
  const p1 = KNOTS[i - 1];
  const p = KNOTS[i];
  const p3 = KNOTS[i + 1] ?? p;
  const c1 = [p1[0] + (p[0] - p0[0]) / 6, p1[1] + (p[1] - p0[1]) / 6];
  const c2 = [p[0] - (p3[0] - p1[0]) / 6, p[1] - (p3[1] - p1[1]) / 6];
  for (let t = 1; t <= 16; t++) DENSE.push([bez(p1[0], c1[0], c2[0], p[0], t / 16), bez(p1[1], c1[1], c2[1], p[1], t / 16)]);
}
/* in film px */
const POINTS = DENSE.map(([x, y]) => [TREND.x + x * TS, TREND.y + y * TS] as [number, number]);
const LINE_D = POINTS.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" ");

/* ── 9 · the lockup, as Close places it ── */
/* 15% smaller than the first cut (440), asked for; centred on the same line */
const LOCKUP_W = 374;
const MARK_W = LOCKUP_W * (209 / 538);
const WORD_W = LOCKUP_W * (329 / 538);
const LOCKUP_H = LOCKUP_W * (173 / 538);
const LOCKUP = { x: W / 2 - LOCKUP_W / 2, y: 413 };

export const Story2: React.FC = () => {
  const f = useCurrentFrame();
  if (f < P5) return null;

  /* ── 5 ── */
  const backIn = e(f, P5 + 12, P5 + 40, 0, 1, EASE_OUT);
  const sortT = (i: number) => e(f, P5 + 46 + i * 6, P5 + 86 + i * 6);
  const open5 = e(f, P5 + 100, P5 + 136);
  const rowShift = OPEN_UP * (1 - open5) - BTN_LIFT * e(f, P6 + 6, P6 + 34, 0, 1, EASE_OUT);
  const rowsIn = (i: number) => e(f, P5 + 30 + i * 8, P5 + 58 + i * 8, 0, 1, EASE_OUT);
  const axisIn = e(f, P5 + 92, P5 + 122, 0, 1, EASE_OUT);

  /* ── 6 ── */
  const btnIn = e(f, P6 + 12, P6 + 38, 0, 1, EASE_OUT);
  /* hover: the app's duration/hover (400 ms) as the fingertip comes over it */
  const hov = e(f, BTN_TAP - 24, BTN_TAP - 12, 0, 1, (t) => t * t * (3 - 2 * t));
  const rowsOut = e(f, P6 + D2 + 64, P6 + D2 + 88);
  /* the analysing screen clears the rows; the results page follows it */
  const anDim = e(f, AN0, AN0 + 20);
  /* ── 7 ── */
  const regroup = (i: number) => e(f, P7 + 4 + i * 3, P7 + 22 + i * 3, 0, 1, EASE_OUT);
  const labelIn = e(f, P7 + 44, P7 + 60, 0, 1, EASE_OUT);
  const strike = e(f, P7 + 64, P7 + 82, 0, 1, EASE_OUT);
  /* with the strike, the paused bottle is ringed in the Avoid red and grows a little */
  const flag = e(f, P7 + 64, P7 + 82, 0, 1, EASE_IN_OUT);
  const FLAG_GROW = 1.1;
  const leave = e(f, P7 + 90, P7 + 130);
  const close = e(f, P7 + 100, P7 + 140);
  const pausedPill = e(f, P7 + 124, P7 + 140, 0, 1, EASE_OUT);

  /* ── 8 ── */
  /* 8: the products leave (asked for 3 Oct 2026) and the graph has the frame */
  const rowGone = e(f, P8, P8 + 24);
  const rowS = 1;
  const trendIn = e(f, P8 + 20, P8 + 40, 0, 1, EASE_OUT);
  /* the card's own entrance (SymptomTrend.module.css), from when it lands */
  const tt = f - (P8 + 34);
  const galIn = e(f, P8 + 74, P8 + 96, 0, 1, EASE_OUT);

  /* ── 9 ── */
  const clear = e(f, P9, P9 + 24);
  /* the logo arrives on its own once the graph has cleared */
  const settle = e(f, P9 + 30, P9 + 62, 0, 1, EASE_OUT);
  const word = e(f, P9 + 70, P9 + 100, 0, 1, EASE_OUT);
  const light = interpolate(f, [P9 + 92, P9 + 172], [0.35, 1.35], clamp);
  const lightO = interpolate(f, [P9 + 92, P9 + 102, P9 + 162, P9 + 172], [0, 1, 1, 0], clamp);
  const endFade = e(f, NEXT_END - 26, NEXT_END - 2);

  /* ── the five, through 5 → 6 → 7 → 8 ── */
  const tile = (p: string) => {
    const i = ORDER.indexOf(p);
    const s = slotOf[p];
    /* 5: back as the row, then sorted into its group */
    let x = lerp(backRowX(i), s.x, sortT(i));
    let y = lerp(lerp(BACK_Y + 30, BACK_Y, backIn), s.y + rowShift, sortT(i));
    let size = lerp(110, SLOT, sortT(i));
    let o = backIn;
    let filt = "";
    if (f >= P6) {
      o *= 1 - anDim;
      if (!["dropper-green", "bottle-milky"].includes(p)) {
        o *= 1 - rowsOut;
        y += rowsOut * 30;
      }
    }
    if (f >= P7) {
      /* 7: the row simply appears in place (its re-forming flight was cut
         3 Oct 2026, asked for) */
      const k = regroup(i);
      x = r7x(i);
      y = R7.y + (1 - k) * 24;
      size = R7.size;
      o = k;
      filt = "";
      if (p === PAUSED) {
        x = lerp(x, GHOST_X, leave);
        /* up and over the row, never through it */
        y = R7.y - 210 * Math.sin(Math.PI * leave);
        size = lerp(size * lerp(1, FLAG_GROW, flag), R7.size * GHOST_S, leave);
        o = 1 - 0.55 * leave;
        filt = `grayscale(${0.8 * leave}) blur(${leave * 1.2}px)`;
      } else {
        const j = FOUR.indexOf(p);
        x = lerp(x, fourX(j), close);
      }
    }
    if (f >= P8) {
      o *= 1 - rowGone;
      y -= 30 * rowGone;
    }
    o *= 1 - clear;
    return { x, y, size, o, filt };
  };

  /* the orb: points in 6, draws the line in 8, becomes the mark in 9 */
  let orb: { x: number; y: number; size: number; o: number; think?: number } | null = null;
  /* only on the analysing screen now: it no longer points before the analysis */
  if (f >= AN0 && f < AN0 + AN) {
    const back = e(f, AN0 + AN - 26, AN0 + AN - 6);
    /* after the groups have cleared */
    const k = e(f, AN0 + 20, AN0 + 36, 0, 1, EASE_OUT);
    orb = { x: AN_ORB.x, y: AN_ORB.y, size: AN_ORB.size * (0.9 + 0.1 * k), o: k * (1 - back), think: e(f, AN0 + 16, AN0 + 30) };
  }

  return (
    <AbsoluteFill style={{ opacity: 1 - endFade }}>
      {/* ── captions ── */}
      {/* over the results page, where the pause card is (moved 4 Oct 2026: it
          used to come before the analysis had run) */}
      <Caption text="Analyses **compatibility**" at={SCORE + 8} out={SCORE + 138} top={COMPAT_CAP_TOP} />
      <Caption text="LUX points to **what to pause** first" at={SCORE + NEXT_AT + 8} out={SCORE + NEXT_AT + 66} />
      <Caption text="And **what to do next**, step by step" at={SCORE + NEXT_AT + 80} out={P7 - 12} />
      {/* over the row while it is the whole picture; up to the top as the graph comes in */}
      <Caption text="Pause the **suspected** product" at={P7 + 40} out={P9} top={lerp(R7_CAP_TOP, 64, e(f, P8 - 10, P8 + 16, 0, 1, EASE_IN_OUT))} />
      <Caption text="then see **what changes**" at={P8 + 6} out={P9 + 2} top={64 + 65} />

      {/* ── 5 · the groups and their axis ── */}
      {f < P7 &&
        GROUPS.map((g, i) => {
          const k = rowsIn(i);
          const dim = 0;
          return (
            <div
              key={g.label}
              style={{
                position: "absolute",
                left: ROWS_X,
                top: ROWS_TOP + rowShift + i * (ROW_H + ROW_GAP) + (1 - k) * 30 + rowsOut * 30,
                width: ROW_W,
                height: ROW_H,
                boxSizing: "border-box",
                borderRadius: 24 * K5,
                background: C.card,
                boxShadow: cardShadow(K5),
                backdropFilter: "blur(16px)",
                fontFamily: FIGTREE,
                color: C.ink,
                opacity: k * (1 - 0.5 * dim) * (1 - rowsOut) * (1 - anDim),
              }}
            >
              {/* t-h6: 16 / 500, at the card's 24 inset, 20 from its top */}
              <div style={{ position: "absolute", left: 24 * K5, top: 20 * K5, fontSize: 16 * K5, fontWeight: 500, lineHeight: 1.2 }}>{g.label}</div>
              {/* the window pill (t-label 14 / 600), its three-bar age meter */}
              <div
                style={{
                  position: "absolute",
                  left: 24 * K5,
                  top: 62 * K5,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6 * K5,
                  height: 28 * K5,
                  boxSizing: "border-box",
                  padding: `0 ${12 * K5}px 0 ${9 * K5}px`,
                  borderRadius: 999,
                  background: C.glass,
                  boxShadow: `inset 0 ${K5}px 0 ${C.panelRim}`,
                  fontSize: 14 * K5,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "flex-end", gap: 2 * K5, height: 12 * K5 }}>
                  {[1, 2, 3].map((b) => (
                    <span key={b} style={{ width: 4 * K5, height: [6, 9, 12][b - 1] * K5, borderRadius: 2 * K5, background: b <= g.age ? "#39386f" : "rgba(57, 56, 111, 0.18)" }} />
                  ))}
                </span>
                {g.sub}
              </div>
              {/* the count (t-h6 in a 28 disc) and the chevron, top right */}
              <div
                style={{
                  position: "absolute",
                  left: 262 * K5,
                  top: 16 * K5,
                  width: 28 * K5,
                  height: 28 * K5,
                  borderRadius: 14 * K5,
                  background: C.routine,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16 * K5,
                  fontWeight: 500,
                }}
              >
                {g.items.length}
              </div>
              <svg width={12 * K5} height={12 * K5} viewBox="0 0 12 12" style={{ position: "absolute", left: 306 * K5, top: 24 * K5 }}>
                <path d="M1.5 3.5L6 8l4.5-4.5" fill="none" stroke={C.ink} strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          );
        })}
      {f < P7 && axisIn > 0 && (
        <div style={{ opacity: (1 - rowsOut) * (1 - anDim), translate: `0 ${rowShift}px` }}>
          <div
            style={{
              position: "absolute",
              left: AXIS_X - 1.5,
              top: rowMidY(0),
              width: 3,
              height: (rowMidY(2) - rowMidY(0)) * axisIn,
              borderRadius: 3,
              background: `linear-gradient(${C.primaryStart}, ${C.primary})`,
            }}
          />
          {[0, 1, 2].map((i) => {
            const k = e(f, P5 + 96 + i * 12, P5 + 110 + i * 12, 0, 1, EASE_OUT);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: AXIS_X - 11,
                  top: rowMidY(i) - 11,
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  /* all three filled (4 Oct 2026, asked for: hollow then / mid read
                     as unanswered, not as earlier) */
                  background: C.primary,
                  border: `3px solid ${C.primary}`,
                  scale: k,
                  opacity: k,
                }}
              />
            );
          })}
          {[
            { t: "then", y: rowMidY(0), at: P5 + 98, bold: false },
            { t: "now", y: rowMidY(2), at: P5 + 122, bold: true },
          ].map((l) => {
            const k = e(f, l.at, l.at + 16, 0, 1, EASE_OUT);
            return (
              <div
                key={l.t}
                style={{
                  position: "absolute",
                  right: W - AXIS_X + 28,
                  top: l.y - 20,
                  fontFamily: FIGTREE,
                  fontSize: 26.4,
                  lineHeight: "40px",
                  fontWeight: l.bold ? 700 : 500,
                  color: l.bold ? C.primary : C.ink,
                  opacity: k,
                  translate: `${(1 - k) * 14}px 0`,
                }}
              >
                {l.t}
              </div>
            );
          })}
        </div>
      )}

      {/* ── 6 · the app's Start analysis button: flies in, is tapped ── */}
      {f >= P6 + 12 && f < AN0 + 24 && (
        <>
          <div
            style={{
              position: "absolute",
              left: W / 2 - BTN.w / 2,
              top: BTN.y + (1 - btnIn) * 120,
              width: BTN.w,
              height: BTN.h,
              borderRadius: 999,
              overflow: "hidden",
              /* the app's primary (Button.module.css): #485780 → #313560, and its
                 hover runs the gradient end for end as the fingertip arrives */
              background: `linear-gradient(90deg, ${mix("#485780", "#313560", hov)}, ${mix("#313560", "#485780", hov)})`,
              boxShadow: "inset 0 1.5px 0 rgba(255,255,255,0.28), 0 24px 40px -22px rgba(49,53,96,0.55)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FIGTREE,
              fontSize: 15 * K5,
              fontWeight: 500,
              opacity: btnIn * (1 - anDim),
              filter: `blur(${(1 - btnIn) * 8}px)`,
            }}
          >
            Start analysis
          </div>
          {/* the hover's specular rim: two 1.5px streaks circling the pill, one turn
              every 4.5s (globals.css lux-specular-orbit), fading in with the hover */}
          <div
            style={{
              position: "absolute",
              left: W / 2 - BTN.w / 2 - 1.5,
              top: BTN.y + (1 - btnIn) * 120 - 1.5,
              width: BTN.w + 3,
              height: BTN.h + 3,
              borderRadius: 999,
              padding: 1.5 * 1.6,
              boxSizing: "border-box",
              opacity: hov * (1 - anDim),
              background: `conic-gradient(from ${-45 + ((f - (BTN_TAP - 24)) / 135) * 360 - 60}deg, transparent 0deg, #b3bccb 30deg, #a1b2d0 50deg, #f2f4f9 60deg, #a1b2d0 70deg, #b3bccb 90deg, transparent 120deg, transparent 180deg, #acb0c3 210deg, #a1b2d0 230deg, #f2f4f9 240deg, #a1b2d0 250deg, #acb0c3 270deg, transparent 300deg)`,
              WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
            }}
          />
          <Tap f={f} at={BTN_TAP} x={W / 2 - BTN.w / 2} y={BTN.y} w={BTN.w} h={BTN.h} />
        </>
      )}

      {/* ── 6 · the results page, as the Analysis tab draws it: the compatibility
          scores, then the camera travels down to what to do next ── */}
      {f >= SCORE && f < P7 + 10 && <ResultsPage t={f - SCORE} out={e(f, P7 - 14, P7 + 8)} />}

      {/* ── 8 · the progress graph: the app's symptom trend card ── */}
      {f >= P8 + 20 && (
        <>
          <div style={{ position: "absolute", left: TREND.x, top: TREND.y + (1 - trendIn) * 40, transformOrigin: "0 0", scale: TS, opacity: trendIn * (1 - clear) }}>
            <TrendCard t={tt} />
          </div>
          {/* the line: a clip-path wipe left to right, as the app draws it (960 ms after 240 ms) */}
          <svg
            width={W}
            height={1080}
            style={{
              position: "absolute",
              inset: 0,
              overflow: "visible",
              opacity: trendIn * (1 - clear),
              translate: `0 ${(1 - trendIn) * 40}px`,
              clipPath: `inset(-20px ${W - lerp(POINTS[0][0] - 10, POINTS[POINTS.length - 1][0] + 10, tw(tt, 7, 29))}px -20px 0)`,
            }}
          >
            <path d={LINE_D} fill="none" stroke="#fff" strokeWidth={2 * TS} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {/* the end dot settles in at 1100 ms */}
          <svg width={W} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible", opacity: trendIn * (1 - clear) * tw(tt, 33, 10), translate: `0 ${(1 - trendIn) * 40}px` }}>
            <circle
              cx={POINTS[POINTS.length - 1][0]}
              cy={POINTS[POINTS.length - 1][1]}
              r={6 * TS * (0.4 + 0.6 * tw(tt, 33, 10))}
              fill="#fff"
              stroke={C.routine}
              strokeWidth={2.4 * TS}
            />
          </svg>
          {/* the progress gallery: four close ups of the same cheek, the redness fading */}
          <div style={{ position: "absolute", left: GAL.x, top: GAL.y + (1 - galIn) * 40, transformOrigin: "0 0", scale: TS, opacity: galIn * (1 - clear) }}>
            <GalleryCard t={f - (P8 + 84)} />
          </div>
        </>
      )}

      {/* ── 7 · the paused one's name, struck through; then the label it leaves with ── */}
      {f >= P7 + 40 && f < P7 + 140 && (() => {
        return (
          <>
            <div
              style={{
                position: "absolute",
                left: r7x(1) - 200,
                width: 400,
                /* moves down with the bottle's growth and ring, keeping its gap */
                top: R7.y + R7.size / 2 + 22 + ((FLAG_GROW - 1) * R7.size / 2 + 6 + 3) * flag,
                textAlign: "center",
                fontFamily: FIGTREE,
                fontSize: 32,
                fontWeight: 500,
                color: lerp(0, 1, strike) > 0.5 ? C.inkMuted : C.ink,
                opacity: labelIn * (1 - leave),
              }}
            >
              <span style={{ position: "relative" }}>
                Salicylic Acid (BHA)
                <span
                  style={{
                    position: "absolute",
                    left: -6,
                    right: -6,
                    top: "54%",
                    height: 3.5,
                    borderRadius: 2,
                    background: C.primary,
                    transformOrigin: "0 50%",
                    scale: `${strike} 1`,
                  }}
                />
              </span>
            </div>
          </>
        );
      })()}
      {/* the Paused pill: under the ghost from 7, carried up with the row in 8 */}
      {f >= P7 + 100 && (() => {
        const t = tile(PAUSED);
        return (
          <div
            style={{
              position: "absolute",
              left: t.x - 70,
              width: 140,
              top: t.y + t.size / 2 + 18 * rowS,
              height: 46,
              borderRadius: 23,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FIGTREE,
              fontWeight: 600,
              fontSize: 26,
              letterSpacing: "0.04em",
              color: C.primary,
              background: C.glassStrong,
              border: `1.5px solid ${C.primary}`,
              opacity: pausedPill * (1 - clear) * (1 - rowGone),
              transformOrigin: "50% 0",
              scale: rowS,
            }}
          >
            Paused
          </div>
        );
      })()}
      {/* ── the five, everywhere from 5 to 8 ── */}
      {f < P9 + 26 &&
        [...ORDER.filter((p) => p !== PAUSED), PAUSED].map((p) => {
          const t = tile(p);
          if (t.o <= 0.01) return null;
          return <FiveTile key={p} photo={p} x={t.x} y={t.y} size={t.size} style={{ opacity: t.o, filter: t.filt || undefined }} />;
        })}

      {/* the paused bottle's Avoid ring, drawing itself around the tile as the name is struck */}
      {f >= P7 + 64 && f < P7 + 130 && (() => {
        const t = tile(PAUSED);
        const pad = 6;
        const box = t.size + pad * 2;
        return (
          <svg
            width={box}
            height={box}
            style={{ position: "absolute", left: t.x - box / 2, top: t.y - box / 2, overflow: "visible", opacity: t.o * (1 - leave) }}
          >
            <rect x={1.5} y={1.5} width={box - 3} height={box - 3} rx={t.size * 0.24 + pad} fill="none" stroke={AVOID} strokeWidth={3} strokeLinecap="round" pathLength={1} strokeDasharray={`${flag} 1`} />
          </svg>
        );
      })()}

      {/* beat 5's caption, drawn after the five */}
      <Caption text="Add what you use, and **when** you started it" at={P5 + 10} out={P6 - 12} top={ROWS_CAP_TOP - OPEN_UP * (1 - open5)} />

      {/* ── 6 · the analysing screen, as /check/analyzing draws it ── */}
      {f >= AN0 && f < AN0 + AN && <Analysing t={f - AN0} />}


      {/* ── 9 · the lockup, on its own ── */}
      {f >= P9 + 30 && (
        <>
          <div style={{ position: "absolute", left: LOCKUP.x, top: LOCKUP.y, width: MARK_W, height: LOCKUP_H, opacity: settle, filter: `blur(${(1 - settle) * 10}px)`, scale: 0.94 + 0.06 * settle }}>
            <LuxLogoMark p="nextm" light={light} lightOpacity={lightO} />
          </div>
          <div
            style={{
              position: "absolute",
              left: LOCKUP.x + MARK_W,
              top: LOCKUP.y,
              width: WORD_W,
              opacity: word,
              filter: `blur(${(1 - word) * 10}px)`,
              translate: `${(1 - word) * 0.2 * WORD_W}px 0`,
            }}
          >
            <LuxLogoWord p="nextw" light={light} lightOpacity={lightO} />
          </div>
          <div style={{ position: "absolute", left: 84, right: 84, top: LOCKUP.y + LOCKUP_H + 70 }}>
            <Headline text="When **less** than more is the answer" size={41} at={P9 + 96} />
          </div>
        </>
      )}

      {orb && orb.o > 0 && (
        <div style={{ position: "absolute", left: orb.x - orb.size / 2, top: orb.y - orb.size / 2, opacity: orb.o }}>
          <Orb size={orb.size} p="next6" thinking={orb.think ?? 0} />
        </div>
      )}
    </AbsoluteFill>
  );
};

/* the app's --ease-standard, and a transition as frames: delay d, duration n */
const STANDARD = Easing.bezier(0.2, 0, 0, 1);
const tw = (t: number, d: number, n: number) => interpolate(t, [d, d + n], [0, 1], { ...clamp, easing: STANDARD });

/** PROGRESS's symptom trend card at its own CSS size (616 × 344), from the
    live app: the deep tier, white ink, three bands, the date axis. `t` runs
    the app's entrance: bands sweep in from the left 60 ms apart with their
    labels, the day labels arrive left to right 25 ms apart from 300 ms. */
const TrendCard: React.FC<{ t: number }> = ({ t }) => {
  const white = "#fff";
  const dates = ["19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "1", "2"];
  return (
    <div
      style={{
        position: "relative",
        width: TC.w,
        height: TC.h,
        borderRadius: 28,
        /* the app's --gradient-routine (tokens.css) */
        background: `linear-gradient(#0000000d, #0000000d), radial-gradient(45% 45% at 100% 100%, #00303c3d, #0000 70%), radial-gradient(60% 55% at 0 0, #d0b4b81f, #a0353500 70%), radial-gradient(110% 90% at 0 35%, #567e88, #0000 60%), radial-gradient(90% 80% at 90% 105%, #60a8ba52, #0000 65%), radial-gradient(70% 60% at 80% -10%, #37617547, #0000 70%), ${C.routine}`,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25), 0 30px 60px -30px rgba(30,60,66,0.55)",
        fontFamily: FIGTREE,
        color: white,
      }}
    >
      <div style={{ position: "absolute", left: 24, top: 22, fontSize: 14.4, ...overline, fontWeight: 600, lineHeight: "14.4px" }}>Progress</div>
      <div style={{ position: "absolute", right: 24, top: 18, height: 23, padding: "0 12px", borderRadius: 11.5, border: "1px solid rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.12)", fontSize: 12, fontWeight: 500, lineHeight: "20px", boxSizing: "border-box", display: "flex", alignItems: "center" }}>{VALS.length} check-ins</div>
      {[
        ["Severe", 110],
        ["Moderate", 154],
        ["Mild", 198],
      ].map(([label, y], i) => (
        <div key={label} style={{ position: "absolute", left: 24, top: (y as number) - 11, fontSize: 12, fontWeight: 500, lineHeight: "22px", opacity: 0.9 * tw(t, i * 1.8, 9.6), translate: `${-6 * (1 - tw(t, i * 1.8, 9.6))}px 0` }}>{label}</div>
      ))}
      <div style={{ position: "absolute", left: 88, top: 88, width: 498, height: 132, borderRadius: 8, overflow: "hidden" }}>
        {[0.07, 0.163, 0.07].map((a, i) => (
          <div key={i} style={{ position: "absolute", left: 0, right: 0, top: i * 44, height: 44, background: `rgba(255,255,255,${a})`, transformOrigin: "left center", scale: `${tw(t, i * 1.8, 14.4)} 1`, opacity: tw(t, i * 1.8, 14.4) }} />
        ))}
      </div>
      <div style={{ position: "absolute", left: 24, top: 236, fontSize: 12, fontWeight: 500, lineHeight: "16.8px", opacity: 0.9 * tw(t, 9, 9.6), translate: `0 ${4 * (1 - tw(t, 9, 9.6))}px` }}>Sep–Oct</div>
      {dates.map((d, k) => (
        <div key={k} style={{ position: "absolute", left: colX(k) - 15, width: 30, top: 236, textAlign: "center", fontSize: 12, lineHeight: "16.8px", fontWeight: k === 13 ? 600 : 500, opacity: (k === 13 ? 1 : 0.9) * tw(t, 9 + k * 0.75, 9.6), translate: `0 ${4 * (1 - tw(t, 9 + k * 0.75, 9.6))}px` }}>{d}</div>
      ))}
    </div>
  );
};

/* ── 6 · the results page ─────────────────────────────────────────────────
   Rebuilt from the live Analysis results (asked for 3 Oct 2026: "elaborate
   to this page, add motions"). The panel is laid out in the reference
   screenshot's own px and drawn at K6; the compatibility cards at 2×.
   ⚠️ Every brand here is made up (Clearwell, Lumen Lab, Serave): the app's
   demo data names real ones. */
/* the panel is the app's NextStepsCard at phone width (342 × 1003 at 390),
   drawn at the product rows' scale so it is their width; the page scrolls
   through it under the caption, as it would on the phone */
const K6 = K5;
const NW = 342;
const NPOS = { x: W / 2 - (NW * K6) / 2, y: 180 };
/* two scrolls: step 1's top (303) up to 205, then step 2's (546) up to 195 */
const NSCROLL1 = NPOS.y + 303 * K6 - 205;
const NSCROLL2 = NPOS.y + 546 * K6 - 195;
const TRAVEL = 860;
/* the app's feedback/error, /warning and /success */
const AVOID = "#82302B";
const RISKY = "#C24E47";
const COMPATIBLE = "#5F8A6E";
const ee = (t: number, a: number, b: number, easing = EASE_OUT) => interpolate(t, [a, b], [0, 1], { ...clamp, easing });

const ProductTile: React.FC<{ photo: string; size: number; style?: React.CSSProperties }> = ({ photo, size, style }) => (
  <div
    style={{
      position: "absolute",
      width: size,
      height: size,
      borderRadius: size * 0.22,
      background: "rgba(255,255,255,0.6)",
      border: `1px solid ${C.glassEdge}`,
      boxShadow: "0 10px 20px -12px rgba(44,69,70,0.35)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      ...style,
    }}
  >
    <Img src={staticFile(`products/${photo}.webp`)} style={{ height: size * 0.74, maxWidth: size * 0.74, width: "auto", objectFit: "contain" }} />
  </div>
);

/** text that fades up 12 px as it arrives */
const Up: React.FC<{ k: number; style: React.CSSProperties; children: React.ReactNode }> = ({ k, style, children }) => (
  <div style={{ position: "absolute", opacity: k, translate: `0 ${(1 - k) * 12}px`, ...style }}>{children}</div>
);

const ScoreCard: React.FC<{ score: number; name: string; brand?: string; band: string; color: string; photo: string; ring: number; bandK: number }> = ({ score, name, brand, band, color, photo, ring, bandK }) => {
  const R = 52;
  const CIRC = 2 * Math.PI * R;
  return (
    <div
      style={{
        width: 188 * 2,
        height: 201 * 2,
        boxSizing: "border-box",
        padding: 32,
        borderRadius: 48,
        background: C.card,
        boxShadow: cardShadow(2, "0 40px 70px -34px rgba(44, 69, 70, 0.4)"),
        fontFamily: FIGTREE,
        color: C.ink,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* the ring and the product's picture side by side, as the app's score
          card draws them since 5 Oct 2026 (ring 64, thumb 48, 12 apart, ×2) */}
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      <div style={{ position: "relative", width: 128, height: 128 }}>
        <svg width={128} height={128} viewBox="0 0 128 128" style={{ position: "absolute", inset: 0 }}>
          <circle cx={64} cy={64} r={R} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={9} />
          <circle cx={64} cy={64} r={R} fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" strokeDasharray={`${CIRC * (score / 100) * ring} ${CIRC}`} transform="rotate(-90 64 64)" />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: 300, fontVariantNumeric: "tabular-nums" }}>
          {Math.round(score * ring)}
        </div>
      </div>
      <div style={{ position: "relative", width: 96, height: 96 }}>
        <ProductTile photo={photo} size={96} style={{ left: 0, top: 0 }} />
      </div>
      </div>
      <div style={{ fontSize: 32, fontWeight: 500, lineHeight: 1.2, marginTop: 24 }}>{name}</div>
      {brand && <div style={{ fontSize: 24, fontWeight: 500, lineHeight: 1.4, marginTop: 4, color: C.inkMuted }}>{brand}</div>}
      <div
        style={{
          marginTop: "auto",
          alignSelf: "flex-start",
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          height: 48,
          padding: "0 20px",
          borderRadius: 24,
          fontSize: 24,
          fontWeight: 500,
          background: C.glassStrong,
          border: `1.5px solid ${C.glassEdge}`,
          opacity: bandK,
          translate: `0 ${(1 - bandK) * 10}px`,
        }}
      >
        <span style={{ width: 16, height: 16, borderRadius: 8, background: color }} />
        {band}
      </div>
    </div>
  );
};

const CARDS = [
  /* made up brands, like Serave (asked for 3 Oct 2026) */
  { score: 45, name: "BHA Exfoliant", brand: "Clearwell", band: "Avoid", color: AVOID, photo: "bottle-milky" },
  { score: 62, name: "Retinol B3 Serum", brand: "Lumen Lab", band: "Risky", color: RISKY, photo: "dropper-green" },
  { score: 71, name: "Foaming Cleanser", brand: "Serave", band: "Risky", color: RISKY, photo: "bottle-brown" },
  { score: 94, name: "Niacinamide 10% + Zinc 1%", brand: "Aldermere", band: "Compatible", color: COMPATIBLE, photo: "pump-milky" },
  { score: 98, name: "Moisturizing Cream", brand: "Serave", band: "Compatible", color: COMPATIBLE, photo: "jar-olive" },
];
/* all five on one line: the 400 card drawn at CARD_K */
const CARD_K = 0.82;
const CARD_W = 188 * 2 * CARD_K;
const CARD_GAP = 18;
const CARDS_X = W / 2 - (5 * CARD_W + 4 * CARD_GAP) / 2;
/* the caption and the cards as one block centred on the frame (4 Oct 2026,
   asked for: the caption sat at the top with the cards well below it) */
const COMPAT_CAP_TOP = 255;
const COMPAT_Y = COMPAT_CAP_TOP + 175;

/** text that fades up 12 px as it arrives, in the flow */
const UpIn: React.FC<{ k: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ k, style, children }) => (
  <div style={{ position: "relative", opacity: k, translate: `0 ${(1 - k) * 12}px`, ...style }}>{children}</div>
);

/** one step of NextStepsCard at phone width (ResultCards.module.css): a tile
    of its own (padding 16, radius 24), the number in a 24 disc, then a 226
    column of the title (balanced, as .t-h6), an optional pair of 40 thumbs and
    the reason (pretty, as .t-body2), 8 apart */
const Step: React.FC<{
  n: number;
  k: number;
  titleK: number;
  textK: number;
  title: string;
  text: string;
  pair?: { a: string; b: string; k: number; slide: number; plus: number };
}> = ({ n, k, titleK, textK, title, text, pair }) => (
  <div style={{ position: "relative", padding: "16px 16px 16px 52px", borderRadius: 24, background: C.card, boxShadow: cardShadow(1, "none"), opacity: k, translate: `0 ${(1 - k) * 10}px` }}>
    <div style={{ position: "absolute", left: 16, top: 17, width: 24, height: 24, borderRadius: 12, background: C.primary, color: "#fff", fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center" }}>{n}</div>
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: 226 }}>
      <UpIn k={titleK} style={{ fontSize: 16, fontWeight: 500, lineHeight: "19.2px", textWrap: "balance" }}>{title}</UpIn>
      {pair && (
        <div style={{ position: "relative", height: 40 }}>
          <ProductTile photo={pair.a} size={40} style={{ left: -13 * (1 - pair.slide), top: 0, borderRadius: 8, opacity: pair.k }} />
          <div style={{ position: "absolute", left: 48, top: 10, width: 9, height: 20, fontSize: 14, fontWeight: 600, lineHeight: "20px", textAlign: "center", opacity: pair.plus }}>+</div>
          <ProductTile photo={pair.b} size={40} style={{ left: 65 + 13 * (1 - pair.slide), top: 0, borderRadius: 8, opacity: pair.k }} />
        </div>
      )}
      <UpIn k={textK} style={{ fontSize: 16, fontWeight: 500, lineHeight: "22.4px", textWrap: "pretty" }}>{text}</UpIn>
    </div>
  </div>
);

const ResultsPage: React.FC<{ t: number; out: number }> = ({ t, out }) => {
  /* the page scrolls: the scores leave upward as the advice comes up under them */
  const travel = ee(t, 146, 196, EASE_IN_OUT);
  const ty = -TRAVEL * travel;
  /* everything on the advice card runs from n */
  const n = t - NEXT_AT;
  const panelIn = ee(t, 150, 186);
  /* each step's two tiles slide together round the + */
  const border = ee(n, 18, 52, EASE_IN_OUT);
  const pill = ee(n, 44, 58);
  return (
    <AbsoluteFill style={{ opacity: 1 - out, fontFamily: FIGTREE }}>
      {/* compatibility first: the cards rise and their rings draw */}
      {t < 200 && (
        <div style={{ position: "absolute", inset: 0, translate: `0 ${ty}px`, opacity: 1 - ee(t, 150, 190, (x) => x) }}>
          <Up k={ee(t, 8, 26)} style={{ left: CARDS_X, top: COMPAT_Y, fontSize: 14.4 * 2 * CARD_K, ...overline, color: C.ink }}>
            COMPATIBILITY · 5 PRODUCTS
          </Up>
          {CARDS.map((c, i) => {
            const k = ee(t, 14 + i * 6, 40 + i * 6);
            return (
              <div
                key={c.name}
                style={{
                  position: "absolute",
                  left: CARDS_X + i * (CARD_W + CARD_GAP),
                  top: COMPAT_Y + 66 + (1 - k) * 40,
                  transformOrigin: "0 0",
                  scale: CARD_K,
                  opacity: k,
                }}
              >
                <ScoreCard {...c} ring={ee(t, 28 + i * 8, 76 + i * 8)} bandK={ee(t, 72 + i * 8, 86 + i * 8)} />
              </div>
            );
          })}
        </div>
      )}

      {/* what to do next, coming up from under the scores: the app's
          NextStepsCard at phone width, in its own CSS px, drawn at K6. Once
          step 1 has been read the page scrolls on, under the caption. */}
      <div style={{ position: "absolute", inset: 0, maskImage: "linear-gradient(to bottom, transparent 130px, #000 175px)", WebkitMaskImage: "linear-gradient(to bottom, transparent 130px, #000 175px)" }}>
      <div
        style={{
          position: "absolute",
          left: NPOS.x,
          top: NPOS.y + TRAVEL + ty - NSCROLL1 * ee(n, 70, 98, EASE_IN_OUT) - (NSCROLL2 - NSCROLL1) * ee(n, 150, 180, EASE_IN_OUT),
          width: NW,
          transformOrigin: "0 0",
          scale: K6,
          opacity: panelIn,
          boxSizing: "border-box",
          padding: 24,
          borderRadius: 28,
          background: C.card,
          boxShadow: cardShadow(1, "0 40px 70px -34px rgba(44, 69, 70, 0.4)"),
          color: C.ink,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <UpIn k={ee(n, 12, 28)} style={{ fontSize: 14.4, ...overline, lineHeight: "10.4px", height: 10.4 }}>What to do next</UpIn>

        {/* the pause: its outline draws itself, then the reason */}
        <div style={{ position: "relative", marginTop: 16, padding: 20, borderRadius: 24, background: `rgba(255,255,255,${0.4 * border})`, boxShadow: `inset 0 1px 0 rgba(255,255,255,${0.8 * border})` }}>
          <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            <rect x={1} y={1} width={292} height="calc(100% - 2px)" rx={23} fill="none" stroke={AVOID} strokeWidth={2} pathLength={1} strokeDasharray={`${border} 1`} />
          </svg>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ position: "relative", width: 48, height: 48, alignSelf: "center", flex: "none" }}>
              <ProductTile photo="bottle-milky" size={48} style={{ left: 0, top: 0, borderRadius: 12, opacity: ee(n, 28, 44), scale: 0.85 + 0.15 * ee(n, 28, 44) }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, width: 194 }}>
              <div style={{ height: 26, padding: "0 12px", borderRadius: 13, background: AVOID, color: "#fff", fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", opacity: pill, scale: 0.8 + 0.2 * pill }}>
                Avoid
              </div>
              <UpIn k={ee(n, 32, 48)} style={{ fontSize: 16, fontWeight: 500, lineHeight: "19.2px", textWrap: "balance" }}>Pause Clearwell BHA Exfoliant</UpIn>
            </div>
          </div>
          <UpIn k={ee(n, 48, 66)} style={{ marginTop: 12, fontSize: 16, fontWeight: 500, lineHeight: "22.4px", textWrap: "pretty" }}>
            It contains Salicylic Acid (BHA), the biggest problem for your skin profile in this set. Leave it out for two weeks and see whether the flare settles.
          </UpIn>
        </div>

        {/* the three steps, each its own tile */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
          <Step n={1} k={ee(n, 88, 100)} titleK={ee(n, 92, 108)} textK={ee(n, 112, 128)} pair={{ a: "dropper-green", b: "pump-milky", k: ee(n, 98, 110), slide: ee(n, 98, 122, EASE_IN_OUT), plus: ee(n, 114, 124) }}
            title="Keep Retinol B3 Serum and Niacinamide 10% + Zinc 1% on alternate nights"
            text="Retinol and Niacinamide irritate in the same routine. One tonight, the other tomorrow." />
          <Step n={2} k={ee(n, 168, 180)} titleK={ee(n, 172, 186)} textK={ee(n, 188, 202)} pair={{ a: "bottle-milky", b: "dropper-green", k: ee(n, 176, 188), slide: ee(n, 176, 196, EASE_IN_OUT), plus: ee(n, 190, 198) }}
            title="Keep BHA Exfoliant and Retinol B3 Serum on alternate nights"
            text="Salicylic Acid 2% and Retinol irritate in the same routine, so this pair settles itself while BHA Exfoliant is out, and matters again the day it comes back." />
          <Step n={3} k={ee(n, 200, 212)} titleK={ee(n, 204, 216)} textK={ee(n, 210, 224)}
            title="Bring anything back one product at a time"
            text="Two at once and a reaction cannot be traced to either of them." />
        </div>
      </div>
      </div>
    </AbsoluteFill>
  );
};

/* ── 6 · the analysing screen ─────────────────────────────────────────────
   CHECK's `/check/analyzing` (CheckAnalyzing + PassList): the orb thinking,
   "LUX is analysing…", and the five passes ticking one by one (the app's
   CHECK_PASSES, verbatim). The app runs a pass every 380 ms; here every 18
   frames so each line can be read. The description line under the list is
   left off: its ingredient count is computed from a live basket. */
/* below the caption, which holds on beat 5's line */
const AN_ORB = { x: W / 2, y: 410, size: 190 };
const AN_PASSES = [
  "Reading the ingredients in each product",
  "Scoring each one against your skin profile",
  "Flagging ingredients that commonly irritate",
  "Checking for pairs that clash in one routine",
  "Working out what to change in your routine",
];
const AN_STEP = 18;

const Analysing: React.FC<{ t: number }> = ({ t }) => {
  const inn = interpolate(t, [24, 42], [0, 1], { ...clamp, easing: EASE_OUT });
  const out = interpolate(t, [AN - 26, AN - 6], [0, 1], clamp);
  const done = Math.floor((t - 44) / AN_STEP);
  return (
    <AbsoluteFill style={{ opacity: inn * (1 - out), fontFamily: FIGTREE }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 548, textAlign: "center", fontFamily: MANROPE, fontSize: 41.3, fontWeight: 500, color: C.ink, translate: `0 ${(1 - inn) * 12}px` }}>
        LUX is analysing…
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 648, display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {AN_PASSES.map((line, i) => {
            const state = i < done ? "done" : i === Math.max(done, 0) ? "active" : "waiting";
            /* each change eases over the app's `base` 200 ms (6 frames) */
            const since = t - 44 - (state === "done" ? (i + 1) * AN_STEP : i * AN_STEP);
            const k = interpolate(since, [0, 6], [0, 1], clamp);
            const tick = state === "done" ? interpolate(since, [0, 8], [0, 1], { ...clamp, easing: EASE_OUT }) : 0;
            const opacity = state === "waiting" ? 0.45 : state === "active" ? 0.45 + 0.55 * k : 1;
            const color = state === "done" ? C.inkSecondary : state === "active" ? C.ink : C.inkMuted;
            return (
              <div key={line} style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 30, fontWeight: 500, lineHeight: "40px", color, opacity }}>
                <svg width={32} height={32} viewBox="0 0 28 28" style={{ flex: "none", opacity: tick > 0 ? 1 : 0 }}>
                  <path d="M5 13L10 18L20 6" fill="none" stroke={C.primary} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${tick} 1`} />
                </svg>
                {line}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** the app's frosted photo pill (PhotoGallery .date / .day): t-label-sm in
    white on an 18% frost, blurred and darkened behind, an all-round edge ring */
const PhotoPill: React.FC<{ style: React.CSSProperties; children: React.ReactNode }> = ({ style, children }) => (
  <div
    style={{
      position: "absolute",
      padding: "2px 8px",
      borderRadius: 999,
      background: "rgba(244, 254, 255, 0.05)",
      backdropFilter: "blur(8px) saturate(1.4) brightness(0.8)",
      WebkitBackdropFilter: "blur(8px) saturate(1.4) brightness(0.8)",
      boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.45), inset 0 2px 12px rgba(255, 255, 255, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.25)",
      color: "#fff",
      fontSize: 12,
      fontWeight: 500,
      lineHeight: 1.4,
      textShadow: "0 1px 2px rgba(0, 0, 0, 0.25)",
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

/** PROGRESS's "Progress gallery" card (ProgressScreen's galleryDesktop) at
    its own CSS size, 616 wide: overline, count, four square photos and the
    chevron. The four are ONE Unsplash photo's cheek (free licence, photo
    1730288951113-9cc087c14b83) with its redness graded down in steps. Each
    carries the app's two frosted photo pills (PhotoGallery's .date and .day):
    the date top-left, the day count bottom-right. */
const GalleryCard: React.FC<{ t: number }> = ({ t }) => {
  const DAYS = [
    { date: "Sep 17", day: "Day 1" },
    { date: "Sep 21", day: "Day 5" },
    { date: "Sep 26", day: "Day 10" },
    { date: "Sep 30", day: "Day 14" },
  ];
  return (
    <div
      style={{
        position: "relative",
        width: TC.w,
        height: 211,
        borderRadius: 28,
        background: "rgba(214, 232, 236, 0.82)",
        boxShadow: cardShadow(1, "0 30px 60px -30px rgba(44, 69, 70, 0.4)"),
        fontFamily: FIGTREE,
        color: C.ink,
      }}
    >
      <div style={{ position: "absolute", left: 24, top: 24, fontSize: 14.4, ...overline, lineHeight: "14.4px" }}>Progress gallery</div>
      <div style={{ position: "absolute", right: 24, top: 24, fontSize: 12, fontWeight: 500, lineHeight: "16.8px" }}>{VALS.length} photos</div>
      {DAYS.map((d, i) => {
        const k = tw(t, i * 7, 14);
        return (
          <div
            key={d.day}
            style={{
              position: "absolute",
              left: 24 + i * 134,
              top: 62,
              width: 120,
              height: 120,
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.5)",
              opacity: k,
              translate: `0 ${(1 - k) * 8}px`,
            }}
          >
            <Img src={staticFile(`app/gallery/stage${i}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <PhotoPill style={{ left: 8, top: 8 }}>{d.date}</PhotoPill>
            <PhotoPill style={{ right: 8, bottom: 8 }}>{d.day}</PhotoPill>
          </div>
        );
      })}
      {/* the strip's "more" button: an 11 chevron centred in a 33 target */}
      <div style={{ position: "absolute", left: TC.w - 24 - 33, top: 105, width: 33, height: 33, opacity: tw(t, 28, 10), display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={11} height={11} viewBox="0 0 12 12">
          <path d="M4 1.5L8.5 6 4 10.5" fill="none" stroke={C.ink} strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
};
