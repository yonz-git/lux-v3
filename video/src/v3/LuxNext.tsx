import { AbsoluteFill, Sequence } from "remotion";
import { LivingCanvas } from "../components/LivingCanvas";
import { Story } from "./Story";
import { NEXT_END, Story2 } from "./Story2";
import { OPEN_HANDOFF, OPEN_LEN, OpenFace } from "./OpenFace";
import { Ring, RING_LEN } from "./Ring";

/* Story's own clock puts the orb at 350 (it used to follow the product wall,
   cut 2 Oct 2026); it now arrives as the ring dissolves */
const ORB_IN = 350;
const STORY_FROM = OPEN_HANDOFF + RING_LEN - 8 - ORB_IN;

/**
 * The next version of the intro, built beat by beat.
 * Brief: lux-v3/.forge/briefs/intro-video-next.md.
 * The skin photo, then your five in a ring round the question, then Story
 * (beats 3 onward) on its own clock, offset to land the orb on the ring's exit.
 */
export const NEXT_LEN = NEXT_END + STORY_FROM;

export const LuxNext: React.FC = () => (
  <AbsoluteFill>
    <LivingCanvas />
    <Sequence from={OPEN_HANDOFF} durationInFrames={RING_LEN} name="Your five">
      <Ring />
    </Sequence>
    <Sequence from={STORY_FROM} name="Story">
      <Story />
      <Story2 />
    </Sequence>
    <Sequence from={0} durationInFrames={OPEN_LEN} name="Your skin">
      <OpenFace />
    </Sequence>
  </AbsoluteFill>
);
