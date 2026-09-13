"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./MyProducts.module.css";
import { HubScreen } from "@/components/layout/HubScreen";
import { Button } from "@/components/ui/Button";
import { Orb } from "@/components/ui/Orb";
import { ProductAccordionCard } from "./ProductAccordionCard";
import { ThumbStack } from "./ThumbStack";
import { EmptyBox } from "./ProductList";
import { AddProductMethodSheet } from "./AddProductMethodSheet";
import { Collapse, COLLAPSE_EXIT_MS } from "@/components/ui/Collapse";
import { ChevronDownIcon, PlusIcon } from "@/components/ui/icons";
import { useInvestigation } from "@/lib/store/InvestigationProvider";
import { useSnackbar } from "@/components/layout/Snackbar";
import { ownedProducts, DEMO_PRODUCTS } from "@/lib/demo";
import {
  BUCKETS,
  BUCKET_LIST_TITLE,
  BUCKET_WINDOW,
  UNSORTED_BUCKET,
  countIn,
  fullName,
  type BucketId,
  type SavedProduct,
} from "@/features/products/products";

/**
 * My Products — the PRODUCTS hub landing. ONE screen in two states:
 *   empty  Figma mobile 579:1574, desktop 583:1863
 *   filled Figma mobile 579:1607, desktop 583:1889
 *
 * ⚠️ A HUB LANDING HAS NO BACK CHEVRON. It is reached from the bottom nav, so
 * there is nothing to go back to — and no progress track and no `Save & exit`,
 * because it is not an investigation step.
 *
 * ⚠️ THE TWO STATES USE DIFFERENT DESKTOP COMPOSITIONS, and that is the comps'
 * own decision, not an inconsistency to iron out: the empty state floats an orb
 * and a CTA on the gradient with no card (the same exception every LUX empty
 * state and welcome screen has), while the filled state is a list and gets the
 * standard centred 920 card.
 *
 * The empty state's hero is the orb, matching `Progress — empty` and the CHECK
 * empty states. The wireframe's giant LUX wordmark is deliberately NOT used: the
 * logo is a brand asset, not a screen element.
 *
 * ⚠️ EACH CATEGORY ROW STATES ITS TIME WINDOW, AND THAT IS NEW. `Bucket.window`
 * existed from the start — its own doc calls it "the `duration` label beside
 * it" — but the only screen that rendered it was the add-products intro, which
 * was deleted in the twelve-to-one remap. So the windows that DEFINE these
 * three groups stopped appearing anywhere the user could see them, and the hub
 * asked them to know from the names alone that "Recent" ends where "Long-term"
 * begins.
 *
 * This is the right screen for it and the only one: the hub is the single place
 * all three periods appear TOGETHER, so the windows read as one scale —
 * 4+ weeks / 1–4 weeks / < 1 week — rather than as an isolated fact per row. A
 * group's own products are the opposite case: the row they hang under already
 * names the period, which is why the duration is off those cards (see
 * `ProductAccordionCard`).
 *
 * The treatment is not invented — it is the name + muted-window pairing
 * `Your products` already uses on its group headers, same `t-h6` / `t-label-sm`,
 * same baseline alignment, same `BUCKET_WINDOW` lookup. ⚠️ NOT IN FIGMA:
 * `My Products — filled` (579:1607) draws the row as title + count only.
 * The row stays exactly 56 — the window sits BESIDE the name, not under it.
 *
 * ⚠️ AND EACH ROW NOW SHOWS WHAT IT HOLDS — see `ThumbStack.tsx`. NOT IN
 * FIGMA either: closed, this screen was four text rows and four counts, so the
 * only way to find out which group a product was in was to open every one of
 * them in turn. The artwork that answers that already existed — `ProductArt`
 * draws every product, tinted per brand and shaped per packaging — and it was
 * locked inside the cards, which is to say behind the very disclosure the user
 * was trying to decide about.
 *
 * ⚠️ THE PREVIEW FADES OUT WHEN THE GROUP OPENS, AND IT KEEPS ITS WIDTH. Open,
 * the row is the header of a box whose contents draw the same vessels a few
 * pixels below it — the deck would be the same pictures twice, smaller,
 * exactly where the eye should be moving down. It fades rather than unmounting
 * so the row does not reflow mid-gesture, and the reserved width is
 * deliberate: a title that ellipsises closed and does not open is worse than
 * one that does neither.
 *
 * ⚠️ AND AN OPEN GROUP IS ONE BOX, NOT A ROW AND A STACK — NOT IN FIGMA, and
 * the second half of the same idea. The cards used to open UNDER the row as
 * siblings of it, 12 away and at the list's full width, which is the same
 * distance and the same width the NEXT category sits at: the only thing saying
 * which row owned which cards was that they happened to follow it, and with
 * two groups open at once the screen was six boxes in a column. The frosted
 * fill moved off the row and onto the group, so the row is now the header of a
 * container and its products are inside it, inset 8 from three sides. The row
 * itself did not change — same 56, same fill, same radius, and closed the box
 * IS the row.
 *
 * The cards inside step down to match — `ProductAccordionCard`'s `compact`
 * form, opaque because a frosted fill on a frosted surface does not read. See
 * that component for what changes and why it is a prop.
 *
 * ⚠️ THE CATEGORY ROWS ARE DROPDOWNS, NOT LINKS — AND `/products/[bucket]` IS
 * GONE. NOT IN FIGMA either: 579:1607 gives each row a trailing `chevron-right`
 * and pushes `Long-term products list` (581:1593 / 583:1924), a whole screen
 * whose entire content was a title, a count and the group's cards — the first
 * two of which the hub row was already stating. Four groups meant four pushed
 * screens differing only in which products they listed, and comparing two
 * periods meant back, tap, back, tap.
 *
 * Opening in place is the decision `Your products` makes one step earlier (the
 * list groups itself, live) and the one the add tray makes (the whole add flow
 * runs "without ever navigating"): a category here is not a destination, it is
 * a section of this list. The chevron rotates instead of pointing right — the
 * disclosure glyph the app already uses — and the cards that open ARE the
 * pushed view's cards, lifted into `ProductAccordionCard` unchanged. Nothing
 * else from that screen is lost: its inert `Edit` header action goes (as has
 * the per-card `Edit`, the same dead link — see `ProductAccordionCard`), and
 * its `Add more products` row moves here — which is also where the hub was
 * missing one, since the filled state offered no way to add a product at all.
 *
 * ⚠️ ADDING OPENS THE TRAY IN PLACE — IT DOES NOT GO BACK INTO THE FLOW. Both
 * of this screen’s add affordances (the empty state’s `Add products` and the
 * filled state’s `Add more products` row) used to `push`
 * `/investigation/products`, which is step 5 of the investigation: the user
 * asked to add a product and was answered with a progress track, a
 * `Save & exit` and the list they were already looking at, one screen back from
 * the tray they actually wanted. The tray is the whole add flow and it
 * "runs without ever navigating" — so it opens here exactly as it opens on
 * step 5, and the product it adds lands in the list underneath it.
 *
 * It is handed `DEMO_PRODUCTS` as its `base`: on this screen an empty store
 * means the seeded library is showing, and a first add that started from `[]`
 * would replace that whole list with the one product just added — the same
 * trap the remove path below documents.
 *
 * ⚠️ AN EMPTY GROUP STILL OPENS, onto the same `EmptyBox` the pushed view used
 * — in its compact form, so an empty group and a full one open onto the same
 * shape. The hub deliberately lists all three designed periods including empty
 * ones, so a row that refused to open would be the only dead row on the screen.
 */
