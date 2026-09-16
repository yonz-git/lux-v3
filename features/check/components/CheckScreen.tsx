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
  return (
    <HubScreen
      title="Analysis"
      subtitle="Product compatibility"
      nav="check"
      layout="plain"
      /* ⚠️ PLACED EXACTLY WHERE 00 WELCOME PLACES ITS GROUP — 16 Sep 2026, the
         third time this was asked for ("still not exactly same layout as the
         welcome page"). The first two moves missed the same way: they CENTRED
         the orb and bubble and PINNED the actions to the nav, first on a phone
         (15 Sep, the actions as `HubScreen`'s footer) and then on desktop too
         (16 Sep). Welcome does neither. Its orb, bubble, button and caption are
         one group at fixed intervals, set low in the column by two weighted
         spacers, so at 1440x780 this screen's orb sat 57 above Welcome's and
         its bubble 133 over the button rather than 100; at 440x957 the orb sat
         47 high and the button 62 low.
         `center="low"` is Welcome's placement (weights, column, the heading
         riding above — see HubScreen.tsx); `.heroChat` and `.actions` in the
         module are its intervals, with the two lines this screen draws taller
         than Welcome's paid for inside the group. Measured after: the orb, the
         bubble's top, the button and the link's top are Welcome's to the pixel
         at 1920x1080, 1440x900, 1440x780, 1024x768, 440x957, 390x844 and
         375x667. They part only where a spacer hits its floor — under 726 tall
         on desktop, and a 320x568 phone, where the heading outgrows its share
         and the page scrolls 48. */
      center="low"
      tightTop
      /* ⚠️ NOT IN FIGMA — 601:1952 paints this screen with the static
         `gradient/canvas-*`. It shows the app-wide living canvas instead, like
         every route since 12 Sep 2026 (see `AppCanvas` in CanvasShader.tsx);
         it used to opt in here with a `shader` prop, which is gone.

         ⚠️ MEASURED, BECAUSE AXE CANNOT SEE A CANVAS. The ramp's dark end is
         the #9bb1b8 floor (see CanvasShader.tsx) — #acc5cc until the canvas
         was darkened 10% on 14 Sep 2026 — so that floor IS this screen's worst
         case whatever the field does. Against it: the h1 in `text/primary`
         6.17:1 (was 7.64), `View previous analyses` in `text/brand` 5.32:1
         (6.59), and the strip's translucent `surface/data` composites to
         #8eadb1, giving its values in `text/on-data` 5.75:1 (6.52). The bubble
         is opaque and does not move.

         ⚠️ TWO NOW FAIL AA, DEFERRED WITH THE DARKENING: the subtitle in
         `text/secondary` 3.84:1 (was 4.75) and the strip's 14px labels in
         `text/on-data-muted` 4.22:1 (4.79). Nothing on this screen sits on
         bare canvas below `text/secondary`, so the floor is the whole proof.
         The tiles card's `text/primary` on its own teal glass is measured in
         SkinProfileTiles.module.css: 5.5:1 or better.

         ⚠️ NOTHING SITS UNDER THE HEADING ANY MORE, asked for directly 14 Sep
         2026: the skin-profile strip and the skin-profile tiles both left this
         screen, and so did the warm glass metric cards briefly mounted under
         them. The strip still leads `/check/new` and `/check/results`, the
         tiles still sit on `/progress`, and the cards are kept unmounted as
         GlassMetricCard.tsx. The strip and tiles figures above are history. */
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
            rule in the module keeps the empty state's 32 off it — see the note
            there. Third route, same rule as the shader: not without a Figma
            decision. */}
        <Orb animateIn halo />
        {/* ⚠️ `hug`, 13 Sep 2026 — asked for directly: the bubble trims to its
            longest line instead of keeping the CTA's width with empty fill
            down its right side. See the note on `hug` in ChatBubble.tsx. */}
        <ChatBubble from="ai" align="center" full hug className={styles.intro}>
          Check how your products may suit your skin and work together in the
          same routine.
        </ChatBubble>
      </div>

      <div className={styles.actions}>
        <Button href="/check/new" className={styles.cta}>
          Start analysis
        </Button>
        {/* ⚠️ THE TRAILING CHEVRON IS NOT IN FIGMA. 601:1952 draws this as a
            bare text link, which reads as the one thing on the screen that
            might not go anywhere — the CTA above it is a filled button and
            every OTHER row in CHECK that pushes a view (`CheckHistory`'s own
            rows) ends in this exact glyph. Same `ChevronRightIcon` at
            `icon-sm`, currentColor, so it takes `text/brand` from the link
            and cannot drift from it. Nothing else about the link changed. */}
        <Link href="/check/history" className={`${styles.link} t-body3`}>
          <span className={styles.linkLabel}>View previous analyses</span>
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
        <Button href="/investigation/start" className={styles.cta}>
          Create skin profile
        </Button>
      </div>
    </HubScreen>
  );
}
