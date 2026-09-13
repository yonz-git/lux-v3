# 006 — Chat bubbles scale in from their tail corner

- **Status**: TODO
- **Commit**: `d7220d6` — plus the uncommitted working tree of 13 Sep 2026. Search by quoted code.
- **Severity**: MEDIUM
- **Category**: Physicality & origin
- **Estimated scope**: 1 file (`app/globals.css`), ~15 lines

## Problem

Every chat bubble in the app enters through one shared rule, which `ChatBubble` applies itself (`components/ui/ChatBubble.tsx:138`: `entrance ? "bubble-enter" : null`):

```css
/* app/globals.css:1989-1998 — current */
@keyframes lux-bubble-ask {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.94);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

```css
/* app/globals.css:2016-2020 — current */
.bubble-enter {
  transform-origin: top center;
  animation: lux-bubble-ask 800ms var(--ease-standard)
    var(--bubble-enter-delay, 0ms) backwards;
}
```

AI bubbles sit left with their 1px tail on the **top-left** corner. User bubbles sit right with the tail **top-right** (`ChatBubble.tsx:9-11`). The row wrapper carries the side, via `data-align={resolvedAlign}` where `resolvedAlign = align ?? (from === "ai" ? "left" : "right")` (`ChatBubble.tsx:93` and `:131`); the `.bubble` element is its direct child.

Scaling from 0.94 about the top **centre** pulls each side edge in by 3% of the bubble's width. So the tail corner slides sideways as the bubble lands: about 11px on a 380px bubble, about 17px on a 560px desktop bubble. The `top center` origin was written for Welcome's centred bubble ("hangs from the orb above it", `app/globals.css:2001`) and copied to every bubble.

Frequency: every bubble in the daily check-in, the `/check` landing and the step-5 briefings. That's occasional, but several per session.

The 800ms duration and the keyframes are documented decisions (`app/globals.css:2006-2013`) and stay.

## Target

The bubble grows from the corner that carries its tail:

```css
/* target — added after .bubble-enter */
[data-align="left"] > .bubble-enter {
  transform-origin: top left;
}

[data-align="right"] > .bubble-enter {
  transform-origin: top right;
}
```

Centred rows (`data-align="center"`) keep `top center` from the base rule.

## Repo conventions to follow

- Rules that name keyframes live in `app/globals.css`. This change only sets `transform-origin`, but it belongs beside `.bubble-enter` so the entrance recipe stays in one place.
- Decided-here changes carry a `⚠️` comment naming the change and why. Exemplar: the comment above `.bubble-enter` (`app/globals.css:2006-2015`).

## Steps

1. In `app/globals.css`, directly after the `.bubble-enter { … }` rule (it ends at ~line 2020), add:

   ```css
   /* ⚠️ A BUBBLE GROWS FROM ITS TAIL — added 13 Sep 2026. `top center` above is
      right for a centred bubble and wrong for every other: scaling from 0.94
      about the middle slid a left-hand AI bubble's tail corner ~11–17px
      sideways as it landed. The row's `data-align` is where the bubble sits and
      so which top corner carries the tail (ChatBubble.tsx). Centred rows keep
      the base rule's `top center`. */
   [data-align="left"] > .bubble-enter {
     transform-origin: top left;
   }

   [data-align="right"] > .bubble-enter {
     transform-origin: top right;
   }
   ```

## Boundaries

- Do NOT change `lux-bubble-ask`, the 800ms duration, `--bubble-enter-delay`, or Welcome's `.bubble-ask`, `.bubble-ask-exit` and `.bubble-swap-in`.
- Do NOT change `ChatBubble.tsx` or its module.
- If `.bubble-enter` or the `data-align` attribute is not where quoted, STOP and report.

## Verification

- **Mechanical**: `npm run build` succeeds. `npx biome lint app/globals.css` reports no new diagnostics.
- **Feel check** (`npm run dev`; DevTools → Animations, playback 10%):
  - `/progress` → `Check in today`: the AI question bubble's **top-left corner stays put horizontally** while the bubble drops 10px and grows. Answer the first question and check the next bubble the same way.
  - `/check` (the landing bubble, which uses `hug`): the top-left corner stays pinned, and after landing the bubble is still trimmed to its longest line.
  - Any right-aligned (user) bubble pins its top-right corner.
  - `/` (Welcome): the centred bubbles behave exactly as before.
- **Done when**: the tail corner's x-coordinate stays fixed through the entrance. Measure it by sampling `el.getBoundingClientRect().left` of a left-aligned `.bubble-enter` on each `requestAnimationFrame` during its entrance: it varies by less than 1px.
