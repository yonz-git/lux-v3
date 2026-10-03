import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Card, track, type Key } from "../components/Card";
import { EvidenceCard, ProfileCard, VerdictCard } from "../components/Panels";
import { Phone, SCREEN_W, type ScreenLayer } from "../components/Phone";
import { Headline } from "../components/Type";
import { C, clamp, EASE_IN_OUT, EASE_OUT, URBANIST } from "../theme";
import { useLayout } from "../layout";
import M from "../measure.json";
import SC from "../screens.json";
import REC from "../faceRec.json";
import LINE from "../trendline.json";
import { TILES } from "./Hook";

/* ── the beats, in frames from the walkthrough's start ─────────────────── */
export const MAP = 0;
export const PROFILE = 320;
export const PRODUCTS = 500;
export const ANALYSIS = 680;
export const TRACK = 1120;
export const WALK_END = 1400;
const BEATS = [MAP, PROFILE, PRODUCTS, ANALYSIS, TRACK, WALK_END];

/* ── the phone: placed by the format's layout (src/layout.ts) ──────────── */

const e = (f: number, from: number, to: number, a: number, b: number, easing = EASE_IN_OUT) =>
  interpolate(f, [from, to], [a, b], { ...clamp, easing });


/** a card leaving forward — up, a touch larger, dissolving — never back */
const leave = (f: number, at: number) => ({ o: e(f, at, at + 18, 1, 0), dy: e(f, at, at + 18, 0, -40), s: e(f, at, at + 18, 1, 1.03) });

/* ── caption block: kicker over headline, inside the 100px safe area ───── */
/* the caption: one headline, centred over the column it captions. (It had a
   tracked "DAY 1 · …" overline until the polish pass; the heading carries
   itself, and the day count was a label the viewer had to parse.) */
export const Caption: React.FC<{ text: string; at: number; out: number; top?: number }> = ({ text, at, out, top }) => {
  const { caption } = useLayout();
  return (
    <div style={{ position: "absolute", left: caption.left, width: caption.width, top: top ?? caption.top }}>
      <Headline text={text} size={59} at={at} out={out} align="center" lineHeight={1.1} />
    </div>
  );
};

export const Pulse: React.FC<{ x: number; y: number; at: number; r?: number; f: number }> = ({ x, y, at, r = 34, f }) => {
  const k = e(f, at, at + 24, 0, 1, EASE_OUT);
  if (k <= 0 || k >= 1) return null;
  const rr = r * (0.6 + 1.1 * k);
  return (
    <div
      style={{
        position: "absolute",
        left: x - rr,
        top: y - rr,
        width: rr * 2,
        height: rr * 2,
        borderRadius: "50%",
        border: `3px solid ${C.primary}`,
        opacity: (1 - k) * 0.7,
      }}
    />
  );
};

const circlesMask = (circles: { x: number; y: number; r: number; soft?: boolean }[], full: number) => {
  /* a pill's reveal is crisp; a callout's is feathered, so its growing disc
     reads as light spreading along the leader lines rather than a hard circle */
  const layers = circles
    .filter((c) => c.r > 0)
    .map((c) => `radial-gradient(circle at ${c.x}px ${c.y}px, #000 ${c.soft ? c.r * 0.55 : c.r}px, transparent ${c.soft ? c.r : c.r + 1.5}px)`);
  layers.push(`linear-gradient(rgba(0,0,0,${full}), rgba(0,0,0,${full}))`);
  const m = layers.join(", ");
  return { WebkitMaskImage: m, maskImage: m } as React.CSSProperties;
};

/** a vector card placed by a tracked rect: drawn at `natural` px wide, scaled */
const Placed: React.FC<{ rect: { x: number; y: number; w: number; o: number }; natural: number; children: React.ReactNode }> = ({
  rect,
  natural,
  children,
}) =>
  rect.o <= 0 ? null : (
    <div style={{ position: "absolute", left: rect.x, top: rect.y, width: natural, transformOrigin: "0 0", scale: rect.w / natural, opacity: rect.o }}>
      {children}
    </div>
  );

/* ── step 1, recorded from the live app (scratchpad rec.mjs): the face's own
   entrance, then Redness picked, its three places tapped, saved, and Itching
   on the chin. Each recorded frame is one 30fps frame of the app's own CSS
   motion, stepped; here they play 1:1, with a short hold before each tap for
   the fingertip to arrive. ── */
