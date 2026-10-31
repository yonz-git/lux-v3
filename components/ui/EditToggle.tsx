"use client";

import styles from "./EditToggle.module.css";
import { SmallButton } from "./SmallButton";

/**
 * EditToggle — a card's `Edit` / `Save` pill, at its overline's end. `Edit`
 * opens the card's controls in place and `Save` closes them. It is
 * `SmallButton` without its arrow: it opens a panel, it does not go anywhere.
 *
 * ⚠️ `Save`, NOT `Done` — 31 Oct 2026, asked for directly. Nothing waits for
 * the press: every control the card opens writes to the store as it is
 * tapped, as step 1 does, so `Save` closes the panel on answers that are
 * already kept.
 *
 * ⚠️ ONE COMPONENT FOR EVERY EDITABLE CARD — lifted out of the profile recap
 * the same day, when PROGRESS's `Symptoms and location` card took the same
 * control ("as i said use reusable component system").
 *
 * The two words are stacked in one grid cell and trade opacity on the smooth
 * recipe, so the swap does not snap and the pill keeps one width. The
 * `aria-label` is what a screen reader hears; the visible words are hidden
 * from it.
 */
export function EditToggle({
  editing,
  subject,
  onClick,
}: {
  editing: boolean;
  /** what is being edited, for the accessible name: "skin profile" */
  subject: string;
  onClick: () => void;
}) {
  return (
    <SmallButton
      label={
        <span className={styles.swap} aria-hidden="true">
          <span data-on={!editing || undefined}>Edit</span>
          <span data-on={editing || undefined}>Save</span>
        </span>
      }
      arrow={false}
      aria-label={editing ? `Save ${subject}` : `Edit ${subject}`}
      aria-expanded={editing}
      onClick={onClick}
    />
  );
}
