/**
 * The conversation — data and derived values for `chat-page / mobile` (270:96).
 *
 * The frame draws a two-turn exchange under a `Today` divider. Those two turns
 * are seeded here rather than written into the screen, for the same reason
 * every other section keeps its data in `features/<section>/*.ts`: the screen
 * states nothing it could read from this file.
 *
 * ⚠️ THE SEEDED TIMESTAMPS ARE THE COMP'S, VERBATIM, and they are strings
 * rather than `Date`s on purpose. 10:32 / 10:34 are the two times the frame
 * prints; deriving them from a clock would make the screen render differently
 * on every load and, worse, differently on the server and the client. A message
 * the USER sends is stamped from the real clock — that only ever happens after
 * an interaction, so it cannot reach the prerender.
 */

export type ChatAuthor = "ai" | "user";

export type ChatMessage = {
  id: string;
  from: ChatAuthor;
  text: string;
  /** already formatted for display — see the note above */
  at: string;
};

/**
 * The exchange the frame draws.
 *
 * ⚠️ THIS IS THE ONLY LUX COPY ON THE SCREEN, AND NOTHING GENERATES MORE. The
 * screen does not answer a message the user sends. What LUX may say about skin
 * is governed by the controlled vocabulary in `docs/product-brief.md`, and
 * inventing a reply here to make the prototype feel alive would put unreviewed
 * clinical-sounding copy in front of a user. The frame shows one question; that
 * is what ships until the analysis this screen fronts actually exists.
 */
export const SEEDED_CONVERSATION: ChatMessage[] = [
  {
    id: "seed-lux-1",
    from: "ai",
    text: "How does your skin feel today?",
    at: "10:32 AM",
  },
  {
    id: "seed-user-1",
    from: "user",
    text: "it is much better than yesterday! no itchiness.",
    at: "10:34 AM",
  },
];

/** The divider that heads the day's messages. */
export const DAY_LABEL = "Today";

/**
 * `10:34 AM` — the shape the frame prints, from the viewer's own locale.
 *
 * ⚠️ NOT IN `lib/date.ts`, THOUGH THAT IS THE SHARED DATE MODULE. Nothing else
 * in the app prints a clock time: PROGRESS works in whole days and formats them
 * with `formatLong` / `formatDay`. A helper used by exactly one section belongs
 * to that section — move it down when a second caller appears.
 */
export function clockTime(at: Date): string {
  return at.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}
