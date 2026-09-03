# Twelve Screens, One Tray

**Thesis:** A flow doesn't exist until you can click it.
**Role framing:** design engineer / product designer who codes.
**Live page:** https://claude.ai/code/artifact/9a777dfa-abc4-4383-b739-21d9b3ca9848
**Prototype:** https://lux-two-cyan.vercel.app/ · **Code:** https://github.com/yonz-git/lux

Platform-agnostic copy for reuse in a portfolio site. Images are in this folder.

---

## Hero

**Eyebrow:** LUX · an AI-guided skincare investigation

**Headline:** A flow doesn't exist until you can click it.

**Standfirst:** I designed LUX in Figma, then built all seventeen routes myself to walk them. Most screens survived the translation intact. One flow did not: twelve screens for adding a product, broken in four ways at once, and not one of the four was visible in a frame.

**Byline:** Yeon Ji Lee · Product design & front-end · Self-directed, 2026 · Figma → Next.js 16

**Actions:** Walk the prototype → / Read the code

`[image: welcome-440.jpg]`

---

## The translation job that became an argument

> Scope: 17 routes · 2 breakpoints · 5-step investigation · 4 nav sections · no backend

LUX collects what your skin is doing, what you have been putting on it, and when — then looks for links between the two. The design system lives in Figma: tokens, type, components, every screen drawn at 440 and at 1440.

I drew those screens. Then I built them, which was supposed to be a translation job, and mostly was. Component sizes, radii, type and colour all match the file to the pixel; inventing a treatment is drift and the repo says so. But a comp cannot show you what happens between two frames, and that is where this flow was broken.

So the project ended up with a split rule, written at the top of the file the build reads before every task:

> **Figma leads on every visual decision. The prototype leads on the shape of a flow — what the steps are, what order they run in, and what each one asks.**

---

## Twelve screens for one question

> Designed: 12 screens · 3 time periods · 6 routes
> Shipped: 1 screen · 1 tray · 0 navigations

The designed flow walked three time periods in sequence — `4+ weeks`, `1–4 weeks`, `under a week`. Each period got an intro row, a list screen, and four routed add screens: search → confirm, or scan → match, rejoining at *Product added*. Twelve screens to answer one question about each product.

Every frame was drawn. Every row sat on its grid. Then I clicked it.

**Everything filed under Long term.** The intro's three period rows all opened the same tray without setting a period. Three different taps, one identical result — and nothing on screen ever said so.

**No source of truth.** `bucketFor()` and `durationForBucket()` sat in one module as mutual inverses, with no answer to which end was authoritative.

**Two of the three periods were never drawn.** Not at either breakpoint. The flow promised three journeys and the file contained one.

**Recent was unreachable.** You could not file a product as Recent until you already owned a long-term one.

Only the last of those is the kind of thing a design review catches, and only if the reviewer happens to walk the file in the right order. The other three are properties of the *transitions* between frames — and a comp has no transitions. They took about a minute of clicking to find and would have survived any number of careful reviews of the artboards.

---

## The period was never a place. It was an answer.

> **How long you have used something is a fact about that product, not a mode you enter before searching.**

Once it is an answer rather than a place, it belongs beside the thing it describes: asked with the product on screen, after you have found it, as the last question before it is filed. That single move deleted the intro, the three period lists, and the two routed add screens — because none of them existed to do anything except carry state that now travels with the product.

`[images: tray-1-method.jpg, tray-2-search.jpg, tray-3-verify.jpg, tray-4-duration.jpg]`

1. Method — search or photograph
2. Search — live, ranked
3. Verify — is this the one?
4. File it — the only input

Four stages, one route. The tray never navigates — the products list you were reading stays behind it the whole time. The duration answer is now the *only* input to `bucketFor()`, so there is exactly one place in the codebase that decides which group a product lands in.

**What came out of the codebase**

- deleted — `AddProductsIntro`, `SearchProducts`, `ScanProduct`, `ProductConfirmScreen`, `ProductAdded`
- deleted — six routes beneath them
- renamed — `LongTermProducts` → `YourProducts`
- reduced — `bucketFor(duration, current)` → `bucketFor(duration)`

The second signature change is the one that mattered. As long as `bucketFor` took the period the user was standing in, the bug was structurally possible: some caller, somewhere, had to set that period correctly, and the three that were meant to had all been written to do nothing. Removing the argument removed the class of bug, not just the instance.

---

## The list sorts itself while you watch

Because the duration is answered per product, the list can group live. `groupProducts()` omits empty groups, so it renders as one flat list while everything sits in a single period, and grows headers the moment a second one fills.

Which is why there is no closing *here's how I sorted them* screen — the designed flow had one, and it would only ever show a result the user had already watched happen.

`[image: step5-grouped.jpg]` — Three products, added one after another with different answers. The headers and their windows appeared as each group filled. Captured from the live build.

---

## The hub does the opposite, deliberately

The same three periods appear again on the Products tab — and there they are *always* drawn, including the empty ones. That is the reverse of the rule I had just written, and it is not an inconsistency.

