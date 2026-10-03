import { Composition, Folder } from "remotion";
import { DURATION, LuxIntro } from "./LuxIntro";
import { Brand } from "./scenes/Brand";
import { Close, CLOSE_LEN } from "./scenes/Close";
import { Hook } from "./scenes/Hook";
import { WALK_END, Walkthrough } from "./scenes/Walkthrough";
import { LivingCanvas } from "./components/LivingCanvas";
import { AbsoluteFill } from "remotion";
import { FPS } from "./theme";
import { LayoutProvider, WIDE } from "./layout";
import { DURATION_V2, LuxIntroV2 } from "./v2/LuxIntroV2";
import { Measure } from "./Measure";
import { TOO_MUCH_LEN, TooMuch } from "./v3/TooMuch";
import { LuxNext, NEXT_LEN } from "./v3/LuxNext";

/* the same film, laid out for 16:9 — see WIDE in src/layout.ts */
const LuxIntroWide: React.FC = () => (
  <LayoutProvider value={WIDE}>
    <LuxIntro />
  </LayoutProvider>
);

const withCanvas = (C: React.FC) => () => (
  <AbsoluteFill>
    <LivingCanvas />
    <C />
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="LuxIntro" component={LuxIntro} durationInFrames={DURATION} fps={FPS} width={1080} height={1080} />
    <Composition id="LuxIntroWide" component={LuxIntroWide} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} />
    <Composition id="LuxIntroV2" component={LuxIntroV2} durationInFrames={DURATION_V2} fps={FPS} width={1920} height={1080} />
    <Composition id="Measure" component={Measure} durationInFrames={1} fps={FPS} width={1920} height={400} />
    <Composition id="LuxNext" component={LuxNext} durationInFrames={NEXT_LEN} fps={FPS} width={1920} height={1080} />
    <Composition id="TooMuch" component={withCanvas(TooMuch)} durationInFrames={TOO_MUCH_LEN} fps={FPS} width={1920} height={1080} />
    <Folder name="Scenes">
      <Composition id="Hook" component={withCanvas(Hook)} durationInFrames={170} fps={FPS} width={1080} height={1080} />
      <Composition id="Brand" component={withCanvas(Brand)} durationInFrames={160} fps={FPS} width={1080} height={1080} />
      <Composition id="Walkthrough" component={withCanvas(Walkthrough)} durationInFrames={WALK_END} fps={FPS} width={1080} height={1080} />
      <Composition id="Close" component={withCanvas(Close)} durationInFrames={CLOSE_LEN} fps={FPS} width={1080} height={1080} />
    </Folder>
  </>
);
