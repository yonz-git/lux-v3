"use client";

import { useId, type ReactNode } from "react";
import styles from "./SearchField.module.css";
import { SearchIcon, CloseIcon } from "./icons";
import { IconButton } from "./IconButton";

/**
 * Search Field: a pill with a leading search glyph and a trailing clear button
 * once there is text, both in `text/muted`, and an optional round action at
 * the end. The action stays at the end, so clear appearing never moves it.
 */
export function SearchField({
  value,
  onChange,
  placeholder = "Search products",
  label,
  action,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** the accessible name — the field has no visible <label> in the design */
  label: string;
  /** a glyph button at the field's end, e.g. switching to the camera */
  action?: { label: string; icon: ReactNode; onClick: () => void };
}) {
  const id = useId();
  return (
    <div className={styles.field}>
      <SearchIcon className={styles.icon} />
      <input
        id={id}
        type="search"
        className={`${styles.input} t-body2`}
        value={value}
        placeholder={placeholder}
        aria-label={label}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
      />
      {value !== "" && (
        <button
          type="button"
          className={styles.trailing}
          aria-label="Clear search"
          onClick={() => onChange("")}
        >
          <CloseIcon className={styles.icon} />
        </button>
      )}
      {action && (
        <IconButton
          size="md"
          label={action.label}
          className={styles.action}
          onClick={action.onClick}
        >
          {action.icon}
        </IconButton>
      )}
    </div>
  );
}
