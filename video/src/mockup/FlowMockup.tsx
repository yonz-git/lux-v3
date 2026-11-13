import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { clamp, EASE_IN_OUT } from "../theme";
import { Tap } from "../v3/Story";
import { IPhone, SCREEN_W } from "./IPhone";
import { Backdrop } from "./Backdrop";
import map from "./rec/map.json";
import products from "./rec/products.json";
import analysis from "./rec/analysis.json";
import track from "./rec/track.json";
import subtraction from "./rec/subtraction.json";

/* A case-study loop: an iPhone on a soft-focus backdrop, playing a take of
   the real app recorded by scripts/rec-flow.mjs — every frame is the app's
   own render, the fingertips sit on the controls the take clicked. A take
   that ends somewhere else dips through the canvas over its last SEAM frames
   and comes up on frame 0, so it loops as a muted <video>; one that ends
   where it began just cuts. */

export type Flow = "map" | "products" | "analysis" | "track" | "subtraction";
type Take = { frames: number; taps: { frame: number; x: number; y: number; w: number; h: number }[] };
export const TAKES: Record<Flow, Take> = { map, products, analysis, track, subtraction };

export const MOCKUP_W = 1080;
export const MOCKUP_H = 1350;
const K = 1.25; // screen points → film px
const SEAM = 18;
const DIP: Record<Flow, boolean> = { map: true, products: false, analysis: false, track: true, subtraction: true };

const frameSrc = (flow: Flow, i: number) => staticFile(`mockups/${flow}/${String(i).padStart(3, "0")}.jpg`);

export const FlowMockup: React.FC<{ flow: Flow }> = ({ flow }) => {
  const f = useCurrentFrame();
  const take = TAKES[flow];
  const n = take.frames;
  const half = n - SEAM / 2;
  const dip = DIP[flow]
    ? interpolate(f, [n - SEAM, half, half + 1, n - 1], [0, 1, 1, 0], { ...clamp, easing: EASE_IN_OUT })
    : 0;
  const shown = DIP[flow] && f >= half ? 0 : Math.min(f, n - 1);
  const float = Math.sin((f / n) * Math.PI * 2) * 4;
  return (
    <AbsoluteFill>
      <Backdrop loop={n} />
      <IPhone x={MOCKUP_W / 2} y={MOCKUP_H / 2 + float} k={K}>
        <Img src={frameSrc(flow, shown)} style={{ position: "absolute", left: 0, top: 0, width: SCREEN_W * K }} />
        {dip > 0 && <div style={{ position: "absolute", inset: 0, background: "#d6e6ea", opacity: dip }} />}
        {take.taps.map((t) => (
          <Tap key={t.frame} f={f} at={t.frame} x={t.x * K} y={t.y * K} w={t.w * K} h={t.h * K} />
        ))}
        {/* the status bar's soft scrim, in the app's canvas — a scrolled page
            slides under it the way it does on a phone */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            right: 0,
            height: 64 * K,
            background: "linear-gradient(rgb(214, 230, 234) 0%, rgb(214, 230, 234) 66%, rgba(214, 230, 234, 0) 100%)",
          }}
        />
      </IPhone>
    </AbsoluteFill>
  );
};
