"use client";

import type {
  ButtonHTMLAttributes,
  PointerEvent,
  PointerEventHandler,
  ReactNode,
} from "react";
import Link from "next/link";
import styles from "./SmallButton.module.css";
import { trackSpecular } from "./specular";

/**
 * Small Button — Figma `Small Button / Secondary / Default` (225:60).
 *
 * A sage gradient pill, 38 tall, label `Button Small` in text/brand, carrying
 * the same two stacked drop shadows as Button.
 *
 * ⚠️ The Figma component has NO Label text property — its default string is
 * "Learn more", so every instance in the file overrides the text child by hand.
 * Here the label is a real prop, which is what that component should have.
 *
 * The trailing arrow is part of the component; `arrow={false}` hides it the way
 * the Add control on the CHECK screens does.
 *
 * ⚠️ `specular={false}` drops the hover rim — asked for directly, 13 Sep 2026,
 * for the Add control on `/check/new`. That control repeats down every row of
 * two lists, so a light streak chasing the pointer across it turned scanning
 * the list into a light show. The rim is not rendered and the pointer is not
 * tracked; the gradient reversal and the label shine stay.
 */
type Props = {
  label: string;
  arrow?: boolean;
  /** a leading glyph from `icons.tsx`, sized to icon/sm (20) by the module */
  icon?: ReactNode;
  /** the pointer-facing hover rim — see the doc comment above */
  specular?: boolean;
  href?: string;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">;

export function SmallButton({
  label,
  arrow = true,
  icon,
  specular = true,
  href,
  className,
  onPointerMove,
  ...rest
}: Props) {
  /* the specular rim (globals.css `.specular`) turns to face the pointer — the
     same treatment `Button` has, and why this is a client component */
  const handlePointerMove = specular
    ? (e: PointerEvent<HTMLButtonElement>) => {
        trackSpecular(e);
        onPointerMove?.(e);
      }
    : onPointerMove;
  const content = (
    <>
      {specular && <span className="specular" aria-hidden="true" />}
      {/* ⚠️ NOT IN FIGMA — Small Button (225:60) has no icon slot; added 13
          Sep 2026 for `Add another product` */}
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      {/* ⚠️ NOT IN FIGMA — the label shines on hover (`.shine-on-hover`,
          globals.css), the same glint `Button` has; the arrow does not */}
      <span className="t-button-sm shine-text shine-on-hover">{label}</span>
      {arrow && (
        <span className="t-button-sm" aria-hidden="true">
          →
        </span>
      )}
    </>
  );
  /* `pressable` is board 04b's overlay, shared from globals.css — the same
     recipe `Button` draws inline. Without it the app's two action controls
     answered a tap differently. */
  const cls = [styles.button, "pressable", className].filter(Boolean).join(" ");

  // a disabled control must not stay a link — links are not disableable
  if (href && !rest.disabled) {
    return (
      <Link
        href={href}
        className={cls}
        onPointerMove={handlePointerMove as unknown as PointerEventHandler<HTMLAnchorElement>}
      >
        {content}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} onPointerMove={handlePointerMove} {...rest}>
      {content}
    </button>
  );
}
