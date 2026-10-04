"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * What a modal hands Radix so focus lands and returns the way LUX had it.
 *
 * ⚠️ RADIX DIALOG OWNS THE MODAL BEHAVIOUR NOW — 4 Oct 2026, asked for
 * directly ("add radix under the sheet and dialogs"). `Sheet` and PROGRESS's
 * check-in overlay are `@radix-ui/react-dialog` underneath: its FocusScope
 * traps Tab, its DismissableLayer runs Escape and the outside press, its
 * RemoveScroll locks the page, and it `aria-hidden`s everything outside the
 * dialog, which the hand-built hook this replaced never did. That hook (a
 * keydown trap, an `overflow: hidden` lock on `html` and `body`, and a
 * restore of the opener's focus) is gone; its reasoning lives in git.
 *
 * ⚠️ TWO THINGS RADIX DOES DIFFERENTLY ARE PUT BACK HERE:
 *   1. ON OPEN it focuses the first focusable control. LUX focused the
 *      DIALOG ITSELF, so a screen reader announces the dialog's name before
 *      any control, and an input inside it does not raise a keyboard on a
 *      phone the moment the tray opens. `onOpenAutoFocus` does that.
 *   2. ON CLOSE it returns focus to its `Trigger`, and no LUX dialog has one
 *      (each is opened by state from wherever the button lives). It would
 *      also wait for the content to UNMOUNT, which is after the 200ms exit
 *      (`useDialogPresence`). So the opener is remembered as the dialog opens
 *      and focused the moment `open` goes false, as before.
 * Spread the result onto `Dialog.Content`.
 */
export function useDialogFocus(
  open: boolean,
  ref: RefObject<HTMLElement | null>,
) {
  const opener = useRef<HTMLElement | null>(null);
  const wasOpen = useRef(open);

  useEffect(() => {
    if (wasOpen.current && !open) {
      opener.current?.focus?.();
      opener.current = null;
    }
    wasOpen.current = open;
  }, [open]);

  return {
    onOpenAutoFocus: (e: Event) => {
      /* still the opener: Radix fires this before it moves focus */
      opener.current = document.activeElement as HTMLElement | null;
      e.preventDefault();
      ref.current?.focus();
    },
    onCloseAutoFocus: (e: Event) => e.preventDefault(),
  };
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
 * ⚠️ `open` REMAINS THE TRUTH FOR EVERY BEHAVIOUR — Radix's `Root` takes the
 * raw prop, so Escape and the focus trap end the moment the user asks to
 * close, and `useDialogFocus` returns focus then too. Only the PAINT (and
 * Radix's scroll lock, which sits on the overlay) outlives it.
 *
 * ⚠️ THE EXIT LENGTH IS THE CALLER'S — added 13 Sep 2026. A tray leaves on
 * `duration/base`, a floating dropdown on `duration/fast`; unmounting a
 * dropdown on the tray's number left the in-flow add-product panel as blank
 * space for the difference. Pass the number your CSS exit uses
 * (`DROP_EXIT_MS` for `.drop`).
 */
export function useDialogPresence(open: boolean, exitMs: number = EXIT_MS) {
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
    }, exitMs);
    return () => clearTimeout(timer);
  }, [open, present, exitMs]);

  return { present, leaving };
}

/* ⚠️ KEEP IN STEP WITH `--duration-base` (200ms) — the fade and the slide are
   CSS transitions on `[data-tray][data-state="leaving"]` in `globals.css`, and
   this is only the moment the node is removed (Radix's `forceMount` holds it
   until then). Unmounting EARLY cuts the exit off mid-flight; unmounting late
   leaves an invisible dialog over the screen holding Radix's scroll lock. Same arrangement, same hazard, as `Snackbar`'s
   `EXIT_MS`. */
const EXIT_MS = 200;

/* ⚠️ KEEP IN STEP WITH `--duration-fast` (120ms) — `.drop[data-state="leaving"]`
   in globals.css. A floating dropdown leaves faster than a tray, and this is
   only the moment its node is removed. */
export const DROP_EXIT_MS = 120;

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
