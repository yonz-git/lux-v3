"use client";

import { useState } from "react";
import styles from "./SkinProfileSummary.module.css";
import { HubScreen } from "@/components/layout/HubScreen";
import { Button } from "@/components/ui/Button";
import { Orb } from "@/components/ui/Orb";
import { SmallButton } from "@/components/ui/SmallButton";
import { FaceDiagram } from "./FaceDiagram";
import { SelfieSheet } from "./SelfieSheet";
/* ⚠️ ACROSS SECTIONS, WHICH THE PLACEMENT RULE ALLOWS AND THIS IS THE THIRD
   CASE OF. `CheckInPhotoArt` draws the capture in a PROGRESS check-in record;
   it draws the same thing here — a crop of skin, never anyone's face — and
   forking it would give the app two drawings of one placeholder. ⚠️ A THIRD
   CALLER SHOULD PROMOTE IT: the rule in AGENTS.md is that a component two
   sections use stops belonging to either, and this is the second. */
import { CheckInPhotoArt } from "@/features/progress/components/CheckInPhotoArt";
import { SkinProfileTiles } from "@/features/check/components/SkinProfileTiles";
import { useInvestigation } from "@/lib/store/InvestigationProvider";
import { useToday } from "@/lib/useToday";
import { COPY, isEmpty, recap } from "@/features/my-skin/profile";