export function MyProducts() {
  const { answers, setAnswer } = useInvestigation();
  const { show } = useSnackbar();
  const [sheetOpen, setSheetOpen] = useState(false);
  /* ⚠️ THE SEEDED LIBRARY WHEN THE USER OWNS NOTHING — see lib/demo.ts. The hub
     greeted a portfolio visitor with "No products added yet", which is the same
     empty-readout problem `/progress` and `/check` had. */
  const products: SavedProduct[] = ownedProducts(answers);

  /**
   * ⚠️ THE REMOVAL IS UNDOABLE, AND THE UNDO IS THE SLICE AS IT WAS. `products`
   * is one of the four keys that persist FOREVER, so before this a mis-tap on
   * the accordion's `Remove` deleted a product permanently, silently, and with
   * no way back but retyping it. The snapshot is taken from the store, NOT from
   * the resolved list above: on the demo path the key is still `undefined`
   * because the library is seeded, and restoring `undefined` is what puts the
   * seeded library back — restoring `DEMO_PRODUCTS` would materialise it and
   * quietly turn a portfolio visitor's list into a stored one.
   */
  function removeProduct(id: string) {
    const before = answers.products;
    const removed = products.find((p) => p.id === id);
    setAnswer("products", (prev) =>
      (prev ?? DEMO_PRODUCTS).filter((x) => x.id !== id),
    );
    show({
      message: removed ? `Removed ${fullName(removed)}` : "Product removed",
      onAction: () => setAnswer("products", before),
    });
  }

  // ⚠️ THE THREE DESIGNED PERIODS ALWAYS, "Not sure" ONLY WHEN IT HAS SOMETHING.
  // The comp shows all three periods and a category that disappears when it
  // empties makes the list look like it lost something — but `Not sure` is a
  // fourth group with no frame at all (see UNSORTED_BUCKET), so it appears only
  // once the user has actually given that answer. Showing an empty one would
  // advertise a category nobody asked for.
  const categories = [
    ...BUCKETS,
    ...(countIn(products, UNSORTED_BUCKET.id) > 0 ? [UNSORTED_BUCKET] : []),
  ];

  if (products.length === 0) {
    return (
      <HubScreen title="My Products" layout="plain" center tightTop>
        <div className={styles.empty}>
          <Orb animateIn />
          <h2 className="t-h4-h3">No products added yet</h2>
          <p className={`${styles.emptyText} t-body3-body2`}>
            Add products you use to check skin compatibility.
          </p>
          <Button
            className={styles.emptyCta}
            onClick={() => setSheetOpen(true)}
          >
            Add products
          </Button>
        </div>
        <AddProductMethodSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
        />
      </HubScreen>
    );
  }

  return (
    <>
      <HubScreen
        title="My Products"
        subtitle={`${products.length} product${products.length === 1 ? "" : "s"} added`}
        layout="card"
        tightTop
        footer={
          /* ⚠️ NOT IN FIGMA — `Start analysis`. The hub listed the products and
           then ended: the one thing the user can DO with a library of products
           is check them against their skin, and reaching that meant finding the
           Check tab and starting over from its own landing. It goes to
           `/check/new` rather than `/check`, because the products are already
           here and the next question is which of them to check. Primary, in the
           hub footer, so it reads at the same size as a flow's Continue. */
          <Button href="/check/new">Start analysis</Button>
        }
      >
        <ul className={styles.categories}>
          {categories.map((b) => (
            <li key={b.id}>
              <CategoryGroup
                bucket={b.id}
                products={products.filter((p) => p.bucket === b.id)}
                /* ⚠️ THE FALLBACK IS THE `prev`, so removing a seeded product
                 works. With `prev ?? []` the filter ran over an empty array and
                 wrote an empty array, which left the row on screen and was the
                 same bug in a second costume. Removing one product is the user
                 taking the list over: it materialises the seeded library into
                 the store minus that product, and from then on the list is
                 theirs — including when they empty it. */
                onRemove={(id) => removeProduct(id)}
              />
            </li>
          ))}
        </ul>

        {/* ⚠️ NOT IN FIGMA — THE SMALL SECONDARY PILL, NOT `AddProductRow`,
            asked for directly 13 Sep 2026. The row is a frosted list row with a
            plus, and at the foot of a list of frosted accordion rows it read as
            one more row rather than as the list's action. It was the full
            secondary `Button` for a few hours the same day, then stepped down
            to `SmallButton` so it does not compete with `Start analysis` below.
            As of later the same day it is no longer scoped to this hub: step 5
            and CHECK's results dropped `AddProductRow` for this same recipe. */}
        <div className={styles.addMore}>
          <Button
            variant="secondary"
            icon={<PlusIcon />}
            className={styles.addMoreButton}
            onClick={() => setSheetOpen(true)}
          >
            Add more products
          </Button>
        </div>
      </HubScreen>

      <AddProductMethodSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        base={DEMO_PRODUCTS}
      />
    </>
  );
}

