import type { ReactNode } from "react";
import styles from "./SearchDropdown.module.css";

/**
 * Search Dropdown: the frosted panel that hangs off a `SearchField` with what
 * the search found. The PRODUCTS add tray and `/analyses/new` both use it.
 *
 * `float` sits over the page under the field (`/analyses/new`); `flow` takes its
 * place in the tray's column, tucked up under the field. The panel caps its
 * height and scrolls inside, under an optional heading that stays put.
 * Mount it while the presence hook says so, and pass `leaving` while it exits.
 */
export function SearchDropdown({
  placement,
  leaving,
  heading,
  children,
}: {
  placement: "float" | "flow";
  leaving?: boolean;
  /** stays put while the rows scroll, e.g. the result count */
  heading?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className={`${styles.panel} drop`}
      data-placement={placement}
      data-state={leaving ? "leaving" : undefined}
      inert={leaving}
    >
      {heading && <h2 className={`${styles.heading} t-label`}>{heading}</h2>}
      <div className={styles.scroll}>{children}</div>
    </div>
  );
}

/** A one-line state of the panel: "Searching…", "No products match …". */
export function SearchDropdownNote({ children }: { children: ReactNode }) {
  return <p className={`${styles.note} t-body3`}>{children}</p>;
}

export function SearchDropdownList({ children }: { children: ReactNode }) {
  return <ul className={styles.list}>{children}</ul>;
}

/**
 * One result: a row on the panel's own fill, not a card of its own. With
 * `onSelect` the whole row is the button; otherwise its `trailing` control is.
 */
export function SearchDropdownRow({
  leading,
  title,
  meta,
  trailing,
  onSelect,
}: {
  /** the thumbnail */
  leading: ReactNode;
  title: ReactNode;
  /** one line under the title */
  meta?: ReactNode;
  trailing?: ReactNode;
  onSelect?: () => void;
}) {
  const body = (
    <>
      {leading}
      <span className={styles.copy}>
        <span className={`${styles.title} t-h6`}>{title}</span>
        {meta && <span className={`${styles.meta} t-label-sm`}>{meta}</span>}
      </span>
      {trailing}
    </>
  );

  return (
    <li>
      {onSelect ? (
        <button type="button" className={styles.row} onClick={onSelect}>
          {body}
        </button>
      ) : (
        <div className={styles.row}>{body}</div>
      )}
    </li>
  );
}
