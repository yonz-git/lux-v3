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
 * to be modal. All three of these close that gap:
 *
 *   1. focus moves into the surface on open
 *   2. Tab and Shift+Tab wrap around inside it
 *   3. focus returns to whatever opened it on close, so the user is not dumped
 *      at the top of the document
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
}

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
