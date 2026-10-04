"use client";

import { Collapse } from "@/components/ui/Collapse";
import { ConfirmField } from "@/components/ui/ConfirmField";

/**
 * The free-text field an `Other` answer reveals — Figma's `other-block`, "input
 * shown when Other is checked". It was the checkbox row AND the field until
 * lux-v3 (1 Oct 2026), when the answers became chips: the `Other` chip now
 * sits in its group with the rest, and this is only what opens under the group.
 *
 * "Other" is an ordinary multi-select option, NOT an exclusive one — picking it
 * does not clear the rest.
 *
 * When Other is checked the text is REQUIRED: an unfilled "Other" is not an
 * answer, so the step's isComplete rule refuses it and Continue stays disabled.
 *
 * ⚠️ IT KEEPS OR DROPS ITS WORDS WITH ✓ AND ✕, AS OF 4 Oct 2026 — asked for
 * directly; it is `ConfirmField`. ✕ (or Esc) is `onRemove`, which the caller
 * makes untick `Other` and clear the words: a field you throw away should
 * take its chip with it, or the step is left asking for text again.
 */
export function OtherField({
  open,
  value,
  onChange,
  onRemove,
  placeholder,
}: {
  open: boolean;
  value: string;
  onChange: (v: string) => void;
  onRemove: () => void;
  placeholder: string;
}) {
  return (
    <Collapse open={open}>
      {open && (
        <ConfirmField
          value={value}
          onChange={onChange}
          onRemove={onRemove}
          placeholder={placeholder}
          label={placeholder}
          noun="condition"
        />
      )}
    </Collapse>
  );
}
