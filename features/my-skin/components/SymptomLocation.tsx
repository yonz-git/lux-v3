"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./SymptomLocation.module.css";
import { FaceDiagram, FACE_REGION_IDS, type SymptomPlaces } from "./FaceDiagram";
import { SYMPTOMS, type Symptom } from "@/features/my-skin/safety";
import { COPY } from "@/features/my-skin/profile";

/**
 * `Symptoms and location` — the read-only face diagram with a LIST of each
 * symptom and its places beside it, and the episode's start date under the
 * list. Drawn on `/progress` and on the profile recap
 * (`/investigation/profile`); it is the one place the location answer is
 * read back, so the two screens share it rather than each pairing the face
 * with its own copy of the `Other` line.
 *
 * ⚠️ NOT IN FIGMA — asked for directly 15 Sep 2026 ("make and design a system
 * to list the selected symptoms and area; on desktop move the diagram to left
 * and display the list on right … move the started date also in the Symptoms
 * and location box"). Before this the card held the face alone, centred, and
 * the pairing lived only in the diagram's callouts (a pill per symptom with a
 * line to each place). Callouts are a picture: they say WHICH cheek, but they
 * cross, they are 12px at best, and they are `aria-hidden`. The list says the
 * same answer in words — one row per symptom, its places under it as a set —
 * and it is the spoken answer now: `FaceDiagram`'s own hidden "Symptoms by
 * place" list is switched off here (`legendOutside`), or a screen reader would
 * hear the pairing twice.
 *
 * ⚠️ THE LIST IS WIRED TO THE DIAGRAM, BOTH WAYS. Pointing at a row lights that
 * symptom's pill and its lines on the face (`litSymptom`); pointing at a pill
 * or a place on the face lights the rows it pairs with (`onLit`). It is the
 * diagram's own reading aid (see HOVER in `FaceDiagram.tsx`), reached from the
 * words as well as from the picture. Nothing is selected or written.
 *
 * ⚠️ THE ROW IS THE PLACES AS A SET, NOT A SENTENCE. A multi-select is a set
 * (AGENTS.md): the places are a `<ul>` drawn inline with `·` between them, so
 * the count is announced and no comma sentence is written. They follow the
 * diagram's own order — the seven face regions top to bottom, then the chips
 * (`Whole face`, `Neck`, `Other`) — so the list reads the face the way it is
 * drawn.
 *
 * ⚠️ THE START DATE LIVES UNDER THE LIST, THE DAY COUNT DOES NOT. `Started
 * <date> · Day <n>` sat under the state pill in `SkinProfileTiles` until 15
 * Sep 2026; the date moved here (it is the age of the episode the list
 * describes) and the day count went to the calendar, where the days are
 * (`CheckInCalendar`'s `day` prop). The `Other` note — what the user typed
 * under step 1's diagram — is the second pair in the same block, because it
 * explains the `Other` chip the rows name.
 *
 * ⚠️ DIAGRAM LEFT, LIST RIGHT, AND THE FLEX BASES DECIDE WHEN — no media
 * query. The face keeps the 392 it is drawn at and never shrinks below 300
 * (the floor AGENTS.md records for its pills); the list wants 180. Where the
 * two fit side by side (PROGRESS's 592 column, the recap's full 776) they
 * are a row; where they do not (a phone, the recap's paired blocks) the list
 * drops under the face at full width, same rhythm.
 */
const CHIP_ORDER = ["Whole face", "Neck", "Other"];
const PLACE_ORDER = [...FACE_REGION_IDS, ...CHIP_ORDER];
const byPlace = (a: string, b: string) =>
  PLACE_ORDER.indexOf(a) - PLACE_ORDER.indexOf(b);

