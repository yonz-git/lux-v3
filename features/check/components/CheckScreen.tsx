"use client";

import Link from "next/link";
import styles from "./CheckScreen.module.css";
import { HubScreen } from "@/components/layout/HubScreen";
import { Button } from "@/components/ui/Button";
import { Orb } from "@/components/ui/Orb";
import { ChatBubble } from "@/components/ui/ChatBubble";
import { ChevronRightIcon } from "@/components/ui/icons";

/**
 * CHECK — the Check tab landing, at `/check`: `Check — start` (601:1952, and
 * its desktop twin). Documented by `HANDOFF — CHECK` (613:2434).
 */
export function CheckScreen() {
  return (
    <HubScreen
      nav="check"
      layout="plain"
      center="low"
      tightTop
    >
      <div className={`${styles.hero} ${styles.heroChat}`}>
        <div className="orb-hero">
          <Orb animateIn halo />
        </div>
        <ChatBubble from="ai" align="center" full hug className={styles.intro}>
          <span className={styles.line}>Check how your products </span>
          <span className={styles.line}>may suit your skin and work </span>
          <span className={styles.line}>together in the same routine.</span>
        </ChatBubble>
      </div>

      <div className={styles.actions}>
        <Button width="action" href="/check/new" className={styles.cta}>
          Start analysis
        </Button>
        <Link href="/check/history" className={`${styles.link} t-body3 tap-target`}>
          <span className={styles.linkLabel}>View previous analyses</span>
          <ChevronRightIcon className={styles.linkArrow} />
        </Link>
      </div>
    </HubScreen>
  );
}

/** `Check — no profile`, at `/check/no-profile`. */
export function CheckNoProfile() {
  return (
    <HubScreen
      title="Analysis"
      subtitle="Product compatibility"
      nav="check"
      layout="plain"
      center
      /* the same state of the same screen as `/check`, so the same top */
      tightTop
    >
      <div className={styles.hero}>
        <Orb animateIn />
        <h2 className="t-h4-h3">No skin profile yet</h2>
        <p className={`${styles.text} t-body3-body2`}>
          Check how your products may suit your skin and work together in the
          same routine.
        </p>
        {/* the handoff's transition map: → GETTING STARTED 01 */}
        <Button width="action" href="/investigation/start" className={styles.cta}>
          Create skin profile
        </Button>
      </div>
    </HubScreen>
  );
}
