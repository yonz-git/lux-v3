# LUX case study, problem-first version (paste-ready)
<!-- Images: LUX/case-study-screens/ and lux-v3/video/out/stills/LuxNext-f300.png (hero), Images/lux/LUX-UI_01.avif (2022) -->

Work / LUX

# When your skin flares, find what to **take away**

Role
    Product strategy, product design, design system, build

Timeline
    2022 first version · 2026 rebuild

Built with
    Next.js, directed with Claude Code

Status
    Concept · working prototype, not yet user-tested

**Not a medical tool.** LUX is a design concept. It doesn't diagnose skin conditions or tell you what caused a reaction. It suggests which product might be worth pausing first, based on what you tell it. For severe or persistent reactions, see a dermatologist.

[Try the prototype](https://iamlux.vercel.app) Skip to the solution

[IMAGE: A tilted wall of hundreds of skincare product tiles with the line 'Everyone tells you to add more.']

Overview

## What should a skin app do when your skin is already reacting?

Problem

A lot of the people searching for skincare answers already have a skin problem. And the industry's answer to almost every problem is another product. Search for something for acne and you get an overwhelming list of things to buy.

But most of these people already use several products. If their skin keeps reacting, something in that routine is worth looking at before anything new goes on.

Opportunity

Start with what's already on the shelf. Look back at what someone uses and when each product started, and help them find the one thing to pause.

  * **Fewer products** Ends in taking one thing away, not a shopping list.
  * **Reasoning you can see** Shows why a product is suspected, and the evidence against it.
  * **A way to check** Tracks your skin after the pause, so you can see what changed.



The gap

## Why existing beauty apps don't solve this

What exists| What it does well| What it misses  
---|---|---  
General AI chat| Answers almost any skin question. I use Gemini myself; it's free and pretty accurate.| Only knows what you think to tell it. Checking every product combination one by one is slow.  
Skin analysis apps| Read your skin from a photo and build a routine.| The output is a routine to follow, usually with new products in it.  
Ingredient scanners| Score or explain one product at a time.| Judge products alone, not your routine or your timeline.  
LUX| Looks at everything you already use, and since when.| Suggests one product to pause, then tracks what happens.  
  
How I got here

## Same name, different problem

2022

### An AI that answers everything

The first LUX, for a startup, was an AI that could answer any beauty or skin question. I designed the brand and the chat UI. Today any AI assistant does that for free.

[IMAGE: The first LUX concept: two phones showing a chat interface.]

2026

### An investigation that does one job

In 2026 I reframed it around a problem I had lived. I'd added several products at once, my skin got worse, and I couldn't tell which one to stop. My hunch: when skin flares, it may need a break from something, not one more thing.

[IMAGE: The 2026 LUX analysis screen.]

Solution

## Introducing LUX: light on what's already in your routine

_Lux_ is Latin for light. The app sheds light on the part you can't see: which of the products you already use might be worth pausing.

It works in four steps. It asks what you use and since when, checks those products against each other and against your skin type, suggests one to pause, and tracks what changes.

Use **less**. Find what to leave out.

Core flows

## Four steps from a flare-up to one thing to try

### 1Map what's happening

Pick a symptom and tap where it shows up on your face.

[IMAGE: Step 1: Redness selected and both cheeks highlighted on the face map.]

### 2Add what you use, and since when

Each product gets one question: how long have you used it? LUX sorts them into long-term, recent and new.

[IMAGE: Products in use: five products grouped as long-term, recent and new addition.]

### 3Analyse the routine

LUX checks ingredients across your products, your timeline and your skin profile, then points to a possible contributor with the reasoning shown.

[IMAGE: Analysis card: possible contributor Salicylic Acid (BHA), with the reasons it may be relevant expanded.]

### 4Pause one, track the change

A quick daily check-in shows whether your skin settles after the pause.

[IMAGE: Symptom trend card: from severe to mild over 14 days.]

Screens from the working prototype, filled with its demo profile.

Design decisions

## The analysis works by subtraction

Products you've used without trouble clear their ingredients. Whatever is left in your newer products is what's worth pausing.

Foaming cleanserLong-term, no problems

Clearedfragranceglycerin

Retinol serumRecent, no problems

Clearedalcohol denat.retinol

BHA exfoliantNew, started around the flare-up

fragrancealcohol denat.salicylic acidPause first

green cleared by products that were finestruck ruled outrose worth pausing first

[IMAGE: In the app: 'Ruled out by what you tolerate' lists alcohol denat. and fragrance, followed by a prompt to pause the BHA exfoliant for four weeks.]

The same reasoning in the app, ending in one suggested pause.

Design decisions

## Three calls that keep it honest

5 questions

### A guide instead of a chat

An open chat only knows what you think to tell it. LUX asks the few things the analysis needs, and nothing more.

0 scores

### No fake precision

There's no percentage. With rough dates and unknown concentrations, a number would look more certain than the answer is. When there isn't enough to go on, LUX says so.

12 → 1

### Fewer screens

Adding a product went from 12 screens to 1, and the result from 3 screens to 1. My note on the old version was "too much reading."

Limits

## What LUX doesn't do

  * It doesn't diagnose, and it never says a product caused a reaction. It uses words like "possible contributor" and "associated with."
  * It works from what you tell it. Ingredient lists don't show concentrations, so it can only narrow things down, not prove anything.
  * It doesn't recommend new products. The answer is always to pause something, not to buy something.
  * The analysis is rule-based by design, so the same inputs always give the same answer and every step can be explained.



Build

## How I built it

I designed LUX and built it in Next.js by directing Claude Code. I wrote the specs, the design-system rules and the motion guidelines, and reviewed every change. The design system lives in code, and the launch film was made in code from the same tokens.

37 components 31 written motion specs WCAG 2.1 AA audit, fixes in progress Film built in Remotion

Reflection

## What I learned

**The brief can be the problem.** The 2022 version answered every question well and still didn't help anyone with a flare-up. Changing the question did more than any redesign.

**Saying "I don't know yet" is part of the design.** For anything near health, showing the limits builds more trust than a confident score.

**Next:** test it with five people who've had a flare-up, and add AI where it helps, like reading messy product names and explaining results in plain words. The decision about what to pause stays rule-based.

LUX is a design concept, not medical advice. For anything persistent, see a dermatologist. [iamlux.vercel.app](https://iamlux.vercel.app)
