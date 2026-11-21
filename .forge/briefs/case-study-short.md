# LUX: short case study copy (paste-ready, about 400 words)
<!-- Layout reference: the "LUX Case Study" artifact. Images come from lux-v3/video/out/stills (f300 wall, f450 face, f800 timeline, f1800 pause + trend) and Images/lux/LUX-UI_01.avif (2024). -->

Case study · Yeon Ji Lee
# LUX
A skincare app that helps you work out which product to stop using.

Role: Product design, design system, build · Timeline: 2024 brand work, rebuilt in 2026 · Built with: Next.js, directed with Claude Code · Status: Working prototype, not yet user-tested
[Try the prototype](https://iamlux.vercel.app)

[IMAGE: f300, "Everyone tells you to add more."]

## My skin got worse the more I added
I kept adding the products the internet recommended, several at once. My skin broke out, and I couldn't tell which one to blame. I ended up asking a chatbot about every combination, one pair at a time.

Almost all skincare advice is about what to add, whether it comes from a brand, an app or a video. I couldn't find anything that helped me work out what to take away.

**Use less. Find what to leave out.**

## Three steps from a flare-up to one thing to try
1. **Tell it what happened.** Tap where your skin reacts. Add the products you use and how long you've used each one. [IMAGE: f450]
2. **It rules things out.** Products you've used without trouble clear their ingredients, and whatever is left in your newer products points to the one to pause first. [IMAGE: f800]
3. **Pause one, then check in.** A short daily check-in tracks your skin, so you can see whether pausing that product made a difference. [IMAGE: f1800]

## The analysis works by subtraction
[DIAGRAM: the four-product table from the artifact]
LUX suggests pausing the exfoliant first: it's the newest product, and its main active isn't in anything you've used without trouble.
*A simplified example. The real analysis also weighs timing and known ingredient clashes, and it can answer "not enough evidence yet."*

## Three calls that shaped it
**5 questions · A guide instead of a chatbot.** LUX started in 2024 as a startup's "ask me anything" skincare chatbot. I designed its brand and UI. Any AI can answer questions now, so I rebuilt it to ask only what the analysis needs.

**3 outcomes · It can say "not sure yet."** One likely suspect, a few possible ones, or not enough evidence yet. There's no percentage score, because with rough dates and unknown concentrations a number would look more certain than the answer is.

**12 → 1 · Fewer screens.** Adding a product went from 12 screens to 1, and the result from 3 screens to 1. My note on the old version was "too much reading."

## 2024 to 2026
**2024:** The brand and chat UI I designed for a startup. The product direction was theirs.
**2026:** My rebuild. I made the product calls, redesigned it and built it.

## How I built it
I designed LUX and built it in Next.js by directing Claude Code: I wrote the specs, the design-system rules and the motion guidelines, and reviewed every change. The design system lives in code, and the launch film was made in code from the same tokens.
37 components · 31 written motion specs · WCAG 2.1 AA audit, fixes in progress · Film built in Remotion

## What's next
- Test it with five people who've had a flare-up. So far I'm the only person who has used it.
- Bring in AI where it helps, like reading messy product names and explaining results in plain words. The decision about what to pause stays rule-based, so it's consistent and easy to explain.

LUX isn't medical advice. For anything persistent, see a dermatologist.
