import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Orb } from "../components/Orb";
import { Phone, SCREEN_W } from "../components/Phone";
import { Headline } from "../components/Type";
import { Pulse } from "../scenes/Walkthrough";
import { C, clamp, EASE_IN_OUT, EASE_OUT } from "../theme";
import REC from "../faceRec.json";

/**
 * Next version, beats 3–4: INVESTIGATE → MAP IT.
 * Brief: lux-v3/.forge/briefs/intro-video-next.md. Every frame here is a film
 * frame (no Sequence offset), so it reads straight against LuxNext's timeline.
 *
 * 3 · The orb answers the question; your five go into the phone as it rises;
 *     the orb dives into the face card, and the face's own entrance plays.
 *     Then the camera pushes THROUGH the screen: the phone scales past the
 *     frame and fades while the face card (the same recorded pixels, as its
 *     own layer) lands as the hero, at ≤1.9× so it stays sharp.
 * 4 · The step-1 interaction, recorded from the live app, plays as the hero:
 *     the face card with the symptom chips and the Save / Reset / Reset all
 *     bar UNDER it, exactly as the app lays them out (they sat in a column
 *     beside the face until 2 Oct 2026; the app never drew that). The skin
 *     profile that followed, and the chips flying into it, were cut 3 Oct
 *     2026 (asked for); beat 5 follows the face directly.
 */

const W = 1920;
const e = (f: number, a: number, b: number, from = 0, to = 1, easing = EASE_IN_OUT) =>
  interpolate(f, [a, b], [from, to], { ...clamp, easing });
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ── the timeline, film frames ─────────────────────────────────────────── */
export const HANDOFF = 340; /* TooMuch unmounts; the row is ours from here */
const ORB_IN = 350;
const LINE_IN = 366;
const LINE_OUT = 404;
const RISE = [416, 464] as const;
const DIVE = [416, 462] as const;
const REC_START = 456; /* the face's own entrance, as the orb lands in it */
const PUSH = [494, 548] as const;
const MAP_CAP = 548;
const T0 = 560; /* the first recorded tap */
const HOLD = 6;
/* the interaction plays 2× its recorded speed: the same taps, less waiting.
   Since 3 Oct 2026 it is the longer take (asked for: two symptoms whose
   places overlap, so more lines show): Redness on both cheeks, forehead and
   nose; Itching on both cheeks, forehead and chin. */
const SPEED = 2;

/* ── the recording: one recorded frame per film frame, with a short hold
   before each tap for the fingertip to arrive ── */
const EVENTS = REC.events.filter((ev) => ev.label !== "entrance");
const taps = EVENTS.map((ev, i) => ({ ...ev, w: Math.round(T0 + (ev.frame - EVENTS[0].frame) / SPEED + HOLD * i) }));
const recAt = (f: number) => {
  if (f < REC_START) return 0;
  if (f < REC_START + EVENTS[0].frame) return f - REC_START;
  for (let i = taps.length - 1; i >= 0; i--) {
    if (f >= taps[i].w) return Math.min(taps[i].frame + Math.round((f - taps[i].w) * SPEED), (taps[i + 1]?.frame ?? REC.frames) - 1);
  }
  return EVENTS[0].frame - 1;
};
/* the face leaves once the last callout has drawn (the take holds after it) */
const PROFILE = taps[taps.length - 1].w + Math.round((REC.frames - 1 - taps[taps.length - 1].frame) / SPEED) + 6;
/* beat 5 starts here (Story2), as the face leaves */
export const P5 = PROFILE + 20;
export const STORY_END = P5 + 30;
const recSrc = (n: number) => `app/face/${String(n).padStart(3, "0")}.jpg`;

/* ── the phone and the push ── */
const PX = W / 2;
const PY = 98;
const PS = 1.02;
const SCREEN_LEFT = PX - (SCREEN_W * PS) / 2 - 1;
const SCREEN_TOP = PY + 11;
/* the hero region of the recording, in screen px: the face card and the chip
   rows. Inside the phone (A) and as the hero (B), 890 film px tall from a
   1196 px source, so never upscaled */
