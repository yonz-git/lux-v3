"use client";

import Link from "next/link";
import styles from "./BottomNav.module.css";
import { ProgressIcon, CheckIcon, ProductsIcon, MySkinIcon } from "./icons";

/**
 * The bottom navigation, from Figma component set `Bottom-Nav-Bar` (410:258).
 *
 * `active` mirrors the component's Active property and reflects the section the
 * user is IN, not the screen they came from:
 *   my-skin  — the investigation flow: every `QuestionScreen`, `/investigation/*`
 *   progress — dashboards, progress, streaks, rituals
 *   check    — the compatibility check, `/check*`
 *   products — product browse and detail
 *   none     — outside those four sections (welcome, intro, onboarding steps).
 *              `none` is a deliberate state, not a fallback.
 *
 * ⚠️ `My skin` IS A FOURTH ITEM AND IT IS NOT IN FIGMA. `Bottom-Nav-Bar`
 * (410:258) encodes three. The investigation flow — the longest section in the
 * app and the one every other section depends on — had no nav item at all, so
 * `QuestionScreen` lit `Check` on all six of its screens. That is wrong twice
 * over: it told the user they were in the compatibility check while they were
 * answering profile questions, and it meant the Check tab appeared active on
 * screens its own landing cannot reach. The flow is now its own section,
 * FIRST, because it is what the other three read from — `/progress`, `/check`
 * and `/products` all render the answers it collects.
 *
 * Its landing is step 1, `/investigation/start`, whose CTA everywhere in the
 * app reads `Create skin profile` — which is the label `Check — no profile`
 * (606:2183) already gives that exact link. The nav item is named for the
 * thing, not the act, for the same reason.
 *
 * Size is handled by CSS (380 mobile / 598 desktop) rather than a prop, since
 * on the web the breakpoint decides, not the caller.
 *
 * ⚠️ ALL FOUR SECTIONS ARE LINKS. My skin, Progress, Check and Products each
 * have a landing, so every item is a real `next/link` carrying
 * `aria-current="page"` when it is the active section, and the inert-button
 * branch below is dead code kept only for the next section that lands before
 * its screen does.
 *
 * ⚠️ `Check` IS THE COMPATIBILITY CHECK, AND THE DAILY CHECK-IN IS NOT IN IT.
 * The PROGRESS handoff nominally puts `Check-in chat` in this section, and that
 * assignment was not taken: the daily check-in ships under PROGRESS, at
 * `/progress/check-in`, and lights `Progress`. Reporting your symptoms and
 * scoring a basket of products share the word "check" and nothing else, and
 * lighting this tab while the user answers "how is your skin today?" is the
 * same category error that lit it on the profile questions. The whole argument
 * is on `components/CheckIn.tsx`; raise the section split in Figma.
 */

export type NavSection = "none" | "my-skin" | "progress" | "check" | "products";

const items = [
  { id: "my-skin", label: "My skin", Icon: MySkinIcon, href: "/investigation/start" },
  { id: "progress", label: "Progress", Icon: ProgressIcon, href: "/progress" },
  { id: "check", label: "Check", Icon: CheckIcon, href: "/check" },
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
