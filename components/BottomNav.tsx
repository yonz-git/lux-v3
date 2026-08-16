"use client";

import styles from "./BottomNav.module.css";
import { ProgressIcon, CheckIcon, ProductsIcon } from "./icons";

/**
 * The bottom navigation, from Figma component set `Bottom-Nav-Bar` (410:258).
 *
 * `active` mirrors the component's Active property and reflects the section the
 * user is IN, not the screen they came from:
 *   progress — dashboards, progress, streaks, rituals
 *   check    — check-in and investigation questions
 *   products — product browse and detail
 *   none     — outside those three sections (welcome, intro, onboarding steps).
 *              `none` is a deliberate state, not a fallback.
 *
 * Size is handled by CSS (380 mobile / 598 desktop) rather than a prop, since
 * on the web the breakpoint decides, not the caller.
 *
 * NOTE: the items render as buttons, not links, because only 00 Welcome exists
 * so far. Swap them for `next/link` as each section lands, and set
 * `aria-current="page"` on the active one at that point.
 */

export type NavSection = "none" | "progress" | "check" | "products";

const items = [
  { id: "progress", label: "Progress", Icon: ProgressIcon },
  { id: "check", label: "Check", Icon: CheckIcon },
  { id: "products", label: "Products", Icon: ProductsIcon },
] as const;

export function BottomNav({ active = "none" }: { active?: NavSection }) {
  return (
    <nav className={styles.nav} aria-label="Sections">
      {items.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          className={styles.item}
          data-active={active === id}
          // no destination yet — see the note above
          onClick={() => {}}
        >
          <Icon />
          <span className={`${styles.label} t-label-sm`}>{label}</span>
        </button>
      ))}
    </nav>
  );
}
