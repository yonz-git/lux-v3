import { DataCard } from "@/components/ui/DataCard";
import {
  BUCKET_KEY_LABEL,
  countIn,
  type BucketId,
  type SavedProduct,
} from "../products";
import styles from "./RoutineSummary.module.css";

const ORDER: BucketId[] = ["long-term", "recent", "new-addition", "not-sure"];

export function RoutineSummary({ products }: { products: SavedProduct[] }) {
  const total = products.length;
  const parts = ORDER.map((id) => ({ id, n: countIn(products, id) })).filter(
    (p) => p.n > 0,
  );

  return (
    <DataCard className={`${styles.card} grain`} aria-labelledby="routine-total">
      <p className={styles.top}>
        <span className={`${styles.overline} t-overline`}>In your routine</span>
        <span
          id="routine-total"
          className={`${styles.total} t-label`}
          data-align-exempt="centred on the x-height, not the caps (RoutineSummary.module.css)"
        >
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
