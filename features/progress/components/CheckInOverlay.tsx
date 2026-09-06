"use client";

import { useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./CheckInOverlay.module.css";
import { CheckInPanel } from "./CheckIn";
import { useModalDialog, useMounted } from "@/lib/useModalDialog";

/**
 * The daily check-in opened OVER `/progress`, rather than navigated to.
 *
 * ⚠️ NOT IN FIGMA, AND IT IS A FLOW DECISION — 6 Sep 2026. `Check in today` used
 * to push `/progress/check-in`; it now opens the same conversation as a modal
 * panel on the dashboard. THE PROTOTYPE LEADS ON FLOW: the check-in is a daily
 * action off a hub that ends by putting you back on the hub you started from,
 * and the panel it is drawn in already looks like a surface that floats over
 * the app rather than a page in its navigation stack — `ChatPanel`'s own doc
 * comment argues exactly that, and its X, which reads "this goes away" rather
 * than "step back", is the control this reading was always waiting for.
 *
 * ⚠️ THE ROUTE SURVIVES AND IS NOT A DUPLICATE. `/progress/check-in` still
 * exists, still carries its `metadata`, and is still what the analysis pushes
 * when the user chooses to pause and check in — a deep link into the check-in
 * needs somewhere to land. Both render `CheckInPanel`, so there is ONE
 * conversation with two ways in, not two check-ins to keep in step.
 *
 * ⚠️ NO PIXEL DECISION IS MADE HERE. The panel keeps `ChatPanel`'s geometry and
 * the overlay reproduces `.screen[data-layout="panel"]`'s frame around it, so
 * the surface lands in the same place either way in.
 *
 * ⚠️ THE SCRIM DOES NOT CLOSE IT, UNLIKE `Sheet`'S. A tray dismissed by a
 * mistap costs you a menu; this one would cost a part-answered conversation,
 * because the store holds no partial check-in — the same fact that keeps the
 * note field and the photo capture on the screen instead of behind a route. The
 * X and Escape are the ways out, both deliberate.
 *
 * ⚠️ IT PORTALS TO `document.body` FOR THE REASON `Sheet` DOES. `position:
 * fixed` is viewport-relative only while no ancestor establishes a containing
 * block, and PROGRESS is a wall of frosted `DataCard`s — a `backdrop-filter`
 * establishes one exactly as `transform` does. Rendered in place, the overlay
 * would be fixed to a card.
 */
export function CheckInOverlay({
  open,
  now,
  onClose,
}: {
  open: boolean;
  /** the dashboard's own clock, so the overlay dates the check-in the same day
   *  the calendar rings — see `useToday` and CheckIn's note on it */
  now: number;
  onClose: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const mounted = useMounted();

  /* Escape, the focus trap, and focus returning to `Check in today` on close —
     `lib/useModalDialog.ts`, shared with `Sheet`. */
  useModalDialog(open, onClose, overlayRef);

  if (!open || !mounted) return null;

  return createPortal(
    <>
      <div className={styles.scrim} aria-hidden="true" />
      <div
        ref={overlayRef}
        className={styles.overlay}
        role="dialog"
        aria-modal="true"
        aria-label="Daily check-in"
        tabIndex={-1}
      >
        <CheckInPanel
          now={now}
          onClose={onClose}
          onSubmitted={onClose}
          /* ⚠️ AN `<h2>`, NOT THE ROUTE'S `<h1>` — `/progress` owns the page
             heading and is still the page. The dialog is named by
             `aria-label`; this keeps the heading outline honest for anyone
             walking it. */
          heading={<h2 className="visually-hidden">Daily Check-in</h2>}
        />
      </div>
    </>,
    document.body,
  );
}
