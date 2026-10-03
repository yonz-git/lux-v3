import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { LivingCanvas } from "./components/LivingCanvas";
import { Brand, BRAND_LEN } from "./scenes/Brand";
import { Close, CLOSE_LEN } from "./scenes/Close";
import { Hook } from "./scenes/Hook";
import { WALK_END, Walkthrough } from "./scenes/Walkthrough";
import { clamp } from "./theme";

/* the running order, in film frames */
export const T = {
  hook: 0,
  brand: 150,
  walk: 150 + BRAND_LEN - 14,
  close: 150 + BRAND_LEN - 14 + WALK_END,
};
export const DURATION = T.close + CLOSE_LEN;

/* the canvas runs on its own clock; these must match LivingCanvas's defaults */
const CANVAS_START = 11;

/**
 * LUX — intro and walkthrough, 1:1, for the case study and the feed.
 * Brief: lux-v3/.forge/briefs/intro-video.md (FINAL — B revised, round 2).
 * The app's own living canvas runs underneath everything, unbroken; over the
 * last 24 frames a second canvas holding frame 0's field fades in over it, so
 * the loop has no seam.
 */
export const LuxIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const seam = interpolate(frame, [DURATION - 26, DURATION - 2], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <LivingCanvas />
      {seam > 0 && (
        <AbsoluteFill style={{ opacity: seam }}>
          <LivingCanvas start={CANVAS_START} speed={0} />
        </AbsoluteFill>
      )}
      <Sequence from={T.hook} durationInFrames={T.brand + 20} name="Hook">
        <Hook />
      </Sequence>
      <Sequence from={T.brand} durationInFrames={BRAND_LEN + 10} name="Brand">
        <Brand />
      </Sequence>
      <Sequence from={T.walk} durationInFrames={WALK_END} name="Walkthrough">
        <Walkthrough />
      </Sequence>
      <Sequence from={T.close} durationInFrames={CLOSE_LEN} name="Close">
        <Close />
      </Sequence>
    </AbsoluteFill>
  );
};
