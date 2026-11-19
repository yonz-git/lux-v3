# LUX case study — three angles (G1, 6 Oct 2026)

- **A · Confession:** a first-person narrative. My skin got worse every time I added something, so I designed the app I needed. The story unfolds like Simon Pan's, and each section ends on a decision.
- **B · Contrarian thesis:** the whole category says add, and LUX says subtract. Argument-led, with the decisions as numbered claims, each with the rejected alternative.
- **C · Two years apart:** the same project, the same designer, 2024 and 2026. The structure is "what the brief asked for, then what I know now". The seam is the spine.

---

## DRAFT A — Confession

**[HERO: video `lux_next_v35`, autoplay muted, poster frame = the orb over the five product tiles]**

# LUX
### A skincare guide that helps you find what to stop using.
Product design and build · 2024 brand, 2026 product · Yeon Ji Lee
[View the live prototype →](https://iamlux.vercel.app) · [Watch the 67-second film ↓]

---

## It started with my own skin
My skin flared up while I was doing everything right. Or at least everything the internet told me. Every video, brand and guide said *try this, add this*. So I did, several products at once.

When my skin got worse I started stopping things. But I'd added so many together that I couldn't tell which one it was. I asked an AI chatbot about every combination, one pair at a time. It took days and never gave me a straight answer.

**What I wanted didn't exist:** something that looks at everything I already use and tells me which one to pause first.

## Everyone tells you to add
Skincare content runs on *add*. Ingredient apps explain a product, hazard apps score it, and routine apps help you build more. They all assume the product in your hand is the next one.

Almost nobody says *"if you already use this, you don't need that."* That gap became the thesis:

> **Use less. Find what to leave out.**

**[IMAGE: the "too much" wall, a still from the film: hundreds of products, then five]**

## Why not just ask a chatbot?
That's what I did, and it's exactly what didn't work. An open chat only knows what you think to tell it, and it answers every question with the same confidence.

LUX began in 2024 as a chatbot a company I worked for wanted to build, an AI that answers everything about skincare. I designed its identity and interface. The product direction was the founders'. In 2026 I took the concept back and turned it around: **instead of answering anything, LUX asks the five things it needs and does one job.**

**Decision:** a guided investigation, not an open chat.

## Five questions, one map
The intake is five short steps: where it shows up (tap the face), skin type, known conditions, when it started, and the products you use, each with *"how long have you used it?"*

That last question used to be a twelve-screen flow that sorted products into time periods before you'd even searched. I cut it to one list and one tray. How long you've used something is a fact about *that product*, so it's asked with the product on screen.

**[IMAGE: step 1, the face map with symptom callouts · step 5, the add tray at "how long have you used it?"]**

**Decision:** twelve screens became one.

## The analysis subtracts
The products you've used without problems clear their ingredients. Whatever is left in the newer products is a *possible contributor*. The same pass produces the evidence for and the evidence against, so the result shows both.

There's no percentage. A score would dress a judgement up as a measurement, and this judgement comes from rough timelines and ingredient lists of unknown concentration. Confidence is a word.

**[IMAGE: the analysis result, the leading hypothesis with "for" and "against" side by side]**

**Decision:** rules I can explain, not a model that guesses. The same inputs always give the same answer.

## "Not enough evidence" is an answer
I built the refusal state first, because it's where most real runs land. My first version refused for five reasons, including no sunscreen in your routine. That turned the app into a lecturer, and judging someone's routine isn't its call. Now only two things stop it: no flare-up date, or nothing to compare against. Everything else just lowers its confidence.

**Decision:** two gates, not five.

## Then it follows up
The next step is one action: pause one product. A daily check-in on Progress records how your skin responds, and the trend shows whether pausing it helped.

**[IMAGE: Progress, the check-in calendar and the symptom trend card]**

## Too much reading
Reviewing my own build, I wrote: *"as a user it's more steps added and too much reading required."* The analysis was three screens. It's now one: a 2-second working state, then the answer.

## How it's built
I direct the build; Claude Code writes the code. I wrote the product brief, the design-system rules, a decision log and 31 motion specs, and reviewed every change against them. **[Next.js · 359 commits since 16 Aug · 37 components · 22 routes]**

- **The design system lives in code.** Tokens and components are the source of truth, rendered live at `/styleguide`. I retired the Figma file on 1 Oct: a new visual decision is a token change, never a one-off value.
- **Motion has rules.** "Nothing snaps. LUX does not bounce." Each motion fix is a written plan before it's code.
- **Accessibility is measured.** A WCAG 2.1 AA audit across 18 routes at two widths: zero non-contrast axe violations, and 21 issues logged, mostly contrast on glass, which I'm working through.
- **The film is code too.** Built in Remotion from the same tokens.

**[IMAGE: /styleguide, one wide screenshot]**

## What I cut
Routine building, AI skin-photo analysis, shopping, an ingredient encyclopedia and community. Each is its own product, and each already exists in a better form than I could build. LUX does one thing.

## What's next
- **Test with five people.** So far I'm the only user, and the case study shouldn't pretend otherwise.
- **AI for language, rules for judgement.** A model can read a messy product name, walk you through the intake in plain words and explain a result. The decision about what to pause stays rule-based.
- **Fix the contrast debt** the audit found, starting with the nav labels.

LUX isn't medical advice and doesn't diagnose. It points to what to try pausing first.

[Live prototype →](https://iamlux.vercel.app)

---

## DRAFT B — Contrarian thesis

**[HERO: video `lux_next_v35`]**

# LUX: the skincare app that tells you what to stop
Every skincare app helps you add. LUX helps you subtract.
Role: product design, design system and build (2026) · brand and UI (2024) · Yeon Ji Lee · [Live prototype →](https://iamlux.vercel.app)

---

## The category is built on "add"
| What exists | The job | What it assumes |
|---|---|---|
| Ingredient decoders | Explain this product | You'll buy it |
| Hazard scorers | Is this bad? | One score fits everyone |
| Routine trackers | Manage what you use | You'll keep using it |

None of them answers the question you have when your skin flares: **which of the things I already use should I stop?**

I know because I lived it. I'd added several products at once on the internet's advice, my skin got worse, and I couldn't untangle which one to blame. I went pair by pair with a chatbot for days.

## Claim 1 · A guide beats a chatbot here
**Rejected:** the 2024 brief, "an AI that answers everything about skincare" (I designed its brand and UI; the direction was the founders'). Any general AI does that now.
**Chosen:** five guided questions (where, skin type, conditions, timing, products), then one analysis and one next step. The app asks for exactly what the analysis needs, and nothing else.

## Claim 2 · The answer should be explainable, not generated
**Rejected:** a model writing the verdict. It answers differently each time and is confident when it's wrong.
**Chosen:** a subtraction. Products you've used without problems clear their ingredients, and what's left in the newer ones is a *possible contributor*. Evidence for and against come out of the same pass. There's no percentage, because confidence is a word.

**[IMAGE: analysis result, for/against]**

## Claim 3 · "I don't know yet" is a feature
**Rejected:** five completeness gates, including "you don't use sunscreen." The app lectured before it helped.
**Chosen:** two gates: no flare date, or nothing comparable. I built this state first, because it's where most real runs land.

## Claim 4 · Fewer screens, every time
- Analysis: 3 routes → 1, after my own review: *"more steps, too much reading."*
- Adding products: 12 screens → 1 tray. "How long have you used it?" is asked with the product on screen.
- Intake: 9 designed screens → 5 steps.

**[IMAGE: before/after, the 12-screen flow map beside the single tray]**

## Claim 5 · The system is the source of truth
I retired Figma on 1 Oct. Tokens and 37 components in code are the design system, live at `/styleguide`. A new visual decision is a token change. Motion follows written rules ("nothing snaps"), and 31 motion fixes were each specced before they were built. I direct the code through Claude Code; the specs, rules and reviews are mine.

## What I cut
Routine building, photo skin analysis, shopping, encyclopedia, community. All real features in real competitors, and none of them is this job.

## Honest status
Tested by me only. A WCAG AA audit found 21 issues, mostly contrast on glass, and I'm working through them. No live AI yet.

## Next
Five-person test. AI for language (reading product names, explaining results), rules for judgement. Contrast fixes.

---

## DRAFT C — Two years apart

**[HERO: split. Left: 2024 LUX UI concept (`Images/lux/LUX-UI_01.avif`). Right: 2026 analysis screen. Caption: "Same name. Different question."]**

# LUX, twice
In 2024 I drew a skincare chatbot for a company. In 2026 I rebuilt it as the guide I needed.
Yeon Ji Lee · Product design and build · [Live prototype →](https://iamlux.vercel.app)

---

## 2024: the brief
A company asked me for a logo, a landing page and a chatbot UI for "an AI that answers everything about skincare." The direction was the founders'; I owned the visuals. I'm still proud of the identity: the orb and the breathing contour rings.

**[VIDEO: `lux_logo_motion`, 8s]**

What the brief never asked was *what problem the chat solves*. In 2026, an AI that answers everything about skin is any AI.

## Between: my skin
Then I became the user. I added several products the internet recommended, all at once. My skin got worse, and I couldn't work out which one to stop. I went combination by combination with a chatbot, and it took days.

That was the missing question: **not "what should I add?" but "what should I stop?"**

## 2026: the same name, the opposite product
> **Use less. Find what to leave out.**

| | 2024 | 2026 |
|---|---|---|
| Question | Ask anything | Which product should I pause? |
| Interface | Open chat | Five guided steps |
| Answer | Generated text | Rule-based analysis, for and against |
| When unsure | Answers anyway | "Not enough evidence yet" |
| After | — | Pause one product, check in daily |
| My role | Brand and UI | Product decisions, design system, build |

## What I know now that I didn't then
**Constraints make a product, not features.** The analysis was three screens; my own review said *"too much reading."* Now it's one. Adding products was twelve screens; now it's one tray.

**Honesty is a design material.** No percentage on the result, because this judgement can't be measured that precisely. The vocabulary is controlled: *associated with*, *possible contributor*, never *caused*.

**Refusing well matters.** I built the "not enough evidence" state first, and cut the gates that lectured people about their routine.

**[IMAGES: step 1 face map · step 5 tray · analysis · progress trend]**

## I build now, too
In 2024 I handed off. In 2026 I ship: Next.js, directed through Claude Code. I write the specs, the design-system rules and the motion plans, and Claude writes the code. Figma retired on 1 Oct; the tokens in code are the system. 359 commits, 37 components, a WCAG AA audit with 21 issues logged and being fixed, and a launch film built in code from the same tokens.

## Cut, and next
Cut: routines, photo analysis, shopping, encyclopedia, community.
Next: a five-person test (so far it's only me), AI for the language and rules for the judgement, contrast fixes.
