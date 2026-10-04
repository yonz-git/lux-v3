"use client";

import { useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import styles from "./CheckInOverlay.module.css";
import { CheckInPanel } from "./CheckIn";
import { useDialogFocus, useDialogPresence } from "@/lib/useModalDialog";

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
 * ⚠️ RADIX DIALOG IS UNDERNEATH, AS OF 4 Oct 2026, AS IT IS UNDER `Sheet` —
 * the focus trap, Escape, the scroll lock and hiding the page from assistive
 * tech are Radix's. The scrim rule above is kept by refusing Radix's outside
 * press (`onPointerDownOutside` / `onInteractOutside`).
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

  /* ⚠️ THE OVERLAY USED TO ARRIVE AND LEAVE WITH NO MOTION OF ITS OWN, and the
     contents made that read worse rather than better: `ChatPanel` carries
     `data-reveal`, so the orb, the bubble and the chips faded up over 320ms
     INSIDE a panel that had snapped into existence around them. Closing was a
     single frame for all of it. The panel is the object here — it fades as one,
     and it leaves the same way it came. See `useDialogPresence`. */
  const { present, leaving } = useDialogPresence(open);
  const focus = useDialogFocus(open, overlayRef);

  if (!present) return null;

  /* the scrim does not close it — see the doc comment */
  const keepOpen = (e: Event) => e.preventDefault();

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal forceMount>
        <Dialog.Overlay
          forceMount
          className={styles.scrim}
          data-state={leaving ? "leaving" : undefined}
        />
        <Dialog.Content
          forceMount
          ref={overlayRef}
          className={styles.overlay}
          data-state={leaving ? "leaving" : undefined}
          /* closed for focus and assistive tech already — see `Sheet` */
          inert={leaving}
          aria-describedby={undefined}
          tabIndex={-1}
          onPointerDownOutside={keepOpen}
          onInteractOutside={keepOpen}
          /* a field that owns its Escape (ConfirmField's ✕) keeps it: the
             dialog does not close under it */
          onEscapeKeyDown={(e) => {
            if ((e.target as HTMLElement | null)?.closest?.("[data-own-escape]"))
              e.preventDefault();
          }}
          {...focus}
        >
          <CheckInPanel
            now={now}
            onClose={onClose}
            onSubmitted={onClose}
            /* ⚠️ AN `<h2>`, NOT THE ROUTE'S `<h1>` — `/progress` owns the page
               heading and is still the page. It is also the dialog's name now
               (`Dialog.Title`), where `aria-label` used to give it. */
            heading={
              <Dialog.Title asChild>
                <h2 className="visually-hidden">Daily check-in</h2>
              </Dialog.Title>
            }
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
