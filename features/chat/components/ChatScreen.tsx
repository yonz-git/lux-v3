"use client";

import { useRef, useState } from "react";
import styles from "./ChatScreen.module.css";
import { BottomNav } from "@/components/layout/BottomNav";
import { ChatPanel } from "@/components/layout/ChatPanel";
import { ChatBubble } from "@/components/ui/ChatBubble";
import { SendArrowIcon } from "./icons";
import { SEEDED_CONVERSATION, type ChatMessage } from "@/features/chat/chat";

/**
 * Conversation — `chat-page / mobile` (270:96), at `/chat`.
 *
 * ⚠️ PROTOTYPE-ONLY, AND IT IS NOT ONE OF THE FOUR NAV SECTIONS. The frame is a
 * standalone exploration of what a free-text conversation with LUX looks like;
 * nothing in the app links to it and nothing reads what is typed into it. It is
 * here to be walked and looked at. `features/chat/` is therefore a FIFTH
 * feature folder against a rule that says there are four, one per nav item —
 * deliberately, because the alternative is filing a screen that belongs to no
 * section under one that it does not belong to. It gets a home or it gets
 * deleted; it does not quietly become `progress`'s.
 *
 * ⚠️ IT IS A PANEL, NOT A SCREEN. 375x538 with a 36 radius on all four corners
 * and its own gradient, where every other frame in the file is the 440x957
 * canvas. So it renders as a surface floating on `.screen`'s canvas gradient,
 * which is also the only reading under which its two header controls mean
 * anything: you collapse a panel, not a page.
 *
 *   header    the orb, `Hi, I'm LUX` and a close X
 *   body      the seeded exchange the frame draws
 *   composer  a frosted pill with a `gradient/brand` send disc
 *
 * ⚠️ NOTHING ON THIS SCREEN STATES A TIME ANY MORE, AND THE FRAME STATES TWO.
 * It drew per-message timestamps (10:32 / 10:34, at 10px) under a `Today`
 * divider; both were removed on request, in that order. What is left is an
 * exchange with no date at all — which is fine for two seeded turns and would
 * not be for a conversation with history, so this is the first thing to
 * revisit if the panel ever holds more than one day.
 *
 * Each removal took its data with it rather than leaving it unread:
 * `ChatMessage` no longer carries an `at`, `clockTime` is gone, and `DAY_LABEL`
 * went with the divider. If times come back, they come back in `chat.ts` first
 * — a timestamp is data before it is markup.
 *
 * ⚠️ THE BUBBLES TAKE THE FRAME'S SMALLER TYPE, VIA `size="compact"` — REVERSED
 * 5 Sep 2026, HAVING FIRST SHIPPED THE OTHER WAY. This frame sets its bubble
 * text at 14/20 where the published component (`Spec/Chat Bubble` 47:12) and
 * all nine GETTING STARTED frames set `Body 2` / `Body 1`. The first build gave
 * the component the win, reasoning that a bubble two steps smaller here than
 * everywhere else would be the drift; walked at 375 the panel says otherwise —
 * it is a 375 surface, not a 440 screen, and full-size bubbles in it leave the
 * conversation with almost no room to be a conversation. The frame was right
 * about its own panel. Asked for directly, and the change is the frame's.
 *
 * `t-body3` (14/22) is the nearest published style to the frame's 14/20; there
 * is no 20 line-height in the ramp, and rule 3 means a `t-*` class rather than
 * an ad-hoc `font-size`. The bubble's PADDING drops with the type — see
 * ChatBubble.module.css — and `--bubble-max` below drops by the same ratio, so
 * the bubble shrinks as a whole rather than just losing height.
 *
 * ⚠️ IT IS A VARIANT ON THE PUBLISHED COMPONENT, NOT A LOCAL OVERRIDE, and it
 * still needs raising in Figma — see ChatBubble.tsx. Everything else about the
 * bubble — the 30/1 tail corners, the two fills, the fill-plus-two-shadows
 * recipe with no stroke — the component already draws exactly as this frame
 * does.
 *
 * ⚠️ SENDING APPENDS YOUR MESSAGE AND LUX DOES NOT ANSWER. What LUX may say
 * about skin is governed by `docs/product-brief.md`'s controlled vocabulary,
 * and a canned reply written here to make the demo feel alive would put
 * unreviewed clinical-sounding copy in front of a user. The composer is real so
 * the interaction can be judged; the conversation is not simulated. See
 * `chat.ts`.
 *
 * ⚠️ THE SEND DISC IS NOT GATED ON THE FIELD, THOUGH EVERY OTHER PRIMARY
 * ACTION IN THE APP IS GATED ON ITS STEP. `Continue` is disabled until the step
 * is answered, so the disc was built the same way — and on this surface the 0.4
 * `opacity/disabled` fade ERASES IT. The disc is `gradient/brand` sage on a
 * sage panel; at 0.4 there is no disc, and the screen's RESTING state loses the
 * only affordance that says how to send. Measured on the crop, not guessed.
 *
 * The frame settles it: `chat-page / mobile` draws a full-strength disc beside
 * the placeholder, i.e. beside an EMPTY field. So the comp says this control is
 * not gated, and the `Continue` rule does not reach it — that rule is about
 * investigation steps and lives on the step in `flow.ts`, and a composer is not
 * a step. An empty submit is a no-op, the same as pressing Enter in an empty
 * field, which is what every chat composer does.
 *
 * ⚠️ THE CLOSE CONTROL IS AN X AND THE FRAME DRAWS A CHEVRON-DOWN — decided
 * here, 5 Sep 2026. A chevron-down is a DISCLOSURE glyph: it says the panel
 * folds away and can be unfolded, and pointed at a route change it promises a
 * state the app cannot return you to, since nothing links back to `/chat`. An X
 * says the thing goes away, which is what actually happens. It is also the DS's
 * own `CloseIcon` rather than a fourth chat-local glyph, and it takes the
 * control onto `size/icon-xs` (16) from the frame's off-scale 14.
 *
 * ⚠️ THE KEBAB IS GONE, THOUGH THE FRAME DRAWS ONE — removed on request, and
 * it is the better end of an argument this file already had. It shipped
 * DISABLED because no flow anywhere defines what it opens, and a dead control
 * is a promise the app does not keep; deleting it keeps the promise honestly
 * instead. Closing DOES have an obvious destination — the prototype leads on
 * flow — so the X remains and goes to Welcome.
 *
 * The X is now the only thing on the right, so the header is one control each
 * side. `MoreVerticalIcon` went with it: it was drawn for this button and had
 * no other caller.
 *
 * ⚠️ NOTHING ANIMATES ITSELF. Each bubble runs `ChatBubble`'s own
 * `bubble-enter` because it is newly mounted, and the panel arrives on the
 * global `[data-reveal]` hook. This file names no animation, which is what
 * keeps it clear of the "a rule that NAMES an animation may not live in a CSS
 * module" trap.
 */
