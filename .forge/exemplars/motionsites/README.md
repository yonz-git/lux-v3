# motionsites.ai study, 2 Oct 2026

Studied for the next version of the LUX presentation video. Nothing built yet.

**What the site is.** A paid library of AI website prompts. Each card has a
5–7s screen recording of the finished hero. The prompts themselves are behind
"Go Unlimited", so only the public preview videos were studied; nothing was
bought or signed up for. `/backgrounds` is a second library of AI-generated
video loops (mostly watermarked landscapes).

**Method.** 23 card previews, 8 evenly spaced frames each (`sheets/00–22.jpg`,
names in `sheets/meta.json`), plus one frame of 24 backgrounds
(`sheets/bg.jpg`). `picks.jpg` is the board of the nine picks below. The grid
is shuffled on every load, so the set is a sample, not the whole library.

## Picks, ranked by fit with LUX

| # | Seen on | What happens | In LUX | Build |
|---|---|---|---|---|
| 1 | KnowSugar | A sugar cube bursts into particles that drift and re-form as a human bust, on a pale grey-lavender ground | The paused product dissolves and drifts out of the routine; subtraction you can watch. Optionally the particles settle into the face | Canvas particles sampled from the product PNG's alpha, seeded noise per frame. Medium |
| 2 | Avelon Drive, arc Summit | A paragraph's words sharpen from blurred grey to ink in reading order | Captions read along with the viewer; the second line can stay muted | Per-word blur and colour in `Caption`. Low |
| 3 | Digital Persona, Nival | Glass panes and chips orbit a portrait at different depths | The face wireframe in the centre with LUX's own cards (symptom pills, a product, a check-in disc) floating around it in shallow 3D | CSS 3D transforms, frame-driven. Medium |
| 4 | NOX, Wayfinder | Engraved line art wipes or draws itself in | The face draws itself before the regions light. `face-art.svg` is stroked paths, so `pathLength` + `stroke-dashoffset` works | Low–medium. ⚠️ The art is traced from a Pinterest image; replace it before the video is public |
| 5 | Cosmic Mapping | Slow push into a vortex, through black, onto "We turn the unknown into a map" | "Investigate" made literal: push into a lit region of the face and come out in the next scene | Scale + blur transition. Medium |
| 6 | NEX Robotics, Plume | Giant type sits behind the subject; a ring appears on one spot | A huge outlined "less" behind the phone at the close; a soft ring on the region being asked about | Low |
| 7 | Wealthcore | A small glass card grows into the full dashboard, then settles back | The analysis card on the phone grows to fill the frame, then returns. Extends the existing card lift | Low–medium |
| 8 | Backgrounds #21 | Fluted, reeded glass refracting a soft gradient | A reeded-glass pass over the living canvas for the opening and close. Frost, on-system | Shader pass. Medium |
| 9 | Codeveil, Quantum Lucid | A window rises from below; headline in two tones (ink line, muted line) | Phone rises in; "LUX helps you investigate." in ink with a muted second line | Low |

## Rejected

- **Glyph scramble text** (Orange Horse): noisy and technical; LUX motion is calm.
- **Sticker pop with overshoot** (Orbit Stickers): bounce; "LUX does not bounce."
- **Dark space, light streaks, particle trees** (Neural Pathway, Anchor AI): off the v2 gradients.
- **Big counters and percentages** (Axle Journey "88%"): the analysis shows no score, bar or percentage.
- **AI cinematic loops and realistic portraits** (backgrounds, Cobalt Hour): paywalled and watermarked, and a photo face would compete with the face diagram.

Common thread on the strongest cards: one hero object, one editorial line,
glass cards at the edges, and slow continuous motion with no hard cuts.
