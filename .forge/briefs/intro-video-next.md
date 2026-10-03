# Intro video, next version: storyline and motion (proposal, 2 Oct 2026)

Status: BUILT, first full cut, 2 Oct 2026.
- **Composition:** `video/src/v3/LuxNext.tsx`, 2020 frames (67s) at 1920×1080.
- **Scenes:** beats 1–2 in `TooMuch.tsx` (approved), 3–4 in `Story.tsx`, 5–9 in `Story2.tsx`.
- **Render:** `video/out/lux-next.mp4`.
- **Copy:** "Everyone tells you to **add** more." is approved. Beat 7's caption is the existing "Pause one product," with "then note **what happens**." landing in beat 8; no new line was needed.

Original status: PROPOSAL. This file was written after the user asked to improve the
"so basic" video, with the focus on storyline and creative motion rather than sound.
Sources:
- `../exemplars/skillry/` (the primary study);
- `../exemplars/motionsites/` (secondary);
- the storyboard board, `intro-video-next-storyboard.jpg`;
- the current cut's contact sheet, `intro-video-current-sheet.jpg`.

## Why the current cut reads as basic

- **One composition for about 45 of 62 seconds.** The phone sits on the right
  with a caption and a card on the left, six times over. Every change is a
  crossfade, the camera never moves, and scale never changes.
- **It's a feature tour** (map, profile, products, analysis, evidence, track),
  not a problem that turns into a payoff.
- **The thesis is buried.** "Pause one product" is the last and smallest
  walkthrough beat, when it should be the climax.

## Storyline: too much, your five, investigate, the one, take it out, watch, close

The spine is borrowed from Enxovaly (a baby-gear app's video: "Mil dúvidas.
Sem exageros. Sob medida."). It is the same story as LUX: overwhelm, then
only what you need. **"Take it out" is the climax.**

| # | ~sec | Beat | Motion | Copy |
|---|---|---|---|---|
| 1 | 0–7 | Too much | Hold on one product tile, then pull back into a tilted 3D wall of hundreds of products and "try this" tip cards | "Your skin flared up." (existing) |
| 2 | 7–13 | Your five | The wall falls away in eased waves; five tiles stay and glide into one row | "You use five products. **Where** do you start?" (existing) |
| 3 | 13–17 | Investigate | The orb arrives, the phone rises in, and the camera pushes through the screen into the app | "LUX helps you **investigate**." (approved) |
| 4 | 17–27 | Map it | The face draws itself line by line, then regions light as they're tapped. The tapped region pill flies out and becomes the profile card | "Tap **where** it shows up." (existing) |
| 5 | 27–34 | Timeline | The five tiles from beat 2 fly back in and become the rows of the products screen. The newest slides to "new addition" | "Add what you use, and **when** you started it." (existing) |
| 6 | 34–42 | The one | The other four dim and blur back; one is ringed. Push in until the analysis card fills the frame, then "for" and "against" part to either side | "LUX points to **what to pause** first." (approved) |
| 7 | 42–49 | **Take it out** | Its name is struck through by a drawn line, the tile lifts out of the row and leaves frame, and the four close the gap | DRAFT: "Take one out." |
| 8 | 49–57 | Watch | Check-in days tick (discs fill, or a day counter flips) while the trend line draws with the orb at its head | "Pause one product,\nthen note **what happens**." (existing) |
| 9 | 57–64 | Close | The orb settles into the mark as a circle draws around it; the wordmark resolves | "Use **less**. Find what to leave out." (approved) |

The camera never fully stops: each cut hands its motion to the next scene
("velocity-matched seams"). There are no crossfades between beats.

## Effects

| Effect | Seen in | LUX version | How in Remotion | Effort |
|---|---|---|---|---|
| Pull-back into a tilted wall | Enxovaly 0–2s (`sheets2/gabrielbuzziv-057430.jpg`, row 1) | Beat 1 | A CSS 3D plane (`perspective`, `rotateX` ~35°) holding a grid of tiles, with scale eased from about 5× to 1× | M |
| Wall falls away, five stay | Enxovaly 4–5s ("Sem exageros") | Beat 2 | Tiles fade and drop in staggered waves by distance from the centre; the five keep their rects and glide into a row | M |
| Orb as protagonist | ik_builds (the ball crosses every scene and ends in the logo) | Beats 3, 4, 8, 9 | One `<Orb>` with a path keyed across beats and a faint onion-skin trail. **Option:** the recorded taps use a fingertip, so the orb could replace the finger or only lead between scenes | M |
| Push through the screen | koldo2k (every scene seen through a lens, then the camera pushes through it) | Beat 3 | Scale around the phone screen's centre until it covers the frame, then the next scene takes over at matched velocity | S |
| Line-drawn face | ink-line reel, NOX | Beat 4 | `face-art.svg` is stroked paths: `pathLength=1` plus an animated `stroke-dashoffset`, in three opacity tiers. ⚠️ The art is Pinterest-traced; replace it before public use | S |
| Shared-element cut | Taxtello (the receipt joins its booking), the Velocity-Matched UI Sting skill | Beats 4, 5 | Interpolate the rect from element A in scene 1 to element B in scene 2, crossfading their contents mid-flight | M |
| Dim the rest, ring the one | DesignLoop, NEX | Beat 6 | The others get `filter: blur() saturate()` and opacity; a ring draws on the chosen one | S |
| Push into one card | Claude watch ("1 · yes" fills the frame) | Beat 6 | **Needs a rebuilt card** (see the prerequisite below), then a scale on the camera group | S, once rebuilt |
| Strike-through | theviableedge, chrisjdimarco, DistilBook | Beat 7 | An SVG line across the name with an animated `scaleX` from the left, the text going to muted | S |
| Lift out, close the gap | Already prototyped in `src/v2/TakeOut.tsx` | Beat 7 | Reuse it and add the strike and a full exit from frame | S |
| Days tick | Heat of 2026 (tally marks, a 21→25 day counter) | Beat 8 | Discs fill in sequence; an optional "Day 1 → Day 14" counter rolls digit by digit | S |
| Orb rides the line | ik_builds (the ball at the line's head) | Beat 8 | The orb follows `getPointAtLength` on the trend path as it draws | S |
| Circle into logo | muda (an ensō draws itself) | Beat 9 | A stroke-dash ring around the orb, then the mark and the word resolve | S |
| Two-tone line | muda ("We removed the waste. *It was most of it.*"), Codeveil | Any caption | The second line arrives later in muted ink | S |

## Prerequisites (must be in place before the effects above can be built)

1. **Rebuild the key UI pieces as React components from lux-v3 tokens** inside
   `video/`, instead of cropping the captured PNGs. This covers:
   - the analysis card ("Best fit so far");
   - for and against;
   - the region pills;
   - the profile card;
   - the product rows;
   - the check-in discs.

   Push-ins and shared-element cuts blur on bitmaps at 2×. This is the real scope
   change. The phone can stay as captures plus the recorded face, since it's
   shown at device scale.
2. **Assets for the wall.** We have 5 product tiles; the wall needs hundreds.
   Repeat the five with hue and scale jitter, add generic bottle and jar
   silhouettes, and mix in short "try this" tip cards. Use no real brands.
3. **Motion rules hold.** "Nothing snaps; LUX does not bounce." Tile drops are
   eased, not physical, and there's no overshoot. Taxtello's restraint list
   applies:
   - one idea per shot;
   - no particle spam;
   - no glass everywhere;
   - no constant zoom.

## Not taken

- the hard light and dark switches;
- "a new idea every 1.5 s";
- mascots;
- big result numbers;
- dark space backgrounds;
- glyph scramble.
