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
  const [litRow, setLitRow] = useState<Symptom | null>(null);
  const [litByFace, setLitByFace] = useState<readonly Symptom[]>([]);
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
