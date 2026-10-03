import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { LuxLogoMark, LuxLogoWord } from "../components/Logo";
import { Headline } from "../components/Type";
import { clamp, EASE_IN_OUT, EASE_OUT } from "../theme";

export const CLOSE_LEN = 192;

/* the master lockup is 538 wide: the mark's half is 209 of it, the word's 329 */
const LOCKUP_W = 440;
const MARK_W = LOCKUP_W * (209 / 538);
const WORD_W = LOCKUP_W * (329 / 538);
const LOCKUP_H = LOCKUP_W * (173 / 538);

/**
 * The close: the full logo, the symbol drifting in from its left and the
 * wordmark from its right as the app's own entrance does, with one pass of the
 * logo's light, then the line to leave behind. The last 12 frames are the bare
 * canvas, crossfading to frame 0's, so it loops.
 */
export const Close: React.FC = () => {
  const frame = useCurrentFrame();
  const CX = useVideoConfig().width / 2;
  const mark = interpolate(frame, [0, 30], [0, 1], { ...clamp, easing: EASE_OUT });
  const word = interpolate(frame, [6, 36], [0, 1], { ...clamp, easing: EASE_OUT });
  const light = interpolate(frame, [36, 120], [0.35, 1.35], clamp);
  const lightOpacity = interpolate(frame, [36, 46, 110, 120], [0, 1, 1, 0], clamp);
  const fade = interpolate(frame, [154, 180], [0, 1], { ...clamp, easing: EASE_IN_OUT });
  /* a slow push over the hold, so the last seconds still breathe */
  const push = interpolate(frame, [20, 180], [1, 1.04], clamp);
  /* logo, gap and line form one group, centred on the frame */
  const top = 402;
  return (
    <AbsoluteFill style={{ opacity: 1 - fade, filter: `blur(${fade * 8}px)`, scale: push, transformOrigin: "50% 45%" }}>
      <div style={{ position: "absolute", left: CX - LOCKUP_W / 2, top, width: LOCKUP_W, height: LOCKUP_H, display: "flex" }}>
        <div
          style={{
            width: MARK_W,
            opacity: mark,
            filter: `blur(${(1 - mark) * 10}px)`,
            translate: `${(1 - mark) * -0.35 * MARK_W}px 0`,
          }}
        >
          <LuxLogoMark p="closem" light={light} lightOpacity={lightOpacity} />
        </div>
        <div
          style={{
            width: WORD_W,
            opacity: word,
            filter: `blur(${(1 - word) * 10}px)`,
            translate: `${(1 - word) * 0.2 * WORD_W}px 0`,
          }}
        >
          <LuxLogoWord p="closew" light={light} lightOpacity={lightOpacity} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 84, right: 84, top: top + LOCKUP_H + 70 }}>
        <Headline text="Use **less**. Find what to leave out." size={59} at={32} />
      </div>
    </AbsoluteFill>
  );
};
