"use client";

import styles from "./ProductAdded.module.css";
import { HubScreen } from "./HubScreen";
import { Button } from "./Button";
import { Tag } from "./Tag";
import { SuccessCheckIcon } from "./icons";
import { useInvestigation } from "./InvestigationProvider";
import { BUCKET_LIST_TITLE, bucketFor, fullName } from "@/lib/products";

/**
 * Product added. Figma mobile 579:1540, desktop 583:1832.
 *
 * ⚠️ THIS IS A HUB SCREEN, NOT AN ADD-FLOW STEP — nav `Active=Products`, no
 * progress track, no `Save & exit`, no header row at all. Its wireframe id is
 * `11:162`, which puts it with the three other hub screens rather than with the
 * eight `8:*` add-flow ones. It is reached from inside the flow all the same.
 *
 * The block is centred between two equal flexible spacers, with the two buttons
 * pinned below — that is what Figma's `flex-top` / `flex-bottom` pair of 211s
 * (229s on desktop) expresses, and expressing it as flex is what makes it hold
 * on viewport heights the 957 canvas never anticipated.
 */
export function ProductAdded() {
  const { answers } = useInvestigation();
  const draft = answers.productDraft;
  const bucket =
    draft?.duration != null ? bucketFor(draft.duration, draft.bucket) : draft?.bucket;

  return (
    <HubScreen
      layout="plain"
      center
      footer={
        <>
          <Button href="/investigation/products/long-term">Add another product</Button>
          <Button variant="secondary" href="/products">
            View my products
          </Button>
        </>
      }
    >
      <div className={styles.success}>
        <span className={styles.circle} aria-hidden="true">
          <SuccessCheckIcon className={styles.check} />
        </span>

        <h1 className="t-h3">Product added!</h1>

        {/* echo what was actually added rather than the comp's CeraVe — and
            guard for a deep link, which arrives with no draft at all */}
        {draft && (
          <>
            <p className={`${styles.name} t-h6`}>{fullName(draft.product)}</p>
            <p className={`${styles.size} t-label-sm`}>{draft.product.size}</p>
          </>
        )}

        {bucket && <Tag>Added to: {BUCKET_LIST_TITLE[bucket]}</Tag>}
      </div>
    </HubScreen>
  );
}
