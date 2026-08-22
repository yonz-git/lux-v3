"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./LongTermProducts.module.css";
import { QuestionScreen } from "./QuestionScreen";
import { ChatBubble } from "./ChatBubble";
import { Button } from "./Button";
import { Tag } from "./Tag";
import { Sheet } from "./Sheet";
import { ProductRow, AddProductRow, EmptyBox } from "./ProductList";
import { useInvestigation } from "./InvestigationProvider";
import { SearchIcon, CameraIcon, ChevronRightIcon } from "./icons";
import { fullName, type SavedProduct } from "@/lib/products";
import { nextHref } from "@/lib/flow";

/**
 * 04a — Long-term products. ONE screen in two states:
 *   empty  Figma mobile 574:1391, desktop 582:1662
 *   filled Figma mobile 578:1557, desktop 582:1918
 * plus the method sheet on top (mobile 576:1376, desktop dialog 583:1786).
 *
 * ⚠️ THE PROTOTYPE ARRIVES EMPTY. The comps show two products because a comp
 * has to show a filled-in state; which state renders here is decided by what
 * the user has actually added.
 *
 * The two states differ in more than the list: the empty one keeps the AI's
 * second, reassuring line and offers "None — skip to next"; the filled one drops
 * both, shows a count, and adds a secondary "Done" above Continue. Those are the
 * comps' own differences, not a simplification.
 *
 * ⚠️ ONLY THE LONG-TERM PERIOD IS DESIGNED. The intro promises three, and
 * neither Recent nor New addition exists at either breakpoint or in the
 * wireframes, so Continue ends step 8 here — see `lib/flow.ts`.
 */
export function LongTermProducts() {
  const router = useRouter();
  const { answers } = useInvestigation();
  const [sheetOpen, setSheetOpen] = useState(false);

  const products: SavedProduct[] = answers.products ?? [];
  const filled = products.length > 0;
  const done = nextHref("products-bucket") ?? "/products";

  return (
    <>
      <QuestionScreen
        id="products-bucket"
        continueWidth="full"
        footer={
          filled ? (
            <Button variant="secondary" href={done}>
              Done
            </Button>
          ) : undefined
        }
      >
        <ChatBubble from="ai" full>
          Let&rsquo;s start with products you&rsquo;ve used for 4 weeks or longer.
        </ChatBubble>

        {!filled && (
          <ChatBubble from="ai" full className={styles.secondBubble}>
            Long-term products can show what your skin may already tolerate.
          </ChatBubble>
        )}

        {filled ? (
          <ul className={styles.list}>
            {products.map((p) => (
              <li key={p.id}>
                <ProductRow
                  name={fullName(p)}
                  meta={p.size}
                  trailing={<Tag>{p.duration}</Tag>}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className={styles.emptyWrap}>
            <EmptyBox>No products added yet</EmptyBox>
          </div>
        )}

        <div className={styles.addWrap}>
          <AddProductRow label="Add product" onClick={() => setSheetOpen(true)} />
        </div>

        {filled ? (
          <p className={`${styles.count} t-label-sm`}>
            {products.length} product{products.length === 1 ? "" : "s"} added
          </p>
        ) : (
          // an inline skip, not a header `Skip` — the question is genuinely
          // optional here, and the header's escape hatch is `Save & exit`
          <button
            type="button"
            className={`${styles.skip} t-label`}
            onClick={() => router.push(done)}
          >
            None — skip to next
          </button>
        )}
      </QuestionScreen>

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Add a product">
        <ul className={styles.methods}>
          <li>
            <MethodCard
              icon={<SearchIcon />}
              title="Search by name"
              subtitle="Find by brand or product name"
              onClick={() => router.push("/investigation/products/search")}
            />
          </li>
          <li>
            <MethodCard
              icon={<CameraIcon />}
              title="Take a photo"
              subtitle="Snap the front label or ingredient list"
              onClick={() => router.push("/investigation/products/scan")}
            />
          </li>
        </ul>
        <button
          type="button"
          className={`${styles.cancel} t-label`}
          onClick={() => setSheetOpen(false)}
        >
          Cancel
        </button>
      </Sheet>
    </>
  );
}

/**
 * A method card inside the tray.
 *
 * ⚠️ THE CARD IS SAGE, AND SO IS ITS ICON. `surface/data-strong` takes WHITE
 * text, and an icon instance carries its own dark default — a dark glyph beside
 * white text is the single most-repeated bug in this file. Both the fill and the
 * stroke have to change, because most LUX icons are stroke-drawn and a
 * fills-only recolour silently does nothing. `currentColor` does both here.
 */
function MethodCard({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className={styles.method} onClick={onClick}>
      <span className={styles.methodIcon}>{icon}</span>
      <span className={styles.methodCopy}>
        <span className={`${styles.methodTitle} t-h6`}>{title}</span>
        <span className={`${styles.methodSubtitle} t-label-sm`}>{subtitle}</span>
      </span>
      <ChevronRightIcon className={styles.methodChevron} />
    </button>
  );
}
