import { DataCard } from "@/components/ui/DataCard";
import {
  BUCKET_KEY_LABEL,
  countIn,
  type BucketId,
  type SavedProduct,
} from "../products";
import styles from "./RoutineSummary.module.css";

/**
 * The routine card at the top of My Products — option G, picked on the design
 * canvas 3 Oct 2026 after "my products should come to the center, and there
 * should be a system that shows the total products". ⚠️ NOT IN FIGMA.
 *
 * It replaced the heading's `6 products added` subtitle. The total is the
 * card's figure, and under it one bar split by how long each group has been in
 * the routine, keyed in words. The bar answers "how many" and "how old" at
 * once, and a long dark run says most of the routine is settled, a pale end
 * points at what is new, which is where LUX looks first.
 *
 * ⚠️ IT WEARS THE PROGRESS CHART'S DEEP TEAL, WHITE INK AND ALL — 3 Oct 2026,
 * asked for directly ("use the progress graph bg color"), with the total in
 * a pill ("put 6 products in a pill"). The surface is copied from
 * `SymptomTrend.module.css`, so a retune there has to be repeated here.
 * Shades run from solid white for the oldest group to a faint white for the
 * newest; the key carries the same shade in a dot so the bar is readable
 * without colour alone, and the bar itself is hidden from screen readers
 * because the key says it in words.
 *
 * Groups with nothing in them are left out of the bar and the key, so an
 * empty period never draws a sliver. "Not sure" joins only when it has
 * products, the same rule the list below follows.
 */
const ORDER: BucketId[] = ["long-term", "recent", "new-addition", "not-sure"];

export function RoutineSummary({ products }: { products: SavedProduct[] }) {
  const total = products.length;
  const parts = ORDER.map((id) => ({ id, n: countIn(products, id) })).filter(
    (p) => p.n > 0,
  );

  return (
    <DataCard className={styles.card} aria-labelledby="routine-total">
      <p className={styles.top}>
        <span className={`${styles.overline} t-overline`}>In your routine</span>
        <span id="routine-total" className={`${styles.total} t-label`}>
          {total} product{total === 1 ? "" : "s"}
        </span>
      </p>
      <div className={styles.bar} aria-hidden="true">
        {parts.map((p) => (
          <span
            key={p.id}
            className={styles.segment}
            data-bucket={p.id}
            style={{ flexGrow: p.n }}
          />
        ))}
      </div>
      <ul className={styles.key}>
        {parts.map((p) => (
          <li key={p.id} className={`${styles.keyItem} t-label-sm`}>
            <span className={styles.dot} data-bucket={p.id} aria-hidden="true" />
            {p.n} {BUCKET_KEY_LABEL[p.id]}
          </li>
        ))}
      </ul>
    </DataCard>
  );
}
