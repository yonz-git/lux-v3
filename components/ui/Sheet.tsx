"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import styles from "./Sheet.module.css";
import { CloseSmallIcon } from "./icons";
import { IconButton } from "./IconButton";
import { useDialogFocus, useDialogPresence } from "@/lib/useModalDialog";

/**
 * The modal tray: one shape at every width, a dialog centred in the viewport.
 * It closes with its ✕ or label, the scrim, or Escape.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
  className,
  dismissLabel = "Done",
  dismiss = "label",
  contentKey,
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
  /** names what the tray is showing; when it changes, the tray eases from its
   *  old height to the new one instead of jumping */
  contentKey?: string;
}) {
  const trayRef = useRef<HTMLDivElement>(null);
  /* the portal mounts the tray a render after this component, so the height
     observer waits for the node itself rather than for `present` */
  const [trayEl, setTrayEl] = useState<HTMLDivElement | null>(null);
  const attachTray = useCallback((node: HTMLDivElement | null) => {
    trayRef.current = node;
    setTrayEl(node);
  }, []);
  const lastHeight = useRef<number | null>(null);
  const heightAnim = useRef<Animation | null>(null);
  const shownKey = useRef(contentKey);

  const { present, leaving } = useDialogPresence(open);
  const focus = useDialogFocus(open, trayRef);

  /* the tray's laid-out height, kept current so a content change knows where
     it is easing from */
  const easesHeight = contentKey !== undefined;
  useEffect(() => {
    const tray = trayEl;
    if (!tray || !easesHeight) return;
    const record = () => {
      if (!heightAnim.current) lastHeight.current = tray.getBoundingClientRect().height;
    };
    record();
    const ro = new ResizeObserver(record);
    ro.observe(tray);
    return () => ro.disconnect();
  }, [trayEl, easesHeight]);

  useLayoutEffect(() => {
    const tray = trayRef.current;
    const prev = shownKey.current;
    shownKey.current = contentKey;
    if (!tray || !open || prev === contentKey || lastHeight.current === null) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    /* a switch mid-ease starts from where the tray is now */
    const running = heightAnim.current;
    const from = running ? tray.getBoundingClientRect().height : lastHeight.current;
    running?.cancel();
    heightAnim.current = null;
    const to = tray.getBoundingClientRect().height;
    if (Math.abs(to - from) < 1) return;
    const css = getComputedStyle(tray);
    /* the browser may report the token in seconds */
    const move = css.getPropertyValue("--duration-move").trim();
    const anim = tray.animate(
      { height: [`${from}px`, `${to}px`] },
      {
        duration: Number.parseFloat(move) * (move.endsWith("ms") ? 1 : 1000),
        easing: css.getPropertyValue("--ease-in-out").trim(),
      },
    );
    heightAnim.current = anim;
    anim.finished.then(
      () => {
        if (heightAnim.current !== anim) return;
        heightAnim.current = null;
        lastHeight.current = tray.getBoundingClientRect().height;
      },
      () => {},
    );
  }, [contentKey, open]);

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
          ref={attachTray}
          className={className ? `${styles.tray} ${className}` : styles.tray}
          data-tray="tray"
          data-dismiss={dismiss}
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
        {/* the dialog's name — a span, so it adds no heading to the outline */}
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
