"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * The dialog behaviours a modal owes a keyboard user, for any surface that
 * claims `aria-modal`.
 *
 * ⚠️ `aria-modal` IS A PROMISE, NOT AN IMPLEMENTATION. It tells assistive tech
 * the rest of the page is inert; it does nothing to the tab order. Measured
 * with `Sheet` open before this existed: eight controls behind it — Back,
 * Save & exit, Add product, the skip link, Continue and all three nav items —
 * were still reachable by Tab, so focus wandered out of a dialog that claimed
 * to be modal. All four of these close that gap:
 *
 *   1. focus moves into the surface on open
 *   2. Tab and Shift+Tab wrap around inside it
 *   3. focus returns to whatever opened it on close, so the user is not dumped
 *      at the top of the document
 *   4. the page underneath does not scroll while it is open — added 12 Sep
 *      2026, and the same omission as the other three: measured, not assumed
 *
 * ⚠️ IT LIVES IN `lib/` BECAUSE TWO SURFACES USE IT — `components/ui/Sheet`
 * and PROGRESS's check-in overlay, which is a `ChatPanel` rather than a tray
 * and so cannot simply BE a `Sheet`. The alternative was a second copy of the
 * trap, and two focus traps drift apart the first time one of them is fixed.
 *
 * ⚠️ `onClose` IS READ THROUGH A REF AND IS NOT A DEPENDENCY, ON PURPOSE.
 * Callers pass an inline arrow — a fresh function on every render, including
 * the render triggered by typing a character into a field inside the dialog.
 * As a dependency it would re-run the effect and its `focus()` would yank focus
 * back onto the container on every keystroke, eating all but the first
 * character. `open` is the only real dependency: all three behaviours are
 * open/close transitions, not per-render work.
 */