const REC_ENTRANCE_AT = 20;
const REC_W0 = 96; /* the first tap */
const REC_HOLD = 5;
const recTaps = REC.events
  .filter((ev) => ev.label !== "entrance")
  .map((ev, i, all) => ({ ...ev, w: REC_W0 + (ev.frame - all[0].frame) + REC_HOLD * i }));
export const REC_END = REC_W0 + (REC.frames - recTaps[0].frame) + REC_HOLD * recTaps.length;
const recFrameAt = (f: number) => {
  if (f < REC_ENTRANCE_AT) return 0;
  if (f < REC_ENTRANCE_AT + recTaps[0].frame) return f - REC_ENTRANCE_AT;
  for (let i = recTaps.length - 1; i >= 0; i--) {
    if (f >= recTaps[i].w) return Math.min(recTaps[i].frame + (f - recTaps[i].w), (recTaps[i + 1]?.frame ?? REC.frames) - 1);
  }
  return recTaps[0].frame - 1;
};
const recSrc = (n: number) => `app/face/${String(n).padStart(3, "0")}.jpg`;

/** a tap on a real control: the pressed overlay the app draws (14% ink), and
    a soft fingertip that settles, presses and lifts with a ring */
const Tap: React.FC<{ f: number; at: number; x: number; y: number; w: number; h: number; k: number }> = ({ f, at, x, y, w, h, k }) => {
  const show = e(f, at - 8, at - 2, 0, 1, EASE_OUT) * (1 - e(f, at + 6, at + 16, 0, 1));
  if (show <= 0) return null;
  const press = e(f, at - 1, at + 2, 0, 1) * (1 - e(f, at + 4, at + 8, 0, 1));
  const D = 44 * k;
  return (
    <>
      <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: h / 2, background: "rgba(46, 42, 63, 0.14)", opacity: press }} />
      <div
        style={{
          position: "absolute",
          left: x + w / 2 - D / 2,
          top: y + h / 2 - D / 2,
          width: D,
          height: D,
          borderRadius: "50%",
          background: "rgba(244, 254, 255, 0.55)",
          border: "1.5px solid rgba(49, 53, 96, 0.22)",
          boxShadow: "0 6px 16px -6px rgba(44, 69, 70, 0.45)",
          opacity: show,
          scale: 1.2 - 0.2 * e(f, at - 8, at - 2, 0, 1, EASE_OUT) - 0.12 * press,
        }}
      />
      <Pulse x={x + w / 2} y={y + h / 2} at={at + 1} r={30 * k} f={f} />
    </>
  );
};

/* ── the trend line: the live chart's plotted points, in the card's css px ── */
const PTS = Object.entries(LINE as Record<string, number>)
  .map(([x, y]) => [Number(x), y] as [number, number])
  .sort((a, b) => a[0] - b[0]);
const SEGS = PTS.slice(1).map((p, i) => Math.hypot(p[0] - PTS[i][0], p[1] - PTS[i][1]));
const LINE_LEN = SEGS.reduce((a, b) => a + b, 0);
/* a Catmull-Rom curve through the samples, as cubic beziers */
const LINE_D = PTS.map((p, i) => {
  if (i === 0) return `M${p[0]} ${p[1]}`;
  const p0 = PTS[i - 2] ?? PTS[i - 1];
  const p1 = PTS[i - 1];
  const p3 = PTS[i + 1] ?? p;
  const c1 = [p1[0] + (p[0] - p0[0]) / 6, p1[1] + (p[1] - p0[1]) / 6];
  const c2 = [p[0] - (p3[0] - p1[0]) / 6, p[1] - (p3[1] - p1[1]) / 6];
  return `C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${p[0]} ${p[1]}`;
}).join(" ");
/** the point `len` along the polyline */
const pointAt = (len: number): [number, number] => {
  let acc = 0;
  for (let i = 0; i < SEGS.length; i++) {
    if (acc + SEGS[i] >= len) {
      const t = (len - acc) / SEGS[i];
      return [PTS[i][0] + (PTS[i + 1][0] - PTS[i][0]) * t, PTS[i][1] + (PTS[i + 1][1] - PTS[i][1]) * t];
    }
    acc += SEGS[i];
  }
  return PTS[PTS.length - 1];
};
/* the record, drawn all the way to today */
const STOP_LEN = LINE_LEN;

