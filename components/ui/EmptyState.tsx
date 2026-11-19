import type { ReactNode } from "react";
import styles from "./EmptyState.module.css";
import { Button } from "./Button";
import { Orb } from "./Orb";

/**
 * A screen with nothing to show yet: orb, title, one line of body and the
 * action that fills it. Orb → 32 → title (`t-h5`) → 12 → body → Welcome's
 * gap → action. Sits inside `HubScreen layout="plain" center="empty"`, which
 * sets it low as Welcome is; no card.
 */
export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  /** the body line */
  children: ReactNode;
  action: { label: string; href?: string; onClick?: () => void };
}) {
  return (
    <div className={styles.empty}>
      <Orb animateIn className={styles.orb} />
      <h2 className={`${styles.title} t-h5`}>{title}</h2>
      <p className={`${styles.body} t-body3-body2`}>{children}</p>
      <Button
        width="action"
        href={action.href}
        onClick={action.onClick}
        className={styles.action}
      >
        {action.label}
      </Button>
    </div>
  );
}
