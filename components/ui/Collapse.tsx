"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useDialogPresence } from "@/lib/useModalDialog";

/**
 * A panel that opens DOWN and closes back UP — the in-flow half of the
 * dropdown recipe in `globals.css` ("Dropdowns open DOWN and close back UP").
 * Wrap the panel and keep its own class and id on it: this adds the moving
 * space around it and nothing visual.
 *
 * ⚠️ NOT IN FIGMA — asked for directly 13 Sep 2026. The reasoning is on the
 * `globals.css` block; this file is only the state that block needs.
 *
 * ⚠️ THE PANEL IS STILL NOT MOUNTED WHILE CLOSED, and callers rely on that —
 * `Disclosure` for the heading tree a screen reader must not reach behind a
 * collapsed section. `useDialogPresence`, the trays' own hook, holds a closing
 * panel only for the 200ms it takes to leave, and `inert` takes it out of the
 * tab order and the accessibility tree for exactly those 200ms, as `Sheet`
 * does.
 *
 * ⚠️ `entering` IS A STATE, NOT JUST THE FIRST FRAME, because the clip hangs
 * off it: the panel is clipped while its row grows and unclipped once it has
 * (`ENTER_MS`). A panel that starts open (`Disclosure`'s `defaultOpen`) starts
 * settled, so it paints at full height instead of growing into a page that has
 * already laid out.
 */
export function Collapse({
  open,
  children,
}: {
  open: boolean;
  children: ReactNode;
}) {
  const { present, leaving } = useDialogPresence(open);
  const [settled, setSettled] = useState(open);

  useEffect(() => {
    if (!present || leaving) {
      setSettled(false);
      return;
    }
    const timer = setTimeout(() => setSettled(true), ENTER_MS);
    return () => clearTimeout(timer);
  }, [present, leaving]);

  /* ⚠️ `open`, NOT JUST `present`, DECIDES THE FIRST FRAME — changed 13 Sep
     2026. `useDialogPresence` sets `present` in an effect, so opening mounted
     the panel one render late, and a caller that focuses a field inside it
     from its own effect (OtherBlock, the check-in note) ran before the field
     existed. */
  if (!open && !present) return null;

  /* ⚠️ `leaving` COUNTS ONLY WHILE `open` IS STILL FALSE — changed after
     review, 13 Sep 2026. `useDialogPresence` clears `leaving` in an effect, a
     render after a reopen, and the caller's own effect focuses the field in
     that same commit: the panel was still `inert`, the focus went nowhere, and
     a panel reopened mid-exit came back with nothing focused. It also turns
     that panel round a frame sooner. */
  const closing = leaving && !open;

  return (
    <div
      className="collapse"
      data-state={closing ? "leaving" : settled ? undefined : "entering"}
      inert={closing}
    >
      <div>{children}</div>
    </div>
  );
}

/* ⚠️ KEEP IN STEP WITH `--duration-base` (200ms) — the row's transition in
   `globals.css`. This only decides when the clip comes off: too early and the
   panel's content spills over the rows below for the last frames of growing;
   too late and a focus ring at its edge stays cut for a moment longer. */
const ENTER_MS = 200;
