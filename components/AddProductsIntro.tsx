"use client";

import styles from "./AddProductsIntro.module.css";
import { QuestionScreen } from "./QuestionScreen";
import { ChatBubble } from "./ChatBubble";
import { BUCKETS } from "@/lib/products";

/**
 * 04 — Add products intro. Figma mobile 574:1342, desktop 582:1612. Step 8/8.
 *
 * The briefing that opens PRODUCTS: what to include, why it matters, and the
 * three time periods that follow. There is nothing to answer, so Continue is
 * available on arrival — that rule lives on the step in `lib/flow.ts`.
 *
 * ⚠️ PRODUCTS IS SURFACE SYSTEM A (light frosted), not the sage data system
 * PROGRESS uses. Choose the surface by screen type, not by section: these are
 * forms and lists, not dashboards.
 */
export function AddProductsIntro() {
  return (
    <QuestionScreen id="products" continueWidth="full">
      <ChatBubble from="ai" full>
        Now let&rsquo;s look at the products you&rsquo;ve been using. Please include
        every product used on the affected area during the last four weeks — even
        products you have used without problems.
      </ChatBubble>

      <ChatBubble from="ai" full className={styles.secondBubble}>
        Those products help LUX rule out weaker explanations.
      </ChatBubble>

      {/* a frosted note, not a bubble: it is a caption about what happens next
          rather than something the AI says, so it takes the row recipe
          (border + inner shadow) and not the bubble recipe */}
      <div className={styles.note}>
        <p className={`${styles.noteText} t-body3`}>
          We&rsquo;ll go through three time periods.
        </p>
      </div>

      <ul className={styles.buckets}>
        {BUCKETS.map((b) => (
          <li key={b.id} className={styles.bucket}>
            <span className="t-h6">{b.name}</span>
            <span className={`${styles.window} t-label-sm`}>{b.window}</span>
          </li>
        ))}
      </ul>
    </QuestionScreen>
  );
}
