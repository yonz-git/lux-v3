"use client";

import Link from "next/link";
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
 * ⚠️ ONLY THE SECTIONS THAT EXIST ARE LINKS. Products landed with the PRODUCTS
 * build, so that item is a real `next/link` carrying `aria-current="page"` when
 * it is the active section. Progress and Check have no hub screen yet, so they
 * stay inert buttons — a link to a 404 would be worse than a control that has
 * not been wired. Give each one an `href` here as its section lands.
 */

export type NavSection = "none" | "progress" | "check" | "products";

const items = [
  { id: "progress", label: "Progress", Icon: ProgressIcon, href: null },
  { id: "check", label: "Check", Icon: CheckIcon, href: null },
  { id: "products", label: "Products", Icon: ProductsIcon, href: "/products" },
] as const;

export function BottomNav({ active = "none" }: { active?: NavSection }) {
  return (
    <nav className={styles.nav} aria-label="Sections">
      {items.map(({ id, label, Icon, href }) => {
        const content = (
          <>
            <Icon />
            <span className={`${styles.label} t-label-sm`}>{label}</span>
          </>
        );
        const isActive = active === id;

        if (href) {
          return (
            <Link
              key={id}
              href={href}
              className={styles.item}
              data-active={isActive}
              aria-current={isActive ? "page" : undefined}
            >
              {content}
            </Link>
          );
        }
        return (
          <button
            key={id}
            type="button"
            className={styles.item}
            data-active={isActive}
            // no destination yet — see the note above
            onClick={() => {}}
          >
            {content}
          </button>
        );
      })}
    </nav>
  );
}
