"use client";

import styles from "./Welcome.module.css";
import { Orb } from "./Orb";
import { ChatBubble } from "./ChatBubble";
import { Button } from "./Button";
import { BottomNav } from "./BottomNav";

export function Welcome() {
  return (
    <main className="screen">
      <div className={styles.welcome}>
        {/* the two spacers split the free space in the ratio Figma places above
            and below the group, so it sits low without fixed offsets */}
        <div className={styles.spacerTop} aria-hidden="true" />

        <div className={`${styles.hero} reveal-hero`}>
          <Orb size="var(--size-orb-lg)" />
          {/* centred rather than left, because Welcome is a hero composition —
              see the note in ChatBubble.module.css */}
          <ChatBubble from="ai" align="center">
            How is your skin feeling today?
          </ChatBubble>
        </div>

        <div className={`${styles.actions} reveal-hero`}>
          <Button className={styles.cta} href="/investigation/start">
            Start investigating
          </Button>
          <p className={`${styles.disclaimer} t-caption`}>
            This is not a medical diagnosis tool.
          </p>
        </div>

        <div className={styles.spacerBottom} aria-hidden="true" />
      </div>

      {/* Welcome sits before the flow, so no section is current. */}
      <BottomNav active="none" />
    </main>
  );
}
