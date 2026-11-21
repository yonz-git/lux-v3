"use client";

import { Fragment, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import styles from "./IngredientTerms.module.css";
import { noteFor, splitInci, splitLeadIn } from "@/features/products/ingredients";
import { DROP_EXIT_MS, useDialogPresence, useHeldWhileClosing } from "@/lib/useModalDialog";

/**
 * An INCI list whose names explain themselves — rest a mouse on one, or tap
 * it, and a small panel says what the ingredient is.
 */
export function IngredientTerms({ ingredients }: { ingredients: string }) {
  const terms = useMemo(
    /* the key is the name's place in the list — a label can repeat a name, and
       the list never reorders. */
    () =>
      splitInci(ingredients).map((raw, at) => {
        const { leadIn, name } = at === 0 ? splitLeadIn(raw) : { leadIn: "", name: raw };
        return { key: `${at}:${raw}`, leadIn, text: name, note: noteFor(name) };
      }),
    [ingredients],
  );

  const [tip, setTip] = useState<{ index: number; pinned: boolean } | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const open = tip !== null;
  const shown = useHeldWhileClosing(open, tip);
  const { present, leaving } = useDialogPresence(open, DROP_EXIT_MS);

  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const panel = useRef<HTMLSpanElement>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const panelId = useId();

  const clearTimers = useCallback(() => {
    clearTimeout(openTimer.current);
    clearTimeout(closeTimer.current);
  }, []);

  const close = useCallback(() => {
    clearTimers();
    setTip(null);
    setAnnouncement("");
  }, [clearTimers]);

  /* hover — a mouse only; a finger's pointerenter arrives with its tap */
  const hoverIn = (index: number, pointerType: string) => {
    if (pointerType !== "mouse") return;
    if (tip?.pinned) return;
    clearTimers();
    /* already open: follow the pointer at once, or a sweep along the list
       would sit out the delay on every name */
    if (tip) {
      if (tip.index !== index) setTip({ index, pinned: false });
      return;
    }
    openTimer.current = setTimeout(() => setTip({ index, pinned: false }), HOVER_OPEN_MS);
  };

  const hoverOut = (pointerType: string) => {
    if (pointerType !== "mouse") return;
    clearTimeout(openTimer.current);
    if (tip && !tip.pinned) closeTimer.current = setTimeout(close, HOVER_CLOSE_MS);
  };

  const press = (index: number) => {
    clearTimers();
    if (tip?.index === index && tip.pinned) {
      close();
      return;
    }
    setTip({ index, pinned: true });
    const { text, note } = terms[index];
    if (note) setAnnouncement(`${text}. ${note.role}. ${note.about}`);
  };

  /* where the panel goes — under its name, or over it when the viewport has no
     room below. Written straight to the node: it runs on every scroll frame,
     and a state update per frame would re-render the whole list. */
  const place = useCallback(() => {
    const el = panel.current;
    const trigger = shown ? buttons.current[shown.index] : null;
    if (!el || !trigger) return;

    if (!inSight(trigger)) {
      close();
      return;
    }

    const r = trigger.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const w = el.offsetWidth;
    const h = el.offsetHeight;

    const below = r.bottom + GAP;
    const side = below + h > vh - GUTTER && r.top - GAP - h >= GUTTER ? "top" : "bottom";
    const top = side === "top" ? r.top - GAP - h : below;
    const centre = r.left + r.width / 2;
    const left = Math.min(Math.max(centre - w / 2, GUTTER), vw - GUTTER - w);

    el.dataset.side = side;
    el.style.top = `${top}px`;
    el.style.left = `${left}px`;
    /* `.drop` settles from the edge nearest the name, at the name's own x */
    el.style.transformOrigin = `${centre - left}px ${side === "top" ? "100%" : "0"}`;
  }, [shown, close]);

  useLayoutEffect(() => {
    const el = panel.current;
    if (!present || !el || typeof el.showPopover !== "function") return;
    if (el.matches(":popover-open")) {
      place();
      return;
    }

    const trigger = shown ? buttons.current[shown.index] : null;
    const room = trigger ? window.innerHeight - trigger.getBoundingClientRect().bottom : Infinity;
    const guess = room < ROOM_BELOW ? "top" : "bottom";
    el.dataset.side = guess;
    el.showPopover();
    place();

    const side = el.dataset.side;
    if (side !== guess && el.matches(":popover-open")) {
      el.hidePopover();
      el.getBoundingClientRect(); // style it hidden, so the next show enters again
      el.dataset.side = side;
      el.showPopover();
      place();
    }
  }, [present, shown, place]);

  /* the dismissals, and keeping the panel on its name while the page moves */
  useEffect(() => {
    if (!open) return;

    let frame = 0;
    const follow = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(place);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      close();
    };

    const outside = (target: EventTarget | null) => {
      const node = target as Node | null;
      if (!node || panel.current?.contains(node)) return false;
      return !buttons.current.some((b) => b?.contains(node));
    };

    let pressed: number | null = null;
    const onPress = (e: PointerEvent) => {
      if (!outside(e.target)) return;
      if (e.pointerType === "mouse") close();
      else pressed = e.pointerId;
    };
    const onLift = (e: PointerEvent) => {
      if (e.pointerId !== pressed) return;
      pressed = null;
      if (outside(e.target)) close();
    };
    const onCancel = (e: PointerEvent) => {
      if (e.pointerId === pressed) pressed = null;
    };

    window.addEventListener("keydown", onKey, true);
    document.addEventListener("pointerdown", onPress, true);
    document.addEventListener("pointerup", onLift, true);
    document.addEventListener("pointercancel", onCancel, true);
    window.addEventListener("scroll", follow, { capture: true, passive: true });
    window.addEventListener("resize", follow);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKey, true);
      document.removeEventListener("pointerdown", onPress, true);
      document.removeEventListener("pointerup", onLift, true);
      document.removeEventListener("pointercancel", onCancel, true);
      window.removeEventListener("scroll", follow, { capture: true });
      window.removeEventListener("resize", follow);
    };
  }, [open, place, close]);

  useEffect(() => clearTimers, [clearTimers]);

  const explained = shown ? terms[shown.index] : undefined;

  return (
    <>
      {terms.map((term, index) => {
        const last = index === terms.length - 1;
        if (!term.note) return `${term.leadIn}${term.text}${last ? "" : ", "}`;

        const active = tip?.index === index;
        const pinned = active && tip?.pinned === true;
        return (
          <Fragment key={term.key}>
            {term.leadIn}
            <button
              ref={(node) => {
                buttons.current[index] = node;
              }}
              type="button"
              className={styles.term}
              data-active={active || undefined}
              aria-expanded={pinned}
              aria-controls={pinned && present ? panelId : undefined}
              aria-describedby={active ? panelId : undefined}
              onPointerEnter={(e) => hoverIn(index, e.pointerType)}
              onPointerLeave={(e) => hoverOut(e.pointerType)}
              onClick={() => press(index)}
              onFocus={(e) => {
                /* Tab onto another name: the open panel belongs to the last */
                if (tip && !active && e.currentTarget.matches(":focus-visible")) close();
              }}
              onBlur={(e) => {
                /* focus moved off the list — Tab away, or a press on another
                   focusable. A press on another NAME is not leaving: its click
                   moves the panel, and closing first would flicker. */
                if (!active) return;
                const next = e.relatedTarget as Node | null;
                if (!next || buttons.current.includes(next as HTMLButtonElement)) return;
                const own = panel.current;
                if (own && (next.contains(own) || own.contains(next))) return;
                close();
              }}
            >
              <span className={styles.word}>{term.text}</span>
              {!last && <span aria-hidden="true">,</span>}
            </button>
            {!last && " "}
          </Fragment>
        );
      })}

      {present && explained?.note && (
        <span
          ref={panel}
          id={panelId}
          popover="manual"
          className={`${styles.panel} drop`}
          data-state={leaving ? "leaving" : undefined}
          onPointerEnter={(e) => {
            if (e.pointerType === "mouse") clearTimeout(closeTimer.current);
          }}
          onPointerLeave={(e) => hoverOut(e.pointerType)}
        >
          <span className={`${styles.name} t-label`}>{explained.text}</span>
          <span className={`${styles.role} t-label-sm`}>{explained.note.role}</span>
          <span className={`${styles.about} t-body3`}>{explained.note.about}</span>
        </span>
      )}

      <span role="status" className="visually-hidden">
        {announcement}
      </span>
    </>
  );
}

