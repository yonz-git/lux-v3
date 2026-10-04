"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { TextField } from "./TextField";
import { CloseIcon, NoteIcon, SuccessCheckIcon } from "./icons";
import styles from "./ConfirmField.module.css";

/**
 * A free-text answer you keep or throw away — ✓ and ✕ inside the field while
 * typing, then a glass row with the words, a pen to reopen them and ✕ to drop
 * them.
 *
 * ⚠️ LIFTED HERE 4 Oct 2026, ON ITS THIRD CALLER, asked for directly ("same
 * thing here, no check x icons", on step 3's `Other` field). Step 1's `Other`
 * description drew it first (StartInvestigation.tsx, still its own copy,
 * tied to the face card's store answer), the check-in's note second, as a
 * copy of step 1's styles, and that copy said to lift it on a third. Two
 * sections use it now, so it is `components/ui` by the placement rule.
 *
 *   ✓ or Enter   keeps the text and shows it as the row; an empty field has
 *                nothing to keep, so confirming it is removing it
 *   ✕ or Esc     `onRemove` — the caller decides what "gone" means (the
 *                note closes; step 3's `Other` chip unticks)
 *   ✎            reopens the field on the same words
 *
 * ⚠️ ESC IS THE FIELD'S, NOT THE DIALOG'S. Inside a Radix dialog (the check-in
 * overlay, a `Sheet`) Escape is heard at the document first and would close
 * the whole dialog. The field carries `data-own-escape`, and both dialogs
 * decline Escape that starts inside one.
 *
 * A value that arrives filled (restored from the store) arrives confirmed.
 */
export function ConfirmField({
  value,
  onChange,
  onRemove,
  placeholder,
  label,
  noun,
  inputRef: outerRef,
}: {
  value: string;
  onChange: (v: string) => void;
  onRemove: () => void;
  placeholder: string;
  /** the field's accessible name */
  label: string;
  /** what the buttons act on — "Keep note", "Edit condition" */
  noun: string;
  /** the input, for a caller that scrolls it into view */
  inputRef?: RefObject<HTMLInputElement | null>;
}) {
  const [editing, setEditing] = useState(() => !value.trim());
  const ownRef = useRef<HTMLInputElement>(null);
  const inputRef = outerRef ?? ownRef;
  const penRef = useRef<HTMLButtonElement>(null);

  /* the field takes focus whenever it opens — without the browser's jump
     scroll, so a caller can scroll it in smoothly (see CheckIn's note) */
  useEffect(() => {
    if (editing) inputRef.current?.focus({ preventScroll: true });
  }, [editing, inputRef]);

  const confirm = () => {
    if (!value.trim()) {
      onRemove();
      return;
    }
    setEditing(false);
    requestAnimationFrame(() => penRef.current?.focus());
  };

  if (!editing && value.trim()) {
    return (
      <div className={styles.confirmed}>
        <p className={`${styles.text} t-body2`}>{value}</p>
        <div className={styles.actions}>
          <button
            ref={penRef}
            type="button"
            className={styles.action}
            aria-label={`Edit ${noun}`}
            onClick={() => setEditing(true)}
          >
            <NoteIcon className={styles.actionIcon} />
          </button>
          <button
            type="button"
            className={styles.action}
            aria-label={`Remove ${noun}`}
            onClick={onRemove}
          >
            <CloseIcon className={styles.actionIcon} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.fieldWrap}>
      <TextField
        ref={inputRef}
        value={value}
        placeholder={placeholder}
        aria-label={label}
        data-own-escape=""
        style={{ paddingRight: 80 }}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") confirm();
          if (e.key === "Escape") onRemove();
        }}
      />
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.action}
          aria-label={`Keep ${noun}`}
          onClick={confirm}
        >
          <SuccessCheckIcon className={styles.checkIcon} />
        </button>
        <button
          type="button"
          className={styles.action}
          aria-label={`Remove ${noun}`}
          onClick={onRemove}
        >
          <CloseIcon className={styles.actionIcon} />
        </button>
      </div>
    </div>
  );
}
