"use client";

import styles from "./EditToggle.module.css";
import { IconButton } from "./IconButton";
import { EditSparkleIcon, SuccessCheckIcon } from "./icons";

/**
 * EditToggle — a card's Edit / Save control, at its overline's end. Edit
 * opens the card's controls in place and Save closes them.
 *
 * ⚠️ A ROUND ICON BUTTON, NOT A WORDED PILL — 1 Nov 2026, asked for directly
 * ("change the edit button to an icon button using the same circle as the
 * back icon button"): `IconButton` glass at `md` (48), the header's back
 * button, holding the supplied pen-and-sparkle (`EditSparkleIcon`). It was
 * `SmallButton` with the words `Edit` / `Save` until then. A round button has
 * no room for a word, so Save is the app's ✓ (`SuccessCheckIcon`).
 *
 * ⚠️ `Save`, NOT `Done` — 31 Oct 2026, asked for directly. Nothing waits for
 * the press: every control the card opens writes to the store as it is
 * tapped, as step 1 does, so Save closes the panel on answers that are
 * already kept.
 *
 * ⚠️ ONE COMPONENT FOR EVERY EDITABLE CARD — lifted out of the profile recap
 * the same day, when PROGRESS's `Symptoms and location` card took the same
 * control ("as i said use reusable component system").
 *
 * The two glyphs are stacked in one grid cell and trade opacity on the smooth
 * recipe, so the swap does not snap. The `aria-label` is what a screen reader
 * hears: `Edit skin profile` / `Save skin profile`.
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
    <span className={styles.slot}>
      <IconButton
        size="md"
        label={editing ? `Save ${subject}` : `Edit ${subject}`}
        aria-expanded={editing}
        onClick={onClick}
      >
        <span className={styles.swap}>
          <span data-on={!editing || undefined}>
            <EditSparkleIcon />
          </span>
          <span data-on={editing || undefined}>
            <SuccessCheckIcon />
          </span>
        </span>
      </IconButton>
    </span>
  );
}
