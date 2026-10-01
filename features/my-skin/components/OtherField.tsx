"use client";

import { useEffect, useRef } from "react";
import { TextField } from "@/components/ui/TextField";
import { Collapse } from "@/components/ui/Collapse";

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
 */
export function OtherField({
  open,
  value,
  onChange,
  placeholder,
}: {
  open: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const wasOpen = useRef(open);

  // focus the field the moment it appears, so ticking "Other" lands the caret
  // where the user has to type next rather than making them reach for it
  useEffect(() => {
    if (open && !wasOpen.current) inputRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  return (
    <Collapse open={open}>
      <TextField
        ref={inputRef}
        value={value}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Collapse>
  );
}
