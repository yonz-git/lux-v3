# VidGen redesign — component inventory

Written 1 Oct 2026, before any design work, to answer one question: **what in
LUX do the VidGen references already show, and what has to be designed from
scratch?**

References:

- `~/Claude/vidgen/index.html` — two phones: a light **Welcome** and a dark
  **AI Assistant** prompt sheet.
- `~/Claude/vidgen-studio/index.html` — a dark desktop **Storyboard** editor
  with a prompt panel, a moodboard and a clip timeline.

The references are three screens of a video tool. LUX has 19 routes, a
five-step form flow, readouts, charts and a calendar. Most of LUX's surface
area is NOT in them.

## The look, in one paragraph

Urbanist, set light, with **bold emphasis words inside a light headline**
("Next-level **AI video** creation"). Two grounds: the pale sage canvas, and a
deep indigo (`#1f1830`) that light glass sheets sit on. Big frosted panels with
very round corners (28–46) and no borders — edges come from a white rim and a
soft glow. Controls are **circles**: ~56 round glass icon buttons, and a dark
indigo circle as the one primary action. Options are pill chips with a leading
icon. Colour is quiet — indigo, lilac and sage, with one soft lilac glow.

## Decisions (status 1 Oct 2026)

1. **Typeface — decided: Urbanist.**
2. **Dark screens — decided: none.** The references' dark indigo ground was
   tried and dropped with their gradients; lux-v2's canvas stays.
3. **Primary action — decided: a labelled indigo pill** (`Button`, 56 tall)
   for worded actions, and the indigo circle (`IconButton variant="primary"`)
   where a glyph is enough.
4. **Navigation — OPEN.** Keep the bottom bar restyled, or move to pill tabs.
5. **Brand indigo — decided:** `#485780 → #313560`, lux-v2's.

The system that came out of these is `docs/design.md`.

## A — Shown in the references: restyle directly

| LUX component | Reference element | Notes |
| --- | --- | --- |
| `Chip` | icon pill chips (`9:16`, `1080p`, `15s`) | Unselected = glass pill; selected needs designing (the refs show no selected chip). Leading icon is optional in LUX. |
| `Sheet` | AI Assistant panel | Gradient-lit header, round ✕ button top-right, inner glass card. |
| `ChatPanel` / `CheckInPanel` | AI Assistant prompt card | The daily check-in is the closest LUX screen to this. Composer row = `+`, mic, sparkle send. |
| `ScreenHeader` back control | round glass back button + title (Storyboard) | 44+ circle with chevron. |
| `Welcome` + `LogoEntrance` | Welcome phone | Kicker + mixed-weight headline, pagination dashes, slide-to-start. |
| `Orb` | the lilac glow blob on Welcome | Already a LUX idea; the ref shows it as a soft glow, not a sphere. |
| `Tag` | moodboard `Silhouette` tag | White pill, thin outline. |
| `SegmentedToggle` | `Featured / Recent / Saved` pill tabs | Selected = solid white, others outlined. |
| Icon buttons (`Snackbar` action, `+` in trays, sheet ✕) | round glass buttons (bell, menu, close, `+`, mic) | One component: `IconButton`, glass and primary variants. LUX has no such component yet. |

## B — Partly shown: extend the reference's language

| LUX component | Closest reference | What has to be invented |
| --- | --- | --- |
| `Button` (labelled, full-width `Continue`) | slide-to-start's pill, the primary circle | A labelled pill in primary and secondary. Disabled state. |
| `SmallButton` (`Save & exit`, `Update photo`) | time pill (`00:00`, `02:00`) | Smaller glass pill with a label. |
| `DataCard` | moodboard card (white), description card (glass) | Two tiers again (light + emphasis), now without the sage. Overline + metric type. |
| `TextField` / prompt text | prompt card text area | A single-line field and its focus state. |
| `SearchField` | (none on the light ground) | Glass pill with icon, from the chip recipe. |
| `CameraCapture` / `SelfieSheet` / `CheckInPhotoArt` | image card with glass overlay buttons (camera, expand, delete) | Viewfinder and shutter. |
| `PhotoGallery` | moodboard stacked photos | Grid of tiles. |
| `StepProgress` | Welcome's pagination dashes | Five-step track with the active step longer. |
| `HubScreen` / page layout | Storyboard's big frosted board | Page padding, heading row, card stacking. |
| `BottomNav` | top pill tabs | Depends on decision 4. |
| Analysis product timeline (`HypothesisCard`, `/investigation/analysis`) | Studio clip timeline with ticks and playhead | A strong fit: products introduced over time against the reaction date. |

## C — Not in the references: design from scratch

**Selection and input**

- `OptionRow` — radio and checkbox rows (skin type, conditions). The refs have
  no list rows at all.
- `DateField` + its calendar popover (step 4).
- `FaceDiagram` — region pills, symptom callouts and leader lines (step 1,
  recap, PROGRESS).
- `OtherBlock` / the typed `Other` field with ✓ and pen.
- Exclusive-option behaviour has no visual change, but the selected chip and
  checkbox states do.

**Readouts and data viz**

- `SymptomTrend` — the line chart.
- `CheckInCalendar` — the month grid with checked-in discs.
- `CompatCard` + `GlassMetricCard` + `ResultCards` — score, bands, metric cards.
- `SkinProfileTiles` / `SkinProfileStrip` / `SkinProfileSummary` — the
  profile card and its pills.
- `PriorityList`, `HypothesisCard`, `Disclosure` — the analysis findings.
- `InvestigationRecord`, `CheckInDetail` — the record views.

**Products**

- `ProductCard`, `ProductAccordionCard`, `ProductThumb`, `ThumbStack`,
  `ProductArt` — product rows, photos and stacks.
- `IngredientTerms` / `IngredientsDisclosure`.
- `AddProductMethodSheet` method tiles; `CheckBasket` docked bar.

**Feedback and system states**

- `ChatBubble` (AI and user) — the refs show a prompt, not a conversation.
- `Snackbar` — undo bar.
- `SafetyNotice` — the warning callout (needs a non-colour signal).
- `PassList` + `CheckAnalyzing` — the analysing / loading state.
- Empty states (`/progress/empty`, `/check/no-profile`, `My Products — empty`).
- Focus ring, disabled, hover and pressed states for every control.
- Error and success colours — the refs have no feedback colours.

**Icons**

The refs use about 15 glyphs LUX does not have (sparkle, mic, bell, menu,
aspect ratio, resolution, timer, sliders, copy, help, camera-in-frame,
expand, trash, chevrons). LUX's 13 icons would need redrawing in the same
weight anyway. One set, one stroke.

## Suggested order

1. Make decisions 1–5.
2. Tokens: type ramp, both grounds, glass recipes, radii, brand. Check
   contrast on both grounds before going further.
3. Section A components, then B, on `/styleguide`.
4. Prove it on three screens: Welcome, one flow step (`/investigation/conditions`),
   and the daily check-in.
5. Section C, grouped as above, one group at a time.
