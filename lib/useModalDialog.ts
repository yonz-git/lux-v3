"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/** What a modal hands Radix so focus lands and returns the way LUX had it. */
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

const EXIT_MS = 300;

export const DROP_EXIT_MS = 120;

/**
 * What a closing panel should still be SHOWING — the last value it had while
 * open.
 */
export function useHeldWhileClosing<T>(open: boolean, value: T): T {
  const held = useRef(value);
  useEffect(() => {
    if (open) held.current = value;
  });
  return open ? value : held.current;
}
