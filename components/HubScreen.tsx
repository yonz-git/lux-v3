"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import styles from "./HubScreen.module.css";
import { BottomNav } from "./BottomNav";
import { ChevronLeftIcon } from "./icons";

/**
 * The shell every PRODUCTS **hub** screen shares — `Product added`,
 * `My Products` and `Long-term products list`.
 *
 * ⚠️ A HUB SCREEN IS NOT AN INVESTIGATION STEP, AND THE HEADER IS HOW YOU TELL.
 * A screen belongs to the 8-step add flow if and only if it carries BOTH a
 * progress track AND `Save & exit`. These carry neither, so they get neither —
 * and their nav reads `products`, not `check`.
 *
 *   hub landing (nav-reachable)  no chevron, no action — nothing to go back to
 *   hub pushed view              a back chevron, and whatever action it defines
 *
 * The title lives in the BODY, not in the header row. That is pattern C from the
 * desktop guide and it is what every other hub landing in the file does.
 *
 * `layout` picks the desktop composition: `card` is one centred 920 frosted card
 * (the two list screens), `plain` floats the content on the gradient with no
 * card at all (`Product added`, `My Products — empty`) — the same exception
 * welcome and empty-state screens have always had.
 */
export function HubScreen({
  title,
  subtitle,
  backHref,
  action,
  layout = "card",
  center,
  footer,
  children,
}: {
  title?: string;
  subtitle?: string;
  /** a pushed view's back chevron; a landing has none */
  backHref?: string;
  /** the header row's right-hand slot */
  action?: ReactNode;
  layout?: "card" | "plain";
  /** centre the body between two equal flexible spacers */
  center?: boolean;
  /** pinned below the body — `Product added`'s two stacked buttons */
  footer?: ReactNode;
  children?: ReactNode;
}) {
  const hasHeader = Boolean(backHref || action);

  const heading = title ? (
    <div className={styles.heading}>
      <h1 className="t-h3-h2">{title}</h1>
      {subtitle && <p className={`${styles.subtitle} t-body3-body2`}>{subtitle}</p>}
    </div>
  ) : null;

  return (
    <main className="screen" data-layout="hub">
      <div className={styles.shell} data-reveal>
        {hasHeader && (
          <div className={styles.header}>
            {backHref ? (
              <Link href={backHref} className={styles.back} aria-label="Back">
                <ChevronLeftIcon />
              </Link>
            ) : (
              <span />
            )}
            {action}
          </div>
        )}

        {/* on a `plain` screen the heading sits at the top of the full-width
            column; on a `card` screen it moves inside the card with the body */}
        {layout === "plain" && heading}

        {center && <div className={styles.flex} aria-hidden="true" />}

        <div className={styles.body} data-layout={layout} data-reveal data-reveal-stagger>
          {layout === "card" && heading}
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

      <BottomNav active="products" />
    </main>
  );
}
