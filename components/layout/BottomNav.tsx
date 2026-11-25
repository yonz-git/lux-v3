"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./BottomNav.module.css";
import {
  CheckIcon,
  MySkinIcon,
  ProductsIcon,
} from "@/components/ui/icons";
import { useInvestigation } from "@/lib/store/InvestigationProvider";
import { hasInvestigation } from "@/features/progress/progress";

/**
 * The bottom navigation, from Figma component set `Bottom-Nav-Bar` (410:258).
 *
 * `active` mirrors the component's Active property and reflects the section the
 * user is IN, not the screen they came from:
 *   my-skin  — the investigation flow (every `QuestionScreen`,
 *              `/investigation/*`) and progress, `/myskin*`
 *   check    — the compatibility check, `/analyses*`
 *   products — product browse and detail
 *   none     — outside those three sections (welcome, intro, onboarding steps).
 *              `none` is a deliberate state, not a fallback.
 */

export type NavSection = "none" | "my-skin" | "check" | "products";

/* My skin opens the questionnaire until there is a profile, then Progress */
const items = [
  {
    id: "my-skin",
    label: "My skin",
    href: "/investigation/start",
    profileHref: "/myskin",
    Icon: MySkinIcon,
  },
  { id: "check", label: "Analysis", href: "/analyses", Icon: CheckIcon },
  { id: "products", label: "Products", href: "/products", Icon: ProductsIcon },
] as const;

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
  const hasProfile = hasInvestigation(useInvestigation().answers);
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
      {items.map((entry) => {
        const { id, label, Icon } = entry;
        const href =
          hasProfile && "profileHref" in entry ? entry.profileHref : entry.href;
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
            onClick={() => {}}
          >
            {content}
          </button>
        );
      })}
    </nav>
  );
}
