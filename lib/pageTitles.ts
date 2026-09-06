/**
 * One title per route.
 *
 * ⚠️ EVERY ROUTE IN THE APP USED TO BE TITLED `LUX`. `app/layout.tsx` set the
 * document title once and no page overrode it, so all seventeen routes shipped
 * the same `<title>` — a WCAG 2.4.2 (Page Titled, level A) failure, since a
 * title has to describe the page's topic or purpose. It also cost more than the
 * tab label: a title is the first thing a screen reader reads on load, the text
 * that names a bookmark or a history entry, and — see `RouteAnnouncer` — the
 * only sentence available to announce a client-side navigation.
 *
 * The titles live HERE rather than inline in each `page.tsx` because two
 * different things need them: the server metadata export that renders the
 * `<title>` tag, and the client announcer that reads a route change aloud.
 * Splitting them would let the two drift, and a route announced as one screen
 * while its tab says another is worse than the single "LUX" was.
 *
 * ⚠️ THE FIVE FLOW STEPS DO NOT APPEAR BELOW. They take their title from
 * `lib/flow.ts`, which already owns every step's heading — the same string the
 * screen renders as its `<h1>`. `lib/flow.ts` is the authority on a step's
 * name; repeating it here would be a second place for it to live.
 */
import { STEPS } from "@/features/my-skin/flow";

export const APP_NAME = "LUX";

/* ⚠️ THE TWO PROTOTYPE-ONLY ROUTES NAME THEIR STATE. `/progress/empty` and
   `/check/no-profile` are the empty-state twins of `/progress` and `/check`,
   and giving each pair one title would put two different screens under one
   name — which is the failure this file exists to fix, only smaller. The state
   is the whole reason the route exists, so it is what the title says. */
const HUB_TITLES: Record<string, string> = {
  "/": "Welcome",
  "/products": "My products",
  "/progress": "Progress",
  "/progress/empty": "Progress — no check-ins yet",
  "/progress/check-in": "Daily check-in",
  "/check": "Analysis",
  "/check/no-profile": "Analysis — no skin profile",
  "/check/new": "Add products",
  "/check/analyzing": "Analysing your products",
  "/check/results": "Analysis results",
  "/check/history": "Previous analyses",
  /* ⚠️ UNDER `/investigation`, AND NOT A FLOW STEP — so it belongs here rather
     than coming from `flow.ts`. The five steps COLLECT; this reports on what
     they collected, and carries no progress track and no `Save & exit`. See
     `features/my-skin/analysis.ts`.

     ⚠️ IT WAS THREE ROUTES — `evidence`, `analyzing`, `findings` — and three
     screens for one question read as three more steps. One route now, with the
     wait as its first state. */
  "/investigation/analysis": "Analysis",
  /* ⚠️ `/chat` USED TO BE HERE AND THE ROUTE IS GONE — 7 Sep 2026. It was the
     standalone conversation panel (270:96), prototype-only and in no nav
     section; `app/chat/page.tsx` was deleted, so a title for it would name a
     pathname that 404s. `features/chat/` went the same day, so there is no
     screen left for it to title either.
     ⚠️ If the route ever comes back it needs its entry back with it — an
     untitled route is the WCAG 2.4.2 failure this file exists to fix, and
     "prototype" is not an exemption from it. */
};

/**
 * The title for a pathname, or `null` if nothing matches — an unrouted path is
 * Next's own 404, which carries its own title.
 */
export function titleFor(pathname: string): string | null {
  const step = STEPS.find((s) => s.href === pathname);
  if (step) return step.title;
  if (CHECK_IN_DETAIL.test(pathname)) return "Check-in record";
  return HUB_TITLES[pathname] ?? null;
}

/**
 * `/progress/check-in/2026-08-05` — the app's one dynamic route, and the one
 * pathname this file cannot hold a key for.
 *
 * ⚠️ THE DATE IS NOT IN THE TITLE, though the screen's own `<h1>` is the date.
 * A title names the KIND of page — every other entry here does — and a tab
 * reading "August 5, 2026" says nothing about which app it belongs to or what
 * is being shown about that day. The date is on screen, and `RouteAnnouncer`
 * moves focus into the heading's screen, so it is read straight after.
 */
const CHECK_IN_DETAIL = /^\/progress\/check-in\/[^/]+$/;

/**
 * The same title with the product name on it, for a page's `metadata` export.
 *
 * ⚠️ IT IS NOT A `title.template` ON THE ROOT LAYOUT, THOUGH THAT IS THE
 * OBVIOUS SHAPE. A template applies to a layout's CHILD segments, and
 * `app/page.tsx` is part of the root layout's own segment rather than a child
 * of it — so `/` alone came out titled "Welcome" while every other route got
 * "… · LUX". One route silently exempt from the naming rule is exactly the kind
 * of drift a shared helper exists to prevent, so the suffix is applied here,
 * where every route goes through it.
 *
 * The ANNOUNCED string stays bare — `RouteAnnouncer` reads `titleFor`, because
 * repeating the product name on every navigation is noise a screen-reader user
 * has to sit through each time.
 */
export function metadataTitleFor(pathname: string): string {
  const title = titleFor(pathname);
  return title ? `${title} · ${APP_NAME}` : APP_NAME;
}
