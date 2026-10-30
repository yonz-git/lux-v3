"use client";

import { type CSSProperties, useId, useState } from "react";
import styles from "./StartInvestigation.module.css";
import { QuestionScreen } from "./QuestionScreen";
import { SymptomPlacer } from "./SymptomPlacer";
import { Button } from "@/components/ui/Button";
import { ChatBubble } from "@/components/ui/ChatBubble";
import { Orb } from "@/components/ui/Orb";
import { CameraIcon } from "@/components/ui/icons";
import { SelfieSheet } from "./SelfieSheet";

/**
 * 01 + 03b combined — Start investigation and Location on one screen. Step 1/5.
 *
 * ⚠️ THIS IS A PROTOTYPE-ONLY MERGE, NOT YET REFLECTED IN FIGMA. The two
 * questions were separate frames (01 `476:2542`/`476:2670` and 03b
 * `476:2802`/`476:2934`); per the "Figma first" rule this combination needs a
 * matching Figma frame before it is really done. Both frame ids are kept below
 * so the next person can find what each half came from. Location was already
 * moved to immediately follow Start ahead of this merge — see the STEPS
 * comment in `lib/flow.ts`.
 *
 * Symptoms are CHIPS because they are short multi-select labels — that is the
 * documented use for Chip, and it must not be "normalised" to rows.
 *
 * ⚠️ NO CHAT BUBBLE ASKS "Where on your face did this happen?" — on its own
 * screen Location needed the question spelled out, but stacked directly under
 * the symptom picker the face diagram reads as the obvious next thing to fill
 * in. Adding the bubble back here would just repeat what the layout already
 * says.
 *
 * ⚠️ "Take a photo" OPENS AN OVERLAY, IT DOES NOT NAVIGATE — decided here, not
 * in Figma. The selfie capture used to be `/investigation/selfie`, a routed
 * screen that shared this step's number so the track did not move. A sub-step
 * that is really an aside to the question on screen is what the modal tray is
 * for: routing away scrolled the symptoms and regions just picked out of
 * sight, and the capture is one tap. See `components/SelfieSheet.tsx`.
 *
 * ⚠️ THIS SCREEN CARRIES THE APP'S ONLY SAFETY MESSAGE. Ticking `Swelling` or
 * `Rash` — the two symptoms on this screen that appear on the product brief's
 * § 03E trigger list — reveals `SafetyNotice` under the chip grid. It does NOT
 * interrupt the flow and does NOT gate Continue: LUX states what it cannot see
 * and hands the severity judgement to the reader, rather than performing a
 * triage it is not qualified to perform. `features/my-skin/safety.ts` owns the
 * rule, the trigger set and the copy, and carries the full reasoning.
 *
 * ⚠️ THE PLACES ARE ASKED ONE SYMPTOM AT A TIME — NOT IN FIGMA, asked for
 * directly 14 Sep 2026. The chips and the face used to be two independent
 * multi-selects, so the answer could only say "these symptoms, somewhere in
 * these places": the pairing was never collected, so nothing could show it. A
 * symptom and its places are one answer now (`start`, a map — see
 * `lib/store/answers.ts`), and the screen collects them together:
 *
 *   idle      every symptom chip is available; the face shows every place
 *             marked so far, and the rest wait at `opacity/disabled`
 *   placing   the picked chip is lit; every region label shines once,
 *             together, and the face takes taps for this symptom alone.
 *             Picking another chip moves the placing to it
 *
 * ⚠️ `Save` AND `Reset` WERE REMOVED AFTER USABILITY TESTING, 29 Oct 2026. A
 * symptom is saved the moment it has a place and unsaved by tapping its lit
 * chip again; `Reset all` is the only button left. Chips are never disabled
 * while another symptom is placed.
 *
 * ⚠️ PLACES ARE WRITTEN AS THEY ARE TAPPED, NOT ON `Save`. `Save` only closes
 * the symptom, so nothing marked is lost to a Continue, a Back or a reload
 * taken mid-symptom, and `isComplete` stays a rule about the ANSWER rather than
 * about this screen's local state. The first place tapped creates the entry and
 * removing the last one deletes it (`withAreas`), so a stored symptom always
 * has somewhere to be. The recap and PROGRESS still read the union
 * (`areasOf`) until they are redrawn to use the pairing.
 *
 * ⚠️ TWO TAPS THE REQUEST DID NOT SPECIFY, DECIDED HERE: tapping the chip being
 * placed DESELECTS it and its places, which is what tapping a lit chip always
 * meant; tapping a chip that is already marked REOPENS it, so its places can be
 * changed without starting it again. `Whole face`, `Neck`
 * and `Other` are places of a symptom like any region. The typed description under the card stays ONE
 * sentence for the screen.
 *
 * ⚠️ THE TYPED DESCRIPTION IS CONFIRMED, THEN SHOWN — NOT IN FIGMA, asked for
 * directly 14 Sep 2026. The field carries ✓ before its ✕ (Enter is ✓, Escape is
 * ✕), and a confirmed sentence becomes a frosted row with a pen that reopens
 * the field and a ✕ that still removes it. ✓ on an empty field is ✕: there is
 * nothing to keep. Whether the field is open is local state that starts
 * closed, so a description restored from the store arrives as the confirmed
 * row rather than as an open field.
 *
 * ⚠️ lux-v3 (1 Oct 2026, the canvas boards): THE QUESTION LEADS AGAIN, IN ITS
 * PANEL, AND THE FACE CARD FOLLOWS IT. The panel holds the question, the
 * instruction and the symptom chips. ⚠️ `Save`, `Reset` and `Reset all` sit
 * UNDER THE FACE CARD in one glass pill, v2's layout — asked for directly the
 * same day, after the board's places row inside the panel was built. The
 * picked symptom is the app's indigo chip, no longer the rose
 * `bg/symptom` (the canvas drew it indigo; the face's callouts keep the rose).
 * The typed description and `Take a photo` were not on the board and stay,
 * under the face card: they are answers, not decoration.
 *
 * NOTHING starts selected. The Figma frames show options already chosen
 * because a comp has to show a filled-in state; the prototype starts empty and
 * Continue stays disabled until a symptom has at least one place marked.
 *
 */
