# 019 — Three states read at the wrong moment

- **Status**: TODO
- **Commit**: `f23b117` (`design-trial`)
- **Severity**: MEDIUM. Three bugs that each show up as a jarring change.
- **Category**: Preventing a jarring change (correctness)
- **Estimated scope**: 3 files, ~40 lines: `features/progress/components/CheckIn.tsx`, `features/my-skin/components/SkinProfileSummary.tsx`, `features/products/components/MyProducts.tsx`

The three parts are independent. Apply them in any order.

## A — "You have already checked in today" appears as the check-in closes

### Problem

```tsx
/* features/progress/components/CheckIn.tsx:179 — current */
  const alreadyToday = (answers.checkIns ?? []).some((c) => c.date === today);
```

```tsx
/* CheckIn.tsx:230-246 — current (abridged) */
  const submit = () => {
    if (!choice || !canSubmit) return;

    setAnswer("checkIns", (prev) =>
      recordCheckIn(prev ?? [], { date: today, … })
    );
    onSubmitted();
  };
```

```tsx
/* CheckIn.tsx:277-281 — current */
        {alreadyToday && (
          <p className={`${styles.note} t-caption`}>
            You have already checked in today, a new answer replaces it.
          </p>
        )}
```

On `/progress`, `CheckInOverlay` passes `onSubmitted={onClose}` and keeps `CheckInPanel` painted through its 200ms exit (`CheckInOverlay.tsx:67-92`). The render after `submit` already has today's check-in in the store, so `alreadyToday` is true. The note then mounts at the top of the fading panel and pushes the whole conversation down by its height.

On `/progress/check-in`, the same render lands before `router.push("/progress")` (`CheckIn.tsx:116`) completes.

### Target

A local `submitted` flag, set in `submit`, hides the note from then on.

It is not a snapshot taken at mount. The standalone route hydrates after mount, so a mount-time value would miss a real earlier check-in.

### Steps

1. Directly after

   ```tsx
     const alreadyToday = (answers.checkIns ?? []).some((c) => c.date === today);
   ```

   add

   ```tsx
     /* ⚠️ NOT ONCE THIS CHECK-IN HAS BEEN SUBMITTED — added 13 Sep 2026. The
        render after `submit` already holds today's check-in, and the panel is
        still painted (the overlay's exit, or the route's push), so the note
        appeared at the top of a closing panel and shoved the conversation down.
        A flag rather than a value frozen at mount: the standalone route
        hydrates after mounting, and a frozen value would miss a real earlier
        check-in. */
     const [submitted, setSubmitted] = useState(false);
   ```

2. In `submit`, replace

   ```tsx
       if (!choice || !canSubmit) return;

   ```

   with

   ```tsx
       if (!choice || !canSubmit) return;
       setSubmitted(true);

   ```

3. Replace `        {alreadyToday && (` with `        {alreadyToday && !submitted && (`.

## B — The profile recap renders its empty state before the store hydrates

### Problem

```tsx
/* features/my-skin/components/SkinProfileSummary.tsx:160-170 — current (abridged) */
  const { answers } = useInvestigation();
  const [photoOpen, setPhotoOpen] = useState(false);
  const profile = recap(answers, useToday(now));
  …
  if (isEmpty(profile)) {
    return (
      <HubScreen … layout="plain" center>
```

The store fills in from storage in an effect, so the first render of every reload of `/investigation/profile` is empty. That render mounts the empty-state tree (plain layout, centred, `Orb animateIn`, CTA). The recap then replaces it one commit later, remounting the page and restarting its reveal.

### Target

Until `hydrated`, render the recap's own shell (the same `HubScreen` props, no children), so nothing is decided from an empty store.

### Steps

1. Replace `  const { answers } = useInvestigation();` with `  const { answers, hydrated } = useInvestigation();`.
2. Directly above `  if (isEmpty(profile)) {`, add

   ```tsx
     /* ⚠️ NOTHING IS DECIDED BEFORE THE STORE HAS HYDRATED — added 13 Sep 2026.
        The answers arrive one commit after mount, so every reload rendered the
        empty state first and swapped it for the recap. The recap's own shell,
        with nothing in it, holds that commit. */
     if (!hydrated) {
       return (
         <HubScreen
           title={COPY.headlineLabel}
           nav="my-skin"
           backHref="/investigation/timing"
           layout="card"
           tightTop
         />
       );
     }

   ```

3. Confirm that no React hook (`use…(`) is called anywhere in the component below this new `return`. If one is, STOP and report, because the early return would break the rules of hooks.

