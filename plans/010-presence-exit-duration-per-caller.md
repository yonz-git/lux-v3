# 010 — `useDialogPresence` takes the caller's exit duration

- **Status**: TODO
- **Commit**: `d7220d6` — plus the uncommitted working tree of 13 Sep 2026 (`.drop` and the three `.drop` callers are uncommitted). Search by quoted code.
- **Severity**: LOW
- **Category**: Interruptibility
- **Estimated scope**: 4 files (`lib/useModalDialog.ts`, `components/ui/DateField.tsx`, `features/check/components/CheckBuilder.tsx`, `features/products/components/AddProductMethodSheet.tsx`), ~20 lines

## Problem

Every closing surface is unmounted by one shared timer:

```ts
/* lib/useModalDialog.ts:164-188 and :196 — current */
export function useDialogPresence(open: boolean) {
  const [present, setPresent] = useState(open);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (open) {
      setPresent(true);
      setLeaving(false);
      return;
    }

    /* nothing to play out: either it was never open, or a previous exit has
       already finished and unmounted it */
    if (!present) return;

    setLeaving(true);
    const timer = setTimeout(() => {
      setPresent(false);
      setLeaving(false);
    }, EXIT_MS);
    return () => clearTimeout(timer);
  }, [open, present]);

  return { present, leaving };
}
…
const EXIT_MS = 200;
```

Trays, the check-in overlay and `Collapse` all exit on 200ms. Floating dropdowns exit faster:

```css
/* app/globals.css — `.drop[data-state="leaving"]` in the "Dropdowns open DOWN and close back UP" block — current */
.drop[data-state="leaving"] {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
  transition-duration: var(--duration-fast);
}
```

The three `.drop` callers still unmount on 200ms:

```tsx
/* components/ui/DateField.tsx:66 */                         const panel = useDialogPresence(open);
/* features/check/components/CheckBuilder.tsx:130 */          const dropdown = useDialogPresence(open);
/* features/products/components/AddProductMethodSheet.tsx:379 */  const dropdown = useDialogPresence(typed);
```

The add-product tray's results panel sits **in the tray's flow**. After its 120ms fade, the tray keeps a blank gap as tall as the panel (up to 296px) for 80ms, then shrinks in a single frame. The other two are floating, so they are just invisible, inert nodes for 80ms. Frequency: occasional.

## Target

- `useDialogPresence(open, exitMs = EXIT_MS)`: the unmount timer uses the caller's number.
- An exported `DROP_EXIT_MS = 120`, kept in step with `--duration-fast`.
- The three `.drop` callers pass `DROP_EXIT_MS`.
- Nothing else changes. `Sheet`, `CheckInOverlay` and `Collapse` keep the 200ms default.

## Repo conventions to follow

- Timing constants that mirror a CSS token carry a `⚠️ KEEP IN STEP WITH` comment naming the token and the rule. Exemplar: the comment above `const EXIT_MS = 200;` (`lib/useModalDialog.ts:190-195`).
- Hooks and constants shared by more than one section live in `lib/`.

## Steps

1. **`lib/useModalDialog.ts`**:
   - Change the signature line `export function useDialogPresence(open: boolean) {` to `export function useDialogPresence(open: boolean, exitMs: number = EXIT_MS) {`.
   - In the same function, change `}, EXIT_MS);` to `}, exitMs);`.
   - Change the dependency array `}, [open, present]);` to `}, [open, present, exitMs]);`.
2. Same file: in the doc comment above `useDialogPresence`, add a paragraph before the closing `*/`:

   ```ts
    *
    * ⚠️ THE EXIT LENGTH IS THE CALLER'S — added 13 Sep 2026. A tray leaves on
    * `duration/base`, a floating dropdown on `duration/fast`; unmounting a
    * dropdown on the tray's number left the in-flow add-product panel as blank
    * space for the difference. Pass the number your CSS exit uses
    * (`DROP_EXIT_MS` for `.drop`).
   ```

3. Same file: directly after `const EXIT_MS = 200;`, add:

   ```ts
   /* ⚠️ KEEP IN STEP WITH `--duration-fast` (120ms) — `.drop[data-state="leaving"]`
      in globals.css. A floating dropdown leaves faster than a tray, and this is
      only the moment its node is removed. */
   export const DROP_EXIT_MS = 120;
   ```

4. **`components/ui/DateField.tsx`**:
   - Change the import `import { useDialogPresence } from "@/lib/useModalDialog";` to `import { DROP_EXIT_MS, useDialogPresence } from "@/lib/useModalDialog";`.
   - Change `const panel = useDialogPresence(open);` to `const panel = useDialogPresence(open, DROP_EXIT_MS);`.
5. **`features/check/components/CheckBuilder.tsx`**:
   - Change the import `import { useDialogPresence, useHeldWhileClosing } from "@/lib/useModalDialog";` to `import { DROP_EXIT_MS, useDialogPresence, useHeldWhileClosing } from "@/lib/useModalDialog";`.
   - Change `const dropdown = useDialogPresence(open);` to `const dropdown = useDialogPresence(open, DROP_EXIT_MS);`.
6. **`features/products/components/AddProductMethodSheet.tsx`**:
   - Make the same import change as step 5.
   - Change `const dropdown = useDialogPresence(typed);` to `const dropdown = useDialogPresence(typed, DROP_EXIT_MS);`.

## Boundaries

- Do NOT change `EXIT_MS`, `Sheet.tsx`, `CheckInOverlay.tsx`, `Collapse.tsx` or any CSS.
- Do NOT add `transitionend` listeners. A timer that matches the token is the repo's pattern.
- If any quoted line differs, STOP and report.

## Verification

- **Mechanical**: `npm run typecheck` exits 0. `npx biome lint lib/useModalDialog.ts components/ui/DateField.tsx features/check/components/CheckBuilder.tsx features/products/components/AddProductMethodSheet.tsx` reports no diagnostics. `npm run build` succeeds.
- **Feel check** (`npm run dev`):
  - `/products` → `Add more products` → `Search` → type `cera` → select the field text and delete it. The results lift 4px, fade, and the tray shrinks as the fade ends, with no blank beat. Check at DevTools → Animations 10%.
  - `/check/new`: type `cera`, then clear it. Run `setTimeout(() => console.log(document.querySelector('.drop')), 150)` immediately after clearing; it logs `null`.
  - `/investigation/timing`: open the calendar, press Escape. It is gone within 150ms, and focus returns to the field.
  - Close a tray (`Done`) and collapse a product row. Both still take their full 200ms.
- **Done when**: `.drop` nodes are removed within 130ms of closing, and every other presence caller is unchanged.
