"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./CheckIn.module.css";
import { HubScreen } from "./HubScreen";
import { ChatBubble } from "./ChatBubble";
import { Chip } from "./Chip";
import { Button } from "./Button";
import { TextField } from "./TextField";
import { Sheet } from "./Sheet";
import { CameraCapture } from "./CameraCapture";
import { CameraIcon, NoteIcon } from "./icons";
import { useInvestigation } from "./InvestigationProvider";
import { toggleMulti } from "@/lib/answers";
import { toIso } from "@/lib/date";
import {
  NO_CHANGE,
  SKIN_TREND_CHOICES,
  checkInsFor,
  changeOptions,
  changeReply,
  latestCheckIn,
  progressView,
  recordCheckIn,
  severityAfter,
} from "@/lib/progress";

/**
 * The daily check-in — `Check-in chat` (555:1268), at `/progress/check-in`.
 *
 * A chat that builds itself one turn at a time as the user taps a pill:
 *
 *   AI   Hi! How is your skin doing today?
 *        ( Much better · Slightly better · About the same · … )   one
 *   AI   That's good to hear! Any specific changes you've noticed?
 *        ( Less redness · Less itching · Less dryness · No change ) many
 *   AI   Would you like to add any notes or take a photo?
 *        [ Add a note ]  [ Take a photo ]                          optional
 *   [ Submit check-in ]
 *
 * ⚠️ THE SELECTED CHIP STAYS IN PLACE — there is no "user bubble" echo of the
 * answer. An earlier build replaced each answered row with a `from="user"`
 * bubble; the comp does not, and the comp is right. The pills ARE the record of
 * what was said, changing your mind is just tapping a different one, and a
 * bubble that repeats a word already on screen two rows up is a second copy of
 * the same fact. (`ChatBubble`'s `from="user"` styling is therefore still
 * unused by any screen — it has been since the component was written.)
 *
 * ⚠️ THE ANSWERS BUILD THE SCREEN — NO TIMER, NO STEP INDEX. A turn renders
 * because the one above it has been answered. Nothing here schedules anything,
 * and there is no cursor to keep in sync with the answers.
 *
 * ⚠️ NOTHING ANIMATES ITSELF. Each bubble runs `ChatBubble`'s own
 * `bubble-enter` because it is newly mounted; each pill row uses the global
 * `[data-reveal]` hook. Mounting IS the reveal, so this screen names no
 * animation of its own — which is also what keeps it clear of the "a rule that
 * NAMES an animation may not live in a CSS module" trap.
 *
 * ⚠️ TURN 2 IS CONDITIONAL ON TURN 1, and re-answering turn 1 re-asks it.
 * "That's good to hear!" cannot follow "Much worse", so the reply and the chips
 * both switch on direction (`changeReply` / `changeOptions`). Switching from
 * better to worse therefore invalidates any changes already picked, and they
 * are cleared rather than left reading "Less redness" under "Sorry to hear
 * that".
 *
 * ⚠️ TWO THINGS IN THE COMP ARE DELIBERATELY NOT REPRODUCED, both open
 * questions rather than oversights — see the header note and the nav note in
 * AGENTS.md:
 *   · the header's `Save & exit`, which the frame draws WITHOUT a progress
 *     track. That pair is the investigation flow's signature and this screen is
 *     a daily action off a hub, so it has neither.
 *   · the nav lighting `Check`. The frame carries the OLD three-item nav, and
 *     `/check` is the product compatibility check, which cannot reach this
 *     screen. Nav reads `progress`, the section that links here and the only
 *     one that reads a check-in back.
 *
 * ⚠️ NOTHING IS PRE-SELECTED, INCLUDING ON A DAY ALREADY RECORDED. The comp
 * shows "Slightly better", "Less redness" and "Less itching" already chosen
 * because a comp has to show a filled-in screen; the prototype starts empty and
 * always opens on turn 1. Re-answering REPLACES the day's entry
 * (`recordCheckIn`), and the screen says so in a caption.
 */
