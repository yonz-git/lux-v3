"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { titleFor } from "@/lib/pageTitles";

/**
 * What a client-side navigation owes a keyboard or screen-reader user.
 *
 * ⚠️ A ROUTE CHANGE IN THIS APP WAS COMPLETELY SILENT, AND IT DROPPED FOCUS.
 * Measured: tabbing to `Create skin profile` on `/` and activating it landed on
 * `/investigation/start` with `document.activeElement` back at `<body>` and the
 * document title unchanged. Nothing was announced, and the next Tab restarted
 * from the top of the document — so a keyboard user walking the five-step flow
 * re-tabbed past the header, the progress track and every option row again
 * after each Continue. The App Router ships no route announcer of its own (the
 * one people remember is the Pages Router's), so this is the app's job.
 *
 * Two halves, both only on a CHANGE of pathname — never on first load, where
 * the browser already starts the user at the top of a freshly-read document:
 *
 *   1. the new page's title goes into a live region, so the navigation is
 *      spoken (WCAG 4.1.3)
 *   2. focus moves to the new screen's `<main>`, so the next Tab continues from
 *      the top of what just replaced the page rather than from wherever the old
 *      screen's DOM used to be (WCAG 2.4.3)
 *
 * ⚠️ THE TITLE COMES FROM `titleFor`, NOT FROM `document.title`. Next writes the
 * `<title>` tag from the page's metadata export at its own moment in the commit,
 * so reading `document.title` here is a race that resolves, when it loses, to
 * the PREVIOUS screen's name — announcing the page the user just left. Both the
 * tag and this sentence come from the same `lib/pageTitles.ts` entry instead.
 *
 * ⚠️ IT RENDERS NOTHING VISIBLE and takes no layout — the live region is
 * `visually-hidden`, the same utility every other off-screen string in the app
 * uses. Mounted once in the root layout, above the screens.
 */
export function RouteAnnouncer() {
  const pathname = usePathname();
  const [message, setMessage] = useState("");
  // the first pathname is the page the user loaded, not a navigation
  const previous = useRef<string | null>(null);

  useEffect(() => {
    if (previous.current === null) {
      previous.current = pathname;
      return;
    }
    if (previous.current === pathname) return;
    previous.current = pathname;

    /* ⚠️ THE `<h1>` IS THE FALLBACK, AND IT IS NOT DECORATION. `titleFor`
       returns null for anything not in `lib/pageTitles.ts` — a dynamic segment
       cannot have a static entry there, and a brand-new route will not have one
       yet. Announcing "" in that case is silence, which is the exact bug this
       component exists to fix, only quieter and harder to notice. Every screen
       in the app renders exactly one `<h1>` (`QuestionScreen` and `HubScreen`
       both guarantee it, visually hidden where the design shows no title), so
       reading it is a reliable last resort. A route that wants a better
       sentence than its heading should add itself to `pageTitles.ts`. */
    const title =
      titleFor(pathname) ??
      document.querySelector("h1")?.textContent?.trim() ??
      "";
    setMessage(title);

    /* `main` is rendered by the screen itself (`QuestionScreen`, `HubScreen`),
       so it is queried rather than passed a ref — the announcer sits above them
       all in the tree and has no handle on whichever one is mounted. The
       tabindex is set here rather than on every screen for the same reason: a
       new screen cannot forget it. */
    const main = document.querySelector("main");
    if (main) {
      main.setAttribute("tabindex", "-1");
      main.focus({ preventScroll: true });
    }
  }, [pathname]);

  return (
    <p className="visually-hidden" aria-live="assertive" role="status">
      {message}
    </p>
  );
}
