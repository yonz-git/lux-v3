"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
 * so the bar names where you are and nothing else. The bar hugs its items,
 * centred, at every width. ⚠️ Until 3 Oct 2026 an active section stretched it
 * the width of the phone with the pill taking the slack; that was cut, asked
 * for directly ("it should be contained like in desktop"). Inactive labels
 * are visually hidden, not dropped: each circle is still named by its word.
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

/* ⚠️ THE PILL MORPHS BETWEEN SECTIONS — 4 Oct 2026, asked for directly ("can
   you make an animated button for when it changes shape"). Every screen
   renders its OWN BottomNav, so moving section is an unmount and a fresh
   mount: there is no element that lives through the change for a CSS
   transition to run on. So the nav remembers, at module scope (which does
   survive a client-side navigation), which section was lit, and the next
   nav plays the change from there with the Web
   Animations API: the new section's item grows from a 56 circle to its pill
   and its label fades in once the pill has room for it. ⚠️ The old pill does
   NOT shrink back — it did for a first pass and was cut the same day ("we
   don't need old shapes"); it is simply a circle on the new screen. The bar hugs its items, so
   it resizes with them. `duration/slow` on `ease/standard`, the board's
   values for a change of place. Reduced motion skips it, as does a first
   load or a page outside the four sections.
   ⚠️ IT PLAYS ON THE TAP, NOT ON THE NEXT PAGE — the same day, asked for
   directly ("when the user taps the icon, it becomes that indigo button and
   the text appears"). Waiting for the new screen to mount put the whole
   route load between the tap and any answer to it. The tapped circle now
   becomes the indigo pill at once (`tapped`), and `lastActive` is set to it
   in the same breath, so the next screen's nav sees no change to replay. A
   deep link or the browser's back button still gets the morph on mount. */
let lastActive: NavSection | null = null;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function BottomNav({
  active = "none",
  className,
  style,
}: {
  active?: NavSection;
  className?: string;
  style?: React.CSSProperties;
}) {
  const navRef = useRef<HTMLElement>(null);
  /* the section the user just tapped, lit before its screen arrives */
  const [tapped, setTapped] = useState<NavSection | null>(null);
  const lit = tapped ?? active;
  /* once the page says where we are, it is the truth again — a nav that
     outlives a navigation must not keep showing an old tap */
  useEffect(() => setTapped(null), [active]);

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const item = (id: NavSection | null) =>
      id ? nav.querySelector<HTMLElement>(`[data-nav-id="${id}"]`) : null;
    const now = item(lit);
    const was = item(lastActive);
    const from = lastActive;

    lastActive = lit;

    if (from === lit || from === null || prefersReducedMotion()) return;

    const timing: KeyframeAnimationOptions = {
      duration: 320,
      easing: "cubic-bezier(0.2, 0, 0, 1)",
    };
    if (now) {
      const circle = was?.offsetWidth ?? 56;
      now.animate(
        [{ width: `${circle}px` }, { width: `${now.offsetWidth}px` }],
        timing,
      );
      now.querySelector("[data-nav-label]")?.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { ...timing, duration: 200, delay: 140, fill: "backwards" },
      );
    }
  }, [lit]);

  return (
    <nav
      ref={navRef}
      className={className ? `${styles.nav} ${className}` : styles.nav}
      style={style}
      aria-label="Sections"
    >
      {items.map(({ id, label, href, Icon }) => {
        const isActive = lit === id;
        /* the active pill shows its word; a circle keeps it for the screen
           reader only */
        const content = (
          <>
            <Icon className={styles.icon} />
            <span
              className={isActive ? `${styles.label} t-nav` : "visually-hidden"}
              data-nav-label={isActive || undefined}
            >
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
              data-nav-id={id}
              aria-current={active === id ? "page" : undefined}
              onClick={(e) => {
                /* a plain tap only: a modified click opens a new tab and
                   leaves this screen where it is */
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                if (id !== lit) setTapped(id);
              }}
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
            data-nav-id={id}
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
