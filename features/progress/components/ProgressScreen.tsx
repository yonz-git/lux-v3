"use client";

import { useState } from "react";
import styles from "./ProgressScreen.module.css";
import { HubScreen } from "@/components/layout/HubScreen";
import { Button } from "@/components/ui/Button";
import { DataCard } from "@/components/ui/DataCard";
import { Orb } from "@/components/ui/Orb";
import { SymptomLocation } from "@/features/my-skin/components/SymptomLocation";
import { COPY } from "@/features/my-skin/profile";
import { SkinProfileTiles } from "@/features/check/components/SkinProfileTiles";
import { InvestigationRecord } from "./InvestigationRecord";
import { CheckInCalendar } from "./CheckInCalendar";
import { SymptomTrend } from "./SymptomTrend";
import { CheckInOverlay } from "./CheckInOverlay";
import { PhotoGallery, ProgressGallery } from "./PhotoGallery";
import { useInvestigation } from "@/lib/store/InvestigationProvider";
import { useToday } from "@/lib/useToday";
import { formatLong } from "@/lib/date";
import {
  checkInsFor,
  dayNumber,
  faceLocations,
  lastCheckInLabel,
  photoDiary,
  progressView,
  symptomPlaces,
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
 * ⚠️ THE PHOTO GALLERY OPENS OVER THIS SCREEN, AND IT IS NOT A ROUTE — 14 Sep
 * 2026, NOT IN FIGMA. The `Progress gallery` card's photos open every check-in
 * photo in a `Sheet`, and each photo there links to its day's record. That
 * card replaced the `Your skin profile` card the same day, once CHECK's tiles
 * card above it said every answer the profile card held. See
 * `PhotoGallery.tsx`.
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
  const [galleryOpen, setGalleryOpen] = useState(false);
  const view = progressView(answers, useToday(now));
  const { start, today, skinType, tendencies, conditions, status } = view;
  const checkIns = checkInsFor(answers, view);
  const lastCheckIn = lastCheckInLabel(checkIns, today);
  const places = symptomPlaces(answers, view);
  const face = faceLocations(places);
  const otherNote = view.isDemo ? null : answers.locationOther?.trim() || null;
  const photos = photoDiary(checkIns);

  return (
    <HubScreen
      title="Progress"
      subtitle="Your skin investigation"
      nav="progress"
      layout="grid"
      tightTop
    >
      {/* ⚠️ NOT IN FIGMA — two stacks on desktop, asked for directly 13 Sep
          2026: col-1 is the profile tiles, the face diagram and the gallery,
          col-2 the trend, the record and then the calendar with its CTA. Each
          column is one grid item so neither's heights open gaps in the other.
          Both wrappers are `display: contents` on mobile, so the DOM order IS
          the phone's reading order — tiles, face, trend, record, gallery,
          calendar, action (asked for directly 14 Sep 2026). The gallery and
          the action sit in different places at the two breakpoints, so each
          renders one copy per breakpoint and hides the other with
          `display: none` (out of the a11y tree too). No `order` anywhere: the
          visual order matches the DOM at both widths. */}
      {/* ⚠️ THE COLUMNS REVEAL THEIR OWN CARDS, 15 Sep 2026 — HubScreen's body
          staggers its DIRECT children, and on this screen those are these two
          wrappers, so without the hooks the cards inside arrived as one block
          (on a phone the wrappers are `display: contents` and have no box to
          fade at all). The nested rule in globals.css keeps a wrapper from
          fading on top of its children. */}
      <div className={styles.profileColumn} data-reveal data-reveal-stagger>
        {/* ⚠️ NOT IN FIGMA — CHECK's tiles card, asked for directly 14 Sep
            2026. Unlike on `/check` it reads this screen's own answers. It is
            the screen's ONLY skin profile now: the sage `Your skin profile`
            card under it became `Progress gallery` the same day, and its
            `Started <date> · Day <n>` moved under the state tile. */}
        <SkinProfileTiles
          skinType={skinType ?? "Not set"}
          tendencies={tendencies?.length ? tendencies.join(", ") : "None"}
          conditions={conditions?.length ? conditions.join(", ") : "None"}
          symptomsState={status ?? "Not set"}
          /* ⚠️ NO `symptomsStarted` SINCE 15 Sep 2026, asked for directly: the
             date is under the face card's list (`SymptomLocation`) and the day
             count is the calendar's pill. `/check/new` and `/check/results`
             still pass it — they have neither card. */
        />

        {/* ⚠️ ABOVE THE GALLERY, asked for directly 14 Sep 2026 — it sat
            under the profile card, which is the gallery now.

            step 1's own diagram, read-only — the same one the profile recap
            draws, and `aria-hidden` inside.
            ⚠️ ALWAYS RENDERED, since 14 Sep 2026 — it used to render only
            when step 1 had a place, and that made it VANISH: the screen first
            paints the demo, whose face has places, and a moment later the
            user's own answers arrive. With step 4 answered and step 1 empty,
            the card unmounted under the reader ("it disappears when I scroll
            down"). An unlit face is the honest reading of "no place marked
            yet", the same rule the recap's location card follows. */}
        <DataCard
          className={`${styles.faceCard} canvas-card`}
          aria-labelledby="progress-face"
        >
          <h2 id="progress-face" className={`${styles.faceLabel} t-overline`}>
            {COPY.locationLabel}
          </h2>
          {/* ⚠️ THE FACE BESIDE ITS LIST — `SymptomLocation`, 15 Sep 2026,
              asked for directly ("move the diagram to left and display the
              list on right"). It holds the read-only diagram with its callouts
              (14 Sep 2026: a pill per symptom, a line to each place), a row
              per symptom with its places, the episode's start date and the
              typed `Other` — which was a centred `Other: <words>` line under
              the face here until then, and is a labelled pair under the list
              now. The `visually-hidden` sentence that once named the regions
              is still gone: the list IS the spoken answer, and the diagram's
              own hidden list is switched off inside the component so nothing
              says the pairing twice. */}
          <SymptomLocation
            places={places}
            faceRegions={face.faceRegions}
            otherLocations={face.otherLocations}
            otherNote={otherNote}
            started={formatLong(start)}
          />
        </DataCard>

        {/* desktop's copy: col-1, under the face */}
        <ProgressGallery
          className={`${styles.galleryDesktop} canvas-card`}
          photos={photos}
          onOpen={() => setGalleryOpen(true)}
        />
      </div>

      <div className={styles.checkInColumn} data-reveal data-reveal-stagger>
        {/* the day count rides the trend's title — asked for directly 15 Sep
            2026, after an hour on the calendar's legend */}
        <SymptomTrend
          className={styles.trend}
          checkIns={checkIns}
          day={dayNumber(start, today)}
        />

        {/* § 09 — only when the user actually saved a finding. ⚠️ NOT IN
            FIGMA, and absent by default: PROGRESS opens populated because it
            has a seeded check-in series, but a CONCLUSION is not something a
            demo gets to claim on the user's behalf. */}
        {answers.savedFinding && (
          <InvestigationRecord
            className={styles.record}
            finding={answers.savedFinding}
          />
        )}

        {/* mobile's copy: under the trend, above the calendar */}
        <ProgressGallery
          className={`${styles.galleryMobile} canvas-card`}
          photos={photos}
          onOpen={() => setGalleryOpen(true)}
        />

        <CheckInCalendar
          className={styles.calendar}
          checkIns={checkIns}
          today={today}
        />

        <Button className={styles.ctaDesktop} onClick={() => setCheckingIn(true)}>
          Check in today
        </Button>

        {lastCheckIn && (
          <p className={`${styles.lastCheckInDesktop} t-caption`}>
            {lastCheckIn}
          </p>
        )}
      </div>

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

      <PhotoGallery
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        photos={photos}
        start={start}
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
