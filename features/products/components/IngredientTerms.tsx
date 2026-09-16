"use client";

import { Fragment, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import styles from "./IngredientTerms.module.css";
import { noteFor, splitInci, splitLeadIn } from "@/features/products/ingredients";
import { DROP_EXIT_MS, useDialogPresence, useHeldWhileClosing } from "@/lib/useModalDialog";

/**
 * An INCI list whose names explain themselves — rest a mouse on one, or tap
 * it, and a small panel says what the ingredient is.
 *
 * ⚠️ NOT IN FIGMA — asked for directly 16 Sep 2026 ("add hover effect on the
 * ingredient that explains what it is? on mobile it should be tapping"). The
 * design system has no tooltip, no toggletip and no definition treatment, so
 * the name takes a dotted underline and the panel takes the trays' own ground
 * (`Sheet`'s fill and frost, asked for directly the same day) rather than a
 * new one.
 *
 * ⚠️ ONLY A NAME THE GLOSSARY KNOWS IS A CONTROL. Every live Open Beauty Facts
 * result carries names `features/products/ingredients.ts` has no line for, and
 * an underline that opens onto nothing is worse than no underline: it teaches
 * the reader the dotted names are not worth trying. Unknown names stay plain
 * text, so the list reads as it always did wherever there is nothing to say.
 *
 * ⚠️ EVERY INGREDIENT LIST IN THE APP DRAWS IT — asked for directly ("apply to
 * all the elements that contain ingredients part"), after an afternoon on the
 * `/products` hub alone. `/check/results` does not: its `Ingredients of
 * concern` card already explains each ingredient in its own sentence, and
 * `CompatCard`'s risky ingredients are status pills, not a list.
 *
 * ⚠️ IT IS A POPOVER IN THE TOP LAYER, AND IT HAS TO BE. The list renders in
 * three places — the PRODUCTS accordion, `/check/new`'s rows and the add tray's
 * cards — and between them they defeat every ordinary tooltip:
 *   - the tray is `overflow-y: auto`, so an absolute panel is clipped by it;
 *   - every card is `backdrop-filter`ed, which makes `position: fixed`
 *     relative to the CARD (the bug `Sheet`'s own doc comment measured);
 *   - a portal to `document.body` escapes both, but puts the explanation
 *     OUTSIDE the tray's `aria-modal` dialog, where a screen reader will not go.
 * `popover="manual"` paints above everything while staying in this DOM, so it
 * has none of the three problems. `manual` rather than `auto` because the
 * dismissals are ours: an `auto` popover's Escape still reaches `Sheet`'s
 * document listener, and one key would close the explanation AND the tray.
 *
 * ⚠️ HOVER AND TAP ARE ONE PANEL WITH TWO WAYS IN, NOT TWO MECHANISMS.
 *   - A MOUSE opens it after `HOVER_OPEN_MS` at rest, and it closes
 *     `HOVER_CLOSE_MS` after the pointer leaves both the name and the panel —
 *     the grace is what lets the pointer cross onto the panel (WCAG 1.4.13,
 *     "hoverable"). Touch and pen never take this path.
 *   - A CLICK — a tap, Enter or Space — PINS it, and a second click on the same
 *     name lets it go. A click on a name hover already opened pins it rather
 *     than closing it, because that is what the click meant. While pinned,
 *     hovering other names leaves it where it is; clicking one moves it.
 *   - Escape, a press anywhere else, focus moving on, and the name scrolling
 *     out of sight all dismiss it. ⚠️ A FINGER'S PRESS CLOSES IT ON LIFT, NOT
 *     ON TOUCH: every touch scroll starts with a press, and closing on it
 *     dropped a pinned panel on the first frame of a scroll that a wheel let
 *     the panel follow. A pan ends in `pointercancel`, which closes nothing.
 *   - ⚠️ THE 8px BETWEEN A NAME AND ITS PANEL BELONGS TO THE PANEL. Names are
 *     one 22px line tall and touch, so that gap lies over the next line's
 *     name, and crossing it used to hover that name and move the panel a line
 *     further away — a pointer heading for the panel never reached it (WCAG
 *     1.4.13). `.panel::before` bridges it; see the module.
 * One panel for the whole list: moving from name to name moves the panel and
 * never stacks a second one.
 *
 * ⚠️ A PIN IS ANNOUNCED, A HOVER IS NOT. The panel mounts as it opens, and a
 * live region that arrives already holding its text is not read, so a
 * persistent `role="status"` takes the sentence on a pin. Announcing hovers
 * would read out every name the pointer crossed. ⚠️ EVERY NAME ALSO CARRIES
 * `aria-expanded`, for the PIN only. A toggletip usually announces through the
 * live region alone, behind a "More info" button; here the button IS the
 * ingredient's name, so nothing else tells a screen reader it opens anything,
 * and a second press that closes the panel was otherwise silent.
 *
 * ⚠️ NOT `pressable`, AND NO `.tap-target`. The panel appears on the press
 * itself, and a name inside a sentence is the inline exception to WCAG 2.5.8.
 */
export function IngredientTerms({ ingredients }: { ingredients: string }) {
  const terms = useMemo(
    /* the key is the name's place in the list — a label can repeat a name, and
       the list never reorders. ⚠️ THE FIRST NAME LOSES THE LABEL'S LEAD-IN
       (`Ingredients:`, a batch code) — it stays on screen as plain text, but
       not inside the dotted name, the panel's heading or the announcement. */
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
    /* ⚠️ A PIN IS NOT TAKEN OVER BY A PASSING POINTER. It was, for an hour:
       hovering a second name moved the panel onto it unpinned, so it closed
       as the pointer left, and the live region went on holding the first
       name's sentence. A click moves a pin; hovering does not. */
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

  /* ⚠️ THE SIDE GOES ON BEFORE `showPopover`, AND THE SIZE IS READ AFTER IT.
     The entrance is `@starting-style`, resolved the first time the node is
     styled as SHOWN, so the side it rises from must already be on the node.
     That only holds because a closed panel keeps the browser's `display: none`
     — `display` is set on `.panel:popover-open` and never on `.panel`, and it
     was, for a few hours: the closed node was styled on the first layout read
     below, before `data-side` existed, and every panel above its name fell in
     from above. The side is guessed from the room under the name and `place`
     settles it; if the guess was wrong, the panel is shown again from the side
     it settled on, before the frame paints. */
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
      /* ⚠️ CAPTURED ON `window` AND STOPPED — `Sheet` closes on an Escape it
         hears at `document`, and one Escape should close one thing */
      e.stopPropagation();
      close();
    };

    const outside = (target: EventTarget | null) => {
      const node = target as Node | null;
      if (!node || panel.current?.contains(node)) return false;
      return !buttons.current.some((b) => b?.contains(node));
    };

    /* ⚠️ A MOUSE CLOSES IT ON THE PRESS, A FINGER OR PEN ON THE LIFT — see the
       doc comment. A pan hands its pointer to the browser with
       `pointercancel`, so a scroll never reaches `onLift`. */
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
                   moves the panel, and closing first would flicker.
                   ⚠️ NOR IS A PRESS ON THE PANEL. Its text is not focusable, so
                   the browser hands focus to the nearest focusable ancestor —
                   `main[tabindex=-1]` after a client-side navigation, or the
                   tray — which CONTAINS the panel; closing on that blur shut
                   the panel under a press meant to select its words. A press
                   anywhere else is closed by the document listeners. */
                if (!active) return;
                const next = e.relatedTarget as Node | null;
                if (!next || buttons.current.includes(next as HTMLButtonElement)) return;
                const own = panel.current;
                if (own && (next.contains(own) || own.contains(next))) return;
                close();
              }}
            >
              {/* ⚠️ THE COMMA IS INSIDE THE BUTTON, AFTER THE WORDS. A button
                  is an atomic inline: a comma outside it can break onto the
                  next line, and held to it by `nowrap` it followed the button's
                  BOX — so a name wrapping inside itself at 320 pushed its comma
                  past the paragraph. Inside, it rides the name's last line.
                  Hidden from the name a screen reader reads; not underlined,
                  because only `.word` is. */}
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

/* ⚠️ THE GRACE THAT MAKES THE PANEL HOVERABLE — long enough to cross `GAP`
   onto it, short enough that leaving still reads as closing it. */
const HOVER_CLOSE_MS = 150;

/* `space/sm` off the name, `space/lg` off the viewport's edges — the page's own
   gutter. Literals because they are pixel arithmetic, not styles.
   ⚠️ `GAP` IS ALSO THE HEIGHT OF `.panel::before`, the bridge across it —
   change one and change the other. */
const GAP = 8;
const GUTTER = 16;

/* below this much room under the name the panel starts above it — about the
   panel's height with a three-line explanation; `place` has the real number */
const ROOM_BELOW = 160;
