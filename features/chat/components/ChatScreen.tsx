"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import styles from "./ChatScreen.module.css";
import { BottomNav } from "@/components/layout/BottomNav";
import { ChatBubble } from "@/components/ui/ChatBubble";
import { Orb } from "@/components/ui/Orb";
import { CloseIcon } from "@/components/ui/icons";
import { MoreVerticalIcon, SendArrowIcon } from "./icons";
import {
  DAY_LABEL,
  SEEDED_CONVERSATION,
  clockTime,
  type ChatMessage,
} from "@/features/chat/chat";

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
 *   header    the orb, `Hi, I'm LUX`, a kebab and a close X
 *   body      a `Today` divider, then the seeded exchange the frame draws
 *   composer  a frosted pill with a `gradient/brand` send disc
 *
 * ⚠️ THE BUBBLES ARE `ChatBubble`, AT THE COMPONENT'S TYPE AND NOT THE FRAME'S.
 * This frame sets its bubble text at 14/20; the design-system component
 * (`Spec/Chat Bubble` 47:12) and all nine GETTING STARTED frames set it at
 * `Body 2` / `Body 1`, which is what `t-body2-body1` is. Two Figma sources
 * disagree and the published component wins — a chat bubble two steps smaller
 * here than everywhere else in the product would be the drift, not the fix.
 * Everything else about the bubble — the 30/1 tail corners, the two fills, the
 * fill-plus-two-shadows recipe with no stroke — the component already draws
 * exactly as this frame does.
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
 * ⚠️ THE KEBAB HAS NO BEHAVIOUR AND IS RENDERED DISABLED. The frame draws the
 * control and no flow anywhere defines what it opens. A focusable button that
 * does nothing, or an `aria-haspopup` pointing at a menu that does not exist,
 * are both worse than saying so. Closing DOES have an obvious destination —
 * the prototype leads on flow — so the X goes to Welcome.
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
      {
        id: `sent-${prev.length}`,
        from: "user",
        text: draft.trim(),
        /* the real clock, which only ever runs after an interaction and so
           cannot reach the prerender — see chat.ts */
        at: clockTime(new Date()),
      },
    ]);
    setDraft("");
    /* after the append has painted */
    requestAnimationFrame(() =>
      tail.current?.scrollIntoView({ block: "end", behavior: "smooth" })
    );
  };

  return (
    <main className="screen">
      <div className={styles.panel} data-reveal>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.avatar}>
              <Orb size="50px" />
            </span>
            {/* `Body 1` (18/28, regular) — the frame's 18px title. It is not a
                page heading: the panel is a surface inside the page, and the
                greeting names the speaker rather than the screen. */}
            <p className="t-body1">Hi, I&rsquo;m LUX</p>
          </div>

          <div className={styles.headerRight}>
            <button
              type="button"
              className={`${styles.headerButton} ${styles.menu}`}
              aria-label="Conversation options"
              disabled
            >
              <MoreVerticalIcon />
            </button>
            <Link
              href="/"
              className={`${styles.headerButton} ${styles.close}`}
              aria-label="Close conversation"
            >
              <CloseIcon />
            </Link>
          </div>
        </div>

        <div className={styles.body}>
          {/* ⚠️ `t-label-sm` (12/16) AGAINST THE FRAME'S 11. There is no 11 in
              the ramp and rule 3 is that every piece of text takes a `t-*`
              class, so the nearest published style wins over an ad-hoc
              font-size. Same call as the timestamps below, which are drawn at
              10. Both are in docs/figma-catchup.md. */}
          <div className={`${styles.divider} t-label-sm`}>{DAY_LABEL}</div>

          {messages.map((message) => (
            <div key={message.id} className={styles.messageRow} data-from={message.from}>
              <ChatBubble from={message.from} full className={styles.bubble}>
                {message.text}
              </ChatBubble>
              {/* a plain paragraph rather than `<time>`: the seeded rows carry
                  the comp's printed strings and no machine-readable datetime to
                  put in the attribute, and a `<time>` without one is worth
                  nothing to a screen reader. */}
              <p className={`${styles.timestamp} t-label-sm`}>{message.at}</p>
            </div>
          ))}
          <div ref={tail} aria-hidden="true" />
        </div>

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
          <button type="submit" className={styles.send} aria-label="Send message">
            <SendArrowIcon />
          </button>
        </form>
      </div>

      {/* the nav is fixed and identical on every screen. `none` because this
          panel belongs to no section — the same state Welcome uses. */}
      <BottomNav active="none" />
    </main>
  );
}