/**
 * One category: the 56-tall row, and the products it opens onto.
 *
 * The row keeps every part of `My Products — filled`'s recipe — name, window,
 * count — and swaps the trailing `chevron-right` for the rotating
 * `chevron-down`, because it no longer goes anywhere. It is a `<button>` with
 * `aria-expanded` / `aria-controls` rather than a link, which is what tells a
 * screen reader the difference.
 *
 * ⚠️ IT IS STILL 56. `ThumbStack` sits BETWEEN the copy and the count, not
 * under the name: a second line would take the row to ~92 and this is the one
 * screen that stacks four of them. That was the whole reason the deck won over
 * a full-size preview strip — the strip is more legible and costs the comp's
 * height on the screen that can least afford it.
 *
 * ⚠️ AND THE PANEL IS A CHILD OF THE BOX, NOT A SIBLING OF THE ROW. `.group`
 * carries the surface; the button is its header and the panel its contents.
 * The two cannot be nested in the DOM the way they are on screen — a `<button>`
 * may not contain a list of buttons — so `aria-controls` on the row and `id` on
 * the panel are what say the row owns them, exactly as before. */
function CategoryGroup({
  bucket,
  products,
  onRemove,
}: {
  bucket: BucketId;
  products: SavedProduct[];
  onRemove: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const panelId = `bucket-${bucket}`;
  const n = products.length;

  /* ⚠️ A REMOVED CARD CLOSES FIRST AND LEAVES THE STORE SECOND — added 13 Sep
     2026. It used to unmount the moment `Remove` wrote to the store, and every
     card and group under it jumped up by its height; Undo snapped it back the
     same way. `leave` closes its `Collapse` and only then calls `onRemove`,
     which is also when the Undo snackbar appears. */
  const [leaving, setLeaving] = useState<ReadonlySet<string>>(() => new Set());
  const pending = useRef(new Set<string>());
  /* the cards this group has already drawn — one missing from it (put back by
     Undo, or added while the group is open) grows in with `appear`. `null`
     until the first render commits, so nothing animates when the screen
     arrives. */
  const drawn = useRef<ReadonlySet<string> | null>(null);
  useEffect(() => {
    drawn.current = new Set(products.map((p) => p.id));
  });

  function leave(id: string) {
    if (pending.current.has(id)) return;
    pending.current.add(id);
    setLeaving((prev) => new Set(prev).add(id));
    window.setTimeout(() => {
      pending.current.delete(id);
      onRemove(id);
      setLeaving((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, COLLAPSE_EXIT_MS);
  }

  return (
    <div className={styles.group} data-open={open}>
      <button
        type="button"
        className={styles.category}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        /* ⚠️ THE ROW NEEDS ITS OWN LABEL. Read out, the three spans ran
           together as "Long-term products 4+ weeks 3" — a bare count that was
           already unlabelled, and a window that made it ambiguous which number
           was which. Naming the control says all three things in order and in
           words; `aria-expanded` supplies the rest. */
        aria-label={`${BUCKET_LIST_TITLE[bucket]}, ${BUCKET_WINDOW[bucket]}, ${n} product${n === 1 ? "" : "s"}`}
      >
        <span className={styles.copy}>
          <span className={`${styles.categoryName} t-h6`}>
            {BUCKET_LIST_TITLE[bucket]}
          </span>
          <span className={`${styles.window} t-label-sm`}>
            {BUCKET_WINDOW[bucket]}
          </span>
        </span>
        {/* nothing to preview in an empty group — and an empty span would
            still take the row's two 12 gaps on either side of it */}
        {n > 0 && <ThumbStack products={products} className={styles.preview} />}
        <span className={`${styles.count} t-h6`}>{n}</span>
        <ChevronDownIcon className={styles.chevron} />
      </button>

      <Collapse open={open}>
        <div id={panelId} className={styles.panel}>
          {n === 0 ? (
            <EmptyBox compact>No products in this list yet</EmptyBox>
          ) : (
            <ul className={styles.stack}>
              {products.map((p) => (
                <Collapse
                  as="li"
                  key={p.id}
                  open={!leaving.has(p.id)}
                  appear={drawn.current !== null && !drawn.current.has(p.id)}
                >
                  <ProductAccordionCard
                    product={p}
                    compact
                    onRemove={() => leave(p.id)}
                  />
                </Collapse>
              ))}
            </ul>
          )}
        </div>
      </Collapse>
    </div>
  );
}
