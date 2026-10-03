# skillry.dev Opus 5.5 videos, study of 2 Oct 2026

This is the site the user meant for the next version of the LUX presentation
video: https://skillry.dev/ai-videos/opus-5-5. The earlier
`../motionsites/` study was based on a wrong guess about which site; it stays
as secondary reference. Nothing was built.

## What the site is

It's a gallery of 475 videos people made with Claude Opus 5.5. Each comes with the
author's prompt, and skillry adds a live remake. Almost all of them are code:

- **Frameworks:** either HyperFrames (HeyGen's HTML and GSAP renderer, used with
  its skill) or Remotion, which is what lux-v3/video already uses.
- **Prompts:** 60 were read, and the frames of 30 were studied, mostly app and
  product films. The originals are at
  `media.skillry.dev/opus-5-5/<slug>/original.mp4`.
- **Files:** the slugs and the prompts are in `videos.json`, the frames in
  `sheets/`, and the board of picks in `picks.jpg`.

## What the best ones did differently (process)

- **Pointed at the repo**, not a brief. Real copy, real tokens, the real logo traced
  to SVG, real screens (several had Claude drive the iOS simulator), real data.
- **Rebuilt the UI from tokens** instead of filming screenshots. Then each region
  animates on its own, and text stays crisp (`proanaliteg`, Taxtello).
- **Storyboard first, one still per beat, contact sheets before any render.** We
  already do this.
- **Sound written in code.** Music synthesized note by note in Python, sharing one
  beat file with the visuals. SFX on every element that lands, silence otherwise.
  Cuts on a fixed BPM grid (120). One author had Claude read the waveform
  numerically to land hits. Masters at -14 LUFS. **The LUX video has no sound
  today; this is the largest gap.**
- **One codebase, many cuts.** 30/15/6s in 16:9 and 9:16, each a list of
  scenes, recomposed rather than cropped.
- **Restraint is written down.** The Taxtello prompt bans particle spam, glass
  everywhere, excess blur, spinning cards, constant zoom, bouncing UI and
  marketing paragraphs. Its rules are "one shot, one idea" and "the product UI is
  the hero".

## Picks for LUX, ranked

| # | Seen in | In LUX |
|---|---|---|
| 1 | ik_builds (a teal ball crosses every scene, breaks "the ceiling", becomes part of the logo) | **The orb is the protagonist.** It lights the face regions, rides the trend line, marks the paused product and lands in the logo. It ties the whole film into one thought |
| 2 | Taxtello (the receipt joins its booking, the chart card becomes the next surface) and the "Velocity-Matched UI Sting" skill | **Object-driven cuts.** The tapped region becomes the profile card, the paused product's tile becomes the check-in disc. Each cut carries its motion across the seam, so there are no fades or slides |
| 3 | theviableedge ("It's not a ~~prompting~~ problem.") | **Strike-through copy.** Subtraction in the type itself: a product name or "more" struck out by a drawn line |
| 4 | chapiware (a pile of permission dialogs, then "What if they didn't?"), PocketLens (flying coins) | **Clutter, then calm** for the hook: product tiles, tips and "try this" cards pile up, then everything clears to one question |
| 5 | Structura, Taxtello | **Rebuild the analysis card, chips and calendar from lux-v3 tokens** inside Remotion, instead of cropping captures |
| 6 | Claude watch (the "1 · yes / 2 · no" options fill the frame) | **Push into one control.** The check-in's "About the same" chip grows to fill the frame at the moment it's tapped |
| 7 | Kinai (a physio copilot: pale mint and lavender, a waveform card, panels in soft perspective) | **The closest style twin:** healthcare, pale, calm. It confirms the current direction and adds slight perspective on panels |
| 8 | DesignLoop (before and after cards, an "Approved" pill, a named cursor) | **Before and after the pause,** side by side. Copy has to stay within the vocabulary rules: no outcome claim |
| 9 | washow (124 BPM grid), Synclify (music written in Python), the Taxtello sound | **A soundtrack and soft SFX written in code,** cut on a beat grid |

## Rejected

- **"A new idea every 1.5–2 s, hard light/dark switches, huge kinetic type"**
  (ik_builds' rules, washow, EnvelopeBudget). It's too punchy, and LUX is calm.
- **Mascots and pixel art** (Kotlin, the vibe-engineer explainer). Off-brand.
- **Big result numbers** ("3–5x", "100% private", "88%"). These would be
  invented results, and the analysis shows no score or percentage.
- **Lip-synced talking characters and AI-generated 3D dioramas.** They need
  external generators and are off-brand.
- **The viral "showreel, go all out" prompt.** It tunes for spectacle, which
  works against "Nothing snaps".
