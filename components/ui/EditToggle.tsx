"use client";

import styles from "./EditToggle.module.css";
import { IconButton } from "./IconButton";
import { EditSparkleIcon, SuccessCheckIcon } from "./icons";

/**
 * EditToggle — a card's Edit / Save control, at its overline's end. Edit
 * opens the card's controls in place and Save closes them.
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