export const Walkthrough: React.FC = () => {
  const f = useCurrentFrame();
  const { width: W } = useVideoConfig();
  const L = useLayout();
  const PX = L.phone.x;
  const PY = L.phone.y;
  const PS = L.phone.scale; /* css px → film px */
  /* where the capture's own top edge sits, inside the bezel (the captures
     carry the status-bar space themselves) */
  const SCREEN_TOP = PY + 12;
  const SCREEN_LEFT = PX - (SCREEN_W * PS) / 2;
  const inPhone = (r: { x: number; y: number; w: number }, scroll = 0) => ({
    x: SCREEN_LEFT + r.x * PS,
    y: SCREEN_TOP + (r.y - scroll) * PS,
    w: r.w * PS,
  });

  /* ── the camera: a slow push through each beat, eased back at the handover ── */
  const beat = Math.max(0, BEATS.findIndex((b, i) => f >= b && f < (BEATS[i + 1] ?? Infinity)));
  const b0 = BEATS[beat];
  const b1 = BEATS[beat + 1] ?? WALK_END;
  const push01 = interpolate(f, [b0 + 20, b1], [0, 1], clamp);
  const back = beat === 0 ? 0 : interpolate(f, [b0, b0 + 20], [1, 0], { ...clamp, easing: EASE_IN_OUT });
  const camera = 1 + 0.035 * Math.max(push01, back);

  /* ── phone ── */
  const rise = e(f, 6, 42, 1, 0, EASE_OUT);
  /* the square cut clears the phone for the analysis cards; the wide cut has
     room for both, so the phone stays through the analysis */
  /* the wide cut keeps the phone to the end, on the daily CHECK-IN (never on
     PROGRESS, whose live chart shows the finished improvement this film does
     not claim); the square cut has no room and clears it for the analysis */
  const sink = L.phoneToEnd ? e(f, WALK_END - 30, WALK_END - 4, 0, 1) : e(f, ANALYSIS + 40, ANALYSIS + 76, 0, 1);
  const phoneY = PY + rise * 820 + sink * 820;
  const phoneO = 1 - sink;

  const dim = L.phone.dimMax * Math.max(
    e(f, PROFILE + 40, PROFILE + 66, 0, 1) - e(f, PROFILE + 140, PROFILE + 158, 0, 1),
    e(f, PRODUCTS + 50, PRODUCTS + 76, 0, 1) - e(f, PRODUCTS + 140, PRODUCTS + 158, 0, 1),
    e(f, ANALYSIS + 24, ANALYSIS + 50, 0, 1) - e(f, TRACK - 48, TRACK - 28, 0, 1),
  );

  /* ── the app's own flow: scroll to the button, tap it, the next screen
     arrives with the app's reveal (a short fade-up), never a slide ── */
  const T_PROFILE = REC_END + 38; /* Continue on step 1 */
  const T_PRODUCTS = PRODUCTS + 2; /* Add your products, on the recap */
  const T_ANALYSIS = ANALYSIS + 2; /* Start analysis, on PRODUCTS */
  const T_CHECKIN = TRACK - 4; /* Start the observation, on the analysis */
  const arrive = (at: number) => ({ o: e(f, at, at + 12, 0, 1, EASE_OUT), dy: (1 - e(f, at, at + 16, 0, 1, EASE_OUT)) * 12 });
  const leaveScreen = (at: number) => 1 - e(f, at, at + 8, 0, 1);
  /* the recording, then the same finished state as a full page to scroll */
  const recEnded = e(f, REC_END, REC_END + 8, 0, 1);
  const startScroll = REC.scroll + e(f, REC_END + 4, REC_END + 28, 0, 565 - REC.scroll);
  const profileScroll = e(f, PROFILE + 150, PROFILE + 172, 0, 508);
  const productsScroll = e(f, PRODUCTS + 154, PRODUCTS + 172, 0, 100);
  const analysisScroll = e(f, TRACK - 40, TRACK - 16, 0, 678);
  const inProfile = arrive(T_PROFILE);
  const inProducts = arrive(T_PRODUCTS);
  const inAnalysis = arrive(T_ANALYSIS);
  const inCheckin = arrive(T_CHECKIN);

  const screens: ScreenLayer[] = [
    { src: recSrc(recFrameAt(f)), height: 844, opacity: 1 - recEnded },
    { src: "app/scr_start.png", height: 1313, opacity: recEnded * leaveScreen(T_PROFILE), scroll: startScroll },
    { src: "app/scr_profile.png", height: 1258, opacity: inProfile.o * leaveScreen(T_PRODUCTS), dy: inProfile.dy, scroll: profileScroll },
    { src: "app/scr_products.png", height: 878, opacity: inProducts.o * leaveScreen(T_ANALYSIS), dy: inProducts.dy, scroll: productsScroll },
    { src: "app/scr_analysis.png", height: 1488, opacity: inAnalysis.o * leaveScreen(T_CHECKIN), dy: inAnalysis.dy, scroll: analysisScroll },
    /* only the wide cut still has the phone here: the daily check-in, and a
       neutral answer tapped — "note what happens" */
    { src: "app/scr_checkin.png", height: 878, opacity: inCheckin.o, dy: inCheckin.dy },
    { src: "app/scr_checkin_sel.png", height: 878, opacity: e(f, TRACK + 104, TRACK + 112, 0, 1) },
  ];
  const navProducts = e(f, T_PRODUCTS, T_PRODUCTS + 8, 0, 1) - e(f, T_ANALYSIS, T_ANALYSIS + 8, 0, 1);
  const navProgress = e(f, T_CHECKIN, T_CHECKIN + 8, 0, 1);
  const nav = [
    { src: "app/nav_myskin.png", opacity: 1 - navProducts - navProgress },
    { src: "app/nav_products.png", opacity: navProducts },
    { src: "app/nav_progress.png", opacity: navProgress },
  ];
  /* the four taps: the button's rect in its screen, that screen's scroll then */
  const taps = [
    ...recTaps.map((t) => ({ at: t.w, r: t.rect!, scroll: 0 })),
    { at: T_PROFILE - 6, r: SC.scr_start.continue, scroll: 565 },
    { at: T_PRODUCTS - 6, r: SC.scr_profile.cta, scroll: 508 },
    { at: T_ANALYSIS - 6, r: SC.scr_products.cta, scroll: 100 },
    { at: T_CHECKIN - 6, r: SC.scr_analysis.cta, scroll: 678 },
    { at: TRACK + 100, r: SC.scr_checkin.same, scroll: 0 },
  ];

  /* ── each beat's caption and card as one centred block (WIDE), or the
     format's fixed places (SQUARE) ── */
  const stack = (capH: number, w: number, h: number, fixed: { x: number; y: number; w: number }, shift = 0) => {
    if (!L.stack) return { capTop: L.caption.top, rect: fixed };
    const top = L.stack.mid - (capH + L.stack.gap + h) / 2;
    return { capTop: top, rect: { x: L.stack.col - w / 2 + shift, y: top + capH + L.stack.gap, w } };
  };
  const LINE = 65; /* one caption line: 59px at 1.1 */
  const sMap = stack(LINE, L.face.w, L.face.w * (REC.face.h / REC.face.w), L.face);
  const sProfile = stack(LINE * 2, L.profile.w, 588 * (L.profile.w / 800), L.profile);
  const sProducts = stack(LINE * 2, L.buckets.w, L.buckets.w * (366 / 342), L.buckets, L.stack ? 75 : 0);
  const sVerdict = stack(LINE, 616, 414 * (616 / 880), L.verdict);
  const sEvidence = stack(LINE * 2, 912 * 0.7, 584 * 0.7, { x: L.evidence.left, y: L.evidence.top, w: 912 * 0.7 });
  const trackH = Math.max(L.cal.w * (382 / 342), L.trend.w * (328 / 342));
  const sTrack = stack(LINE * 2, L.trend.w, trackH, L.trend);
  const calRect = L.stack ? { x: L.stack.col - L.cal.w / 2, y: sTrack.rect.y + (trackH - L.cal.w * (382 / 342)) / 2, w: L.cal.w } : L.cal;
  const trendRect = L.stack ? { x: L.stack.col - L.trend.w / 2, y: sTrack.rect.y + (trackH - L.trend.w * (328 / 342)) / 2, w: L.trend.w } : L.trend;

  /* ── MAP ── */
  const faceHome = inPhone(REC.face);
  const face = track(f, [
    { f: 64, ...faceHome },
    { f: 92, ...sMap.rect },
  ] as Key[]);
  const faceLeave = leave(f, REC_END);
  const fk = face.w / 342;

  /* ── PROFILE: the summary card lifts out and fills, answer by answer ── */
  const profile = track(f, [
    { f: PROFILE + 40, ...inPhone(SC.scr_profile.card), o: 0 },
    { f: PROFILE + 48, ...inPhone(SC.scr_profile.card), o: 1 },
    { f: PROFILE + 74, ...sProfile.rect, o: 1 },
  ]);
  const profileLeave = leave(f, PROFILE + 140);

  /* ── PRODUCTS ── */
  const bucketsHome = inPhone(SC.scr_products.buckets);
  const buckets = track(f, [
    { f: PRODUCTS + 50, ...bucketsHome },
    { f: PRODUCTS + 78, ...sProducts.rect },
  ] as Key[]);
  const bucketsLeave = leave(f, PRODUCTS + 140);
  const bk = buckets.w / 342;
  const axisIn = e(f, PRODUCTS + 82, PRODUCTS + 112, 0, 1, EASE_OUT);
  const rowY = (i: number) => buckets.y + (M.buckets[i].y! + M.buckets[i].h / 2) * bk;
  const AXIS_X = L.stack ? sProducts.rect.x - 58 : L.axisX;

  /* ── ANALYSIS: the answer, then the two products it names, then the evidence ── */
  const VERDICT_AT = ANALYSIS + 30;
  /* it lifts out of the analysis screen's own BEST FIT card */
  const verdict = track(f, [
    { f: VERDICT_AT, ...inPhone(SC.scr_analysis.verdict), o: 0 },
    { f: VERDICT_AT + 8, ...inPhone(SC.scr_analysis.verdict), o: 1 },
    { f: VERDICT_AT + 34, ...sVerdict.rect, o: 1 },
  ]);
  const verdictLeave = leave(f, ANALYSIS + 200);
  /* the suspects: the hook's own tiles, flying into the verdict's two slots */
  /* the verdict card is drawn at 880 and shown at 616 — slot geometry scales with it */
  const VK = 616 / 880;
  const TS = 92 * VK;
  const SLOT_Y = sVerdict.rect.y + 48 * VK;
  const slots = [
    { tile: TILES[0], x: sVerdict.rect.x + (880 - 48 - 92 - 14 - 92) * VK, y: SLOT_Y },
    { tile: TILES[3], x: sVerdict.rect.x + (880 - 48 - 92) * VK, y: SLOT_Y },
  ];
  const fly = (i: number) => e(f, VERDICT_AT + 60 + i * 8, VERDICT_AT + 90 + i * 8, 0, 1, EASE_OUT);
  const EVIDENCE_AT = ANALYSIS + 208;

  /* ── TRACK: check in daily; the line draws as far as the record goes ── */
  const cal = track(f, [
    { f: TRACK + 14, ...calRect, y: calRect.y + 50, o: 0 },
    { f: TRACK + 40, ...calRect, o: 1 },
    { f: TRACK + 118, ...calRect, o: 1 },
    { f: TRACK + 140, ...calRect, y: calRect.y - 50, o: 0 },
  ]);
  const ck = cal.w / 342;
  /* every check-in, day by day */
  const discs = M.cal.filter((d) => d.t).map((d, i) => {
    const at = TRACK + 46 + i * 7;
    return { x: (d.x! + d.w / 2) * ck, y: (d.y! + d.h / 2) * ck, r: e(f, at, at + 9, 0, 24 * ck, EASE_OUT), at };
  });
  const trend = track(f, [
    { f: TRACK + 122, ...trendRect, y: trendRect.y + 70, o: 0 },
    { f: TRACK + 148, ...trendRect, o: 1 },
    { f: WALK_END - 26, ...trendRect, o: 1 },
    { f: WALK_END - 6, ...trendRect, y: trendRect.y - 40, o: 0 },
  ]);
  const tk = trend.w / 342;
  const drawn = e(f, TRACK + 152, TRACK + 228, 0, STOP_LEN, EASE_IN_OUT);
  const head = pointAt(drawn);
  const headOn = e(f, TRACK + 154, TRACK + 164, 0, 1);
  const breathe = 0.5 + 0.5 * Math.sin((f - TRACK) / 7);

  return (
    <AbsoluteFill>
      {/* captions — each out lands before the next kicker arrives */}
      <Caption text="Tap **where** it shows up." at={MAP + 12} out={PROFILE - 18} top={sMap.capTop} />
      <Caption text="Each answer goes into **your** skin profile." at={PROFILE + 4} out={PRODUCTS - 18} top={sProfile.capTop} />
      <Caption text="Add what you use, and **when** you started it." at={PRODUCTS + 4} out={ANALYSIS - 18} top={sProducts.capTop} />
      <Caption text="LUX points to **what to pause** first." at={ANALYSIS + 4} out={ANALYSIS + 190} top={sVerdict.capTop} />
      <Caption text="Along with what points **for** it, and **against** it." at={EVIDENCE_AT - 4} out={TRACK - 18} top={sEvidence.capTop} />
      <Caption text={"Pause one product,\nthen note **what happens**."} at={TRACK + 4} out={WALK_END - 16} top={sTrack.capTop} />

      <AbsoluteFill style={{ scale: camera, transformOrigin: L.cameraOrigin }}>
        {phoneO > 0 && <Phone x={PX} y={phoneY} scale={PS} screens={screens} nav={nav} dim={dim} opacity={phoneO} />}
        {/* the taps — a fingertip on the app's own button, its pressed state */}
        {phoneO > 0 &&
          taps.map((t) => (
            <Tap key={t.at} f={f} at={t.at} x={SCREEN_LEFT + t.r.x * PS} y={SCREEN_TOP + (t.r.y - t.scroll) * PS} w={t.r.w * PS} h={t.r.h * PS} k={PS} />
          ))}

        {/* MAP — the face card, lifted out of the phone, playing the same
            recorded frames magnified: it mirrors every tap on the phone */}
        {f >= 64 && f < REC_END + 20 && (
          <div style={{ position: "absolute", inset: 0, opacity: faceLeave.o, translate: `0 ${faceLeave.dy}px`, scale: faceLeave.s }}>
            <div
              style={{
                position: "absolute",
                left: face.x,
                top: face.y,
                width: face.w,
                height: face.w * (REC.face.h / REC.face.w),
                borderRadius: 32 * fk,
                overflow: "hidden",
                boxShadow: `0 ${10 + 30 * e(f, 64, 92, 0, 1)}px ${30 + 50 * e(f, 64, 92, 0, 1)}px -20px rgba(44, 69, 70, 0.38)`,
              }}
            >
              <Img
                src={staticFile(recSrc(recFrameAt(f)))}
                style={{ position: "absolute", left: -REC.face.x * fk, top: -REC.face.y * fk, width: 390 * fk, height: 844 * fk }}
              />
            </div>
          </div>
        )}

        {/* PROFILE */}
        {f >= PROFILE + 40 && f < PROFILE + 180 && (
          <div style={{ position: "absolute", inset: 0, opacity: profileLeave.o, translate: `0 ${profileLeave.dy}px`, scale: profileLeave.s }}>
            <Placed rect={profile} natural={800}>
              <ProfileCard at={PROFILE + 80} />
            </Placed>
          </div>
        )}

        {/* PRODUCTS */}
        {f >= PRODUCTS + 50 && f < PRODUCTS + 170 && (
          <div style={{ position: "absolute", inset: 0, opacity: bucketsLeave.o, translate: `0 ${bucketsLeave.dy}px`, scale: bucketsLeave.s }}>
            <Card src="app/buckets.png" rect={buckets} cssW={342} cssH={366} lift={e(f, PRODUCTS + 50, PRODUCTS + 78, 0, 1)} />
            <div
              style={{
                position: "absolute",
                left: AXIS_X - 1.5,
                top: rowY(0),
                width: 3,
                height: (rowY(2) - rowY(0)) * axisIn,
                borderRadius: 3,
                background: `linear-gradient(${C.primaryStart}, ${C.primary})`,
              }}
            />
            {[0, 1, 2].map((i) => {
              const k = e(f, PRODUCTS + 82 + i * 14, PRODUCTS + 96 + i * 14, 0, 1, EASE_OUT);
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: AXIS_X - 11,
                    top: rowY(i) - 11,
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: i === 2 ? C.primary : C.glassStrong,
                    border: `3px solid ${C.primary}`,
                    scale: k,
                    opacity: k,
                  }}
                />
              );
            })}
            {[
              { t: "then", y: rowY(0), at: PRODUCTS + 84, bold: false },
              { t: "now", y: rowY(2), at: PRODUCTS + 112, bold: true },
            ].map((l) => {
              const k = e(f, l.at, l.at + 16, 0, 1, EASE_OUT);
              return (
                <div
                  key={l.t}
                  style={{
                    position: "absolute",
                    right: W - AXIS_X + 26,
                    top: l.y - 19,
                    fontFamily: URBANIST,
                    fontSize: 31,
                    lineHeight: "38px",
                    fontWeight: l.bold ? 700 : 300,
                    color: l.bold ? C.primary : C.ink,
                    opacity: k,
                    translate: `${(1 - k) * 14}px 0`,
                  }}
                >
                  {l.t}
                </div>
              );
            })}
            {/* the two the analysis will name: one recent, one the new addition */}
            <Pulse x={buckets.x + buckets.w - 98 * bk} y={rowY(1)} at={PRODUCTS + 118} r={44} f={f} />
            <Pulse x={buckets.x + buckets.w - 98 * bk} y={rowY(2)} at={PRODUCTS + 126} r={44} f={f} />
          </div>
        )}

        {/* ANALYSIS — the verdict, and the two products flying into it */}
        {f >= VERDICT_AT && f < ANALYSIS + 220 && (
          <div style={{ position: "absolute", inset: 0, opacity: verdictLeave.o, translate: `0 ${verdictLeave.dy}px`, scale: verdictLeave.s }}>
            <Placed rect={verdict} natural={880}>
              <VerdictCard at={VERDICT_AT + 10} productsIn={0} />
            </Placed>
            {slots.map((s, i) => {
              const k = fly(i);
              if (k <= 0) return null;
              /* in along the card's own empty top row, from off frame right —
                 a straight path that crosses no words */
              const fromPhone = L.tilesFrom === "phone";
              const x0 = fromPhone ? PX - TS / 2 : W + 20 + i * 70;
              const y0 = fromPhone ? PY + 420 : s.y;
              const size = TS * (fromPhone ? 0.6 + 0.4 * k : 0.85 + 0.15 * k);
              const qx = x0 + (s.x - x0) * k;
              const qy = y0 + (s.y - y0) * k + (TS - size) / 2;
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: qx,
                    top: qy,
                    width: size,
                    height: size,
                    borderRadius: size * 0.26,
                    background: C.glass,
                    border: `1.5px solid ${C.glassEdge}`,
                    boxShadow: "0 24px 40px -22px rgba(44, 69, 70, 0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: Math.min(1, k * 2.5),
                  }}
                >
                  <Img src={staticFile(s.tile.src)} style={{ height: size * 0.76, maxWidth: size * 0.76, objectFit: "contain" }} />
                </div>
              );
            })}
          </div>
        )}

        {/* ANALYSIS — the evidence */}
        {f >= EVIDENCE_AT && f < TRACK - 4 && (
          <div
            style={{
              position: "absolute",
              left: sEvidence.rect.x,
              top: sEvidence.rect.y,
              transformOrigin: "0 0",
              scale: 0.7,
              opacity: e(f, EVIDENCE_AT, EVIDENCE_AT + 20, 0, 1) * e(f, TRACK - 26, TRACK - 6, 1, 0),
              translate: `0 ${e(f, EVIDENCE_AT, EVIDENCE_AT + 24, 50, 0, EASE_OUT) - e(f, TRACK - 26, TRACK - 6, 0, 40)}px`,
            }}
          >
            <EvidenceCard at={EVIDENCE_AT + 6} />
          </div>
        )}

        {/* TRACK — the calendar fills, then the trend draws as far as the record goes */}
        {f >= TRACK + 14 && cal.o > 0 && (
          <Card src="app/calendar_nodisc.png" rect={cal} cssW={342} cssH={382}>
            <Img src={staticFile("app/calendar.png")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", ...circlesMask(discs, 0) }} />
          </Card>
        )}
        {f >= TRACK + 122 && (
          <Card src="app/trend3_noline.png" rect={trend} cssW={342} cssH={328}>
            {/* the line, drawn as a path through the app's own plotted points
                (sampled from the live chart) so nothing but the line changes */}
            <svg
              width={trend.w}
              height={328 * tk}
              viewBox="0 0 342 328"
              style={{ position: "absolute", inset: 0, overflow: "visible" }}
            >
              <path
                d={LINE_D}
                pathLength={LINE_LEN}
                fill="none"
                stroke="#F4FEFF"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={`${drawn} ${LINE_LEN}`}
              />
            </svg>
            <div
              style={{
                position: "absolute",
                left: head[0] * tk - 10,
                top: head[1] * tk - 10,
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "#F4FEFF",
                boxShadow: `0 0 0 ${4 + 5 * breathe}px rgba(244,254,255,${0.35 - 0.2 * breathe})`,
                opacity: headOn,
              }}
            />
          </Card>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
