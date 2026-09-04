"use client";

import Link from "next/link";
import styles from "./CheckScreen.module.css";
import { HubScreen } from "@/components/layout/HubScreen";
import { Button } from "@/components/ui/Button";
import { Orb } from "@/components/ui/Orb";
import { ChatBubble } from "@/components/ui/ChatBubble";
import { SkinProfileStrip } from "./SkinProfileStrip";
import { ChevronRightIcon } from "@/components/ui/icons";
import { useInvestigation } from "@/lib/store/InvestigationProvider";
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
 * ⚠️ THE DAILY CHECK-IN IS NOT HERE, AND THAT IS NO LONGER A GAP. The PROGRESS
 * handoff assigns `Check-in chat` to this section — "it IS the check-in" — and
 * this screen never offered it, so for a while the tab owned two unrelated jobs
 * and advertised one. Resolved by moving the job rather than by adding a third
 * CTA here: the daily check-in ships at `/progress/check-in`, reached from
 * Progress's `Check in today`, and lights `Progress`. This tab keeps exactly
 * one meaning — the product compatibility check. See `components/CheckIn.tsx`.
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
      /* ⚠️ NOT IN FIGMA — 601:1952 paints this screen with the static
         `gradient/canvas-*`. `/check` now runs 00 Welcome's living canvas
         instead: it was asked for directly, and it is the one hub that earns it
         — the landing is the same composition Welcome opens on (orb, centred AI
         bubble, one CTA) floating on bare canvas with no card to interrupt it,
         so the flowing field reads as the same screen breathing rather than as
         decoration behind a form. Still a candidate treatment awaiting a Figma
         decision; do not spread it to a third route without one.

         ⚠️ MEASURED, BECAUSE AXE CANNOT SEE A CANVAS. The ramp's dark end is
         frozen at #acc5cc (see CanvasShader.tsx), so that floor IS this
         screen's worst case whatever the field does. Against it: the h1 and
         the bubble copy in `text/primary` 7.64:1, the subtitle in
         `text/secondary` 4.75:1, `View previous checks` in `text/brand`
         6.59:1, and the strip's translucent `surface/data` composites to
         #97b8bd, giving `text/on-data` 6.52:1 and `-secondary` 4.79:1. All AA.
         Nothing on this screen sits on bare canvas below `text/secondary`, so
         the floor is the whole proof. */
      shader
      belowHeading={
        <SkinProfileStrip
          className={styles.profile}
          skinType={skinType}
          tendencies={tendencies}
        />
      }
    >
      <div className={`${styles.hero} ${styles.heroChat}`}>
        {/* ⚠️ THE INTRO IS A BUBBLE, NOT A HEADING + PARAGRAPH — NOT IN FIGMA.
            601:1952 draws "Check your products" as an H4/H3 over a Body 3/2
            line. The heading restated the screen: `HubScreen` already titles
            this page "Check" with the subtitle "Product compatibility", so the
            landing carried three names for one thing before it said anything.
            Dropping it leaves the sentence that actually explains the check,
            and the sentence is LUX speaking — which is a bubble everywhere else
            in the app. Same composition 00 Welcome opens on (orb, then a
            centred AI bubble) and the same entrance, since `ChatBubble` owns
            `bubble-enter`. */}
        {/* ⚠️ AND IT ANSWERS THE POINTER, LIKE WELCOME'S — NOT IN FIGMA. Asked
            for directly, and it rides on the same argument the shader above
            makes: this landing IS Welcome's composition (orb, centred AI
            bubble, one CTA) on bare canvas, so the orb is the same brand
            object doing the same job. `.heroChat > .orb-halo` below the SVG
            rule in the module is what keeps its spacing — see the note there.
            Third route, same rule as the shader: not without a Figma
            decision. */}
        <Orb animateIn halo />
        <ChatBubble from="ai" align="center" full className={styles.intro}>
          Check how your products may suit your skin and work together in the
          same routine.
        </ChatBubble>
        <Button href="/check/new" className={styles.cta}>
          Start a check
        </Button>
        {/* ⚠️ THE TRAILING CHEVRON IS NOT IN FIGMA. 601:1952 draws this as a
            bare text link, which reads as the one thing on the screen that
            might not go anywhere — the CTA above it is a filled button and
            every OTHER row in CHECK that pushes a view (`CheckHistory`'s own
            rows) ends in this exact glyph. Same `ChevronRightIcon` at
            `icon-sm`, currentColor, so it takes `text/brand` from the link and
            cannot drift from it. Nothing else about the link changed. */}
        <Link href="/check/history" className={`${styles.link} t-body3`}>
          <span className={styles.linkLabel}>View previous checks</span>
          <ChevronRightIcon className={styles.linkArrow} />
        </Link>
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
        <Orb animateIn />
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
