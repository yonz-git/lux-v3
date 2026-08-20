import type { StepId } from "./flow";

/**
 * Everything the user has answered so far.
 *
 * Keyed by StepId so a screen and its answer cannot drift apart. Single-select
 * steps store a string, multi-select steps store an array.
 */
export type Answers = Partial<{
  start: string[];
  "skin-type": string;
  tendencies: string[];
  conditions: string[];
  symptoms: string[];
  location: string[];
  selfie: string;
  timing: { onset?: string; status?: string; date?: string };
  products: string[];
}>;

/**
 * ⚠️ EXCLUSIVE OPTIONS — "None", "Not sure", "Prefer not to say".
 *
 * These are answers ABOUT the list, not items in it. They stay CHECKBOXES and
 * keep `role="checkbox"` — the group is still multi-select — but they clear
 * everything else. Never switch just those rows to radios: mixing circles and
 * squares in one group tells the user the whole group is single-select.
 */
export const EXCLUSIVE_OPTIONS = ["None", "Not sure", "Prefer not to say"];

export function isExclusive(option: string): boolean {
  return EXCLUSIVE_OPTIONS.includes(option);
}

/**
 * Toggle one option inside a multi-select group, applying the exclusive rules:
 *
 *   taps a normal option    -> deselect every exclusive, keep the rest
 *   taps an exclusive       -> deselect everything else, including the other
 *                              exclusives (they are mutually exclusive)
 *   unchecks an exclusive   -> just unchecks it. Do NOT restore the previous
 *                              selections.
 */
export function toggleMulti(current: string[], option: string): string[] {
  const selected = current.includes(option);

  if (isExclusive(option)) {
    // unchecking an exclusive clears it and restores nothing
    return selected ? [] : [option];
  }

  const withoutExclusives = current.filter((o) => !isExclusive(o));
  return selected
    ? withoutExclusives.filter((o) => o !== option)
    : [...withoutExclusives, option];
}

/**
 * ⚠️ NOT a storage key any more — answers are held IN MEMORY only.
 * Kept solely so the provider can delete data written by an earlier build that
 * did persist; opening the prototype then showed a previous visit's selections
 * as though the screens shipped pre-filled. Remove this once it has shipped for
 * long enough that no stale data remains.
 */
export const LEGACY_STORAGE_KEY = "lux.investigation.v1";

export type AnswerKey = keyof Answers & StepId;
