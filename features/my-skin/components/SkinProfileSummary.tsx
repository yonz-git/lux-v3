"use client";

import { useState } from "react";
import styles from "./SkinProfileSummary.module.css";
import { HubScreen } from "@/components/layout/HubScreen";
import { DataCard } from "@/components/ui/DataCard";
import { Button } from "@/components/ui/Button";
import { SmallButton } from "@/components/ui/SmallButton";
import { Tag } from "@/components/ui/Tag";
import { FaceDiagram } from "./FaceDiagram";
import { SelfieSheet } from "./SelfieSheet";
/* ⚠️ ACROSS SECTIONS, WHICH THE PLACEMENT RULE ALLOWS AND THIS IS THE THIRD
   CASE OF. `CheckInPhotoArt` draws the capture in a PROGRESS check-in record;
   it draws the same thing here — a crop of skin, never anyone's face — and
   forking it would give the app two drawings of one placeholder. ⚠️ A THIRD
   CALLER SHOULD PROMOTE IT: the rule in AGENTS.md is that a component two
   sections use stops belonging to either, and this is the second. */
import { CheckInPhotoArt } from "@/features/progress/components/CheckInPhotoArt";
import { useInvestigation } from "@/lib/store/InvestigationProvider";
import { useToday } from "@/lib/useToday";
import { COPY, isEmpty, recap } from "@/features/my-skin/profile";
import type { ProfileRecap } from "@/features/my-skin/profile";

