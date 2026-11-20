"use client";

import { useId, type ReactNode } from "react";
import styles from "./SearchField.module.css";
import { SearchIcon } from "./icons";
import { CloseButton } from "./CloseButton";
import { IconButton } from "./IconButton";

/**
 * Search Field: a pill with a leading search glyph and either a trailing
 * clear button once there is text (in `text/muted`) or an optional round
 * action at the end, never both.
 */
export function SearchField({
  value,
  onChange,
  placeholder = "Search for a product",
  label,
  action,
  variant = "glass",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** the accessible name — the field has no visible <label> in the design */
  label: string;
  /** a glyph button at the field's end, e.g. switching to the camera */
  action?: { label: string; icon: ReactNode; onClick: () => void };
  /** `clear` drops the fill, for a field that sits on a panel already */
  variant?: "glass" | "clear";
}) {
  const id = useId();
  return (
    <div className={variant === "clear" ? `${styles.field} ${styles.clearField}` : styles.field}>
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
      {/* a field that ends in an action has no clear: one round control at
          the end, never two side by side */}
      {value !== "" && !action && (
        <CloseButton label="Clear search" className={styles.clear} onClick={() => onChange("")} />
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