export function SymptomLocation({
  places,
  faceRegions,
  otherLocations,
  otherNote,
  started,
}: {
  /** each symptom and the places marked for it — step 1's own map */
  places: SymptomPlaces;
  /** the places that are pills on the face — lit on the diagram */
  faceRegions: string[];
  /** the rest (`Whole face`, `Neck`, `Other`) — chips under the diagram */
  otherLocations: string[];
  /** what the user typed for `Other`, or nothing */
  otherNote?: string | null;
  /** the episode's start date, written out — or nothing when unknown */
  started?: string | null;
}) {
  /* the row under the pointer (lights the face), and the symptoms the face is
     lighting (light the rows) — see the note above */
  const [litRow, setLitRow] = useState<Symptom | null>(null);
  const [litByFace, setLitByFace] = useState<readonly Symptom[]>([]);
  /* ⚠️ A TAP LIGHTS A ROW ON TOUCH — 16 Sep 2026, asked for directly, the same
     change as TAP in `FaceDiagram.tsx`. Touch ignores enter/leave (they fire
     on press and lift, so the row only flashed); a tap on a row lights it and
     its pairs on the face, a second tap or a tap anywhere else clears it, and
     a pill tapped on the face takes the light over. A mouse keeps hover. */
  const readoutRef = useRef<HTMLDivElement | null>(null);
  const touching = useRef(false);
  const onFaceLit = (symptoms: Symptom[]) => {
    setLitByFace(symptoms);
    if (symptoms.length > 0 && touching.current) setLitRow(null);
  };

  useEffect(() => {
    if (litRow === null) return;
    const clear = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      const target = e.target instanceof Element ? e.target : null;
      const onTarget =
        target?.closest("[data-tap-light]") &&
        readoutRef.current?.contains(target);
      if (!onTarget) setLitRow(null);
    };
    document.addEventListener("pointerdown", clear);
    return () => document.removeEventListener("pointerdown", clear);
  }, [litRow]);
  const rows = SYMPTOMS.flatMap((s) => {
    const p = places[s];
    return p && p.length > 0 ? [{ symptom: s, places: [...p].sort(byPlace) }] : [];
  });
  const focused = litRow !== null || litByFace.length > 0;
  const hasMeta = Boolean(started) || Boolean(otherNote);

  return (
    <div
      ref={readoutRef}
      className={styles.readout}
      onPointerDown={(e) => {
        touching.current = e.pointerType === "touch";
      }}
    >
      <div className={styles.face}>
        <FaceDiagram
          readOnly
          selected={faceRegions}
          otherLocations={otherLocations}
          callouts={places}
          litSymptom={litRow}
          onLit={onFaceLit}
          legendOutside
        />
      </div>

      <div className={styles.legend}>
        {rows.length > 0 ? (
          <ul
            className={styles.rows}
            aria-label={COPY.legendLabel}
            data-focus={focused || undefined}
          >
            {rows.map(({ symptom, places: p }) => (
              <li
                key={symptom}
                className={styles.row}
                data-lit={
                  litRow === symptom || litByFace.includes(symptom) || undefined
                }
                data-tap-light
                onPointerEnter={(e) => {
                  if (e.pointerType !== "touch") setLitRow(symptom);
                }}
                onPointerLeave={(e) => {
                  if (e.pointerType !== "touch") setLitRow(null);
                }}
                onClick={() => {
                  if (touching.current)
                    setLitRow((prev) => (prev === symptom ? null : symptom));
                }}
              >
                <span className={styles.mark} aria-hidden="true" />
                <span className={`${styles.name} t-label`}>{symptom}</span>
                <ul className={`${styles.places} t-label-sm`}>
                  {p.map((place) => (
                    <li key={place} className={styles.place}>
                      {place}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        ) : (
          <p className={`${styles.empty} t-body3`}>{COPY.legendEmpty}</p>
        )}

        {hasMeta && (
          <dl className={styles.meta}>
            {started && (
              <div className={styles.pair}>
                <dt className={`${styles.metaLabel} t-label-sm`}>
                  {COPY.startedLabel}
                </dt>
                <dd className={`${styles.metaValue} t-label`}>{started}</dd>
              </div>
            )}
            {otherNote && (
              <div className={styles.pair}>
                <dt className={`${styles.metaLabel} t-label-sm`}>
                  {COPY.locationOtherLabel}
                </dt>
                <dd className={`${styles.metaValue} t-label`}>{otherNote}</dd>
              </div>
            )}
          </dl>
        )}
      </div>
    </div>
  );
}
