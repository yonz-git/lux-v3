# LUX — portfolio case study (FORGE winner: Draft A "Confession", fixed)

<!-- Paste-ready for Framer. [SLOT] = an image or video to place. Screens: capture at 440px from the live prototype unless noted. -->

[SLOT · HERO VIDEO] `videos/lux_next_v36 (1920x1080).mp4`, autoplay muted, looped. Poster: the five product tiles in a row (the v36 frame at about 52s).

# LUX
### A guide for when your skin flares up and you're using too many products to know which one to stop.

Product design and build, 2026 · Brand and UI, 2024 · Yeon Ji Lee
**[Try the prototype →](https://iamlux.vercel.app)** · **[Watch the 68-second film ↓](#film)**

---

## It started with my own skin
My skin broke out while I was adding more and more of what the internet recommended. Every video, brand and guide said *try this, add this*, so I added several at once.

When it got worse, I started stopping things. But I'd added so many together that I couldn't tell which one to stop. I asked an AI chatbot about every combination, one pair at a time. It was a slow, tangled process with no clear answer at the end.

**What I wanted didn't exist:** something that looks at everything I already use and tells me which one to pause first.

## Everyone tells you to add
Skincare content runs on *add*. Ingredient apps explain a product, hazard apps score it, and routine apps help you build more. Almost nobody says *"if you already use this, you don't need that."*

> **Use less. Find what to leave out.**

[SLOT · IMAGE] A film still from about 0–7s: the wall of hundreds of products. *Caption: "The advice is always one more product."*

## Why not just ask a chatbot?
That's what I did, and it didn't work. An open chat only knows what you think to tell it, and it answers every question with the same confidence.

LUX began in 2024 as a chatbot for a company I worked with, "an AI that answers everything about skincare." I designed its identity and interface; the product direction was the founders'. In 2026 I took the concept back and turned it around.

| | 2024 (for a company) | 2026 (mine) |
|---|---|---|
| The question | Ask anything | Which product should I pause? |
| The interface | Open chat | Five guided steps |
| The answer | Generated text | An analysis with evidence for and against |
| When unsure | Answers anyway | "Not enough evidence yet" |
| After | — | Pause one product, check in daily |
| My role | Brand and UI | Product decisions, design system, build |

*Caption: "Same name. Different question."*

**Decision:** a guided investigation. **Rejected:** an open chat, because any general AI does that now, and it can't tell you what it doesn't know.

## Five steps, one list
The intake asks only what the analysis needs: where it shows up (tap the face), skin type, known conditions, when it started, and the products you use, each with *"how long have you used it?"*

Adding products was originally twelve screens that walked you through time periods before you'd even searched. Now it's one list and one tray, and the time question appears with the product on screen, because how long you've used something is a fact about *that* product.

[SLOT · IMAGE PAIR] Left: the twelve-screen flow map (the old Figma flow, exported). Right: the add tray at "How long have you used it?" (`/investigation/products`). *Caption: "Twelve screens became one tray."*

**Decision:** one tray. **Rejected:** a mode you enter before searching.

## The analysis subtracts
The products you've used without problems clear their ingredients. Whatever is left in the newer ones is a *possible contributor*. One pass produces both the evidence for and the evidence against, so the result shows both.

There's no percentage. A score would dress a judgement up as a measurement, and this judgement comes from rough timelines and ingredient lists of unknown concentration. Confidence is a word: strong, moderate or weak.

The analysis used to be three screens. Reviewing my own build, I wrote: *"more steps added and too much reading required."* Now it's one screen: a two-second working state, then the answer.

[SLOT · IMAGE] The analysis result, showing the leading possible contributor with "for" and "against" side by side (`/investigation/analysis`, demo profile). *Caption: "The answer, and the reasoning under it."*

**Decision:** a rule-based analysis that gives the same answer for the same inputs and shows its working. **Rejected:** a model writing the verdict, which can phrase it differently each time and sound sure when it's wrong.

## "Not enough evidence" is an answer
With rough timelines, "I don't know yet" is the most likely outcome, so I designed it first, as a proper answer rather than an error page.

My first version refused for five reasons, one of them being that you don't use sunscreen. That made the app a lecturer, and it isn't the app's place to judge someone's routine. Now only two things stop it: no flare-up date, or nothing to compare. Everything else lowers the confidence and says so.

**Decision:** two gates. **Rejected:** five gates that blamed the user's routine.

## Then it follows up
The next step is one action: pause one product. A daily check-in on Progress records how your skin is doing, and a trend line shows whether things change.

[SLOT · IMAGE] Progress, with the check-in calendar and the symptom trend card (`/progress`). *Caption: "Pause one, then watch what happens."*

## How it's built
I direct the build, and Claude Code writes the code. I wrote the product brief, the design-system rules, a running decision log and 31 motion specs, then reviewed every change against them. It's Next.js, live on Vercel.

- **The design system lives in code.** I retired the Figma file on 1 Oct. Tokens and 37 components are the source of truth, rendered live at [/styleguide](https://iamlux.vercel.app/styleguide). A new visual decision is a token change, never a one-off value on a screen.
- **Motion has rules.** "Nothing snaps. LUX does not bounce." Each motion fix was a written plan before it was code.
- **Accessibility is measured.** A WCAG 2.1 AA audit covered 18 routes at two widths. axe found zero non-contrast violations, and I logged 21 issues, mostly contrast on glass surfaces. I'm working through them.
- **The film is code too.** I built it in Remotion from the same tokens.

[SLOT · IMAGE] `/styleguide` at 1440px, one wide capture. *Caption: "The system, rendered from the same code as the app."*

## What I cut, and why
- **My own first thesis.** In August, LUX was "the thirty seconds before you buy," a verdict in the shop. That's a real moment, but it's about the *next* product. My problem was the ones already on the shelf.
- **Routine building.** It's the opposite of the point: it adds.
- **AI skin-photo analysis.** It edges into medical territory, and LUX should never sound like a doctor.
- **Shopping, an ingredient encyclopedia, community.** Each is its own product, and none of them answers "what do I stop?"

## Where it is now, and what's next
**Now:** a working prototype covering intake, analysis, follow-up, and a launch film. So far, I'm its only user.

**Next:**
- **Test with five people** who've had a flare-up, and publish the three changes it leads to.
- **AI for language, rules for judgement.** A model can read a messy product name, talk you through the intake and explain a result in plain words. The decision about what to pause stays rule-based.
- **Fix the contrast debt** the audit found, starting with the nav labels.

<a id="film"></a>
[SLOT · VIDEO] `videos/lux_next_v36 (1920x1080).mp4`, with controls. *Caption: "LUX in 68 seconds."*

**[Try the prototype →](https://iamlux.vercel.app)**

<sub>LUX is not a medical tool. It suggests what to try pausing first, and a dermatologist is the right next step for anything persistent.</sub>
