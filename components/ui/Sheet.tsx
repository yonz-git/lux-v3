"use client";

import { useEffect, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import styles from "./Sheet.module.css";
import { CloseIcon } from "./icons";
import { useDialogFocus, useDialogPresence } from "@/lib/useModalDialog";

/**
 * The modal tray — Figma `04 — Add product · method sheet` (576:1376) on mobile
 * and `04 — Add product · method dialog — desktop` (583:1786).
 *
 * ONE component, two shapes: a bottom sheet docked to the frame's bottom edge
 * below 1024, a centred dialog above it. That is the documented LUX recipe, not
 * a responsive convenience.
 *
 * ⚠️ IT IS SAGE, NOT LIGHT. `Bottom Sheet` (255:91) is `surface/data` with
 * WHITE text even on a light screen — the surface follows the component, not the
 * section. PRODUCTS is otherwise surface system A throughout.
 *
 * ⚠️ THE BLUR IS NOT OPTIONAL. `surface/data-strong` is 62% translucent, so
 * without a backdrop blur the nav and the CTA read straight through the tray.
 *
 * ⚠️ THIS IS THE ONE PLACE THE NAV IS NOT THE TOPMOST LAYER. `--z-sheet` (400)
 * sits above `--z-nav` (200): the tray covers the nav by design. Any sweep that
 * asserts "the nav is on top" must exempt a screen showing a sheet.
 *
 * The design system has no Bottom Sheet with a blur and no scrim token, so this
 * is composed from the recipe rather than instanced. See AGENTS.md.
 *
 * ⚠️ RADIX DIALOG IS UNDERNEATH, AS OF 4 Oct 2026 — asked for directly. The
 * scrim is `Dialog.Overlay`, the tray `Dialog.Content`, the portal
 * `Dialog.Portal`: Radix runs the focus trap, Escape, the press on the scrim,
 * the page's scroll lock and hiding the rest of the page from assistive tech.
 * Every pixel is still this file's and the CSS's — Radix ships no styles.
 * `forceMount` keeps both nodes up for the exit, which `useDialogPresence`
 * times; see `lib/useModalDialog.ts` for the two focus behaviours put back.
 *
 * ⚠️ IT RENDERS IN A PORTAL ON `document.body`, AND IT HAS TO. `position:
 * fixed` is relative to the viewport only while no ancestor establishes a
 * containing block — and `backdrop-filter` does, exactly like `transform` and
 * `filter`. Every tray in the app opens from inside `QuestionScreen`'s card,
 * which is a frosted surface with `blur(32px)` on it, so the desktop dialog's
 * `top: 50%` centred it in THAT CARD rather than the viewport: measured at
 * 1238x875 the tray's top edge sat at y = −41, hanging off the top of the
 * screen with its heading cut away, while the scrim covered the card instead of
 * the page. A portal takes the tray out of the frosted subtree; nothing about
 * the recipe changes.
 *
 * ⚠️ THE BACK CHEVRON IS GONE, AND `Done` IS THE TRAY'S ONLY DISMISSAL. The
 * tray used to carry an `onBack` chevron in a header row of its own, so a
 * multi-view tray had TWO ways out that did different things — a chevron at the
 * top that stepped back one view, and a `Cancel` at the bottom of the method
 * view only that closed the whole thing. Every other view had no visible way
 * out at all. One dismissal, in one place, on every view: it is rendered HERE
 * rather than by each view, so a new view cannot ship without one.
 *
 * ⚠️ IT READS `Done`, NOT `Cancel`. `Cancel` promised to undo, and the button
 * does not: every view that reaches it has already committed — a product added
 * on the `added` view stays added when the tray closes. Naming the sole exit
 * after an undo it never performed was the misleading half. `Done` describes
 * what it does. Escape and the scrim run the same `onClose`.
 *
 * ⚠️ THE GRABBER DRAGS, AS OF 13 Sep 2026 — it was a drawn bar with no
 * behaviour, which is a promise on a phone: every OS sheet with that bar
 * closes by pulling it down. Drag it past a quarter of the tray's height, or
 * flick it, and the tray slides out and runs `onClose`; short of that it
 * springs back. ⚠️ ONLY THE GRABBER, NOT THE TRAY: the tray scrolls and its
 * views hold targets (the selfie viewfinder, results lists), so a drag started
 * there is theirs. The grabber stays `aria-hidden` — it is a pointer shortcut
 * to `Done`, which remains the one labelled dismissal (WCAG 2.5.1).
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
  className,
  dismissLabel = "Done",
  dismiss = "label",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** added to the tray, for a caller that needs to adjust its own dialog */
  className?: string;
  /** the words on the tray's one way out — `Done` unless a caller's close
   *  means something else (CHECK's basket says `Cancel`) */
  dismissLabel?: string;
  /** ⚠️ WHERE THE ONE WAY OUT SITS — added 15 Sep 2026, asked for directly
   *  on PROGRESS's photo gallery ("remove done and add x top right corner").
   *  `label` is the worded button at the tray's foot, every other tray's;
   *  `corner` is a labelled ✕ pinned to the top-right instead, for a tray
   *  whose content is a viewer rather than a task. Still exactly ONE dismissal
   *  either way — the rule the doc comment above exists to keep. */
  dismiss?: "label" | "corner";
}) {
  const trayRef = useRef<HTMLDivElement>(null);

  /* ⚠️ `present` OUTLIVES `open` BY THE LENGTH OF THE EXIT — see
     `useDialogPresence`. The tray used to leave in one frame after a 320ms
     entrance. Every behaviour still keys off `open`: Radix stops treating the
     dialog as modal the moment the user closes it, and only its painting
     lingers. */
  const { present, leaving } = useDialogPresence(open);
  const focus = useDialogFocus(open, trayRef);

  /* The drag writes the tray's transform inline, frame by frame — state would
     re-render the whole tray on every pointermove. */
  const drag = useRef<{ startY: number; lastY: number; lastT: number; v: number } | null>(null);

  /* a tray re-opened before its exit finished is the same node, still carrying
     the drag's inline transform */
  useEffect(() => {
    const tray = trayRef.current;
    if (open && tray) {
      tray.style.transform = "";
      tray.style.transition = "";
    }
  }, [open]);

  function onGrabStart(e: React.PointerEvent<HTMLSpanElement>) {
    if (leaving || e.button !== 0 || !trayRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { startY: e.clientY, lastY: e.clientY, lastT: e.timeStamp, v: 0 };
    trayRef.current.style.transition = "none";
  }

  function onGrabMove(e: React.PointerEvent<HTMLSpanElement>) {
    const d = drag.current;
    const tray = trayRef.current;
    if (!d || !tray) return;
    const dt = e.timeStamp - d.lastT;
    if (dt > 0) d.v = (e.clientY - d.lastY) / dt;
    d.lastY = e.clientY;
    d.lastT = e.timeStamp;
    /* down only — pulling up past the dock has nowhere to go */
    tray.style.transform = `translateY(${Math.max(0, e.clientY - d.startY)}px)`;
  }

  function onGrabEnd(e: React.PointerEvent<HTMLSpanElement>) {
    const d = drag.current;
    const tray = trayRef.current;
    drag.current = null;
    if (!d || !tray) return;
    const dy = Math.max(0, e.clientY - d.startY);
    const dismiss =
      e.type === "pointerup" && (dy > tray.offsetHeight / 4 || (d.v > 0.5 && dy > 16));
    tray.style.transition =
      "transform var(--duration-base) var(--ease-standard), opacity var(--duration-base) var(--ease-standard)";
    if (dismiss) {
      /* carry on from where the finger let go, rather than the leaving rule's
         16px from the dock — the fade comes from `data-state="leaving"` */
      tray.style.transform = "translateY(100%)";
      onClose();
    } else {
      tray.style.transform = "";
    }
  }

  if (!present) return null;

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal forceMount>
        {/* `state/pressed-overlay` at 14% is the only darkening token LUX has,
            and it is weak for a modal. Flagged in the handoff panel rather than
            invented around — a real scrim token belongs in Figma. A press on it
            closes the tray through Radix's outside press. */}
        <Dialog.Overlay
          forceMount
          className={styles.scrim}
          data-tray="scrim"
          /* overrides Radix's own `data-state="open"`/`"closed"`: the CSS keys
             the exit off `leaving` */
          data-state={leaving ? "leaving" : undefined}
        />
        <Dialog.Content
          forceMount
          ref={trayRef}
          className={className ? `${styles.tray} ${className}` : styles.tray}
          data-tray="tray"
          data-state={leaving ? "leaving" : undefined}
          /* ⚠️ `inert` WHILE LEAVING, NOT JUST UNCLICKABLE. The dialog is already
             closed as far as focus and assistive tech are concerned — focus has
             gone back to the opener — so a fading copy of it must not be
             reachable by pointer, Tab or a screen reader for those 200ms. */
          inert={leaving}
          aria-describedby={undefined}
          tabIndex={-1}
          {...focus}
          /* a field that owns its Escape (ConfirmField's ✕) keeps it: the
             dialog does not close under it */
          onEscapeKeyDown={(e) => {
            if ((e.target as HTMLElement | null)?.closest?.("[data-own-escape]"))
              e.preventDefault();
          }}
        >
        {/* mobile only — the desktop dialog has no grabber. Pull it down to
            close; see the doc comment. */}
        <span
          className={styles.grabber}
          aria-hidden="true"
          onPointerDown={onGrabStart}
          onPointerMove={onGrabMove}
          onPointerUp={onGrabEnd}
          onPointerCancel={onGrabEnd}
        />
        {/* the dialog's name, as `aria-label` gave it before — a span, so it
            adds no heading to the outline, and AFTER the grabber, which a
            tablet rule in globals.css finds as the tray's first child */}
        <Dialog.Title asChild>
          <span className="visually-hidden">{title}</span>
        </Dialog.Title>
        {/* the tray's one way out, on every view — see the doc comment. A
            corner ✕ comes FIRST in the DOM, so Tab reaches the exit before
            the content, as it would reach a header's close. */}
        {dismiss === "corner" && (
          <button
            type="button"
            className={`${styles.close} pressable`}
            aria-label="Close"
            onClick={onClose}
          >
            <CloseIcon className={styles.closeIcon} />
          </button>
        )}
        {children}
        {dismiss === "label" && (
          <button type="button" className={`${styles.dismiss} t-label`} onClick={onClose}>
            {dismissLabel}
          </button>
        )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
