"use client";

import { useEffect, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import styles from "./Sheet.module.css";
import { CloseSmallIcon } from "./icons";
import { IconButton } from "./IconButton";
import { useDialogFocus, useDialogPresence } from "@/lib/useModalDialog";

/**
 * The modal tray — Figma `04 — Add product · method sheet` (576:1376) on mobile
 * and `04 — Add product · method dialog — desktop` (583:1786).
 *
 * ONE component, two shapes: a bottom sheet docked to the frame's bottom edge
 * below 1024, a centred dialog above it. That is the documented LUX recipe, not
 * a responsive convenience.
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
  dismiss?: "label" | "corner";
}) {
  const trayRef = useRef<HTMLDivElement>(null);

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
          <IconButton
            size="xs"
            label="Close"
            className={styles.close}
            onClick={onClose}
          >
            <CloseSmallIcon />
          </IconButton>
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