/**
 * Whether any of the name is still on screen — inside the viewport AND inside
 * every clipping ancestor. The tray scrolls inside a viewport that does not,
 * so a name can leave the tray while its rect is still in the window, and a
 * panel pinned to it would float over the tray's heading.
 */
function inSight(el: Element): boolean {
  const r = el.getBoundingClientRect();
  let top = 0;
  let bottom = window.innerHeight;
  for (let p = el.parentElement; p; p = p.parentElement) {
    if (getComputedStyle(p).overflowY === "visible") continue;
    const box = p.getBoundingClientRect();
    top = Math.max(top, box.top);
    bottom = Math.min(bottom, box.bottom);
  }
  return r.bottom > top && r.top < bottom;
}

/* A mouse has to rest on a name this long before it explains itself, so a
   pointer crossing the paragraph does not flash a panel at every name. */
const HOVER_OPEN_MS = 250;

const HOVER_CLOSE_MS = 150;

/* `space/sm` off the name, `space/lg` off the viewport's edges — the page's own
   gutter. Literals because they are pixel arithmetic, not styles. */
const GAP = 8;
const GUTTER = 16;

/* below this much room under the name the panel starts above it — about the
   panel's height with a three-line explanation; `place` has the real number */
const ROOM_BELOW = 160;
