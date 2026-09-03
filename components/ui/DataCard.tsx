import type { ElementType, ReactNode } from "react";
import styles from "./DataCard.module.css";

/**
 * The sage data card — SURFACE SYSTEM B, from `HANDOFF — INVESTIGATION &
 * PROGRESS` (559:1376).
 *
 * ⚠️ THIS IS THE OTHER SURFACE SYSTEM, NOT A VARIANT OF THE FROSTED ROW.
 * GETTING STARTED and PRODUCTS are forms: light frosted rows and cards on the
 * canvas gradient, dark text. PROGRESS (and CHECK) are readouts, and the
 * handoff is explicit about what that means:
 *
 *   fill    surface/data          rgba(125,167,169,0.44)
 *   effect  surface/frosted-data  drop 0 12 32 -8 @12% + background blur 28
 *   radius  radius/2xl            24
 *   padding spacing/xl (20) mobile, spacing/2xl (24) desktop
 *   stroke  NONE
 *
 * ⚠️ NO STROKE, and that is the easy mistake. Every frosted ROW and light card
 * in the app carries a 1px `border/subtle`; a data card carries none, so rule
 * 12's `calc(padding - border)` does not apply here either. A divider INSIDE
 * one is 1px `border/glass`, never `border/subtle`.
 *
 * ⚠️ THE TEXT ON IT IS WHITE, and which white is meaningful:
 *   text/on-data            values, headings          #ffffff
 *   text/on-data-secondary  body copy                 85%
 *   text/on-data-muted      labels, axes, weekdays    62%
 * A section label is `Overline` in text/on-data-muted. Accents — checked-in
 * discs, timeline dots, meter fills — are indigo `bg/brand`. The trend line is
 * white.
 *
 * ⚠️ A NESTED EMPHASIS BLOCK IS `surface/data-strong`, NOT A LIGHT CARD. A sage
 * card inside a light card is a LUX pattern; the reverse is not.
 *
 * The card is deliberately dumb — surface, padding and a 16 gap. Its heading is
 * the caller's, because the three that exist do not share one: the profile card
 * leads with an Overline label, the calendar with an H5 plus month arrows, the
 * trend card with a bare H5.
 */
export function DataCard({
  as: Tag = "section",
  className,
  children,
  ...rest
}: {
  as?: ElementType;
  className?: string;
  children?: ReactNode;
} & Record<string, unknown>) {
  return (
    <Tag
      className={[styles.card, className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </Tag>
  );
}
