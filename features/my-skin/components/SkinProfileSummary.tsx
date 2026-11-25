"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sheet } from "@/components/ui/Sheet";
import styles from "./SkinProfileSummary.module.css";
import { HubScreen } from "@/components/layout/HubScreen";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { SmallButton } from "@/components/ui/SmallButton";
import { CoachBubble } from "@/components/ui/CoachBubble";
import { EditToggle } from "@/components/ui/EditToggle";
import { SymptomLocation } from "./SymptomLocation";
import { LocationEditor } from "./LocationEditor";
import { ProfileEditor } from "./ProfileEditor";
import { Collapse } from "@/components/ui/Collapse";
import { SelfieSheet } from "./SelfieSheet";
import { CheckInPhotoArt } from "@/features/progress/components/CheckInPhotoArt";
import { SkinProfileTiles } from "@/features/check/components/SkinProfileTiles";
import { useInvestigation } from "@/lib/store/InvestigationProvider";
import { useToday } from "@/lib/useToday";
import { COPY, isEmpty, recap } from "@/features/my-skin/profile";

/**
 * `/investigation/profile` — the skin profile recap, between step 4 (Timing)
 * and step 5 (Your products).
 */
export function SkinProfileSummary({ now }: { now: number }) {
  const { answers, reset } = useInvestigation();
  const router = useRouter();
  const [confirmReset, setConfirmReset] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  const [editLocation, setEditLocation] = useState(false);
  const [locationOpened, setLocationOpened] = useState(false);
  const profile = recap(answers, useToday(now));

  if (isEmpty(profile)) {
    return (
      <HubScreen
        title={COPY.headlineLabel}
        nav="my-skin"
        backHref="/investigation/timing"
        layout="plain"
        center="empty"
      >
        <EmptyState
          title={COPY.emptyTitle}
          action={{ label: COPY.emptyCta, href: "/investigation/start" }}
        >
          {COPY.emptyBody}
        </EmptyState>
      </HubScreen>
    );
  }

  const timeline = profile.timeline;
  const hasLocation =
    profile.faceRegions.length > 0 ||
    profile.otherLocations.length > 0 ||
    Boolean(profile.locationNote);
  const showLocation = hasLocation || locationOpened;
  const hasEpisode = showLocation || Boolean(profile.photo);

  return (
    <HubScreen
      nav="my-skin"
      backHref="/investigation/timing"
      layout="card"
      tightTop
    >
      {/* no visible title: the cards name themselves */}
      <h1 className="visually-hidden">{COPY.headlineLabel}</h1>
      <div className={styles.headline}>
        <Collapse smooth open={!editProfile}>
          <SkinProfileTiles
            skinType={profile.skinType}
            tendencies={profile.tendencies}
            conditions={profile.conditions}
            symptomsState={timeline?.status}
            action={
              <EditToggle
                editing={false}
                subject="skin profile"
                onClick={() => setEditProfile(true)}
              />
            }
          />
        </Collapse>
        <Collapse smooth open={editProfile}>
          <Block
            label="Skin profile"
            id="profile-edit"
            action={
              <EditToggle
                editing
                subject="skin profile"
                onClick={() => setEditProfile(false)}
              />
            }
          >
            <ProfileEditor />
          </Block>
        </Collapse>
      </div>

      {hasEpisode && (
        <div className={styles.blocks}>
          {(showLocation || profile.photo) && (
            <div
              className={styles.pictures}
              data-pair={(showLocation && profile.photo) || undefined}
            >
              {showLocation && (
                <Block
                  label={COPY.locationLabel}
                  id="profile-location"
                  action={
                    <EditToggle
                      editing={editLocation}
                      subject="symptoms and location"
                      onClick={() => {
                        setLocationOpened(true);
                        setEditLocation((v) => !v);
                      }}
                    />
                  }
                >
                  <Collapse smooth open={!editLocation}>
                  <SymptomLocation
                      places={profile.places}
                      faceRegions={profile.faceRegions}
                      otherLocations={profile.otherLocations}
                      otherNote={profile.locationNote}
                      started={
                        timeline && timeline.dayNumber !== null
                          ? timeline.started
                          : null
                      }
                    />
                  </Collapse>
                  <Collapse smooth open={editLocation}>
                    <LocationEditor idPrefix="profile" />
                  </Collapse>
                </Block>
              )}

              {profile.photo && (
                <Block label={COPY.photoLabel} id="profile-photo">
                  <figure className={styles.photo}>
                    <div className={styles.photoWell}>
                      <CheckInPhotoArt
                        seed={profile.photo}
                        className={styles.photoArt}
                      />
                    </div>
                    <figcaption className="visually-hidden">
                      {COPY.photoCaption}
                    </figcaption>
                  </figure>
                  <SmallButton
                    label={COPY.photoUpdate}
                    className={styles.photoAction}
                    onClick={() => setPhotoOpen(true)}
                  />
                </Block>
              )}
            </div>
          )}
        </div>
      )}

      <SelfieSheet open={photoOpen} onClose={() => setPhotoOpen(false)} />

      <div className={styles.actions}>
        <CoachBubble>{COPY.ctaHelp}</CoachBubble>
        <div className={styles.cta}>
          <Button href="/products" width="action">
            {COPY.cta}
          </Button>
        </div>
      </div>

      <div className={styles.startOver}>
        <SmallButton
          label={COPY.startOver}
          arrow={false}
          onClick={() => setConfirmReset(true)}
        />
      </div>

      <Sheet
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title={COPY.startOverTitle}
        dismissLabel="Cancel"
      >
        <h2 className={`${styles.confirmTitle} t-h4`}>{COPY.startOverTitle}</h2>
        <p className={`${styles.confirmBody} t-body2`}>{COPY.startOverBody}</p>
        <Button
          width="action"
          onClick={() => {
            reset();
            router.push("/investigation/start");
          }}
        >
          {COPY.startOverConfirm}
        </Button>
      </Sheet>
    </HubScreen>
  );
}

function Block({
  label,
  id,
  action,
  children,
}: {
  label: string;
  id: string;
  /** the section's `Edit` / `Save` (`EditToggle`), at the overline's end */
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className={`${styles.block} canvas-card`} aria-labelledby={id}>
      <div className={styles.blockHead}>
        <h2 id={id} className={`${styles.blockLabel} t-overline`}>
          {label}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

