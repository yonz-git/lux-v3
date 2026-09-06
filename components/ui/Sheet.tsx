"use client";

import { useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./Sheet.module.css";
import { useModalDialog, useMounted } from "@/lib/useModalDialog";

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
  const mounted = useMounted();

  /* Escape, the focus trap and the return of focus to whatever opened the tray
     — `lib/useModalDialog.ts` owns all three, and owns the note explaining why
     `onClose` is read through a ref rather than depended on. PROGRESS's
     check-in overlay is the second caller. */
  useModalDialog(open, onClose, trayRef);

  if (!open || !mounted) return null;

  return createPortal(
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
        <button type="button" className={`${styles.dismiss} t-label`} onClick={onClose}>
          Done
        </button>
      </div>
    </>,
    document.body,
  );
}
