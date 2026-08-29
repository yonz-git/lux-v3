"use client";

import Link from "next/link";
import styles from "./CheckScreen.module.css";
import { HubScreen } from "./HubScreen";
import { Button } from "./Button";
import { Orb } from "./Orb";
import { SkinProfileStrip } from "./SkinProfileStrip";
import { useInvestigation } from "./InvestigationProvider";
import { skinProfile } from "@/lib/demo";

/**
 * CHECK — the Check tab landing, at `/check`: `Check — start` (601:1952, and
 * its desktop twin). Documented by `HANDOFF — CHECK` (613:2434).
 *
 * ⚠️ IT OPENS READY TO CHECK, NOT ON "No skin profile yet". Same call `/progress`
 * makes and for the same reason — see lib/demo.ts. `Check — no profile` is a
 * real designed state, but it is the state you are in for the ten minutes
 * BEFORE you have used the app, and a portfolio visitor never gets past it. The
 * profile is seeded until the user answers step 2, then it is entirely theirs.
 * The no-profile screen keeps its own route at `/check/no-profile`.
 *
 * ⚠️ A HUB LANDING. Reached from the nav, so no back chevron, no progress track
 * and no `Save & exit` — the handoff is explicit that a track plus Save & exit
 * is the investigation flow's signature and CHECK is not part of it. Title in
 * the BODY as H3/H2 with a Body 3/Body 2 subtitle: the dashboard header,
 * pattern C, the same one `/progress` uses.
 *
 * ⚠️ THE DAILY CHECK-IN IS MISSING FROM THIS SECTION AND THAT IS A REAL GAP.
 * The PROGRESS handoff assigns `Check-in chat` to the Check nav section — "it
 * IS the check-in" — but this screen offers only "Start a check" and "View
 * previous checks", so nothing in the app reaches it, and Progress's
 * `Check in today` has nowhere to go either. The tab owns two unrelated jobs
 * and advertises one. Out of scope for this pass by decision, so the second job
 * is NAMED rather than silently dropped — see `.roadmap` in the stylesheet.
 */
export function CheckScreen() {
  const { answers } = useInvestigation();
  const { skinType, tendencies } = skinProfile(answers);

  return (
    <HubScreen
      title="Check"
      subtitle="Product compatibility"
      nav="check"
      layout="plain"
      center
      belowHeading={
        <SkinProfileStrip
          className={styles.profile}
          skinType={skinType}
          tendencies={tendencies}
        />
      }
    >
      <div className={styles.hero}>
        <Orb className="reveal-hero" />
        <h2 className="t-h4-h3">Check your products</h2>
        <p className={`${styles.text} t-body3-body2`}>
          Check how your products may suit your skin and work together in the
          same routine.
        </p>
        <Button href="/check/new" className={styles.cta}>
          Start a check
        </Button>
        <Link href="/check/history" className={`${styles.link} t-body3`}>
          View previous checks
        </Link>

        {/* ⚠️ NOT IN FIGMA — see the doc comment. A stated roadmap line, not a
            control: a disabled button for something that was never built reads
            as broken, while saying nothing at all hides that this tab is
            supposed to hold two things. */}
        <p className={`${styles.roadmap} t-caption`}>
          Daily check-in — coming next
        </p>
      </div>
    </HubScreen>
  );
}

/**
 * `Check — no profile`, at `/check/no-profile`.
 *
 * ⚠️ ITS OWN ROUTE, BECAUSE `/check` NO LONGER REACHES IT — the same treatment
 * `Progress — empty` got. Prototype-only: in the design this is a STATE of the
 * Check landing, not a screen of its own. Delete it and restore the fallback
 * when there is a backend to resume a real profile from.
 *
 * ⚠️ ONLY THE DESKTOP FRAME EXISTS (606:2183) — there is no mobile
 * `Check — no profile` in the file at all, so the 440 composition is the
 * established LUX empty-state block at mobile scale rather than a port.
 */
export function CheckNoProfile() {
  return (
    <HubScreen
      title="Check"
      subtitle="Product compatibility"
      nav="check"
      layout="plain"
      center
    >
      <div className={styles.hero}>
        <Orb className="reveal-hero" />
        <h2 className="t-h4-h3">No skin profile yet</h2>
        <p className={`${styles.text} t-body3-body2`}>
          Check how your products may suit your skin and work together in the
          same routine.
        </p>
        {/* the handoff's transition map: → GETTING STARTED 01 */}
        <Button href="/investigation/start" className={styles.cta}>
          Create skin profile
        </Button>
      </div>
    </HubScreen>
  );
}
