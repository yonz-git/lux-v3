"use client";

import { useId } from "react";
import styles from "./SearchField.module.css";
import { SearchIcon, CloseIcon } from "./icons";

/**
 * Search Field — Figma component 248:70, used verbatim by `04 — Search by name`.
 *
 * 50 tall, radius/full, `surface/frost-nav` fill with the frosted-row inner
 * shadow, a leading search glyph and a trailing clear button, both in
 * `text/muted`.
 *
 * ⚠️ THIS IS THE ONLY INPUT COMPONENT THE DESIGN SYSTEM HAS, and it is
 * search-specific. `TextField` (the "Other" field, 02c/03a) is a separate
 * hand-composed recipe. Do not reach for this one for general text entry.
 *
 * The clear button only exists while there is something to clear — the comp
 * shows it because the comp shows a typed query.
 */
export function SearchField({
  value,
  onChange,
  placeholder = "Search products",
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** the accessible name — the field has no visible <label> in the design */
  label: string;
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
          className={styles.clear}
          aria-label="Clear search"
          onClick={() => onChange("")}
        >
          <CloseIcon className={styles.icon} />
        </button>
      )}
    </div>
  );
}
