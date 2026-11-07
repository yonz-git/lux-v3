"use client";

import { useState } from "react";
import styles from "./Welcome.module.css";
import { Orb } from "@/components/ui/Orb";
import { ChatBubble } from "@/components/ui/ChatBubble";
import { Button } from "@/components/ui/Button";
import { BottomNav } from "@/components/layout/BottomNav";
import { entrancePlayed } from "@/components/layout/LogoEntrance";

export function Welcome() {
  const [returning] = useState(entrancePlayed);

  return (
    <main className="screen">
      <div className={styles.welcome}>
        {/* the two spacers split the free space in the ratio Figma places above
            and below the group, so it sits low without fixed offsets */}
        <div className={styles.spacerTop} aria-hidden="true" />

        <div className={returning ? `${styles.hero} reveal` : styles.hero}>
          <h1 className="visually-hidden">How is your skin feeling today?</h1>
          <div className="orb-hero">
            <Orb
              size="var(--size-orb-lg)"
              animateIn={!returning}
              halo
              className={returning ? undefined : "orb-from-entrance"}
            />
          </div>
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
              <span className={styles.line}>I can help identify possible </span>
              <span className={styles.line}>links between skincare </span>
              <span className={styles.line}>products and skin reactions.</span>
            </ChatBubble>
          </div>
        </div>

        <div className={returning ? `${styles.actions} reveal` : styles.actions}>
          <Button
            className={returning ? styles.cta : `${styles.cta} welcome-rise`}
            style={returning ? undefined : ({ "--rise-delay": "1700ms" } as React.CSSProperties)}
            href="/investigation/start"
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

      {/* Welcome sits before the flow, so no section is current. */}
      <BottomNav
        active="none"
        className={returning ? undefined : "welcome-rise"}
        style={returning ? undefined : ({ "--rise-delay": "2000ms" } as React.CSSProperties)}
      />
    </main>
  );
}
