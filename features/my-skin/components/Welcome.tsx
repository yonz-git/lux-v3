"use client";

import styles from "./Welcome.module.css";
import { Orb } from "@/components/ui/Orb";
import { ChatBubble } from "@/components/ui/ChatBubble";
import { Button } from "@/components/ui/Button";
import { BottomNav } from "@/components/layout/BottomNav";
import { CanvasShader } from "@/components/layout/CanvasShader";

export function Welcome() {
  return (
    <main className="screen">
      {/* ⚠️ NOT IN FIGMA, AND ON THIS ROUTE ONLY. A WebGL canvas that flows five
          LUX tokens around, painted OVER `.screen`'s static gradient rather
          than replacing it — so no WebGL, a lost context or a failed compile
          means the Figma gradient, and nothing looks broken. It paints as a
          positioned element, which is why `.welcome` below had to be lifted out
          of the in-flow paint layer. Read the palette/contrast note in
          CanvasShader.tsx before retuning it: the ramp's dark end is frozen at
          `#acc5cc` so the disclaimer cannot fall below 4.75:1, and widening it
          downwards throws that guarantee away. */}
      <CanvasShader />

      <div className={styles.welcome}>
        {/* the two spacers split the free space in the ratio Figma places above
            and below the group, so it sits low without fixed offsets */}
        <div className={styles.spacerTop} aria-hidden="true" />

        <div className={styles.hero}>
          {/* ⚠️ THE QUESTION IS THE HEADING, so it is marked up as one.
              It renders inside a chat bubble, which is a div — so before this
              the entry point of the whole app had no heading at all and nothing
              for a screen reader to navigate by. `visually-hidden` rather than
              restyling the bubble: the design is unchanged, the semantics are
              not. It duplicates the bubble's text, so the bubble itself is
              hidden from assistive tech to avoid announcing it twice. */}
          <h1 className="visually-hidden">How is your skin feeling today?</h1>
          <Orb size="var(--size-orb-lg)" animateIn />
          {/* centred rather than left, because Welcome is a hero composition —
              see the note in ChatBubble.module.css */}
          {/* the two bubbles occupy the same grid cell and cross-fade — see
              .bubble-ask-exit / .bubble-swap-in in globals.css — rather than
              stacking, so the reply replaces the question in place */}
          <div className={styles.bubbles}>
            <ChatBubble
              from="ai"
              align="center"
              className="bubble-ask-exit"
              entrance={false}
              aria-hidden
            >
              How is your skin feeling today?
            </ChatBubble>

            <ChatBubble
              from="ai"
              align="center"
              className={`bubble-swap-in ${styles.bubbleReply}`}
              entrance={false}
              aria-hidden
            >
              I can help identify possible links between skincare products and
              skin reactions.
            </ChatBubble>
          </div>
        </div>

        <div className={`${styles.actions} reveal-hero`}>
          <Button className={styles.cta} href="/investigation/start">
            Create skin profile
          </Button>
          <p className={`${styles.disclaimer} t-caption`}>
            Lux does not provide medical diagnoses.
          </p>
        </div>

        <div className={styles.spacerBottom} aria-hidden="true" />
      </div>

      {/* Welcome sits before the flow, so no section is current. */}
      <BottomNav active="none" />
    </main>
  );
}