## C — `/products`' add tray remounts when the list empties or fills

### Problem

```tsx
/* features/products/components/MyProducts.tsx:180-202 — current (abridged) */
  if (products.length === 0) {
    return (
      <HubScreen title="My Products" layout="plain" center tightTop>
        <div className={styles.empty}>
          …
        </div>
        <AddProductMethodSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
        />
      </HubScreen>
    );
  }
```

```tsx
/* MyProducts.tsx:259-267 — current */
      </HubScreen>

      <AddProductMethodSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        base={DEMO_PRODUCTS}
      />
    </>
  );
```

The tray sits at two different tree positions: inside the empty state's `HubScreen`, and after the filled one in a fragment. When the store crosses empty ↔ filled with the tray open, React unmounts one tray and mounts the other:
- the tray's local `view` and `stage` reset to the method chooser;
- its entrance replays.

To reproduce: remove every product on `/products`, then add one through the tray. The tray jumps from `Product added` back to `Add a product`.

### Target

Both branches return `<>{HubScreen}{AddProductMethodSheet}</>`, so the tray is the same instance in both states.

It takes `base={DEMO_PRODUCTS}` in both. That changes nothing in the empty state:
- the tray only reads `base` as `prev ?? base` (`AddProductMethodSheet.tsx:173`, `:193-194`);
- the empty state means the store holds `[]`, since `ownedProducts` falls back to the demo library only for `undefined` (`lib/demo.ts:172-174`);
- so `prev` is `[]` and `base` is never used there.

### Steps

1. In the empty-state branch, replace

   ```tsx
       return (
         <HubScreen title="My Products" layout="plain" center tightTop>
   ```

   with

   ```tsx
       /* ⚠️ THE TRAY SITS AT THE SAME PLACE IN BOTH RETURNS — changed 13 Sep 2026.
          It was a child of this HubScreen here and a sibling of the filled one
          below, so adding the first product (or removing the last) with the tray
          open unmounted it: it jumped back to the method chooser and replayed
          its entrance. Both branches are `<>{screen}{tray}</>` now. `base` is
          harmless here — an empty state means the store holds `[]`, and the tray
          only reads `base` when the store is `undefined`. */
       return (
         <>
         <HubScreen title="My Products" layout="plain" center tightTop>
   ```

2. In the same branch, replace

   ```tsx
           <AddProductMethodSheet
             open={sheetOpen}
             onClose={() => setSheetOpen(false)}
           />
         </HubScreen>
       );
     }
   ```

   with

   ```tsx
         </HubScreen>
         <AddProductMethodSheet
           open={sheetOpen}
           onClose={() => setSheetOpen(false)}
           base={DEMO_PRODUCTS}
         />
         </>
       );
     }
   ```

3. Reformat the branch with the project formatter if lint asks. The filled branch is unchanged.

## Boundaries

- Do NOT change the check-in's copy, the overlay, the recap's content or empty state, or the tray's `base` logic.
- Do NOT add motion. These are state fixes.
- If the quoted code isn't found, STOP and report.

## Verification

- **Mechanical**: `npm run typecheck`, `npm run lint` and `npm run build` all exit 0.
- **Measured** (dev server, headless Chrome over CDP):
  - **A.**
    1. On `/progress`, open `Check in today`, answer, and Submit. On every frame of the overlay's 200ms exit, the overlay contains no element whose text includes "already checked in today".
    2. Open the overlay again: the note is shown, which is now correct.
    3. On `/progress/check-in`, submit. The note never appears before the URL changes.
  - **B.**
    1. Seed a filled store by walking steps 1–4, then reload `/investigation/profile` with a `MutationObserver` injected by `Page.addScriptToEvaluateOnNewDocument`.
    2. The empty state's CTA (`main a[href="/investigation/start"]`) is never inserted.
    3. With an empty store (a private window), the empty state renders after hydration.
  - **C.**
    1. On `/products`, remove every product and wait for each row to close.
    2. Open `Add products`, search `cerave`, pick a result, tap `Add product`, pick a duration, and tap `Add product`.
    3. Record `window.__tray = document.querySelector('[data-tray="tray"]')` before the last tap. Afterwards it is the same node (`===`), the tray reads `Product added`, and it has no new `lux-sheet-in` animation.
- **Feel check**:
  - Submit a check-in from `/progress`. The panel fades out without anything moving inside it.
  - Reload the recap. It arrives once.
  - Add the first product to an emptied `/products`. The tray stays where it is and the list appears behind it.
- **Done when**: none of the three changes can be caught mid-frame by the measurements above.