/**
 * `/investigation/profile` — the skin profile recap, between step 4 (Timing)
 * and step 5 (Your products).
 *
 * ⚠️ READ THIS FIRST — REDRAWN TO MATCH PROGRESS, 14 Sep 2026, asked for
 * directly ("fix /investigation/profile accordingly to /progress"). The
 * surface split the notes below defend is RETIRED: the sage `Headline` card
 * and the `Symptoms state` block are one `SkinProfileTiles` (PROGRESS's own
 * card, indigo answer pills, the state with its start date), and the location
 * and photo blocks are bare-canvas `canvas-card`s with 15px overlines. The
 * typed `Other` is a centred `Other: <words>` line under the face, and the
 * photo well has the gallery thumbs' inner shadow. `Headline` and `Meta` were
 * deleted with it. Everything else below — the route, the CTA, the photo
 * control, the raw-answers rule — still holds; the surface history does not.
 *
 * ⚠️ NOT A FLOW STEP, AND `TOTAL_STEPS` IS STILL 5. No progress track, no
 * `Save & exit`, back chevron kept — a pushed view, the same standing
 * `/investigation/analysis` and `/check/results` have. The rule at the top of
 * `flow.ts` is that a screen is a step if and only if it carries BOTH the track
 * and `Save & exit`; this carries neither because it asks nothing. The five
 * steps COLLECT, this READS BACK.
 * **Do not add it to `STEPS`.**
 *
 * ⚠️ THE CTA LEAVES THE FLOW NOW, ASKED FOR DIRECTLY 9 Sep 2026 — it used to
 * continue to step 5 (`/investigation/products`) and now goes straight to the
 * PRODUCTS hub (`/products`). It was routed through step 5 in the first place
 * to keep a DIFFERENT shortcut from breaking: `/check/new` collects PRODUCTS
 * but not DURATIONS, so a basket built there left the analysis able only to
 * refuse (see the note this replaced, and `flow.ts`). `/products` does not
 * share that gap — it renders the SAME add-product tray step 5 does
 * (`AddProductMethodSheet`, which asks the duration question per product on
 * add), not `/check/new`'s builder — so routing here loses nothing the flow
 * needs. What it does give up is the flow's own completion: this exit no
 * longer reaches `/investigation/analysis`, so a user who follows this CTA has
 * to find their own way back to the analysis (or not look for it at all). See
 * `docs/decisions.md` if that trade-off needs revisiting. Step 5 itself is
 * unchanged and still reachable directly, still the one flow screen lighting
 * `products`; `/check/new` is still reachable from CHECK and still the shared
 * builder.
 *
 * ⚠️ NOT IN FIGMA AT ALL. Page `06. Screen Designs` has no recap frame, so
 * every measurement here is decided in the prototype — it is assembled from
 * existing recipes rather than drawn new: the sage `DataCard` that `Analysis`
 * leads with, the frosted card the rest of the flow uses, the face diagram
 * from step 1 and the standard `Button`. Listed in
 * `docs/figma-catchup.md`.
 *
 * ⚠️ ONE CARD PER ANSWER, NOT ONE CARD OF ROWS — REBUILT 7 Sep 2026, ASKED FOR
 * DIRECTLY. The first build was a single light card of `label: value` lines
 * under the heading "From your answers", and three things were wrong with it.
 * The heading named nothing (a card holding a skin type, a symptom list, a
 * photo, a conditions list and two dates is not "your answers", it is five
 * different kinds of thing). Every multi-select arrived as a sentence with
 * commas in it, when what the user actually did was pick a SET — which is what
 * `Tag` is for. And the location answer, the one answer on the screen with a
 * shape, was reduced to its own labels: "Cheeks (L), Chin / jaw" is the
 * coordinates thrown away. Each answer now gets the drawing that fits it and
 * says its own name, so no heading has to stand in for all five.
 *
 * ⚠️ THE SUBTITLE IS GONE TOO, AND IT WAS NOT DELETED FOR SPACE. It read "Here
 * is what you have told us so far. You can change any of it later." The first
 * sentence is what a screen says when it does not trust its own content to be
 * legible; the second is a promise the prototype cannot keep — there is no edit
 * affordance on this screen, and `Save & exit` does not resume a flow (see
 * "PERSISTENCE" in `docs/decisions.md`). A recap that opens by telling you it
 * is a recap has spent the top of the page saying nothing.
 *
 * ⚠️ THE SURFACE SYSTEMS CARRY THE SCREEN'S ONE SPLIT, AS OF 7 Sep 2026: the
 * sage card holds what is true BETWEEN episodes — the skin type, the tendencies
 * and the known conditions — and the light blocks hold the episode, what was
 * noticed and when and where. The conditions were the last to move; they had a
 * light block of their own, which put a standing fact about the skin in among
 * the things that are happening to it. With them in the card, each surface says
 * exactly one thing.
 *
 * ⚠️ THE SAGE CARDS ARE THE ANSWER AND THE LIGHT CARDS ARE THE READING. Surface
 * System B is the readout surface, so the profile — the one-phrase answer to
 * "what is my skin?" — is the sage card at the top, and the face is the sage
 * card in the middle, because both are STATEMENTS you take away rather than
 * detail you read. Everything else is System A. ⚠️ The second sage card sits
 * INSIDE a light one, which is the LUX nesting pattern in the right direction
 * and is also the truer reading of it: the face card is the control the user
 * filled in on step 1, shown back unchanged, and putting it in the light block
 * that names it keeps that continuity without a second focal point competing
 * with the headline.
 *
 * ⚠️ STEP 4 HAS NO BLOCK OF ITS OWN, AND IT HAD TWO DRAWINGS BEFORE IT HAD
 * NONE — cut 7 Sep 2026, asked for directly. It was a two-node timeline rail
 * (10px discs, a hairline between them, vertical on mobile and horizontal on
 * desktop), and for an hour it was ALSO the sage card's lower half. Both are
 * gone and the whole of step 4 is two labelled pairs under the symptom pills:
 * `Started on` over `Aug 31, 2026 · Day 8`, and `Current state` over `Getting
 * worse` — see `Meta` below for the shape and 8 Sep 2026's move onto it. The
 * reasoning is that a date is only the age of something when it sits under the
 * something — on its own it is a date, and a rail is a lot of apparatus for two
 * lines of text. ⚠️ **The block's flag counts the timeline**, so a walk that answered
 * step 4 and nothing on step 1 still has somewhere to show it.
 *
 * ⚠️ THE INTERVALS DO THE GROUPING, AND THEY WERE ALL 16 UNTIL THE LAYOUT PASS
 * ON 7 Sep 2026. One card per answer was right and identical spacing between
 * them was not: four frosted cards at one interval is four peers, and the
 * screen does not hold four peers. `What you noticed`, `Where you noticed it`
 * (`Symptoms and location` since 14 Sep 2026) and `How long this has been
 * going on` are three readings of ONE episode;
 * `Known conditions` was true before it started. So the episode closes to
 * 12 — tighter than the cards' own 20 padding, which is what makes three cards
 * read as one group — and the standing fact sits 24 away from it. The full run
 * is written out at the top of the stylesheet. **No heading was added to say
 * so**: the group label is the thing this screen already deleted once.
 *
 * ⚠️ AND THE RECAP TAKES A 640 COLUMN ON DESKTOP RATHER THAN THE CARD'S 824.
 * A block holding an overline and three pills does not want 824 of measure —
 * it drew as a bar of mostly empty fill — and the read-only face, which is
 * `width: 100%` over a `392 / 300` box, took the whole column and rendered
 * about 600 tall. The face is now capped at the 392 it is drawn at (on step 1
 * it stays full width: there it IS the screen and its regions are targets), and
 * the column is `width/card-focus`, left-aligned so the title, the labels, the
 * pills and the face all land on one line.
 *
 * ⚠️ THE SELFIE IS A BLOCK WITH THE PICTURE IN IT, AND IT WAS A LINE OF TEXT
 * TWICE FIRST — asked for directly, 7 Sep 2026. "Photo added" sat under the
 * symptom pills, then on the face card; both merely stated that a capture
 * exists, which is the least a recap of a photograph can say. It now gets
 * `CheckInDetail`'s well and `CheckInPhotoArt`, seeded on the capture's own id,
 * with `Update photo` opening the same `SelfieSheet` step 1 uses.
 *
 * ⚠️ THAT BUTTON IS THE ONE CONTROL ON THIS SCREEN, and it took a bug in
 * `SelfieSheet` with it when it landed: the shutter used to TOGGLE `selfie`, so
 * the first tap of a retake deleted the capture and this block vanished behind
 * the open tray. The shutter only ever captures now — see the note there. The
 * standing consequence for this file is that **nothing here can empty the store
 * any more**, which is the property a read-back screen should have had all
 * along.
 *
 * ⚠️ EVERY STRING COMES FROM `profile.ts`, including the button label, the
 * labels under the symptoms and the empty state. The screen decides layout and
 * nothing else.
 *
 * ⚠️ `now` IS THE SERVER'S TIMESTAMP AND IT IS NOT THE CLOCK — the same prop
 * `ProgressScreen` takes, for the same reason. It seeds the first render so
 * hydration matches, and `useToday` corrects to the browser's own date straight
 * after; the route is `force-dynamic` so it is the REQUEST time rather than the
 * build time. See `lib/useToday.ts`. It is here at all because the recap says
 * how long ago the symptoms started, and that sentence is only true relative to
 * a today.
 */
