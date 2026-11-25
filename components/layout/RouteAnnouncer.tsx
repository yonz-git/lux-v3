"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { titleFor } from "@/lib/pageTitles";

/** What a client-side navigation owes a keyboard or screen-reader user. */
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