export function useModalDialog(
  open: boolean,
  onClose: () => void,
  ref: RefObject<HTMLElement | null>,
) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  /* ⚠️ `open` IS THE ONLY REAL DEPENDENCY — see the note above. `ref` is a ref object (stable) and
     `ref.current` is read inside the handlers at the moment they run, never
     captured; `onClose` is deliberately read through `onCloseRef`. Re-running
     this on either would re-focus the container mid-typing. */
  useEffect(() => {
    if (!open) return;

    const opener = document.activeElement as HTMLElement | null;
    ref.current?.focus();

    const focusables = () => {
      const root = ref.current;
      if (!root) return [] as HTMLElement[];
      return [...root.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
      )].filter((el) => el.offsetParent !== null || el === root);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab") return;

      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      // wrap at both ends, and pull focus back in if it ever escapes
      if (e.shiftKey && (active === first || active === ref.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (!ref.current?.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [open, ref]);

  /* ⚠️ THE PAGE BEHIND A MODAL SCROLLED, AND `aria-modal` DOES NOT STOP THAT
     EITHER. Measured on `/progress` with the check-in overlay open, 12 Sep
     2026: `window.scrollBy(0, 500)` moved the document to `scrollY 313` with
     the dialog still up. The dialog itself is `fixed inset-0` and stayed put,
     so nothing looked broken — the SCREEN BEHIND IT simply slid, under a scrim
     that is `state/pressed-overlay` at 14% and lets all of it through. A modal
     the page moves behind is not reading as modal.

     It is the same class of gap as the focus trap above: the surface claims to
     take the whole viewport and only the parts that were implemented do.

     ⚠️ IT LOCKS BOTH `html` AND `body`, AND RESTORES WHAT WAS THERE rather
     than clearing to "". `body` alone has never been enough — the scrolling
     element is `html` in every engine this ships to — and clobbering the
     property to empty would discard a value someone else set.

     ⚠️ NO SCROLLBAR COMPENSATION, DELIBERATELY. The usual `padding-right` dance
     exists to stop the page jumping sideways as the scrollbar is removed; LUX
     hides the scrollbar globally (non-negotiable, `globals.css`), so there is
     no gutter to reclaim and adding padding would itself be the jump.

     ⚠️ KNOWN LIMIT: `overflow: hidden` is the document-level lock, and iOS
     Safari can still rubber-band the page under a touch drag that begins on the
     scrim. The tray's own `overscroll-behavior: contain` stops the chaining
     case (a drag that starts INSIDE the sheet and runs past its end), which is
     the one a user actually meets. The full fix is the `position: fixed` body
     swap, and it is not worth its own class of scroll-restoration bugs here —
     revisit if the prototype ever meets a real iPhone. */
  useEffect(() => {
    if (!open) return;

    const root = document.documentElement;
    const { body } = document;
    const rootPrev = root.style.overflow;
    const bodyPrev = body.style.overflow;

    root.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      root.style.overflow = rootPrev;
      body.style.overflow = bodyPrev;
    };
  }, [open]);
}

/**
 * A modal that is closing is still on screen — this is the state that lets it
 * be.
 *
 * ⚠️ BOTH MODAL SURFACES USED TO LEAVE IN A SINGLE FRAME, and the entrance was
 * the reason it looked wrong rather than merely abrupt: `Sheet` and the
 * check-in overlay both rise and fade IN over `duration/slow` (320ms) and then
 * returned `null` the instant `open` went false. An element that arrives with
 * motion and vanishes without it reads as a render fault, not as a dismissal.
 *
 * ⚠️ THE PATTERN IS `Snackbar`'s, NOT A NEW ONE — `data-state="leaving"` on the
 * node, a timer that unmounts on the same number the CSS transitions over. That
 * component has done this since it shipped; the trays simply never borrowed it.
 *
 * ⚠️ THE EXIT IS FASTER THAN THE ENTRANCE (200 against 320), WHICH IS NOT AN
 * OVERSIGHT. Arriving is where the user has to register a new surface; leaving
 * is the app getting out of the way of the thing underneath, and a slow exit
 * reads as the app being reluctant. `duration/base` is the token.
 *
 * ⚠️ `open` REMAINS THE TRUTH FOR EVERY BEHAVIOUR — `useModalDialog` takes the
 * raw prop, so Escape, the focus trap, focus restoration and the scroll lock
 * all end the moment the user asks to close. Only the PAINT outlives it.
 */
export function useDialogPresence(open: boolean) {
  const [present, setPresent] = useState(open);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (open) {
      setPresent(true);
      setLeaving(false);
      return;
    }

    /* nothing to play out: either it was never open, or a previous exit has
       already finished and unmounted it */
    if (!present) return;

    setLeaving(true);
    const timer = setTimeout(() => {
      setPresent(false);
      setLeaving(false);
    }, EXIT_MS);
    return () => clearTimeout(timer);
  }, [open, present]);

  return { present, leaving };
}

/* ⚠️ KEEP IN STEP WITH `--duration-base` (200ms) — the fade and the slide are
   CSS transitions on `[data-tray][data-state="leaving"]` in `globals.css`, and
   this is only the moment the node is removed. Unmounting EARLY cuts the exit
   off mid-flight; unmounting late leaves an invisible dialog over the screen
   holding the scroll lock. Same arrangement, same hazard, as `Snackbar`'s
   `EXIT_MS`. */
const EXIT_MS = 200;

/**
 * `document` does not exist while the page renders on the server, so a portal
 * can only be built after the first client render. Both modal surfaces need
 * the same guard.
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

/**
 * What a closing panel should still be SHOWING — the last value it had while
 * open.
 *
 * ⚠️ `useDialogPresence` HOLDS THE NODE, NOT WHAT IS IN IT. A tray's content
 * does not change when it closes, so the trays never needed this. A search
 * dropdown's does: both of the app's search dropdowns close when the query
 * empties, and the render that starts the exit is the one in which the results
 * have already gone — so the builder's panel faded out over the page's own
 * product list, and the add-product tray's over "No products match “”",
 * instead of over what the user had just been looking at. Added with the
 * dropdowns' exit, 13 Sep 2026.
 *
 * ⚠️ WRITTEN IN AN EFFECT, READ IN RENDER. The write waits for a committed open
 * render, so a render React throws away never becomes the held value; the read
 * is what lets the very first closing render show it.
 */
export function useHeldWhileClosing<T>(open: boolean, value: T): T {
  const held = useRef(value);
  useEffect(() => {
    if (open) held.current = value;
  });
  return open ? value : held.current;
}
