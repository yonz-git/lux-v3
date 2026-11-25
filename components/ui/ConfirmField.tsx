"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { TextField } from "./TextField";
import { NoteIcon, SuccessCheckIcon } from "./icons";
import { CloseButton } from "./CloseButton";
import { IconButton } from "./IconButton";
import styles from "./ConfirmField.module.css";

/**
 * A free-text answer you keep or throw away — ✓ and ✕ inside the field while
 * typing, then a glass row with the words, a pen to reopen them and ✕ to drop
 * them.
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
          <IconButton
            ref={penRef}
            size="xs"
            label={`Edit ${noun}`}
            onClick={() => setEditing(true)}
          >
            <NoteIcon className={styles.actionIcon} />
          </IconButton>
          <CloseButton label={`Remove ${noun}`} onClick={onRemove} />
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
        <IconButton
          size="xs"
          label={`Keep ${noun}`}
          onClick={confirm}
        >
          <SuccessCheckIcon className={styles.checkIcon} />
        </IconButton>
        <CloseButton label={`Remove ${noun}`} onClick={onRemove} />
      </div>
    </div>
  );
}