export function CheckIn() {
  const router = useRouter();
  const { answers, setAnswer } = useInvestigation();

  const [trend, setTrend] = useState<string | null>(null);
  const [changes, setChanges] = useState<string[]>([]);
  const [note, setNote] = useState<string | null>(null);
  const [photo, setPhoto] = useState(false);
  /** whether the capture overlay is open — separate from `photo`, which is
   *  whether a photo EXISTS. Closing the sheet must not discard the capture. */
  const [camera, setCamera] = useState(false);

  const choice = SKIN_TREND_CHOICES.find((c) => c.label === trend);

  /* The check-in is dated the VIEW's today, not `new Date()`. During a demo walk
     that is the frozen 17 Aug 2026, so the new point joins the seeded series
     three days after its last one instead of stranding itself weeks to the right
     of a chart it cannot connect to. Once step 4 is answered the clock is real
     and so is this date. See lib/progress.ts — and note the real branch cannot
     render on the server, which is what keeps `new Date()` out of the prerender. */
  const view = progressView(answers);
  const today = toIso(view.today);
  const alreadyToday = (answers.checkIns ?? []).some((c) => c.date === today);

  /* ⚠️ THE BASELINE COMES FROM THE SERIES THE CHART PLOTS, not from
     `answers.checkIns`. In demo mode the store holds NOTHING — the five seeded
     check-ins live in `lib/progress.ts` and are merged in by `checkInsFor` — so
     reading the store gave no previous severity, `severityAfter` fell back to
     mid-scale, and answering "Slightly better" after a seeded 1 plotted a 3.
     The chart then showed the line going UP directly under the words "Slightly
     better". Better than WHAT has exactly one right answer: the last point the
     user can see. */
  const series = checkInsFor(answers, view);
  const previous = latestCheckIn(series.filter((c) => c.date !== today));

  /** Turn 3 shows once turn 2 has an answer; Submit needs both. Turn 3 itself
   *  is optional — the comp asks "would you LIKE to", not "please do". */
  const askedExtras = changes.length > 0;
  const canSubmit = Boolean(choice) && askedExtras;

  const pickTrend = (label: string) => {
    setTrend(label);
    /* the chips below are about to change vocabulary — see the note above */
    setChanges([]);
  };

  const submit = () => {
    if (!choice || !canSubmit) return;

    setAnswer("checkIns", (prev) =>
      recordCheckIn(prev ?? [], {
        date: today,
        /* relative in, absolute out — SKIN_TREND_CHOICES explains why. The
           baseline excludes TODAY, so re-answering measures from the same place
           the first answer did rather than compounding on top of itself. */
        severity: severityAfter(previous, choice.delta),
        changes,
        ...(note?.trim() ? { note: note.trim() } : {}),
        ...(photo ? { photo: "captured" } : {}),
      })
    );
    router.push("/progress");
  };

  return (
    <HubScreen
      title="Daily Check-in"
      backHref="/progress"
      nav="progress"
      layout="card"
      footer={
        /* ⚠️ ALWAYS RENDERED, DISABLED UNTIL COMPLETE — which is what the comp
           draws (it shows the button greyed while the chat is part-answered),
           and what every other primary action in the app does. An earlier build
           withheld the button entirely until the end; that is a different
           control pattern from the rest of the product for no reason the comp
           supports. */
        <Button className={styles.submit} disabled={!canSubmit} onClick={submit}>
          Submit check-in
        </Button>
      }
    >
      {alreadyToday && (
        <p className={`${styles.note} t-caption`}>
          You have already checked in today — a new answer replaces it.
        </p>
      )}

      <div className={styles.chat}>
        {/* ---- turn 1 — how is it today, relative to last time ------------ */}
        <div className={styles.turn}>
          {/* ⚠️ NOT `aria-hidden`, unlike 00 Welcome's bubble. Welcome marks
              its question up as the page <h1> as well, so hiding the bubble
              stops it being read twice. Here the <h1> is HubScreen's "Daily
              Check-in" — a different string — so each question exists only in
              its bubble and has to be announced. */}
          <ChatBubble from="ai">Hi! How is your skin doing today?</ChatBubble>

          <div
            className={styles.options}
            role="radiogroup"
            aria-label="How is your skin doing today?"
            data-reveal
          >
            {SKIN_TREND_CHOICES.map(({ label }) => (
              <Chip
                key={label}
                control="radio"
                label={label}
                selected={trend === label}
                onToggle={() => pickTrend(label)}
              />
            ))}
          </div>
        </div>

        {/* ---- turn 2 — what specifically changed ------------------------- */}
        {choice && (
          <div className={styles.turn}>
            <ChatBubble from="ai">{changeReply(choice.direction)}</ChatBubble>

            <div
              className={styles.options}
              role="group"
              aria-label="Any specific changes you've noticed?"
              data-reveal
            >
              {changeOptions(choice.direction, answers.start ?? []).map(
                (label) => (
                  <Chip
                    key={label}
                    label={label}
                    selected={changes.includes(label)}
                    /* `No change` is an EXCLUSIVE option, so toggleMulti
                       clears the rest when it is picked and vice versa — the
                       same rule 02c's "None" follows. It had to be ADDED to
                       `EXCLUSIVE_OPTIONS` for that: the list is the only place
                       exclusivity is declared, and until this screen no group
                       had used this particular word. */
                    onToggle={() =>
                      setChanges((prev) => toggleMulti(prev, label))
                    }
                  />
                )
              )}
            </div>
          </div>
        )}

        {/* ---- turn 3 — optional note and photo --------------------------- */}
        {askedExtras && (
          <div className={styles.turn}>
            <ChatBubble from="ai">
              Would you like to add any notes or take a photo?
            </ChatBubble>

            <div className={styles.extras} data-reveal>
              {/* ⚠️ TOGGLES, NOT LINKS. The comp draws two buttons and no
                  destination for either, and routing away mid-chat would lose
                  the conversation — the store holds no partial check-in. So
                  "Add a note" reveals a field in place and "Take a photo"
                  arms the capture, which is a placeholder for the same reason
                  every other viewfinder in the app is: wiring getUserMedia
                  would make the prototype demand a camera permission to walk a
                  flow. See AGENTS.md, Camera shutter. */}
              <button
                type="button"
                className={`${styles.extra} t-label`}
                aria-pressed={note !== null}
                onClick={() => setNote((prev) => (prev === null ? "" : null))}
              >
                <NoteIcon />
                Add a note
              </button>

              <button
                type="button"
                className={`${styles.extra} t-label`}
                aria-pressed={photo}
                onClick={() => setCamera(true)}
              >
                <CameraIcon />
                {photo ? "Retake photo" : "Take a photo"}
              </button>
            </div>

            {note !== null && (
              <TextField
                autoFocus
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Anything worth remembering about today"
                aria-label="Your note"
              />
            )}

            {photo && (
              <p className={`${styles.captured} t-caption`} role="status">
                Photo captured.{" "}
                <button
                  type="button"
                  className={styles.remove}
                  onClick={() => setPhoto(false)}
                >
                  Remove
                </button>
              </p>
            )}
          </div>
        )}
      </div>

      {/* ⚠️ AN OVERLAY, NOT A ROUTE — the capture happens ON this screen. The
          products tray already does exactly this for its scan view, and the
          reason is the same: routing away mid-chat would lose the conversation,
          because the store holds no partial check-in. `Sheet` brings the scrim,
          the focus trap, Escape and the mobile-sheet / desktop-dialog pair with
          it, so the overlay is the app's existing modal rather than a second
          one invented here.

          `Done` is the sheet's own and only dismissal (see Sheet.tsx), and it
          is honest here for the same reason it is there: a photo taken stays
          taken when the overlay closes. Removing it is a separate control in
          the chat. */}
      <Sheet open={camera} onClose={() => setCamera(false)} title="Take a photo">
        <div className={styles.camera}>
          <CameraCapture
            captured={photo}
            title="Take a photo of the affected area."
            helper={
              photo
                ? "Tap the shutter again to retake."
                : "Frame the area you are tracking and tap to capture."
            }
            onCapture={() => setPhoto((prev) => !prev)}
          />
        </div>
      </Sheet>
    </HubScreen>
  );
}