export function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>(SEEDED_CONVERSATION);
  const [draft, setDraft] = useState("");
  /* the last row, so a sent message scrolls itself into view — the body is the
     scroller, not the page */
  const tail = useRef<HTMLDivElement>(null);

  const send = () => {
    /* the no-op on empty — see the note above on why the disc is not disabled */
    if (draft.trim() === "") return;
    setMessages((prev) => [
      ...prev,
      { id: `sent-${prev.length}`, from: "user", text: draft.trim() },
    ]);
    setDraft("");
    /* after the append has painted */
    requestAnimationFrame(() =>
      tail.current?.scrollIntoView({ block: "end", behavior: "smooth" })
    );
  };

  return (
    <main className="screen" data-layout="panel">
      <ChatPanel
        closeHref="/"
        closeLabel="Close conversation"
        footer={
          <form
            className={styles.composer}
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            {/* no visible label in the design — the placeholder is not a name */}
            <input
              type="text"
              className={`${styles.input} t-body2`}
              value={draft}
              placeholder="Type here..."
              aria-label="Message LUX"
              onChange={(e) => setDraft(e.target.value)}
              autoComplete="off"
            />
            <button
              type="submit"
              className={styles.send}
              aria-label="Send message"
            >
              <SendArrowIcon />
            </button>
          </form>
        }
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={styles.messageRow}
            data-from={message.from}
          >
            <ChatBubble
              from={message.from}
              size="compact"
              full
              className={styles.bubble}
            >
              {message.text}
            </ChatBubble>
          </div>
        ))}
        <div ref={tail} aria-hidden="true" />
      </ChatPanel>

      {/* the nav is fixed and identical on every screen. `none` because this
          panel belongs to no section — the same state Welcome uses. */}
      <BottomNav active="none" />
    </main>
  );
}
