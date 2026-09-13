"use client";

import styles from "./Welcome.module.css";
import { Orb } from "@/components/ui/Orb";
import { ChatBubble } from "@/components/ui/ChatBubble";
import { Button } from "@/components/ui/Button";
import { BottomNav } from "@/components/layout/BottomNav";

export function Welcome() {
  return (
    <main className="screen">
      {/* ⚠️ NO CANVAS HERE ANY MORE. The living canvas behind this screen is
          the app-wide `AppCanvas` in app/layout.tsx; Welcome is the one route
          where it answers the pointer. Read the palette/contrast note in
          CanvasShader.tsx before retuning it: the ramp's dark end is frozen at
          `#acc5cc` so the disclaimer cannot fall below 4.75:1. */}
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
          {/* ⚠️ THIS ORB TAKES ITS MARK FROM THE ENTRANCE. `orb-from-entrance`
              (globals.css) grows it from almost nothing behind the entrance's
              symbol, `animateIn` Spiral-Assembles its mark as it grows, and the
              symbol — the same geometry to the pixel — fades over the
              assembling mark on its way in; `LogoEntrance` aims the two by
              class. */}
          <Orb size="var(--size-orb-lg)" animateIn halo className="orb-from-entrance" />
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

        {/* ⚠️ each piece fades up after the question lands (1200 + 800ms),
            one 150ms beat apart, the nav last — see `.welcome-rise` */}
        <div className={styles.actions}>
          {/* ⚠️ `beacon` — the breathing gradient and the light sweep — is
              this button's alone; it is the one control in the app that has
              to say "start here". See Button.tsx. */}
          <Button
            className={`${styles.cta} welcome-rise`}
            style={{ "--rise-delay": "1700ms" } as React.CSSProperties}
            href="/investigation/start"
            beacon
          >
            Create skin profile
          </Button>
          <p
            className={`${styles.disclaimer} t-caption welcome-rise`}
            style={{ "--rise-delay": "1850ms" } as React.CSSProperties}
          >
            Lux does not provide medical diagnoses.
          </p>
        </div>

        <div className={styles.spacerBottom} aria-hidden="true" />
      </div>

      {/* Welcome sits before the flow, so no section is current. */}
      <BottomNav
        active="none"
        className="welcome-rise"
        style={{ "--rise-delay": "2000ms" } as React.CSSProperties}
      />
    </main>
  );
}