/**
 * `/investigation/profile` — the skin profile recap, between step 4 (Timing)
 * and step 5 (Your products).
 *
 * ⚠️ NOT A FLOW STEP, AND `TOTAL_STEPS` IS STILL 5. No progress track, no
 * `Save & exit`, back chevron kept — a pushed view, the same standing
 * `/investigation/analysis` and `/check/results` have. The rule at the top of
 * `flow.ts` is that a screen is a step if and only if it carries BOTH the track
 * and `Save & exit`; this carries neither because it asks nothing. The five
 * steps COLLECT, this READS BACK, and step 5 then continues the walk.
 * **Do not add it to `STEPS`.**
 *
 * ⚠️ IT REPLACED A DIRECT HAND-OFF FROM TIMING TO `/check/new`, WHICH WAS A
 * DELIBERATE ROUTE AND IS WORTH KNOWING ABOUT. Step 4 pointed at CHECK's
 * builder from 6 Sep 2026 as the first move of the CHECK/analysis merge — two
 * screens were doing the same job in two sections. The note on the `timing`
 * step recorded the cost of that shortcut: `/check/new` collects PRODUCTS but
 * not DURATIONS, and the duration is the entire mechanism of the analysis, so a
 * basket built there leaves the analysis able only to refuse. Routing through
 * here to step 5 puts the duration question back on the path. The merge itself
 * is not undone — `/check/new` is still reachable from CHECK and still the
 * shared builder. See `flow.ts` and `docs/decisions.md`.
 *
 * ⚠️ NOT IN FIGMA AT ALL. Page `06. Screen Designs` has no recap frame, so
 * every measurement here is decided in the prototype — it is assembled from
 * existing recipes rather than drawn new: the sage `DataCard` that `Analysis`
 * leads with, the frosted card the rest of the flow uses, `Tag`, the face
 * diagram from step 1 and the standard `Button`. Listed in
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
 * gone and the whole of step 4 is two meta lines under the symptom pills:
 * `Started Aug 31, 2026 · Day 8` and `Now: Getting worse`. The reasoning is
 * that a date is only the age of something when it sits under the something —
 * on its own it is a date, and a rail is a lot of apparatus for two lines of
 * text. ⚠️ **The block's flag counts the timeline**, so a walk that answered
 * step 4 and nothing on step 1 still has somewhere to show it.
 *
 * ⚠️ THE INTERVALS DO THE GROUPING, AND THEY WERE ALL 16 UNTIL THE LAYOUT PASS
 * ON 7 Sep 2026. One card per answer was right and identical spacing between
 * them was not: four frosted cards at one interval is four peers, and the
 * screen does not hold four peers. `What you noticed`, `Where you noticed it`
 * and `How long this has been going on` are three readings of ONE episode;
 * `Known skin conditions` was true before it started. So the episode closes to
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
        layout="card"
        tightTop
        /* ⚠️ THE FOOTER, WHERE THE FILLED STATE USES ITS OWN BLOCK. There are
           two short paragraphs above this and nothing else, so in the body the
           button sat in the upper third of the phone with 600px of canvas under
           it — the stranded action `HubScreen`'s `.footer` documents and solves
           with `margin-top: auto`. The filled state cannot use it: its button
           is half of a pair with the sentence above it, and the footer's own
           desktop width would break that sentence's measure. */
        footer={
          <Button href="/investigation/start" fullWidth>
            {COPY.emptyCta}
          </Button>
        }
      >
        <div className={styles.empty}>
          <p className={`${styles.emptyTitle} t-h5`}>{COPY.emptyTitle}</p>
          <p className={`${styles.emptyBody} t-body3-body2`}>{COPY.emptyBody}</p>
        </div>
      </HubScreen>
    );
  }

  /* ⚠️ THE TIMELINE COUNTS TOWARD THIS BLOCK NOW THAT IT HAS NO BLOCK OF ITS
     OWN. Step 4 answered on its own — a deep link, or a walk that skipped step
     1 — would otherwise have nowhere to appear at all. The block then renders
     as its heading and two meta lines, which `.blockLabel + .started` in the
     stylesheet already spaces correctly. */
  const hasNoticed = profile.symptoms.length > 0 || Boolean(profile.timeline);
  const hasLocation =
    profile.faceRegions.length > 0 || profile.otherLocations.length > 0;
  /* ⚠️ THE THREE FACETS OF ONE EPISODE, GROUPED BY PROXIMITY. What was noticed,
     where it was noticed and how long it has been going on are three readings
     of a single thing that is happening now; the known conditions are a
     standing fact about the skin that was true before it started. Spacing them
     all alike said they were four peers. The wrapper carries the tighter gap
     and nothing else — no heading, no border, no card. A label naming a group
     is what this screen deleted once already ("From your answers"), and it
     would be the same mistake at a smaller scale. */
  const hasEpisode = hasNoticed || hasLocation;

  return (
    <HubScreen
      title={COPY.headlineLabel}
      nav="my-skin"
      backHref="/investigation/timing"
      layout="card"
      tightTop
    >
      <Headline profile={profile} />

      {hasEpisode && (
        <div className={styles.blocks}>
          {hasNoticed && (
            <Block label={COPY.symptomsLabel} id="profile-symptoms">
              <TagList items={profile.symptoms} />
              {/* ⚠️ THE AGE OF THE SYMPTOMS, UNDER THE SYMPTOMS — moved off the
                  sage card 7 Sep 2026, asked for directly. Gated on the day
                  count rather than on the date, because the line only reads as
                  a span with both halves: `started` also carries "No start date
                  given" when step 4 was left blank, and `day` is null for that
                  and for a date in the future. Neither is worth a line: a recap
                  that says "Started: no start date given" is a screen reporting
                  on its own gaps. */}
              {profile.timeline?.day && (
                <p className={`${styles.started} t-body3`}>
                  {COPY.startedWord} {profile.timeline.started} ·{" "}
                  {profile.timeline.day}
                </p>
              )}
              {/* ⚠️ STEP 4's STATUS, AND IT IS A SEPARATE LINE RATHER THAN A
                  THIRD `·` SEGMENT ON THE ONE ABOVE. "Started Aug 31 · Day 8"
                  is one fact — a span — and the verb "Started" governs both
                  halves of it. "Getting worse" is a different fact about a
                  different moment, and hanging it off the same verb reads as
                  something the start did. */}
              {profile.timeline?.status && (
                <p className={`${styles.started} t-body3`}>
                  <span className={styles.startedWord}>{COPY.nowWord}: </span>
                  {profile.timeline.status}
                </p>
              )}
            </Block>
          )}

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
                  {/* ⚠️ THE DIAGRAM IS `aria-hidden` AND THIS LINE IS WHY. A
                      pill only means the left cheek because of where it sits,
                      which is worth nothing read aloud — so the picture is for
                      the eye and this sentence is the answer in words. Two ways
                      of saying one thing, never two announcements of it. The
                      non-face chips need no such line: they are a real list
                      inside the card and their labels mean what they say. */}
                  {profile.faceRegions.length > 0 && (
                    <p className="visually-hidden">
                      {COPY.locationSpoken(profile.faceRegions)}
                    </p>
                  )}
                  {/* ⚠️ THE CARD RENDERS EVEN WITH NOTHING PICKED ON THE FACE,
                      which happens when the only answer was "Neck" or "Other".
                      Seven dimmed pills and one lit chip under them is the
                      honest reading of that — NOT on the face, here instead —
                      where dropping the diagram would leave a chip with nothing
                      to be measured against. */}
                  <div className={styles.face}>
                    <FaceDiagram
                      readOnly
                      selected={profile.faceRegions}
                      otherLocations={profile.otherLocations}
                    />
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
          <Button href="/investigation/products" fullWidth>
            {COPY.cta}
          </Button>
        </div>
      </div>
    </HubScreen>
  );
}

/**
 * The sage statement — who the skin is.
 *
 * ⚠️ IDENTITY ONLY, AND IT HELD MORE FOR ABOUT AN HOUR ON 7 Sep 2026. A
 * supplied comp gave it two halves across a `border/glass` rule — the skin type
 * and tendencies above, `Current: <symptoms> on <places>` and
 * `Started <date> · Day <n>` below — and that was cut back the same day, asked
 * for directly. The rule, the current line and the date are all gone: the
 * symptoms are already drawn as themselves in the block under this card, and
 * the date now sits with them there, which is the only place it reads as the
 * age of those symptoms rather than as a date on its own. What is left is the
 * one thing this card can say that no block below it says — what the skin IS,
 * which is true between episodes.
 *
 * ⚠️ THE VALUES ARE 17px (`t-button`), NOT `t-h4` — asked for directly. It is
 * the only declared 17 in the ramp, so the size lands exactly where it was
 * asked for without a font-size written on a screen (non-negotiable 3). The
 * side effect worth knowing: `t-button` is REGULAR where `t-h4` was MEDIUM, so
 * the card is now quiet rather than the loudest thing on the page. That suits
 * what it is left holding.
 *
 * ⚠️ THE TWO MULTI-SELECTS IN HERE ARE JOINED STRINGS, NOT PILLS, AND THAT IS
 * NOW TWO OF THEM. The rule on this screen is that a multi-select is a SET and
 * gets `Tag`s — it still holds for the symptoms and the other locations, in the
 * light blocks. The card is the one place that trades the set for a glance, the
 * same trade `SkinProfileStrip` makes when it puts the profile on someone
 * else's screen in one line, and the trade is what lets three answers sit in
 * one short card instead of three. The conditions kept their pills right up
 * until they moved in here; a row of pills beside two lines of text would have
 * made the card look like two cards.
 *
 * ⚠️ AND IT DOES CARRY THE COMP'S OVERLINE, AFTER ALL — ASKED FOR, AFTER THE
 * FIRST BUILD LEFT IT OUT. The objection was that the h1 24px above it said the
 * same thing, and naming the page twice is what got "From your answers" deleted
 * from this screen. It was answered first by the word "Your" — the h1 names the
 * PAGE, the overline names what is in THIS CARD — and then settled outright
 * when the page title became `About your skin`. The card was also the only
 * block on the screen with nothing at the top of it saying what it held.
 */
function Headline({ profile }: { profile: ProfileRecap }) {
  const { skinType, tendencies, conditions } = profile;
  if (!skinType && tendencies.length === 0 && conditions.length === 0) {
    return null;
  }

  return (
    <DataCard className={styles.headline}>
      <p className={`${styles.cardLabel} t-overline`}>{COPY.cardLabel}</p>

      <div className={styles.identity}>
        <div className={styles.identityCol}>
          <p className={`${styles.headlineLabel} t-body3`}>
            {COPY.skinTypeLabel}
          </p>
          <p className={`${styles.headlineValue} t-button`}>
            {skinType ?? COPY.skinTypeUnknown}
          </p>
        </div>

        {tendencies.length > 0 && (
          <div className={`${styles.identityCol} ${styles.identityEnd}`}>
            <p className={`${styles.headlineLabel} t-body3`}>
              {COPY.tendenciesLabel}
            </p>
            <p className={`${styles.headlineValue} t-button`}>
              {tendencies.join(", ")}
            </p>
          </div>
        )}
      </div>

      {/* ⚠️ A THIRD ROW, NOT A THIRD COLUMN. `Known skin conditions` is the
          longest label on the card and its value can be a typed sentence (step
          3's "Other"), so squeezed into the identity row it would wrap on
          every phone. Full width under it, in the same label-over-value shape
          the two columns use. */}
      {conditions.length > 0 && (
        <div className={styles.identityCol}>
          <p className={`${styles.headlineLabel} t-body3`}>
            {COPY.conditionsLabel}
          </p>
          <p className={`${styles.headlineValue} t-button`}>
            {conditions.join(", ")}
          </p>
        </div>
      )}
    </DataCard>
  );
}

/** One light block: a name for what it holds, and the answer under it. */
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
    <section className={styles.block} aria-labelledby={id}>
      <h2 id={id} className={`${styles.blockLabel} t-overline`}>
        {label}
      </h2>
      {children}
    </section>
  );
}

/**
 * A multi-select answer, drawn as what it is.
 *
 * ⚠️ `Tag`, NOT `Chip`. A chip is a control with `role="checkbox"`; these are
 * labels the user cannot act on, and the design system's word for that is a
 * tag (`components/ui/Tag.tsx` says so in its first line). The `<ul>` is what
 * tells a screen reader how many there are.
 *
 * ⚠️ IT WEARS THE CHIP'S FILL AND HAIRLINE ALL THE SAME — asked for directly.
 * That is a fill and a border, not a role: nothing about what this element IS
 * has changed. See `.pill` in the stylesheet for why it is safe on THIS screen
 * and nowhere that mixes tags with chips.
 */
function TagList({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  return (
    <ul className={styles.tags}>
      {items.map((item) => (
        <li key={item}>
          <Tag className={styles.pill}>{item}</Tag>
        </li>
      ))}
    </ul>
  );
}
