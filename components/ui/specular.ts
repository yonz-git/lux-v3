import type { PointerEvent } from "react";

/**
 * The specular edge — the pointer half of `.specular` in globals.css.
 *
 * ⚠️ NOT IN FIGMA — asked for directly, 12 Sep 2026, after reactbits'
 * "Specular Button" (reactbits.dev/components/specular-button). The reference
 * paints its ring on a canvas; LUX draws the same picture with a conic
 * gradient masked to a hairline, and this is the one thing CSS cannot do on
 * its own: know where the pointer is. Each move writes the angle from the
 * control's centre to the pointer (0 = top, clockwise, the conic convention)
 * into `--specular-angle`, and the ring's two streaks turn to face it.
 *
 * The angle is UNWRAPPED against the last one written, so a pointer crossing
 * the bottom of the pill goes 179 -> 181 rather than 179 -> -179 — the
 * registered property transitions between the two, and the short way round
 * is the only way that reads as the streak following the hand.
 */
export function trackSpecular(event: PointerEvent<HTMLElement>) {
  const el = event.currentTarget;
  const r = el.getBoundingClientRect();
  const dx = event.clientX - (r.left + r.width / 2);
  const dy = event.clientY - (r.top + r.height / 2);
  let deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
  const last = Number(el.dataset.specularAngle);
  if (Number.isFinite(last)) {
    while (deg - last > 180) deg -= 360;
    while (deg - last < -180) deg += 360;
  }
  el.dataset.specularAngle = String(deg);
  el.style.setProperty("--specular-angle", `${deg}deg`);
}
