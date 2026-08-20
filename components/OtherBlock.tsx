"use client";

import { useEffect, useRef } from "react";
import styles from "./OtherBlock.module.css";
import { OptionRow } from "./OptionRow";
import { TextField } from "./TextField";

/**
 * `other-block` — the "Other" checkbox with a free-text field revealed beneath
 * it. Figma names the frame "other-block · input shown when Other is checked",
 * which is exactly the behaviour: the field only exists once Other is ticked.
 *
 * "Other" is an ordinary multi-select option, NOT an exclusive one — picking it
 * does not clear the rest.
 *
 * When Other is checked the text is REQUIRED: an unfilled "Other" is not an
 * answer, so the step's isComplete rule refuses it and Continue stays disabled.
 */
export function OtherBlock({
  selected,
  onToggle,
  value,
  onChange,
  placeholder,
  label = "Other",
}: {
  selected: boolean;
  onToggle: () => void;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const wasSelected = useRef(selected);

  // focus the field the moment it appears, so checking "Other" lands the caret
  // where the user has to type next rather than making them reach for it
  useEffect(() => {
    if (selected && !wasSelected.current) inputRef.current?.focus();
    wasSelected.current = selected;
  }, [selected]);

  return (
    <div className={styles.block}>
      <OptionRow
        control="checkbox"
        label={label}
        selected={selected}
        onSelect={onToggle}
      />
      {selected && (
        <TextField
          className="reveal-quick"
          ref={inputRef}
          value={value}
          placeholder={placeholder}
          aria-label={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
