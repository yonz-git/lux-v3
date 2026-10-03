# Brief: LUX intro teaser + walkthrough video (case study)

Status: delivered for review, 2 Oct 2026, 01:45. Output: `video/out/lux-intro.mp4` (58.9s) and `lux-intro-poster.png`, also copied to `~/Claude/LUX/videos/`. `lux-intro-opening-5s.mp4` is the first 5s and does not loop; the loop was a stretch goal, not made. R was answered with Claude's defaults (marked ASSUMED) because the user said "go" and went to sleep.
Date: 2 Oct 2026

## Outcome
- **For:** a design lead hiring a product designer or design engineer, who meets the video at the top of the LUX case study or autoplaying muted in a LinkedIn feed (audience.md).
- **After seeing it they should:**
  - **know** what LUX does in one sentence: it helps you work out which of the products you already use may be linked to a skin reaction;
  - **feel** it's a calm, considered and genuinely built product, not a Dribbble shot;
  - **do:** keep watching to the end, then open the case study or prototype.
- **We'll know it worked when:** a cold viewer, asked after one muted watch, can state the problem and the product's answer, and can name at least two screens they saw.

## Success criteria (grading rubric)
1. [MUST] **The problem lands in the first 5 seconds** as readable on-screen text, muted, with no prior context. "The problem" = *you have a skin reaction and several products, and no way to tell which may be involved.* It must be stated as that situation, not as positioning against other apps.
2. [MUST] **Controlled vocabulary**, with no causation by montage either: the analysis beat must not cut straight to "symptoms improve" as if that proved it. No claim that LUX diagnoses or names a cause. Use "associated with", "possible contributor" and "investigate". Never "caused", "diagnose", "allergy", "toxic" or "safe for you".
3. [MUST] **Readable.** Every caption is ≥44px at 1080 (headlines ≥84px), on screen for at least 1.5s plus 0.3s per word, inside an 80px side and 100px top/bottom safe area. App UI is shown large enough that its key element (face map, score ring, trend line) reads at phone size.
4. [MUST] **On-brand, per `docs/design.md`.**
   - Canvas gradient `#E2EDF1` → `#D3E4E7` → `#B1CAD2` at 165°.
   - Primary `#313560`, with the primary gradient from `#485780`.
   - Glass/panel recipes. No opaque white, no glows, no dark ground.
   - Type: **Urbanist only**. Headlines are Light with the key words Bold in primary, the system's own `headline` / `headline-emphasis` pattern.
   - The real orb and wordmark.
5. [MUST] **One thread.** The walkthrough follows ONE user's investigation in order (map symptoms → profile → products → analysis → tracking). It isn't a feature list.
6. **Motion has a job.** Each move either:
   - directs the eye to the one thing in the frame;
   - shows cause → effect (an answer builds the profile, data draws in);
   - or hands over between scenes. No decorative spin or random parallax.
7. **Calm, not sleepy.** The pace is brisk enough for a feed: a new beat every ≤3s, where a beat = a caption change, a new element entering, or a cut. Easing follows the v3 motion system: ease-out entrances, nothing bounces or snaps.
8. **Hook and close.** The poster frame (≈2s in) shows the headline plus the five product photos. It must read as a thumbnail at 320px wide. The close leaves one line plus the lockup and a credit line.
9. **Built-ness shows.** At least one moment makes clear this is a real, working product (real screens and real data states), not a mock.
10. **Loops cleanly** for autoplay: the last frame is the same empty canvas as frame 0.

## Constraints
- **Length / format:** 45–60s; 1080×1080; 30fps; H.264 MP4. Also export a poster still (PNG) and a 6–8s silent GIF-able loop of the hook (stretch).
- **Tone:** calm, precise, quietly confident.
- **Banned words** (including disclaimers; say "not a verdict" instead): caused, cure, diagnose, diagnosis, allergy, toxic, safe for you, revolutionary, game-changing, AI-powered (as hype), "Meet LUX" clichés.
- **Sound:** none required; it must work fully muted. Music is optional later (ASSUMED).
- **Deadline / channel:** overnight, 2–3 Oct 2026. Case study page header plus LinkedIn/Instagram feed.
- **Tooling:** Remotion in `lux-v3/video/`. Assets are captured from the running lux-v3 app (localhost:3030) and rebuilt as vectors where motion needs it. Local only; never push.

## Interview log
R was skipped: the user said "go" and is asleep. These are Claude's recommended defaults and are open for the user to overturn:
- ★ **Who is it for?** A hiring design lead, not skincare consumers (lux-scope-decision §1). ASSUMED. This changes everything: it's a case study teaser, not an app-store ad.
- ★ **The belief that stops the audience acting:** "pretty AI-made UI is cheap; can this person think and ship?" So the video must show reasoning (the controlled verdict, "evidence for / against") and real builtness, not just glass. ASSUMED.
- **Voiceover?** No. Captions carry it, because feeds autoplay muted. ASSUMED.
- **Device frame?** A minimal rounded phone silhouette in panel glass rather than a photoreal iPhone, which keeps it on-brand and readable. ASSUMED.
- ★ **Accent face?** None. The grader caught that lux-v3 is Urbanist-only and already has an editorial pattern (Light headline + Bold primary key words), which does the motionsites mixed-type job on-system.
- **Name a tagline?** Use the product's own language: "Find what your skin is reacting to." ASSUMED. Check it against vocab: "reacting to" is a question the user investigates, not a claim.

## Grader round 1 (fresh context)
None of the drafts passed. B was closest; A and C had structural fails. The fixes are folded into the criteria above and into the final storyboard in `intro-video-drafts.md` ("FINAL — B revised").

## Grader rounds 2–4 (fresh context, on the rendered video)
- **Round 2, draft 1.** Failed MUSTs 2, 3 and 4.
  - Fixed:
    - "A skin reaction.";
    - no cut from the verdict to an improving chart;
    - the verdict, evidence and profile rebuilt as large vector cards in the app's real copy;
    - longer holds;
    - cards leave forward;
    - a camera push on each beat;
    - the two named products thread from the hook into the verdict;
    - a loop crossfade.
  - Overruled: the "teal trend card is off-system" finding. The user explicitly asked to keep v2's colour on that card; design.md's "deep tier is gone" predates that request.
- **Round 3, draft 3.** Four of five MUSTs passed; MUST 3 failed on reading time for the analysis copy.
  - Fixed:
    - the verdict now holds about 5s and the evidence about 4s after resolving (the map was trimmed by 1s to pay for it);
    - the trend line is drawn as an SVG path from the live chart's samples, which removed a tonal seam;
    - the slot blink;
    - kickers raised to 44px;
    - the day labels made consistent: the line and the check-ins both stop at 22 Sep, the Day 19 chip is hidden, and the kicker reads "The next step".

## Open contradictions / vague spots
- `lux-scope-decision.md` frames LUX as "the thirty seconds before you buy" (scan-in-shop). lux-v3 has become a retrospective **investigation** app (product-brief). The video follows lux-v3 as built. Flag for the user: does the case study's thesis line need updating to match?
- The exemplars are PROPOSED, not confirmed.
- **For the user:** the trend card in `docs/design.md` still describes the deep tier as gone, while the app and this video use v2's teal there by your request. Is design.md stale on this point?
- **For the user:** the video ends on the app's own proposed next step ("Pause one product. Record what happens.") and draws only part of the record, so it makes no outcome claim. Confirm you want that rather than showing the improvement.
- **For the user:** E (exporting this as a reusable workflow) waits for your verdict.
