"use client";

import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import styles from "./HubScreen.module.css";
import { BottomNav, type NavSection } from "./BottomNav";
import { ChevronLeftIcon } from "@/components/ui/icons";

/**
 * The shell every **hub** screen shares — the PRODUCTS hub (`My Products`,
 * `Long-term products list`) and PROGRESS (`Progress — empty` / `— active`).
 *
 * ⚠️ A HUB SCREEN IS NOT AN INVESTIGATION STEP, AND THE HEADER IS HOW YOU TELL.
 * A screen belongs to the investigation flow if and only if it carries BOTH a
 * progress track AND `Save & exit`. These carry neither, so they get neither —
 * and their nav names their own section (`products`, `progress`), never
 * `check`, which is the flow.
 *
 *   hub landing (nav-reachable)  no chevron, no action — nothing to go back to
 *   hub pushed view              a back chevron, and whatever action it defines
 *
 * The title lives in the BODY, not in the header row. That is pattern C from the
 * desktop guide and it is what every other hub landing in the file does.
 *
 * `layout` picks the desktop composition:
 *   card   one centred 920 frosted card (the two PRODUCTS list screens)
 *   plain  the content floats on the gradient in a 640 column with no card at
 *          all (`Product added`, `My Products — empty`, `Progress — empty`) —
 *          the same exception welcome and empty-state screens have always had
 *   grid   the full 1280 as a two-column dashboard, no card (`Progress —
 *          active`)
 *
 * ⚠️ `grid` IS NOT A WIDER `card`. `HANDOFF — INVESTIGATION & PROGRESS`
 * (559:1376) is explicit: at 1280 the desktop guide means "dashboard grid, no
 * card". The data screens put sage `DataCard`s straight onto the gradient, and
 * nesting those inside the light 920 page card would invert the one nesting
 * rule the handoff states — a sage card inside a light card is a LUX pattern,
 * the reverse is not.
 *
 * ⚠️ THE TITLE SITS OUTSIDE THE BODY FOR `plain` AND `grid`, inside it for
 * `card`. On a card screen the heading is part of the card; on the other two it
 * is a page header spanning the full column while the body below it is narrower
 * (640) or subdivided (the two grid columns).
 *
 * `nav` is the section the screen belongs to. It defaults to `products` because
 * every hub screen was a PRODUCTS screen until PROGRESS landed — pass it.
 */
export function HubScreen({
  title,
  subtitle,
  backHref,
  action,
  layout = "card",
  nav = "products",
  belowHeading,
  center,
  tightTop,
  gridColumns,
  footer,
  children,
}: {
  title?: string;
  subtitle?: string;
  /** a pushed view's back chevron; a landing has none */
  backHref?: string;
  /** the header row's right-hand slot */
  action?: ReactNode;
  layout?: "card" | "plain" | "grid";
  /** the bottom-nav section this screen belongs to */
  nav?: NavSection;
  /**
   * Content pinned directly under the page heading, ABOVE the centred region.
   *
   * `Check — start` (601:1952) puts its skin-profile strip here: it belongs to
   * the header area, not to the hero block that `center` floats in the middle
   * of what is left. Passing it as a child instead would centre it along with
   * the hero, which is not what the comp draws.
   */
  belowHeading?: ReactNode;
  /** centre the body between two equal flexible spacers */
  center?: boolean;
  /**
   * Take the screen's top padding one step down the scale, 40 -> 32.
   *
   * ⚠️ NOT IN FIGMA, AND OPT-IN ONE SCREEN AT A TIME. The
   * screens that take it are listed at their call sites; if the tighter top
   * wins everywhere it belongs on `.screen` outright and this prop goes away.
   * The rule is `.screen[data-tight-top]` in globals.css — it CANNOT live in
   * this module, because `.screen` is a global class and a module would hash
   * the selector to nothing.
   */
  tightTop?: boolean;
  /**
   * `grid` only: the desktop `grid-template-columns` (default `640px 1fr`).
   * ⚠️ NOT IN FIGMA — `Check-in detail` passes `440px 1fr 1fr`: a column that
   * hugs its square photo, and two halves for the cards beside it.
   */
  gridColumns?: string;
  /** pinned below the body — `Product added`'s two stacked buttons */
  footer?: ReactNode;
  children?: ReactNode;
}) {
  const hasHeader = Boolean(backHref || action);

  /* ⚠️ NOT IN FIGMA — the hub title steps DOWN one ramp entry, `t-h3-h2`
     → `t-h4-h3` (24/32 → 20/28 mobile, 32/40 → 24/32 desktop). The comps give
     a hub landing H3/H2 and every investigation screen H4/H3, which made this
     h1 the only `t-h3-h2` in the app: the lightest screens in the product —
     readouts and lists — were titled a full step louder than the questions that
     are the actual task. It also broke the page's own rhythm; measured on
     `/progress` at 440 the stack ran 24 → 18 → 14 → 13 → 12, so the widest
     interval on the page separated the title from a header two levels down
     inside a card. At 20 the title leads the ground plane, the sage cards keep
     their own internal ramp, and every page title in the app now matches.
     Both classes are existing entries in the globals.css ramp — this is a swap
     between declared text styles, not a font-size written on a screen. */
  const heading = title ? (
    <div className={styles.heading}>
      <h1 className="t-h4-h3">{title}</h1>
      {subtitle && <p className={`${styles.subtitle} t-body3-body2`}>{subtitle}</p>}
    </div>
  ) : null;

  return (
    <main
      className="screen"
      data-layout="hub"
      data-center={center || undefined}
      data-tight-top={tightTop || undefined}
    >
      <div className={styles.shell} data-reveal>
        {hasHeader && (
          <div className={styles.header}>
            {backHref ? (
              <Link href={backHref} className={`${styles.back} pressable`} aria-label="Back">
                <ChevronLeftIcon />
              </Link>
            ) : (
              <span />
            )}
            {action}
          </div>
        )}

        {/* on a `plain` or `grid` screen the heading sits at the top of the
            full-width column; on a `card` screen it moves inside the card with
            the body.

            ⚠️ UNLESS THE CARD SCREEN IS ALSO CENTRED — added 8 Sep 2026, and it
            is what made `center` usable with `layout="card"` at all. The
            heading is the body's first child on a card screen, so centring the
            body used to centre the page title with it: "Analysis" floated to
            the middle of the screen above its own card. Every `plain` caller
            works because its heading sits OUT here, at the top, while only the
            block below is centred — so a centred card screen hoists its heading
            the same way. The 24 under it comes from `.header + .heading` on
            desktop and from `.heading` itself on mobile; the body's own
            `.body > .heading + *` rule simply has no heading to match. */}
        {(layout !== "card" || center) && heading}
        {belowHeading}

        {center && <div className={styles.flex} aria-hidden="true" />}

        <div
          className={styles.body}
          data-layout={layout}
          data-reveal
          data-reveal-stagger
          style={
            gridColumns
              ? ({ "--hub-grid-columns": gridColumns } as CSSProperties)
              : undefined
          }
        >
          {layout === "card" && !center && heading}
          {children}
        </div>

        {/* ⚠️ THE TRAILING SPACER MOVES BELOW THE FOOTER ON DESKTOP. On mobile
            `Product added` pins its two buttons to the bottom of the screen and
            centres the success block above them; on desktop the comp centres the
            block AND the buttons together as one group, with 40 between them.
            Same DOM, reordered — see .tail in the stylesheet. */}
        {center && <div className={styles.flex} data-tail aria-hidden="true" />}

        {footer && <div className={styles.footer}>{footer}</div>}
      </div>

      <BottomNav active={nav} />
    </main>
  );
}
