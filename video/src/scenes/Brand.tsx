import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { LuxLogoWord } from "../components/Logo";
import { Orb } from "../components/Orb";
import { Headline } from "../components/Type";
import { clamp, EASE_IN, EASE_IN_OUT, EASE_OUT } from "../theme";

/**
 * The lockup: the orb grows out of the space the products left, its mark
 * assembles L → U → X as in the app's Spiral Assemble, then the wordmark
 * rises with one pass of the logo's own light, and the line.
 * `exitAt` sends it all up and away, `hold` keeps it (the close).
 */
export const Lockup: React.FC<{
  line: string;
  p: string;
  exitAt?: number;
  lineSize?: number;
  orbSize?: number;
  orbY?: number;
  lineAt?: number;
  /** the wordmark under the orb — the close only; the opening shows the orb alone */
  word?: boolean;
  wordW?: number;
  lineGap?: number;
}> = ({ line, p, exitAt, lineSize = 60, orbSize = 300, orbY = 230, lineAt = 30, word: showWord = true, wordW = 236, lineGap = 210 }) => {
  const frame = useCurrentFrame();
  const CX = useVideoConfig().width / 2;
  const grow = interpolate(frame, [0, 28], [0, 1], { ...clamp, easing: EASE_OUT });
  const word = interpolate(frame, [26, 50], [0, 1], { ...clamp, easing: EASE_OUT });
  const light = interpolate(frame, [30, 108, 120, 198], [0.35, 1.35, 1.35, 2.35], clamp);
  const out = exitAt === undefined ? 0 : interpolate(frame, [exitAt, exitAt + 26], [0, 1], { ...clamp, easing: EASE_IN_OUT });
  const fade = exitAt === undefined ? 0 : interpolate(frame, [exitAt + 6, exitAt + 26], [0, 1], { ...clamp, easing: EASE_IN });
  return (
    <AbsoluteFill style={{ opacity: 1 - fade }}>
      <div
        style={{
          position: "absolute",
          left: CX - orbSize / 2,
          top: orbY - orbSize * 0.05,
          opacity: grow,
          scale: (0.55 + 0.45 * grow) * (1 - 0.35 * out),
          translate: `0 ${-out * 160}px`,
          filter: `blur(${(1 - grow) * 12}px)`,
        }}
      >
        <Orb size={orbSize} p={`${p}orb`} assembleAt={10} />
      </div>
      {showWord && (
      <div
        style={{
          position: "absolute",
          left: CX - wordW / 2,
          top: orbY + orbSize + 30,
          width: wordW,
          opacity: word,
          filter: `blur(${(1 - word) * 10}px)`,
          translate: `0 ${(1 - word) * 30 - out * 120}px`,
        }}
      >
        <LuxLogoWord p={`${p}w`} light={light} lightOpacity={interpolate(frame, [30, 40, 100, 110, 120, 130, 188, 198], [0, 1, 1, 0, 0, 1, 1, 0], clamp)} />
      </div>
      )}
      <div style={{ position: "absolute", left: 84, right: 84, top: orbY + orbSize + lineGap, translate: `0 ${-out * 80}px` }}>
        <Headline text={line} size={lineSize} at={lineAt} />
      </div>
    </AbsoluteFill>
  );
};

export const BRAND_LEN = 150;
export const Brand: React.FC = () => (
  /* orb, gap and line form one group, optically centred on the frame */
  <Lockup line="LUX helps you **investigate**." p="brand" exitAt={120} lineSize={50} lineAt={28} orbSize={240} orbY={374} word={false} lineGap={60} />
);
