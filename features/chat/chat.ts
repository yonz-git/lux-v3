/**
 * The conversation — data and derived values for `chat-page / mobile` (270:96).
 *
 * The frame draws a two-turn exchange under a `Today` divider. Those two turns
 * are seeded here rather than written into the screen, for the same reason
 * every other section keeps its data in `features/<section>/*.ts`: the screen
 * states nothing it could read from this file.
 *
 * ⚠️ THERE ARE NO TIMESTAMPS, THOUGH THE FRAME DRAWS THEM — removed on
 * request. `ChatMessage` carried an `at` string (the comp's own 10:32 / 10:34,
 * kept as strings so a clock could not make the server and the client disagree)
 * and `clockTime` stamped a sent message from the real one. Both are gone
 * rather than left unread: a field nothing renders is a claim the data makes
 * and the screen does not honour.
 *
 * ⚠️ `DAY_LABEL` HAS GONE THE SAME WAY, with the `Today` divider it headed, so
 * this module now states no time at all — not the minute and not the day. That
 * is honest for two seeded turns and would not be for a conversation with
 * history; see the note on ChatScreen.tsx. If times come back, they come back
 * here first.
 */

export type ChatAuthor = "ai" | "user";

export type ChatMessage = {
  id: string;
  from: ChatAuthor;
  text: string;
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
  { id: "seed-lux-1", from: "ai", text: "How does your skin feel today?" },
  {
    id: "seed-user-1",
    from: "user",
    text: "it is much better than yesterday! no itchiness.",
  },
];
