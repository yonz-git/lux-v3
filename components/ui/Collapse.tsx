"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useDialogPresence } from "@/lib/useModalDialog";

/**
 * A panel that opens DOWN and closes back UP — the in-flow half of the
 * dropdown recipe in `globals.css` ("Dropdowns open DOWN and close back UP").
 * Wrap the panel and keep its own class and id on it: this adds the moving
 * space around it and nothing visual.
 */
export function Collapse({
  open,
  as: Tag = "div",
  appear = false,
  smooth = false,
  children,
}: {
  open: boolean;
  /** the element that collapses — `li` when it is a list row itself */
  as?: "div" | "li";
  /** grow in even when mounted open — a row put back by Undo */
  appear?: boolean;
  /**
   * The slow, premium recipe — a 500ms ease in-out move and a 350ms fade
   * (`--duration-move`, `--duration-fade`, `--ease-in-out`) in place of the
   * app's quicker 300ms recipe. For a surface that is swapping, not a row morphing;
   * `~/.claude/taste.md`. Opt-in: every other Collapse is unchanged.
   */
  smooth?: boolean;
  children: ReactNode;
}) {
  const ms = smooth ? SMOOTH_MS : ENTER_MS;
  const { present, leaving } = useDialogPresence(open, ms);
  const [settled, setSettled] = useState(open && !appear);

  useEffect(() => {
    if (!present || leaving) {
      setSettled(false);
      return;
    }
    const timer = setTimeout(() => setSettled(true), ms);
    return () => clearTimeout(timer);
  }, [present, leaving, ms]);

  if (!open && !present) return null;

  const closing = leaving && !open;

  return (
    <Tag
      className="collapse"
      data-smooth={smooth ? "" : undefined}
      data-state={closing ? "leaving" : settled ? undefined : "entering"}
      inert={closing}
    >
      <div>{children}</div>
    </Tag>
  );
}

const ENTER_MS = 300;

const SMOOTH_MS = 500;

export const COLLAPSE_EXIT_MS = 300;
