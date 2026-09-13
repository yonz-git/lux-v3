"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./DateField.module.css";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "./icons";
import { useDialogPresence } from "@/lib/useModalDialog";
import {
  type IsoDate,
  WEEKDAYS,
  addDays,
  addMonths,
  formatFull,
  formatLong,
  formatMonth,
  fromIso,
  monthGrid,
  sameDay,
  startOfMonth,
  toIso,
} from "@/lib/date";

/**
 * A date field with a LUX-styled calendar.
 *
 * ⚠️ WHY THIS IS NOT `<input type="date">`. The native control's popup is drawn
 * by the browser and cannot be styled at all — no token, class or pseudo-element
 * reaches inside it. It rendered as a stock white Chrome calendar with a blue
 * selected day in the middle of the LUX flow. The only way to make the calendar
 * look like the product is to own it.
 *
 * The trigger matches Figma's `date-field` (52 tall, frost-light + border/subtle
 * + radius/lg + the frosted-row inner shadow, value in Body 2, chevron-down on
 * the right). The design system has NO calendar component — this is composed
 * from tokens and belongs in Figma eventually.
 *
 * Keyboard: arrows move by day/week, PageUp/PageDown by month, Home/End to the
 * ends of the week, Enter/Space selects, Escape closes and returns focus.
 */
export function DateField({
  value,
  onChange,
  id,
  placeholder = "Select a date",
}: {
  value?: IsoDate;
  onChange: (v: IsoDate | undefined) => void;
  id?: string;
  placeholder?: string;
}) {
  const selected = value ? fromIso(value) : null;
  const today = new Date();

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<Date>(() =>
    startOfMonth(selected ?? today)
  );
  const [focused, setFocused] = useState<Date>(() => selected ?? today);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const dialogId = useId();
  /* the calendar outlives `open` by its exit — "Dropdowns" in globals.css.
     Focus, Escape and the outside click all key off `open`, so it stops being
     the calendar the moment it is dismissed and only its paint lingers. */
  const panel = useDialogPresence(open);

  // close on outside pointer or Escape
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  /* keep DOM focus on the focused day while the calendar is open

     biome-ignore lint/correctness/useExhaustiveDependencies: `focused` IS
     LOAD-BEARING AND THE RULE CANNOT SEE IT. The effect reaches the day through
     the DOM (`[data-focused="true"]`, rendered from this very state), so no
     reference to `focused` appears in the body and Biome reads the dep as
     surplus. It is the trigger: drop it and DOM focus stops following the arrow
     keys, stranding the ring on whichever day was focused when the calendar
     opened. */
  useEffect(() => {
    if (!open) return;
    gridRef.current
      ?.querySelector<HTMLButtonElement>('[data-focused="true"]')
      ?.focus();
  }, [open, focused]);

  function moveFocus(next: Date) {
    setFocused(next);
    if (next.getMonth() !== view.getMonth() || next.getFullYear() !== view.getFullYear()) {
      setView(startOfMonth(next));
    }
  }

  function onGridKey(e: React.KeyboardEvent) {
    const map: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };
    if (e.key in map) {
      e.preventDefault();
      moveFocus(addDays(focused, map[e.key]));
    } else if (e.key === "PageUp") {
      e.preventDefault();
      moveFocus(addMonths(focused, -1));
    } else if (e.key === "PageDown") {
      e.preventDefault();
      moveFocus(addMonths(focused, 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      moveFocus(addDays(focused, -((focused.getDay() + 6) % 7)));
    } else if (e.key === "End") {
      e.preventDefault();
      moveFocus(addDays(focused, 6 - ((focused.getDay() + 6) % 7)));
    }
  }

  function pick(d: Date) {
    onChange(toIso(d));
    setOpen(false);
    triggerRef.current?.focus();
  }

  const days = monthGrid(view);

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        type="button"
        id={id}
        ref={triggerRef}
        className={styles.trigger}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? dialogId : undefined}
        onClick={() => {
          setOpen((o) => !o);
          setFocused(selected ?? today);
          setView(startOfMonth(selected ?? today));
        }}
      >
        <span className={`${styles.value} t-body2`} data-placeholder={!selected}>
          {selected ? formatLong(selected) : placeholder}
        </span>
        <ChevronDownIcon className={styles.chevron} />
      </button>

      {panel.present && (
        <div
          id={dialogId}
          role="dialog"
          aria-label="Choose a date"
          className={`${styles.panel} drop`}
          data-state={panel.leaving ? "leaving" : undefined}
          inert={panel.leaving}
        >
          <div className={styles.header}>
            <button
              type="button"
              className={styles.navBtn}
              aria-label="Previous month"
              onClick={() => setView((v) => addMonths(v, -1))}
            >
              <ChevronLeftIcon />
            </button>
            <span className={`${styles.month} t-h6`} aria-live="polite">
              {formatMonth(view)}
            </span>
            <button
              type="button"
              className={styles.navBtn}
              aria-label="Next month"
              onClick={() => setView((v) => addMonths(v, 1))}
            >
              <ChevronRightIcon />
            </button>
          </div>

          <div className={styles.weekdays} aria-hidden="true">
            {WEEKDAYS.map((w, i) => (
              /* biome-ignore lint/suspicious/noArrayIndexKey: WEEKDAYS is a
                 fixed seven-item constant that never reorders or filters, and
                 its labels REPEAT — "T" and "S" appear twice — so the value
                 cannot be the key. The position is the identity here. */
              <span key={i} className={`${styles.weekday} t-label-sm`}>
                {w}
              </span>
            ))}
          </div>

          {/* one roving tabstop, which is how a date grid is meant to behave */}
          <div
            className={styles.grid}
            ref={gridRef}
            role="grid"
            onKeyDown={onGridKey}
          >
            {days.map((d) => {
              const outside = d.getMonth() !== view.getMonth();
              const isSelected = selected ? sameDay(d, selected) : false;
              const isToday = sameDay(d, today);
              const isFocused = sameDay(d, focused);
              return (
                <button
                  key={toIso(d)}
                  type="button"
                  role="gridcell"
                  className={`${styles.day} t-body3`}
                  data-outside={outside}
                  data-selected={isSelected}
                  data-today={isToday}
                  data-focused={isFocused}
                  tabIndex={isFocused ? 0 : -1}
                  aria-selected={isSelected}
                  aria-current={isToday ? "date" : undefined}
                  aria-label={formatFull(d)}
                  onClick={() => pick(d)}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={`${styles.action} t-label`}
              onClick={() => {
                onChange(undefined);
                setOpen(false);
                triggerRef.current?.focus();
              }}
            >
              Clear
            </button>
            <button
              type="button"
              className={`${styles.action} t-label`}
              onClick={() => pick(today)}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
