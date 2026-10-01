"use client";

import Link from "next/link";
import styles from "./BottomNav.module.css";
import {
  CheckIcon,
  MySkinIcon,
  ProductsIcon,
  ProgressIcon,
} from "@/components/ui/icons";

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
 * ⚠️ NAV B, THE ROUND-BUTTON BAR — lux-v3, 1 Oct 2026, picked on the design
 * canvas ("nav B"). Four 56 glass circles, icon only, in a thin glass bar.
 * The ACTIVE section is the one item that grows into a labelled indigo pill,
 * so the bar names where you are and nothing else. Two shapes fall out of
 * `active`, never a prop:
 *   a section is active -> the bar runs the width of the phone, 8 in from
 *                          each side, and the pill takes the slack
 *   `none` (Welcome)    -> the bar hugs its four circles, centred
 *                          ("undo the full width only when it's needed")
 * Desktop always hugs. Inactive labels are visually hidden, not dropped: each
 * circle is still named by its word.
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

/* ⚠️ THE ICONS ARE BACK — 27 Sep 2026, asked for directly ("can u find nice
   icons to add?"), after a fortnight of text only. They went on 13 Sep because
   the four glyphs were four different drawings — an outline, a dotted ring, a
   filled glyph and a solid bottle-and-drop — and this file said to redraw them
   as ONE set before bringing them back. That is what `icons.tsx` now holds:
   one 24 box, one 1.5 stroke, one hand. The labels stay; an icon over a word
   is the Figma component's own shape (`Bottom-Nav-Bar`, 410:258). */
const items = [
  {
    id: "my-skin",
    label: "My skin",
    href: "/investigation/start",
    Icon: MySkinIcon,
  },
  { id: "progress", label: "Progress", href: "/progress", Icon: ProgressIcon },
  /* ⚠️ THE LABEL IS `Analysis`, THE ID IS STILL `check`. The id keys the route
     map, the `NavSection` type and every screen's `nav=` prop; renaming it
     would touch a dozen files to change a word the user never sees. The LABEL
     is the word the user sees, and the word the product means is analysis —
     the app was calling one idea "check", "investigation" and "findings". See
     `docs/decisions.md`, "the naming". */
  { id: "check", label: "Analysis", href: "/check", Icon: CheckIcon },
  { id: "products", label: "Products", href: "/products", Icon: ProductsIcon },
] as const;

export function BottomNav({
  active = "none",
  className,
  style,
}: {
  active?: NavSection;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <nav
      className={className ? `${styles.nav} ${className}` : styles.nav}
      style={style}
      data-compact={active === "none" || undefined}
      aria-label="Sections"
    >
      {items.map(({ id, label, href, Icon }) => {
        const isActive = active === id;
        /* the active pill shows its word; a circle keeps it for the screen
           reader only */
        const content = (
          <>
            <Icon className={styles.icon} />
            <span className={isActive ? `${styles.label} t-nav` : "visually-hidden"}>
              {label}
            </span>
          </>
        );

        if (href) {
          return (
            <Link
              key={id}
              href={href}
              className={`${styles.item} pressable`}
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
            className={`${styles.item} pressable`}
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
