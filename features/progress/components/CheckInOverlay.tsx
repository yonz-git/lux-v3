"use client";

import { useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import styles from "./CheckInOverlay.module.css";
import { CheckInPanel } from "./CheckIn";
import { useDialogFocus, useDialogPresence } from "@/lib/useModalDialog";

/** The daily check-in opened OVER `/myskin`, rather than navigated to. */
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