In the flow you are building the list, so an empty group is noise about something you have not done yet. On the hub you are returning to it, and a missing row reads as a lost category: you go looking for the thing you filed last week and its shelf is not there.

Same data, same component family, opposite rule. Which one applies depends on whether the reader is building the list or coming back to it.

`[image: products-hub-1440.jpg]` — The hub, 1440. The time window sits *beside* each name rather than under it — measured at 56px tall in both breakpoints, which a second line would break.

---

## Zero violations, and wrong

> /check/results — 59 text nodes · 38 failing · axe violations: 0

axe reported zero contrast violations on every route in the app. It was not axe's fault: every surface in LUX is a gradient or a stack of translucent fills, and `color-contrast` degrades to INCOMPLETE — never to a violation — the moment it cannot resolve a background.

So I measured by compositing instead. Collect every text node with its rect, make all text transparent, re-capture the screen, and sample the true pixels underneath each block. On the results screen, **38 of 59 text nodes failed.** Overlines and 12px stat labels at 1.49:1. Body and metrics at 1.86:1. The bar is 4.5:1.

The cause was an assumption in my own system. Surface System B says the text on a sage data card is white. But `surface/data` is `#7da7a9` at 44%, which composites to roughly `rgb(170,194,198)` — and even at full opacity that hue gives white only 2.63:1. No alpha value was ever going to pass. The ink had to go dark.

| Role | Was | Measured | Now | Measured |
| --- | --- | --- | --- | --- |
| Values on a data card | `#ffffff` | 1.86:1 | `#2e2a3f` | 6.28–8.12:1 |
| Body & labels | `#ffffff` @82% | 1.49:1 | `#354446` | 4.61–5.97:1 |
| Muted text, app-wide | `#9a9aa5` | 2.13–2.57:1 | `#63636f` | 4.54–5.47:1 |

The two lower tiers could not be rebuilt out of alpha, because the muted tier styles 12–13px labels and therefore has to clear 4.5:1 as well. So secondary and muted share one value now, and the hierarchy is carried by size, weight and the overline's tracking — which is where most of it lived anyway.

### The failure I left in

One did not get fixed. The primary button — on every screen in the app — runs `#a2b9bf → #637073` under a white label:

| Sampled at | Contrast | Needs |
| --- | --- | --- |
| Left edge of the label | 2.05:1 | 4.5:1 |
| First glyph | 2.67:1 | 4.5:1 |
| Last glyph | 3.73:1 | 4.5:1 |

Because the label is centred across a light-to-dark sweep, no ink colour clears both ends. The *surface* has to move — which makes it a design decision, not a token correction. I built the version that passes, `#5f7275 → #3c4b4e` at 4.87:1 to 9.10:1, looked at it, and rejected it: it was too dark, and it changed what the product felt like to use.

So it is documented as failing, flagged in the code as a chosen design value that must not be quietly "improved" toward a passing one, and left alone. Knowing which failures are yours to fix is part of the job. So is writing down the one you did not.

`[image: check-results-1440.jpg]` — The results screen after the ink change. The sage card survived; the white text did not.

---

## The spec became the design work

I built this with Claude Code. That is not a footnote about tooling — it changed what the design work actually was.

An agent does what the codebase tells it, exactly and every time. So the design authority could not stay in my head; it had to live in a file that gets read before every task. Writing that file *was* the design work. It names the token layer a component may never reach past, why a Figma stroke does not add to a frame's height while a CSS border does, why the focus ring has to be an `outline` and not a `box-shadow` (a shadow silently lost the cascade to every frosted row in the app), and which of my own comps not to reproduce.

Every departure from Figma carries a `⚠️ NOT IN FIGMA` comment naming what changed and why, so the file can catch up rather than quietly diverge. Nothing in this build is "just how it came out".

> ⚠️ THE PROTOTYPE LEADS ON FLOW. Screens used to be built in Figma first and translated here. That still holds for every VISUAL decision: a component's size, radius, type and colour must match Figma to the pixel, and inventing a treatment is drift. It no longer holds for the SHAPE OF A FLOW — what the steps are, what order they run in, and what each one asks. Those get decided here, in the thing that can actually be walked, and Figma catches up.

---

## What I took from it

The comps were not wrong about how LUX should look. Every visual decision in the shipped build still comes out of the Figma file, to the pixel. They were wrong about something a comp is structurally unable to be right about.

- A frame decides how a thing looks. Only a build decides how it behaves.
- A flow's failures live in its transitions, and a frame has none.
- When you overrule the design file, write down what changed and why, where the next person will hit it.

---

## Colophon

Set in Figtree — LUX's own typeface, in the three weights its ramp allows: Light, Regular, Medium. There is no bold anywhere on this page, for the same reason there is none in the product. Measurements are set in IBM Plex Mono. Screenshots are viewport captures from the live build, driven through Chrome's DevTools Protocol at 2× — not full-page captures, which expand the viewport and reflow every `100dvh` layout in the app.
