"use client";

import { useState } from "react";
import styles from "./ProgressScreen.module.css";
import { HubScreen } from "@/components/layout/HubScreen";
import { Button } from "@/components/ui/Button";
import { Orb } from "@/components/ui/Orb";
import { SkinProfile } from "./SkinProfile";
import { InvestigationRecord } from "./InvestigationRecord";
import { CheckInCalendar } from "./CheckInCalendar";
import { SymptomTrend } from "./SymptomTrend";
import { CheckInOverlay } from "./CheckInOverlay";
import { useInvestigation } from "@/lib/store/InvestigationProvider";
import { useToday } from "@/lib/useToday";
import { formatLong } from "@/lib/date";
import {
  checkInsFor,
  currentLine,
  dayNumber,
  lastCheckInLabel,
  progressView,
} from "@/features/progress/progress";

/**
 * PROGRESS — the nav's first section, at `/progress`. ONE screen in two states:
 *   empty  Figma mobile 551:1196, desktop 551:1231
 *   active Figma mobile 552:1236, desktop 554:1252
 * documented by `HANDOFF — INVESTIGATION & PROGRESS` (559:1376).
 *
 * ⚠️ A HUB SCREEN, NOT AN INVESTIGATION STEP. No progress track and no
 * `Save & exit` — the handoff calls this "dashboard header, pattern C": the
 * header row stays chevron + action only, and the screen title moves into the
 * BODY as H3/H2 with a Body 3/Body 2 subtitle. It is a hub LANDING reached from
 * the nav, so it has no back chevron either. Nav reads `progress`.
 *
 * ⚠️ THE DESKTOP IS A 1280 GRID, NOT A CARD — the handoff again. Two columns at
 * gutter/desktop (24): col-1 fixed 640 holds the calendar, col-2 fills the
 * remaining 616 with the profile, the trend, the CTA and its caption. That is
 * why this uses HubScreen's `grid` layout rather than `card`; wrapping a data
 * card in the 920 frosted page card would nest Surface System B inside System A
 * the wrong way round.
 *
 * ⚠️ IT OPENS POPULATED, AND THE EMPTY STATE LIVES AT `/progress/empty`. A
 * readout with nothing in it demonstrates nothing, so an investigation is
 * assumed until the user starts a real one — then their own answers take over
 * entirely. This is NOT a breach of "the prototype starts EMPTY": that rule is
 * about selection controls rendering pre-ticked, and there are no controls here.
 * `lib/progress.ts` has the full reasoning.
 *
 * ⚠️ `now` IS THE SERVER'S TIMESTAMP, AND IT IS NOT THE CLOCK. It only seeds
 * the first render so hydration matches; `useToday` corrects to the browser's
 * own date immediately after. See `lib/useToday.ts` — the demo clock is real
 * now, and the seeded fortnight is measured back from whatever today is.
 *
 * ⚠️ `Check in today` IS WIRED, AND IT DOES NOT GO TO THE CHECK TAB. It leads to
 * `/progress/check-in` — one question, one answer, back here. The handoff put
 * the daily check-in in the CHECK section as `Check-in chat`, where nothing in
 * the app could reach it and where it would have lit the tab that owns the
 * product compatibility check; `components/CheckIn.tsx` has the full argument.
 *
 * ⚠️ THE SERIES IS THE USER'S OWN, PLUS THE SEED ONLY WHILE THIS IS THE DEMO.
 * It used to be seeded unconditionally, which was defensible only while nothing
 * could write a check-in. Something can now, so a real investigation plots
 * exactly what was recorded and the demo merges the two — see `checkInsFor`.
 *
 * ⚠️ THE COMP'S UNLABELLED TOP-RIGHT ICON IS DELIBERATELY ABSENT. Listed in the
 * handoff's own deviations: "Progress empty/active drop the unlabelled top-right
 * icon from the wireframe — its purpose is undefined, so it was not invented."
 */
export function ProgressScreen({ now }: { now: number }) {
  const { answers } = useInvestigation();
  /* ⚠️ THE CHECK-IN OPENS HERE, IT DOES NOT NAVIGATE — 6 Sep 2026. `Check in
     today` used to push `/progress/check-in`; the same conversation now opens
     as a modal panel over this dashboard, and submitting it closes back onto
     the numbers it just changed. The route still exists for deep links and for
     the analysis's "pause and check in" — see `CheckInOverlay`. */
  const [checkingIn, setCheckingIn] = useState(false);
  const view = progressView(answers, useToday(now));
  const { start, today, skinType, tendencies } = view;
  const checkIns = checkInsFor(answers, view);
  const current = currentLine(answers, view);
  const lastCheckIn = lastCheckInLabel(checkIns, today);

  return (
    <HubScreen
      title="Progress"
      subtitle="Your skin investigation"
      nav="progress"
      layout="grid"
      tightTop
    >
      <SkinProfile
        className={styles.profile}
        skinType={skinType}
        tendencies={tendencies}
        current={current}
        started={`Started ${formatLong(start)} · Day ${dayNumber(start, today)}`}
      />

      <CheckInCalendar
        className={styles.calendar}
        checkIns={checkIns}
        today={today}
      />

      <SymptomTrend className={styles.trend} checkIns={checkIns} />

      {/* § 09 — only when the user actually saved a finding. ⚠️ NOT IN FIGMA,
          and absent by default: PROGRESS opens populated because it has a
          seeded check-in series, but a CONCLUSION is not something a demo gets
          to claim on the user's behalf. */}
      {answers.savedFinding && (
        <InvestigationRecord
          className={styles.record}
          finding={answers.savedFinding}
        />
      )}

      <Button className={styles.cta} onClick={() => setCheckingIn(true)}>
        Check in today
      </Button>

      {lastCheckIn && (
        <p className={`${styles.lastCheckIn} t-caption`}>{lastCheckIn}</p>
      )}

      <CheckInOverlay
        open={checkingIn}
        now={now}
        onClose={() => setCheckingIn(false)}
      />
    </HubScreen>
  );
}

/**
 * `Progress — empty`, at `/progress/empty`. The orb hero, the same block
 * `My Products — empty` uses and the one the CHECK empty states follow.
 *
 * ⚠️ ITS OWN ROUTE, BECAUSE `/progress` NO LONGER REACHES IT. The screen is
 * designed, built and worth showing, but the default dashboard fills itself in
 * rather than falling back here (see above). A route keeps it reviewable at both
 * breakpoints without a query string — which would have forced `useSearchParams`
 * and a Suspense boundary, and with it a fallback flash on the screen that
 * matters. Prototype-only: it is one Figma screen, not two routes. Delete it and
 * restore the fallback the moment CHECK writes real check-ins.
 *
 * The heading still sits at the top of the page — only the hero block is
 * centred, between two equal spacers, which is what HubScreen's `center` does.
 * On desktop the block is 640 wide (`plain`) and floats on the gradient with no
 * card at all, the standing exception every LUX empty state has.
 */
export function ProgressEmpty() {
  return (
    <HubScreen
      title="Progress"
      subtitle="Your skin investigation"
      nav="progress"
      layout="plain"
      center
    >
      <div className={styles.empty}>
        <Orb animateIn />
        <h2 className="t-h4-h3">No active investigation</h2>
        <p className={`${styles.emptyText} t-body3-body2`}>
          Start an investigation to track your skin&rsquo;s progress over time.
        </p>
        <Button href="/investigation/start" className={styles.emptyCta}>
          Create skin profile
        </Button>
      </div>
    </HubScreen>
  );
}
