"use client";

import { Collapse } from "@/components/ui/Collapse";
import { ConfirmField } from "@/components/ui/ConfirmField";

/**
 * The free-text field an `Other` answer reveals — Figma's `other-block`, "input
 * shown when Other is checked".
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