/* ⚠️ `SYMPTOMS` MOVED TO `features/my-skin/safety.ts` AND THAT IS NOT A TIDY-UP.
   Two of these chips — Swelling and Rash — are the only members of the product
   brief's § 03E trigger list this screen collects, and the safety notice keys
   off them. Kept in two files, renaming a chip here would leave the notice
   quietly never firing again, with nothing in this file to say so. In one file
   the trigger set is typed as a subset of the list and the same rename is a
   compile error. */

export function StartInvestigation() {
  const instructionId = useId();
  const [photoOpen, setPhotoOpen] = useState(false);

  return (
    <QuestionScreen id="start" gapBeforeContinue={48} tightTop>
      {/* ⚠️ AN `<h2>`, NOT AN `<h1>` — the step's own title is the page's one
          `<h1>`, rendered by `QuestionScreen` (visually hidden here). This is a
          question WITHIN that step, so it is a level down. Marking both as
          `<h1>` gave a screen reader two — on `skin-type`, three — peer page
          titles with nothing saying the questions belong to the step. The
          `t-h4-h3` class carries every visual property, so the tag change moves
          nothing on screen. */}
      <h2 className={`${styles.question} t-h4-h3`}>
        What is currently happening to your skin?
      </h2>

      {/* ⚠️ THE INSTRUCTION IS LUX TALKING NOW — 3 Oct 2026, asked for directly
          ("this part is bugging me, how about a cute side chat bubble that
          pops"). It was a centred line of secondary body copy under the
          question. It is now a small orb with an AI bubble beside it, left
          aligned over the face card, popping from its tail corner a beat
          after the question lands (`.bubble-enter` with a delay). The id
          stays on the words, so the face's `aria-describedby` still reads
          them. */}
      <div className={styles.coach}>
        {/* the chat's orb (`animateIn halo`, as ChatPanel's 50), at 40 */}
        <Orb size="40px" animateIn halo className={styles.coachOrb} />
        <ChatBubble from="ai" hug className={styles.coachBubble}>
          <span id={instructionId}>
            Pick a symptom, then tap where it shows on your face.
          </span>
        </ChatBubble>
      </div>

      <SymptomPlacer describedBy={instructionId} summary />

      <Button
        variant="secondary"
        size="md"
        onClick={() => setPhotoOpen(true)}
        icon={<CameraIcon />}
        className={styles.takePhoto}
        data-motion="rise-self"
        style={{ "--rise-delay": "320ms" } as CSSProperties}
      >
        Take a photo
      </Button>

      <SelfieSheet open={photoOpen} onClose={() => setPhotoOpen(false)} />
    </QuestionScreen>
  );
}
