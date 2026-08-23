"use client";

import { useEffect, useRef } from "react";
import styles from "./Sheet.module.css";

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
 * ⚠️ THE BACK CHEVRON IS GONE, AND `Cancel` IS THE TRAY'S ONLY DISMISSAL. The
 * tray used to carry an `onBack` chevron in a header row of its own, so a
 * multi-view tray had TWO ways out that did different things — a chevron at the
 * top that stepped back one view, and a `Cancel` at the bottom of the method
 * view only that closed the whole thing. Every other view had no visible way
 * out at all. One dismissal, in one place, on every view: `Cancel` is rendered
 * HERE rather than by each view, so a new view cannot ship without one.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const trayRef = useRef<HTMLDivElement>(null);

  // ⚠️ NOT IN THE EFFECT'S DEPENDENCY ARRAY, ON PURPOSE. `AddProductMethodSheet`
  // (and any other caller) passes an inline `onClose`, a fresh function on
  // every render — including the render triggered by typing a character into
  // the tray's search field. If the effect below depended on `onClose`, that
  // identity change would re-run it and its `trayRef.current?.focus()` would
  // yank focus off the search input and back onto the tray on every
  // keystroke, eating all but the first character. A ref always reads the
  // latest `onClose` without making the effect re-run for it.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  /**
   * The dialog behaviours a modal owes a keyboard user.
   *
   * ⚠️ `aria-modal` IS A PROMISE, NOT AN IMPLEMENTATION. It tells assistive tech
   * the rest of the page is inert; it does nothing to the tab order. Measured
   * with the sheet open: eight controls behind it — Back, Save & exit, Add
   * product, the skip link, Continue and all three nav items — were still
   * reachable by Tab, so focus wandered out of a dialog that claimed to be
   * modal. All three of these close that gap:
   *
   *   1. focus moves into the tray on open
   *   2. Tab and Shift+Tab wrap around inside it
   *   3. focus returns to whatever opened it on close, so the user is not
   *      dumped at the top of the document
   *
   * All three are open/close transitions, not per-render behaviour — see the
   * `onCloseRef` note above for why `open` is the only dependency.
   */
  useEffect(() => {
    if (!open) return;

    const opener = document.activeElement as HTMLElement | null;
    trayRef.current?.focus();

    const focusables = () => {
      const tray = trayRef.current;
      if (!tray) return [] as HTMLElement[];
      return [...tray.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
      )].filter((el) => el.offsetParent !== null || el === tray);
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
      if (e.shiftKey && (active === first || active === trayRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (!trayRef.current?.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* `state/pressed-overlay` at 14% is the only darkening token LUX has, and
          it is weak for a modal. Flagged in the handoff panel rather than
          invented around — a real scrim token belongs in Figma. */}
      <div className={styles.scrim} data-tray="scrim" onClick={onClose} aria-hidden="true" />
      <div
        ref={trayRef}
        className={styles.tray}
        data-tray="tray"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        {/* mobile only — the desktop dialog has no grabber */}
        <span className={styles.grabber} aria-hidden="true" />
        {children}
        {/* the tray's one way out, on every view — see the doc comment */}
        <button type="button" className={`${styles.cancel} t-label`} onClick={onClose}>
          Cancel
        </button>
      </div>
    </>
  );
}
