"use client";

import { useState } from "react";
import styles from "./ScanProduct.module.css";
import { QuestionScreen } from "./QuestionScreen";
import { useInvestigation } from "./InvestigationProvider";
import { productById, SCAN_MATCH } from "@/lib/products";

/**
 * 04 — Scan product. Figma mobile 577:1498, desktop 582:1819. Step 8/8.
 *
 * ⚠️ THE VIEWFINDER IS A PLACEHOLDER, NOT A CAMERA — the same call the selfie
 * capture makes. Wiring `getUserMedia` would make the prototype demand a camera
 * permission just to walk the flow. Tapping the shutter records THAT a capture
 * happened, which unlocks Continue.
 *
 * The shutter also drafts the product the scan "recognises", so
 * `04 — Product match` has something to show. The 92% is the comp's own number.
 *
 * ⚠️ THE VIEWFINDER IS SAGE on an otherwise light screen — `surface/data` +
 * `surface/frosted-data`, because it stands in for a camera feed. That is the
 * one place surface system B appears in PRODUCTS outside the method sheet.
 *
 * The label guide is a DASHED rectangle, unlike the selfie's solid oval: a
 * product label is a rectangle, and the dashes read as "line this up" rather
 * than as a frame. It is the only dashed stroke in LUX.
 */
export function ScanProduct() {
  const { answers, setAnswer } = useInvestigation();
  const captured = Boolean(answers.scan);
  /* ⚠️ NO SCREEN IS DRAWN FOR THE INGREDIENT LIST. The comp offers the
     alternative in a link but the flow has only one capture screen — it is the
     same viewfinder pointed at a different part of the bottle. So this switches
     what the screen ASKS for rather than routing somewhere that does not exist.
     Flagged rather than invented. */
  const [subject, setSubject] = useState<"front" | "ingredients">("front");

  function capture() {
    if (captured) {
      setAnswer("scan", undefined);
      return;
    }
    setAnswer("scan", "captured");
    const product = productById(SCAN_MATCH.productId);
    if (product) {
      setAnswer("productDraft", {
        product,
        bucket: "long-term",
        matchScore: SCAN_MATCH.score,
      });
    }
  }

  return (
    <QuestionScreen id="products-scan" continueWidth="full" contentGap={24}>
      <h1 className="t-h3-h2">Scan product</h1>

      <div className={styles.viewfinder} data-captured={captured}>
        <span className={styles.guide} aria-hidden="true" />
        {captured && (
          <p className={`${styles.captured} reveal-quick t-label`}>Photo captured</p>
        )}
      </div>

      <div className={styles.copy}>
        <p className="t-h6">
          {subject === "front"
            ? "Take a photo of the front of the product."
            : "Take a photo of the ingredient list."}
        </p>
        <p className={`${styles.helper} t-body3`}>
          {captured
            ? "Tap the shutter again to retake."
            : subject === "front"
              ? "Make sure the product name and brand are visible."
              : "Make sure the whole list is in frame and in focus."}
        </p>
      </div>

      <div className={styles.shutterRow}>
        <button
          type="button"
          className={styles.shutter}
          aria-label={captured ? "Retake photo" : "Capture photo"}
          onClick={capture}
        >
          <span className={styles.shutterCore} aria-hidden="true" />
        </button>
      </div>

      <button
        type="button"
        className={`${styles.alt} t-label`}
        onClick={() => setSubject(subject === "front" ? "ingredients" : "front")}
      >
        {subject === "front"
          ? "Take photo of ingredient list instead"
          : "Take photo of the front instead"}
      </button>
    </QuestionScreen>
  );
}
