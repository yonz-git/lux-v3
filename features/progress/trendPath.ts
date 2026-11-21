/** A smooth line through the points, each segment eased with horizontal
 *  control points so it never overshoots a band. Points are in the chart's
 *  0–100 viewBox. Shared by the Progress trend card and Skin health. */
export function smoothPath(pts: readonly (readonly [number, number])[]): string {
  return pts
    .map(([x, y], i) => {
      if (i === 0) return `M${x} ${y}`;
      const [x0, y0] = pts[i - 1];
      const dx = (x - x0) / 2;
      return `C${x0 + dx} ${y0} ${x - dx} ${y} ${x} ${y}`;
    })
    .join(" ");
}
