"use client";

import type { CSSProperties, ReactNode } from "react";
import styles from "./HubScreen.module.css";
import { BottomNav, type NavSection } from "./BottomNav";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { IconButton } from "@/components/ui/IconButton";

/**
 * The shell every **hub** screen shares — the PRODUCTS hub (`My Products`,
 * `Long-term products list`) and PROGRESS (`Progress — empty` / `— active`).
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
  /** `true` centres the body between two equal flexible spacers. `"empty"`
   *  keeps the heading at the top and sets the body low, in Welcome's
   *  proportions, so an empty state's button sits where Welcome's does. */
  center?: boolean | "low" | "empty";
  /** Take the screen's top padding one step down the scale, 40 -> 32. */
  tightTop?: boolean;
  /** `grid` only: the desktop `grid-template-columns` (default `640px 1fr`). */
  gridColumns?: string;
  /** the screen's actions below the body — `My Products`' */
  footer?: ReactNode;
  children?: ReactNode;
}) {
  const hasHeader = Boolean(backHref || action);
  const low = center === "low";
  const empty = center === "empty";

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
      data-center={center === true || undefined}
      /* `center="low"` reserves no nav on desktop at any height — globals.css */
      data-low={low || empty || undefined}
      data-tight-top={tightTop || undefined}
    >
      <div className={styles.shell} data-reveal>
        {hasHeader && (
          <div className={styles.header}>
            {backHref ? (
              /* `IconButton` glass at 48 — the app's one back button */
              <IconButton size="md" href={backHref} label="Back">
                <ArrowLeftIcon />
              </IconButton>
            ) : (
              <span />
            )}
            {action}
          </div>
        )}

        {/* on a `plain` or `grid` screen the heading sits at the top of the
            full-width column; on a `card` screen it moves inside the card with
            the body. */}
        {(layout !== "card" || center) && !low && heading}
        {!low && belowHeading}

        {center === true && <div className={styles.flex} aria-hidden="true" />}
        {empty && <div className={styles.aboveEmpty} aria-hidden="true" />}

        {low && (
          <div className={styles.above}>
            {heading}
            {belowHeading}
          </div>
        )}

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

        {center && <div className={low || empty ? styles.below : styles.flex} aria-hidden="true" />}

        {footer && <div className={styles.footer}>{footer}</div>}
      </div>

      <BottomNav active={nav} />
    </main>
  );
}