export function SkinProfileSummary({ now }: { now: number }) {
  const { answers } = useInvestigation();
  const [photoOpen, setPhotoOpen] = useState(false);
  const profile = recap(answers, useToday(now));

  /* ⚠️ THE EMPTY STATE IS REACHABLE AND IS NOT AN ERROR. The flow's answers
     survive 24 hours in this browser and no longer (see
     `lib/store/persistence.ts`), so a lapsed window, a different browser or a
     deep link all land here with nothing to read back. Rendering an empty recap
     would look broken; `profile.ts` deliberately does not paper over it with
     the demo profile the way `skinProfile()` does for PROGRESS and CHECK. */
  if (isEmpty(profile)) {
    return (
      <HubScreen
        title={COPY.headlineLabel}
        nav="my-skin"
        backHref="/investigation/timing"
        /* ⚠️ `plain` + `center` + the orb — THE APP'S EMPTY-STATE PATTERN, AND
           THIS SCREEN WAS THE ONE PLACE NOT USING IT. `ProgressEmpty` names it
           as "the standing exception every LUX empty state has": the heading
           stays at the top of the page, the hero block floats centred between
           two equal spacers, and on desktop it is a 640 column on bare gradient
           with no card. `My Products — empty` and `/check/no-profile` both
           follow it.

           What was here instead: `layout="card"` with the button in
           `HubScreen`'s footer. The footer solved the right problem the wrong
           way — it stopped the action being stranded in the upper third by
           pinning it to the bottom, which left a heading, two short paragraphs
           and then roughly 1000px of empty canvas above the button on a 957
           viewport. `center` closes that gap by centring the whole block rather
           than pushing its two halves to opposite edges, and it makes this
           screen read as the same kind of screen as the other three empty
           states, which is what it is.

           ⚠️ IT KEEPS ITS BACK CHEVRON, unlike the other three. They are hub
           LANDINGS with nothing behind them; this is a pushed view off step 4,
           so the chevron is correct here and its absence is correct there. */
        layout="plain"
        center
      >
        <div className={styles.empty}>
          <Orb animateIn />
          <p className={`${styles.emptyTitle} t-h4-h3`}>{COPY.emptyTitle}</p>
          <p className={`${styles.emptyBody} t-body3-body2`}>{COPY.emptyBody}</p>
          <Button href="/investigation/start" className={styles.emptyCta}>
            {COPY.emptyCta}
          </Button>
        </div>
      </HubScreen>
    );
  }

  /* ⚠️ STEP 4 IS THE WHOLE OF THIS BLOCK NOW — the symptom pills left it on
     13 Sep 2026, asked for directly, and are the face diagram's callouts since
     14 Sep 2026. So it renders only when there is a status or a dated start to
     show; "No start date given" with no status is a screen reporting on its
     own gaps, and would draw a heading over nothing. */
  const timeline = profile.timeline;
  const hasLocation =
    profile.faceRegions.length > 0 ||
    profile.otherLocations.length > 0 ||
    /* ⚠️ A TYPED DESCRIPTION IS A LOCATION ANSWER ON ITS OWN. The field and the
       `Other` chip are two controls, and step 1 does not make one require the
       other — so someone can say where in words without tapping anything. The
       block has to render for that, or the only part of the answer the user
       actually wrote is the part that disappears. */
    Boolean(profile.locationNote);
  /* ⚠️ THE THREE FACETS OF ONE EPISODE, GROUPED BY PROXIMITY. What was noticed,
     where it was noticed and how long it has been going on are three readings
     of a single thing that is happening now; the known conditions are a
     standing fact about the skin that was true before it started. Spacing them
     all alike said they were four peers. The wrapper carries the tighter gap
     and nothing else — no heading, no border, no card. A label naming a group
     is what this screen deleted once already ("From your answers"), and it
     would be the same mistake at a smaller scale. */
  const hasEpisode = hasLocation || Boolean(profile.photo);

  return (
    <HubScreen
      title={COPY.headlineLabel}
      nav="my-skin"
      backHref="/investigation/timing"
      layout="card"
      tightTop
    >
      {/* ⚠️ PROGRESS's SKIN PROFILE CARD, NOT THE SAGE STATEMENT — asked for
          directly 14 Sep 2026 ("fix /investigation/profile accordingly to
          /progress"). The sage `Headline` card and the separate `Symptoms
          state` block are both gone: `SkinProfileTiles` holds skin type,
          tendencies, known conditions AND the state with its start date, the
          way `/progress` draws them. ⚠️ STILL THE RAW ANSWERS, never
          `skinProfile()`: an unanswered value says so ("Not answered", "None")
          rather than borrowing the demo's. The start line only renders with a
          real day count — "No start date given" is not a date. */}
      <SkinProfileTiles
        className={styles.headline}
        skinType={profile.skinType ?? COPY.skinTypeUnknown}
        tendencies={
          profile.tendencies.length > 0 ? profile.tendencies.join(", ") : "None"
        }
        conditions={
          profile.conditions.length > 0 ? profile.conditions.join(", ") : "None"
        }
        symptomsState={timeline?.status ?? COPY.skinTypeUnknown}
        symptomsStarted={
          timeline && timeline.dayNumber !== null
            ? { date: timeline.started, day: timeline.dayNumber }
            : undefined
        }
      />

      {hasEpisode && (
        <div className={styles.blocks}>
          {(hasLocation || profile.photo) && (
            /* ⚠️ THE TWO BLOCKS THAT HOLD A PICTURE, PAIRED WHEN BOTH EXIST.
               `data-pair` is what turns the stack into two columns at 1024 —
               the screen knows whether it has two images and says so, because
               a grid that discovers it for itself (`auto-fit`) gives a LONE
               block the full 824 and renders the face about 600 tall. See
               `.pictures` in the stylesheet. */
            <div
              className={styles.pictures}
              data-pair={(hasLocation && profile.photo) || undefined}
            >
              {hasLocation && (
                <Block label={COPY.locationLabel} id="profile-location">
                  {/* ⚠️ THE DIAGRAM IS `aria-hidden`, AND ITS CALLOUTS SAY THE
                      ANSWER IN WORDS. A pill only means the left cheek because
                      of where it sits, which is worth nothing read aloud — so
                      `FaceDiagram` lists each symptom with its places for a
                      screen reader, beside the picture. That list replaced a
                      hidden "On the face: …" line here on 14 Sep 2026, when the
                      callouts arrived: the regions are those places, and the
                      two would have said one answer twice. The non-face chips
                      need no line: they are a real list inside the card and
                      their labels mean what they say. */}
                  {/* ⚠️ THE CARD RENDERS EVEN WITH NOTHING PICKED ON THE FACE,
                      which happens when the only answer was "Neck" or "Other".
                      Seven dimmed pills and one lit chip under them is the
                      honest reading of that — NOT on the face, here instead —
                      where dropping the diagram would leave a chip with nothing
                      to be measured against. */}
                  {/* ⚠️ THE DIAGRAM AND THE TYPED ANSWER SHARE THE BLOCK —
                      asked for directly, 8 Sep 2026: "the face diagram should
                      shrink in size and give space for the typed in text". The
                      row is what spends the space the diagram gives up; the
                      diagram alone keeps the whole block and its 392, because
                      there is nothing to share it with. `data-with-note` is how
                      the block says which of the two it is — see `.located` and
                      `.face[data-with-note]`. */}
                  <div className={styles.located}>
                    <div className={styles.face}>
                      <FaceDiagram
                        readOnly
                        selected={profile.faceRegions}
                        otherLocations={profile.otherLocations}
                        callouts={profile.places}
                      />
                    </div>
                    {/* ⚠️ A `Meta` PAIR, NOT A `Tag` AND NOT A CAPTION. The
                        pills on this screen are SETS drawn as sets; this is one
                        typed sentence, which is the shape the label-over-value
                        pair already exists for (step 4's two facts use it, and
                        so do the sage card's three). ⚠️ AND BESIDE THE PICTURE
                        RATHER THAN UNDER IT WHEREVER THERE IS ROOM, which is
                        the difference between a caption and an answer: a
                        caption describes the picture above it, this is the part
                        of the answer the picture could not draw. */}
                    {/* ⚠️ AND AS OF 14 Sep 2026 IT IS UNDER THE PICTURE, AS
                        ONE CENTRED LINE — `Other: <words>`, PROGRESS's face
                        card's own, asked for directly ("accordingly to
                        /progress"). The side-by-side row and the 300 step-down
                        it needed are retired with it. */}
                    {profile.locationNote && (
                      <p className={`${styles.otherNote} t-body2`}>
                        <span className={styles.otherNoteLabel}>
                          {COPY.locationOtherLabel}:
                        </span>{" "}
                        <span className={styles.otherNoteValue}>
                          {profile.locationNote}
                        </span>
                      </p>
                    )}
                  </div>
                </Block>
              )}

              {/* ⚠️ THE PHOTO IS A BLOCK, NOT A LINE — asked for directly, 7
                  Sep 2026, after it had been a "Photo added" line under the
                  symptoms and then the same line on the face card. Both stated
                  that a capture exists; a recap of a photograph should BE the
                  photograph. The well is `Check-in detail`'s, one recipe over —
                  see the import.

                  ⚠️ AND IT IS THE ONE CONTROL ON THE SCREEN. Every other thing
                  here reads back an answer; this one can change it, because a
                  photo is the single answer a reader is likely to want to redo
                  from the recap ("that one came out dark") and the tray to redo
                  it already exists. `SelfieSheet` writes `selfie` in the store,
                  which is what this block reads — and its shutter only ever
                  CAPTURES, so opening the tray can no longer empty the block
                  underneath it. */}
              {profile.photo && (
                <Block label={COPY.photoLabel} id="profile-photo">
                  <figure className={styles.photo}>
                    <div className={styles.photoWell}>
                      {/* ⚠️ SEEDED ON THE CAPTURE ITSELF. `profile.photo` is
                          the capture's id, so the drawn photograph changes when
                          — and only when — the user actually retakes it. That
                          is the whole visible result of `Update photo` in a
                          prototype whose viewfinder cannot show what a camera
                          sees. */}
                      <CheckInPhotoArt
                        seed={profile.photo}
                        className={styles.photoArt}
                      />
                    </div>
                    <figcaption className="visually-hidden">
                      {COPY.photoCaption}
                    </figcaption>
                  </figure>
                  <SmallButton
                    label={COPY.photoUpdate}
                    className={styles.photoAction}
                    onClick={() => setPhotoOpen(true)}
                  />
                </Block>
              )}
            </div>
          )}
        </div>
      )}

      {/* ⚠️ OUTSIDE THE BLOCK IT BELONGS TO, AND IT STAYS THERE. The shutter no
          longer clears the capture, so this is no longer load-bearing against
          that bug — but a tray that lives inside the thing it edits is one
          state change away from unmounting itself mid-interaction, and there
          is nothing to gain from moving it back in. */}
      <SelfieSheet open={photoOpen} onClose={() => setPhotoOpen(false)} />

      <div className={styles.actions}>
        <p className={`${styles.ctaHelp} t-body3-body2`}>{COPY.ctaHelp}</p>
        {/* ⚠️ THE WIDTH LIVES ON THIS WRAPPER, NOT ON THE BUTTON. `Button`'s
            `fullWidth` fills whatever box it is given, so the desktop 280 is a
            constraint on the box — sizing the control directly from this module
            would put a rule at the same specificity as `Button.module.css`'s own
            `.full`, and which one wins is then CSS-Module load order rather than
            anything written down (non-negotiable 13's exact trap). */}
        <div className={styles.cta}>
          <Button href="/products" fullWidth>
            {COPY.cta}
          </Button>
        </div>
      </div>
    </HubScreen>
  );
}

function Block({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`${styles.block} canvas-card`} aria-labelledby={id}>
      <h2 id={id} className={`${styles.blockLabel} t-overline`}>
        {label}
      </h2>
      {children}
    </section>
  );
}

/* ⚠️ `TagList` — the symptoms as a wrapping row of `Tag`s — WAS DELETED ON
   14 Sep 2026. It had been parked since the pills left the episode block on
   13 Sep 2026, waiting on the move that decided whether it came back; the
   symptoms became callouts on the face instead, and nothing else used it. */
