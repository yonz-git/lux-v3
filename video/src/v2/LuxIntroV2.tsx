import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { LivingCanvas } from "../components/LivingCanvas";
import { LayoutProvider, WIDE } from "../layout";
import { Close, CLOSE_LEN } from "../scenes/Close";
import { ANALYSIS, PRODUCTS, REC_END, TRACK, Walkthrough } from "../scenes/Walkthrough";
import { clamp } from "../theme";
import { Opening, OPENING_LEN } from "./Opening";
import { TakeOut, TAKEOUT_LEN } from "./TakeOut";

/* the three walkthrough beats V2 keeps, as [from, to) in walkthrough frames:
   the map, the products with their time axis, and the analysis with its
   evidence. The profile beat and v1's tracking beat are cut — TakeOut does
   the tracking job, as an action rather than a chart. */
const SEGMENTS: [number, number][] = [
  [0, REC_END + 20],
  [PRODUCTS + 28, ANALYSIS - 10],
  [ANALYSIS, TRACK - 5],
];

const walkStart = OPENING_LEN;
let cursor = walkStart;
const PLACED = SEGMENTS.map(([a, b]) => {
  const at = cursor;
  cursor += b - a;
  return { at, trim: a, len: b - a };
});
const T_TAKEOUT = cursor;
const T_CLOSE = T_TAKEOUT + TAKEOUT_LEN;
export const DURATION_V2 = T_CLOSE + CLOSE_LEN;

/**
 * LUX — V2, "Less". The same walkthrough as v1, framed by the product's
 * thesis: it opens on a routine piling up and ends with one product taken out.
 * 16:9 only. Storyboard: .forge/briefs/intro-video-drafts.md, "V2 — Less".
 */
export const LuxIntroV2: React.FC = () => {
  const frame = useCurrentFrame();
  const seam = interpolate(frame, [DURATION_V2 - 26, DURATION_V2 - 2], [0, 1], clamp);
  return (
    <LayoutProvider value={WIDE}>
      <AbsoluteFill>
        <LivingCanvas />
        {seam > 0 && (
          <AbsoluteFill style={{ opacity: seam }}>
            <LivingCanvas start={11} speed={0} />
          </AbsoluteFill>
        )}
        <Sequence from={0} durationInFrames={OPENING_LEN} name="Opening">
          <Opening />
        </Sequence>
        {PLACED.map((s) => (
          <Sequence key={s.trim} from={s.at - s.trim} durationInFrames={s.trim + s.len} name={`Walk ${s.trim}`}>
            {/* shown only inside its own window: the sequence starts early so
                the walkthrough's clock reads `trim` at the cut */}
            <WalkWindow from={s.trim} />
          </Sequence>
        ))}
        <Sequence from={T_TAKEOUT} durationInFrames={TAKEOUT_LEN} name="Take one out">
          <TakeOut />
        </Sequence>
        <Sequence from={T_CLOSE} durationInFrames={CLOSE_LEN} name="Close">
          <Close />
        </Sequence>
      </AbsoluteFill>
    </LayoutProvider>
  );
};

const WalkWindow: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  return f < from ? null : <Walkthrough />;
};
