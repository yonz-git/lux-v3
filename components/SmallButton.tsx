import type { ButtonHTMLAttributes } from "react";
import Link from "next/link";
import styles from "./SmallButton.module.css";

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
 */
type Props = {
  label: string;
  arrow?: boolean;
  href?: string;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">;

export function SmallButton({ label, arrow = true, href, className, ...rest }: Props) {
  const content = (
    <>
      <span className="t-button-sm">{label}</span>
      {arrow && (
        <span className="t-button-sm" aria-hidden="true">
          →
        </span>
      )}
    </>
  );
  const cls = [styles.button, className].filter(Boolean).join(" ");

  if (href) {
    return (
      <Link href={href} className={cls}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} {...rest}>
      {content}
    </button>
  );
}
