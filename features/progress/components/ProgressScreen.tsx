"use client";

import { useState } from "react";
import styles from "./ProgressScreen.module.css";
import { HubScreen } from "@/components/layout/HubScreen";
import { EmptyState } from "@/components/ui/EmptyState";
import { Orb } from "@/components/ui/Orb";
import { Button } from "@/components/ui/Button";
import { DataCard } from "@/components/ui/DataCard";
import { SymptomLocation } from "@/features/my-skin/components/SymptomLocation";
import { LocationEditor } from "@/features/my-skin/components/LocationEditor";
import { EditToggle } from "@/components/ui/EditToggle";
import { Collapse } from "@/components/ui/Collapse";
import { COPY } from "@/features/my-skin/profile";
import { SkinProfileTiles } from "@/features/check/components/SkinProfileTiles";
import { InvestigationRecord } from "./InvestigationRecord";
import { CheckInCalendar } from "./CheckInCalendar";
import { SymptomTrend } from "./SymptomTrend";
import { CheckInOverlay } from "./CheckInOverlay";
import { PhotoGallery, ProgressGallery } from "./PhotoGallery";
import { useInvestigation } from "@/lib/store/InvestigationProvider";
import { useToday } from "@/lib/useToday";
import { formatLong } from "@/lib/date";
import { ownedProducts } from "@/features/products/library";
import {
  checkInsFor,
  hasInvestigation,
  dayNumber,
  faceLocations,
  lastCheckInLabel,
  photoDiary,
  progressView,
  symptomPlaces,
} from "@/features/progress/progress";

/**
 * PROGRESS — the nav's first section, at `/myskin`. ONE screen in two states:
 *   empty  Figma mobile 551:1196, desktop 551:1231
 *   active Figma mobile 552:1236, desktop 554:1252
 * documented by `HANDOFF — INVESTIGATION & PROGRESS` (559:1376).
 */
export function ProgressScreen({ now }: { now: number }) {
  const { answers } = useInvestigation();
  const [checkingIn, setCheckingIn] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [editLocation, setEditLocation] = useState(false);
  const view = progressView(answers, useToday(now));
  const { start, today, skinType, tendencies, conditions, status } = view;
  const checkIns = checkInsFor(answers, view);
  const lastCheckIn = lastCheckInLabel(checkIns, today);
  const places = symptomPlaces(answers);
  const face = faceLocations(places);
  const otherNote = answers.locationOther?.trim() || null;
  const photos = photoDiary(checkIns);

  /* nothing to read until step 4 is answered — the empty hub says so */
  if (!hasInvestigation(answers)) return <ProgressEmpty />;

  return (
    <HubScreen
      leading={<Orb size="40px" animateIn halo />}
      title="Welcome back"
      subtitle="Here is all that we know about your skin."
      headingAlign="start"
      nav="my-skin"
      layout="grid"
      gridColumns="minmax(0, 640fr) minmax(0, 616fr)"
      tightTop
    >
      <div className={styles.profileColumn} data-reveal data-reveal-stagger>
        <SkinProfileTiles
          skinType={skinType}
          tendencies={tendencies}
          conditions={conditions}
          symptomsState={status}
        />

        <DataCard
          className={`${styles.faceCard} canvas-card`}
          aria-labelledby="progress-face"
        >
          <div className={styles.faceHead}>
            <h2 id="progress-face" className={`${styles.faceLabel} t-overline`}>
              {COPY.locationLabel}
            </h2>
            <EditToggle
              editing={editLocation}
              subject="symptoms and location"
              onClick={() => setEditLocation((v) => !v)}
            />
          </div>
          <Collapse smooth open={!editLocation}>
            <SymptomLocation
              places={places}
              faceRegions={face.faceRegions}
              otherLocations={face.otherLocations}
              otherNote={otherNote}
              started={formatLong(start)}
            />
          </Collapse>
          <Collapse smooth open={editLocation}>
            <LocationEditor idPrefix="progress" />
          </Collapse>
        </DataCard>

        {/* desktop's copy: col-1, under the face */}
        <ProgressGallery
          className={`${styles.galleryDesktop} canvas-card`}
          photos={photos}
          onOpen={() => setGalleryOpen(true)}
        />
      </div>

      <div className={styles.checkInColumn} data-reveal data-reveal-stagger>
        <SymptomTrend
          className={styles.trend}
          checkIns={checkIns}
          today={today}
          products={ownedProducts(answers)}
          day={dayNumber(start, today)}
        />

        {/* § 09 — only when the user actually saved a finding. */}
        {answers.savedFinding && (
          <InvestigationRecord
            className={styles.record}
            finding={answers.savedFinding}
          />
        )}

        {/* mobile's copy: under the trend, above the calendar */}
        <ProgressGallery
          className={`${styles.galleryMobile} canvas-card`}
          photos={photos}
          onOpen={() => setGalleryOpen(true)}
        />

        <CheckInCalendar
          className={styles.calendar}
          checkIns={checkIns}
          today={today}
        />

        <Button width="action" className={styles.ctaDesktop} onClick={() => setCheckingIn(true)}>
          Check in today
        </Button>

        {lastCheckIn && (
          <p className={`${styles.lastCheckInDesktop} t-caption`}>
            {lastCheckIn}
          </p>
        )}
      </div>

      <Button width="action" className={styles.cta} onClick={() => setCheckingIn(true)}>
        Check in today
      </Button>

      {lastCheckIn && (
        <p className={`${styles.lastCheckIn} t-caption`}>{lastCheckIn}</p>
      )}

      <CheckInOverlay
        open={checkingIn}
        now={now}
        onClose={() => setCheckingIn(false)}
      />

      <PhotoGallery
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        photos={photos}
        start={start}
      />
    </HubScreen>
  );
}

/* the empty hub's heading */
const HUB_TITLE = "Progress";

/**
 * `Progress — empty`, at `/myskin/empty`. The orb hero, the same block
 * `My Products — empty` uses and the one the CHECK empty states follow.
 */
export function ProgressEmpty() {
  return (
    <HubScreen
      title={HUB_TITLE}
      titleHidden
      nav="my-skin"
      layout="plain"
      center="empty"
    >
      <EmptyState
        title="No active investigation"
        action={{ label: "Create skin profile", href: "/investigation/start" }}
      >
        Start an investigation to track your skin&rsquo;s progress over time.
      </EmptyState>
    </HubScreen>
  );
}