/* it stops under the chips: the Save / Reset / Reset all bar is cropped out
   (3 Oct 2026, asked for) so the face and chips get the room */
const REG = { x: 12, y: 70, w: 366, h: 598 };
const A = { x: SCREEN_LEFT + REG.x * PS, y: SCREEN_TOP + REG.y * PS, w: REG.w * PS };
const HERO_H = 890;
const HERO_W = HERO_H * (REG.w / REG.h);
const B = { x: W / 2 - HERO_W / 2, y: 160, w: HERO_W };
const FACE_MID = { x: SCREEN_LEFT + (REC.face.x + REC.face.w / 2) * PS, y: SCREEN_TOP + (REC.face.y + REC.face.h / 2) * PS };

/* a recorded rect (screen px) as a film rect on the hero */
const kH = HERO_W / REG.w;
const onHero = (r: { x: number; y: number; w: number; h: number }) => ({ x: B.x + (r.x - REG.x) * kH, y: B.y + (r.y - REG.y) * kH, w: r.w * kH, h: r.h * kH });

/* ── the skin profile step was cut 3 Oct 2026 (asked for: "we don't need to
   show the skin profile"); beat 5 follows the face directly ── */


/** a fingertip on a control: settles, presses (the app's 14% ink), lifts with a ring */
const Tap: React.FC<{ f: number; at: number; x: number; y: number; w: number; h: number }> = ({ f, at, x, y, w, h }) => {
  /* short, so two taps 12 frames apart never show two fingertips */
  const show = e(f, at - 6, at - 1, 0, 1, EASE_OUT) * (1 - e(f, at + 4, at + 9));
  if (show <= 0) return null;
  const press = e(f, at - 1, at + 2) * (1 - e(f, at + 4, at + 8));
  const D = 46;
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
          scale: 1.2 - 0.2 * e(f, at - 6, at - 1, 0, 1, EASE_OUT) - 0.12 * press,
        }}
      />
      <Pulse x={x + w / 2} y={y + h / 2} at={at + 1} r={30} f={f} />
    </>
  );
};

/**
 * One of your five, matched to the wall's lifted tile AS IT RENDERS: measured
 * at the hand-off, TooMuch's 42% tile composites like two stacked layers
 * (fill e7eff2 over b9d0d6 = 1 − 0.58², and a shadow twice as deep), so the
 * fill and both shadows are doubled here and the hand-off has no step.
 */
