"use client";

import Link from "next/link";
import styles from "./CheckScreen.module.css";
import { HubScreen } from "@/components/layout/HubScreen";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Orb } from "@/components/ui/Orb";
import { ChatBubble } from "@/components/ui/ChatBubble";
import { ChevronRightIcon } from "@/components/ui/icons";
import { hasInvestigation } from "@/features/progress/progress";
import { useInvestigation } from "@/lib/store/InvestigationProvider";

/**
 * CHECK — the Check tab landing, at `/check`: `Check — start` (601:1952, and
 * its desktop twin). Documented by `HANDOFF — CHECK` (613:2434).
 */
export function CheckScreen() {
  const { answers } = useInvestigation();

  /* nothing to check against until there is a skin profile */
  if (!hasInvestigation(answers)) return <CheckNoProfile />;

  return (
    <HubScreen
      nav="check"
      layout="plain"
      center="low"
      tightTop
    >
      {/* the orb and its bubble move as one, centred in the space above the
          button whatever the bubble's height */}
      <div className={styles.heroArea}>
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
      center="empty"
      /* the same state of the same screen as `/check`, so the same top */
      tightTop
    >
      <EmptyState
        title="No skin profile yet"
        action={{ label: "Create skin profile", href: "/investigation/start" }}
      >
        Check how your products may suit your skin and work together in the
        same routine.
      </EmptyState>
    </HubScreen>
  );
}
