"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import styles from "./CheckIn.module.css";
import { BottomNav } from "@/components/layout/BottomNav";
import { ChatPanel } from "@/components/layout/ChatPanel";
import { ChatBubble } from "@/components/ui/ChatBubble";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { SmallButton } from "@/components/ui/SmallButton";
import { Collapse } from "@/components/ui/Collapse";
import { Sheet } from "@/components/ui/Sheet";
import { CameraCapture } from "@/components/ui/CameraCapture";
import { CameraIcon, NoteIcon } from "@/components/ui/icons";
import { ConfirmField } from "@/components/ui/ConfirmField";
import { useInvestigation } from "@/lib/store/InvestigationProvider";
import { ProgressEmpty } from "./ProgressScreen";
import { useToday } from "@/lib/useToday";
import { useHeldWhileClosing } from "@/lib/useModalDialog";
import { symptomsOf, toggleMulti } from "@/lib/store/answers";
import { toIso } from "@/lib/date";
import {
  SKIN_TREND_CHOICES,
  checkInsFor,
  hasInvestigation,
  changeOptions,
  changeReply,
  latestCheckIn,
  progressView,
  recordCheckIn,
  severityAfter,
} from "@/features/progress/progress";

/** The daily check-in — `Check-in chat` (555:1268), at `/progress/check-in`. */
export function CheckIn({ now }: { now: number }) {
  const router = useRouter();
  const { answers } = useInvestigation();

  /* no investigation to check in on — the empty Progress hub says so */
  if (!hasInvestigation(answers)) return <ProgressEmpty />;

  return (
    <main className="screen" data-layout="panel">
      <CheckInPanel
        now={now}
        closeHref="/progress"
        onSubmitted={() => router.push("/progress")}
      />
      <BottomNav active="my-skin" />
    </main>
  );
}

/**
 * The conversation itself, without a page around it — the panel, its three
 * turns and the photo overlay.
 */
export function CheckInPanel({
  now,
  closeHref,
  onClose,
  onSubmitted,
  heading,
}: {
  now: number;
  /** the route form — the X is a link back to `/progress` */
  closeHref?: string;
  /** the overlay form — the X closes the overlay, going nowhere */
  onClose?: () => void;
  /** run after the check-in is written: navigate, or close */
  onSubmitted: () => void;
  heading?: ReactNode;
}) {
  const { answers, setAnswer } = useInvestigation();

  const [trend, setTrend] = useState<string | null>(null);
  const [changes, setChanges] = useState<string[]>([]);
  const [note, setNote] = useState<string | null>(null);
  const [photo, setPhoto] = useState(false);
  /** whether the capture overlay is open — separate from `photo`, which is
   *  whether a photo EXISTS. Closing the sheet must not discard the capture. */
  const [camera, setCamera] = useState(false);

  const choice = SKIN_TREND_CHOICES.find((c) => c.label === trend);

  /* The check-in is dated the VIEW's today, not a bare `new Date()`. They are
     the same day — but the view's is the one
     the calendar rings and the chart plots against, and reading the clock twice
     is how the two come to disagree. `useToday` is also the only safe way to
     ask: calling `new Date()` during render bakes a date into the prerender and
     hydrates a mismatch. See lib/useToday.ts. */
  const view = progressView(answers, useToday(now));
  const today = toIso(view.today);
  const alreadyToday = (answers.checkIns ?? []).some((c) => c.date === today);

  const series = checkInsFor(answers, view);
  const previous = latestCheckIn(series.filter((c) => c.date !== today));

  /** Turn 3 shows once turn 2 has an answer; Submit needs both. Turn 3 itself
   *  is optional — the comp asks "would you LIKE to", not "please do". */
  const askedExtras = changes.length > 0;
  const canSubmit = Boolean(choice) && askedExtras;

  /* shared by every scroll-into-view effect below */
  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const noteRef = useRef<HTMLInputElement>(null);
  const noteOpen = note !== null;
  const closeNote = () => setNote(null);
  /* the text the field shows while it closes — `note` is already null then */
  const noteShown = useHeldWhileClosing(noteOpen, note ?? "");
  useEffect(() => {
    if (!noteOpen) return;
    const input = noteRef.current;
    if (!input) return;
    const timer = window.setTimeout(() => {
      input.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "nearest" });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [noteOpen]);

  const turn2Ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!choice) return;
    turn2Ref.current?.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "nearest",
    });
  }, [choice]);

  const turn3Ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!askedExtras) return;
    const timer = window.setTimeout(() => {
      turn3Ref.current?.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "nearest",
      });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [askedExtras]);

  const pickTrend = (label: string) => {
    setTrend(label);
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
        direction: choice.direction,
        ...(note?.trim() ? { note: note.trim() } : {}),
        ...(photo ? { photo: "captured" } : {}),
      })
    );
    onSubmitted();
  };

  return (
    <>
      <ChatPanel
        closeHref={closeHref}
        onClose={onClose}
        closeLabel="Close check-in"
        modal={onClose !== undefined}
        heading={heading ?? <h1 className="visually-hidden">Daily Check-in</h1>}
        footer={
          <Button width="action"
            className={styles.submit}
            disabled={!canSubmit}
            onClick={submit}
          >
            Submit check-in
          </Button>
        }
      >
        {alreadyToday && (
          <p className={`${styles.note} t-caption`}>
            You have already checked in today, a new answer replaces it.
          </p>
        )}

        <div className={styles.chat}>
          {/* ---- turn 1 — how is it today, relative to last time ------------ */}
          <div className={styles.turn}>
            <ChatBubble from="ai" size="compact" hug>How is your skin doing today?</ChatBubble>

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
                  size="compact"
                  tone="teal"
                  label={label}
                  selected={trend === label}
                  onToggle={() => pickTrend(label)}
                />
              ))}
            </div>
          </div>

          {/* ---- turn 2 — what specifically changed ------------------------- */}
          {choice && (
            <div className={styles.turn} ref={turn2Ref}>
              <ChatBubble from="ai" size="compact" hug>
                  {changeReply(choice.direction)}
                </ChatBubble>

              <div
                className={styles.options}
                role="group"
                aria-label="Any specific changes you've noticed?"
                data-reveal
              >
                {changeOptions(choice.direction, symptomsOf(answers)).map(
                  (label) => (
                    <Chip
                      key={label}
                      size="compact"
                      tone="teal"
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
          <Collapse open={askedExtras}>
            <div className={styles.turn} ref={turn3Ref}>
              <ChatBubble from="ai" size="compact" hug>
                Would you like to add any notes or take a photo?
              </ChatBubble>

              <div className={styles.extras} data-reveal>
                <SmallButton
                  label="Add a note"
                  arrow={false}
                  icon={<NoteIcon />}
                  aria-pressed={note !== null}
                  onClick={() => {
                    if (note === null) {
                      setNote("");
                    } else {
                      closeNote();
                    }
                  }}
                />

                <SmallButton
                  label={photo ? "Retake photo" : "Take a photo"}
                  arrow={false}
                  icon={<CameraIcon />}
                  aria-pressed={photo}
                  onClick={() => setCamera(true)}
                />
              </div>

              <Collapse open={noteOpen}>
                {noteOpen && (
                  <ConfirmField
                    inputRef={noteRef}
                    value={noteShown}
                    onChange={(v) => setNote(v)}
                    onRemove={closeNote}
                    placeholder="Anything worth remembering about today"
                    label="Your note"
                    noun="note"
                  />
                )}
              </Collapse>

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
          </Collapse>
        </div>

      </ChatPanel>

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
    </>
  );
}
