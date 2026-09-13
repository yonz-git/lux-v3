"use client";

import { useState } from "react";
import styles from "./Welcome.module.css";
import { Orb } from "@/components/ui/Orb";
import { ChatBubble } from "@/components/ui/ChatBubble";
import { Button } from "@/components/ui/Button";
import { BottomNav } from "@/components/layout/BottomNav";
import { entrancePlayed } from "@/components/layout/LogoEntrance";

export function Welcome() {
  /* ⚠️ AN IN-APP RETURN IS NOT A FIRST RUN. `Save & exit` and Back on step 1
     both land here; the entrance and this screen's staged arrival already
     played on this page load, so the settled composition — orb, reply, CTA —
     fades in on the standard page reveal instead. See `entrancePlayed`.
     Read ONCE PER MOUNT (the `useState` initialiser), not on every render:
     the flag flips when the first-run entrance ends, and a re-render after
     that must not swap a first-run Welcome into this composition mid-screen. */
  const [returning] = useState(entrancePlayed);

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

        <div className={returning ? `${styles.hero} reveal` : styles.hero}>
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
          <Orb
            size="var(--size-orb-lg)"
            animateIn={!returning}
            halo
            className={returning ? undefined : "orb-from-entrance"}
          />
          {/* centred rather than left, because Welcome is a hero composition —
              see the note in ChatBubble.module.css */}
          {/* the two bubbles occupy the same grid cell and cross-fade — see
              .bubble-ask-exit / .bubble-swap-in in globals.css — rather than
              stacking, so the reply replaces the question in place */}
          <div className={styles.bubbles}>
            {!returning && (
              <ChatBubble
                from="ai"
                align="center"
                className="bubble-ask-exit"
                entrance={false}
                aria-hidden
              >
                How is your skin feeling today?
              </ChatBubble>
            )}

            <ChatBubble
              from="ai"
              align="center"
              className={returning ? styles.bubbleReply : `bubble-swap-in ${styles.bubbleReply}`}
              entrance={false}
              aria-hidden
            >
              I can help identify possible links between skincare products and
              skin reactions.
            </ChatBubble>
          </div>
        </div>

        {/* ⚠️ each piece fades up from 1700ms — while the question's 800ms rise,
            which starts at 1200ms, is settling — one 150ms beat apart, the nav
            last — see `.welcome-rise` */}
        <div className={returning ? `${styles.actions} reveal` : styles.actions}>
          {/* ⚠️ `beacon` — the breathing gradient and the light sweep — is
              this button's alone; it is the one control in the app that has
              to say "start here". See Button.tsx. */}
          <Button
            className={returning ? styles.cta : `${styles.cta} welcome-rise`}
            style={returning ? undefined : ({ "--rise-delay": "1700ms" } as React.CSSProperties)}
            href="/investigation/start"
            beacon
          >
            Create skin profile
          </Button>
          <p
            className={returning ? `${styles.disclaimer} t-caption` : `${styles.disclaimer} t-caption welcome-rise`}
            style={returning ? undefined : ({ "--rise-delay": "1850ms" } as React.CSSProperties)}
          >
            Lux does not provide medical diagnoses.
          </p>
        </div>

        <div className={styles.spacerBottom} aria-hidden="true" />
      </div>

      {/* Welcome sits before the flow, so no section is current.
          ⚠️ ON A RETURN THE NAV DOES NOT REVEAL — changed after review, 13 Sep
          2026. It is chrome: `HubScreen` and `QuestionScreen` render it solid
          through every route change, so fading it in here blinked the one
          element that never moves. Only the first run stages it in. */}
      <BottomNav
        active="none"
        className={returning ? undefined : "welcome-rise"}
        style={returning ? undefined : ({ "--rise-delay": "2000ms" } as React.CSSProperties)}
      />
    </main>
  );
}
