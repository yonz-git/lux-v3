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

  // Escape closes it, and focus moves into the tray on open so a keyboard user
  // is not left behind on the screen underneath.
  useEffect(() => {
    if (!open) return;
    trayRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

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
        <h2 className={`${styles.title} t-h4`}>{title}</h2>
        {children}
      </div>
    </>
  );
}
