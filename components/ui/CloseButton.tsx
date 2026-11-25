import type { Ref } from "react";
import { IconButton } from "./IconButton";
import { CloseSmallIcon } from "./icons";

/**
 * The app's one ✕: a 20 glass disc with a 44 hit area, for closing a sheet or
 * panel, clearing a field or removing an item. `label` names what it does and
 * to what ("Remove CeraVe from this analysis").
 */
export function CloseButton({
  label,
  onClick,
  href,
  className,
  ref,
}: {
  label: string;
  onClick?: () => void;
  /** a link instead of a button, for a route that closes by navigating */
  href?: string;
  className?: string;
  ref?: Ref<HTMLButtonElement>;
}) {
  return (
    <IconButton
      size="xs"
      label={label}
      onClick={onClick}
      href={href}
      className={className}
      ref={ref}
    >
      <CloseSmallIcon />
    </IconButton>
  );
}