export const FiveTile: React.FC<{ photo: string; x: number; y: number; size: number; style?: React.CSSProperties }> = ({ photo, x, y, size, style }) => (
  <div
    style={{
      position: "absolute",
      left: x - size / 2,
      top: y - size / 2,
      width: size,
      height: size,
      borderRadius: size * 0.24,
      background: "rgba(255,255,255,0.664)",
      border: "1px solid rgba(255,255,255,0.7975)",
      boxShadow: `inset 0 1px 0 ${C.panelRim}, inset 0 1px 0 ${C.panelRim}, 0 28px 44px -20px rgba(44,69,70,0.38), 0 28px 44px -20px rgba(44,69,70,0.38)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      ...style,
    }}
  >
    {/* drawn twice, like the rest of it: the photo's soft edges stack too */}
    {[0, 1].map((n) => (
      <Img
        key={n}
        src={staticFile(`products/${photo}.webp`)}
        style={{ position: n ? "absolute" : undefined, height: size * 0.72, maxWidth: size * 0.72, width: "auto", objectFit: "contain" }}
      />
    ))}
  </div>
);

const Caption: React.FC<{ text: string; at: number; out?: number; top?: number }> = ({ text, at, out, top = 64 }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center" }}>
    <Headline text={text} size={59} at={at} out={out} lineHeight={1.1} />
  </div>
);

export const Story: React.FC = () => {
  const f = useCurrentFrame();
  if (f < Math.min(ORB_IN, HANDOFF)) return null;

  /* ── 3 · the orb answers; the five go into the phone ── */
  const grow = e(f, ORB_IN, ORB_IN + 28, 0, 1, EASE_OUT);
  const dive = e(f, DIVE[0], DIVE[1]);
  const orbX = lerp(W / 2, FACE_MID.x, dive);
  /* orb and line form one block, centred on the frame (orb 200, gap 40, line 65) */
  const orbY = lerp(488, FACE_MID.y, dive);
  const orbSize = 200 * lerp(1, 0.12, dive);
  const orbO = grow * (1 - e(f, DIVE[1] - 20, DIVE[1]));

  const rise = e(f, RISE[0], RISE[1], 1, 0, EASE_OUT);
  const push = e(f, PUSH[0], PUSH[1]);
  /* the hero rect: from the card's place in the phone to its own */
  const R = { x: lerp(A.x, B.x, push), y: lerp(A.y, B.y, push), w: lerp(A.w, B.w, push) };
  const Z = R.w / A.w;
  const phoneO = 1 - e(push, 0.35, 0.85, 0, 1, (t) => t);
  const rec = recAt(f);
  const k = R.w / REG.w;

  const faceLeave = e(f, PROFILE + 2, PROFILE + 26);

  /* ── the profile ── */

  return (
    <AbsoluteFill>
      {/* 3 — the line under the orb */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 628, display: "flex", justifyContent: "center" }}>
        <Headline text="LUX helps you **investigate**." size={59} at={LINE_IN} out={LINE_OUT} />
      </div>

      {/* the phone, and the push through its screen */}
      {phoneO > 0 && rise < 1 && (
        <AbsoluteFill
          style={{
            transformOrigin: `${A.x}px ${A.y}px`,
            transform: `translate(${R.x - A.x}px, ${R.y - A.y}px) scale(${Z})`,
            opacity: phoneO,
          }}
        >
          <Phone x={PX} y={PY + rise * 1020} scale={PS} screens={[{ src: recSrc(rec), height: 844, opacity: 1 }]} />
        </AbsoluteFill>
      )}

      {/* the orb, diving into the face card */}
      {orbO > 0 && (
        <div style={{ position: "absolute", left: orbX - orbSize / 2, top: orbY - orbSize / 2, opacity: orbO, scale: 0.55 + 0.45 * grow, filter: `blur(${(1 - grow) * 12}px)` }}>
          <Orb size={orbSize} p="next3" assembleAt={ORB_IN + 10} />
        </div>
      )}

      {/* 4 — the step, as the hero: the same recorded pixels as their own
          layer, the region's edges feathered into the canvas */}
      {f >= PUSH[0] && f < PROFILE + 30 && (
        <div
          style={{
            position: "absolute",
            left: R.x,
            top: R.y,
            width: R.w,
            height: R.w * (REG.h / REG.w),
            overflow: "hidden",
            opacity: 1 - faceLeave,
            translate: `0 ${-40 * faceLeave}px`,
            scale: 1 + 0.03 * faceLeave,
            maskImage: "linear-gradient(to right, transparent, black 3%, black 97%, transparent), linear-gradient(to bottom, transparent, black 2%, black 98%, transparent)",
            maskComposite: "intersect",
          }}
        >
          <Img src={staticFile(recSrc(rec))} style={{ position: "absolute", left: -REG.x * k, top: -REG.y * k, width: 390 * k, height: 844 * k }} />
        </div>
      )}

      <Caption text="Tap **where** it shows up." at={MAP_CAP} out={PROFILE - 10} />

      {/* the taps, on the recorded controls */}
      {f >= T0 - 10 && f < PROFILE && taps.filter((t) => t.label !== "save").map((t) => <Tap key={t.w} f={f} at={t.w} {...onHero(t.rect!)} />)}

    </AbsoluteFill>
  );
};
