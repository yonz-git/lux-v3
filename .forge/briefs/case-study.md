# Brief: LUX v3 portfolio case study

Status: go
Date: 2026-10-06

## Outcome
- **For:** a design lead hiring a product designer (junior–mid) who can prototype in code. Skims on a laptop between meetings; gives the page ~10 seconds before deciding to scroll. A design-engineering lead is the secondary reader.
- **After reading/seeing it they should:** believe this person can see a problem clearly, make and defend a product decision, and ship the craft in real code — and want to talk to them.
- **We'll know it worked when:** a skimmer can state LUX's problem and the key decision from headings + captions alone; a reader clicks the live prototype or plays the video; the case study gets cited in an interview invite / screening call.

## Success criteria (grading rubric)
1. [MUST] The first screen (title, one-line summary, hero) says what LUX is, who it's for and what the author did — in under 10 seconds of reading.
2. [MUST] The origin is the spine: how the author arrived at the problem (people with a skin problem already use many products, and everyone says add more). The 'do the opposite / subtract' insight lands before any UI.
3. [MUST] It answers "why not just ask ChatGPT?" head-on: structured intake → analysis → one next step → follow-up.
4. [MUST] It is decision-led, not a feature tour: at least 3 named decisions, each with the alternative rejected and the reason (e.g. one route not seven screens; rules engine over an LLM; the analysis refuses to answer without enough evidence; Figma retired, code becomes the source of truth).
5. [MUST] The 2024 → 2026 seam is honest and visible (a supporting thread; the origin is the spine): 2024 = visual identity + UI for a company, founders owned direction; 2026 = took it back, product decisions, redesign, build. Role is never inflated.
6. [MUST] No medical overclaim. Controlled vocabulary: "associated with", "possible contributor". Never "diagnose" (not even negated), "caused your reaction", "toxic", "safe for you".
7. [MUST] Skimmable: a skimmer can state the problem and one decision from headings + captions alone; no paragraph over ~70 words; total body ≤ ~1,200 words.
8. A "what I cut and why" section exists and is specific.
9. Shows design-engineering evidence concretely (tokens as source of truth, motion plans, accessibility audit, Remotion video) as claims with one proof each, not a list of stats.
10. Ends with outcome / what I'd do next, plus links to live prototype and video.
11. Every visual slot is specified (file path or source, plus caption).

12. [MUST] Honest about the tech and the process: no user-testing claims; the Claude Code build is stated as directed work: the current analysis is presented as rule-based by design; AI appears only as a reasoned next step. Never "AI-powered".

## Constraints
- Length / format: web case study page for the portfolio site (Framer, yonz.framer.website — confirm). Text as text, screens flat and large, max two mockups. Deliver as copy + asset slots, ready to paste.
- Tone: calm, precise, quietly confident; shows reasoning, not hype (who.md).
- Banned: "revolutionary", "AI-powered" as a selling point, "seamless", "delightful", medical claims above, invented metrics or user-test results.
- Deadline / channel: ASAP — needed to start applying.

## Interview log
- Q (F gate): what sets the writing-voice bar? → A: Simon Pan, Uber pickup case study (simonpan.com/work/uber). It works as one problem that unfolds as a single narrative, with each section ending on a decision. Don't copy its length or its senior, team-scale framing.
- ★ Q: what is the story? → A: how I came to the problem. Someone going through a skin problem needs a guide to find the root cause. People who care about skincare already use several products, and brands, apps and guides all tell them to add this and that. **LUX does the opposite: it helps you find what to take out.** This settles the thesis: the investigation/subtraction thesis wins and the shop-verdict thesis is history.

- ★ Q: where did the insight come from? → A (own words, keep the texture): **my own skin.** It flared up while I kept adding the ingredients the media suggested. I started narrowing down and stopping some, but I'd added so many at once that I couldn't tell which one it was. Media is all "use this, try this"; almost nobody says "if you already use X, avoid Y" or "you don't need this". Watching it, you just want to add more, and my skin became a disaster. I asked AI about every combination, one by one, and it was a complicated process. I wanted an app that looks at everything I use and tells me which one to stop. LUX began as an AI my old company was developing: "an AI that answers everything about skincare", which makes no sense now because you can ask any AI. Answer to "why not just ask ChatGPT": you can, but LUX is a purpose-built guide. It **collects exactly the info the analysis needs, runs the analysis, gives a structured next step, and follows up on the change.**
  → Changed: the opening is first-person. The audience objection "why not just ask any AI?" is answered explicitly. The 2024 seam is reframed: the company's idea was "answer everything"; mine is "find the one thing to stop".
- ★ Q: you call LUX "a customised AI", but no model is connected and the analysis is deterministic. How do we frame that? → A: it's a prototype, so no live AI yet. **Write it now, with AI as the next step.** In the case study the analysis is a designed, rule-based guide: same inputs give the same answer, it shows its reasoning, and it can say "not enough evidence yet". "What's next" carries the plan: AI for language (reading messy product names and ingredient lists, talking through the intake, explaining results in plain words), rules for judgement (which product to pause).
  → Changed: never call the current build "AI-powered". The orb/chat is "the guide". Added a MUST.
- Q: did anyone else test v3? → A: no, only me. → Never claim user testing. Self-critique counts as iteration (e.g. 6 Sep: "too many steps, too much reading" collapsed 3 routes into 1). "Test with 5 people" goes in What's next.
- ★ Q: which role? → A: unsure; after discussion, **decision first, build as proof**. Pitched as a product designer who prototypes in code. A "How it's built" section shows the design-engineering evidence. The title can be swapped per application.
- Q: name → A: **Yeon Ji Lee**.
- ★ Q: say it was built with Claude? → A: yes, framed as a skill: "I wrote the specs, design-system rules and motion plans; Claude Code wrote the code." The plans/ folder and decision log are the proof of direction.

## Open contradictions / vague spots
- RESOLVED (Yeon Ji Lee): who.md names the author "Yeon Ji Lee"; the portfolio site says "Yonz Lee". Confirm.
- RESOLVED: the case study never claims a live AI. Thesis drift: scope decision (Aug) = "the thirty seconds before you buy" (shop verdict). v3 = investigation: which of your products is associated with a flare-up; "Use less. Find what to leave out." The case study must pick one and can show the pivot as a decision.
- Exemplars are PROPOSED and video-oriented; no writing exemplar in the user's own voice exists yet. The portfolio site's current LUX page has no prose.
- RESOLVED (no testing): Scope decision Phase 6 promised "test with five people". Unknown whether testing happened — cannot claim it if not.
