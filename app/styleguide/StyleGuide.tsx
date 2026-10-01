"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { SmallButton } from "@/components/ui/SmallButton";
import { Chip } from "@/components/ui/Chip";
import { OptionRow } from "@/components/ui/OptionRow";
import { Tag } from "@/components/ui/Tag";
import { TextField } from "@/components/ui/TextField";
import { DateField } from "@/components/ui/DateField";
import { SearchField } from "@/components/ui/SearchField";
import { ChatBubble } from "@/components/ui/ChatBubble";
import { DataCard } from "@/components/ui/DataCard";
import { Sheet } from "@/components/ui/Sheet";
import { Orb } from "@/components/ui/Orb";
import { IconButton } from "@/components/ui/IconButton";
import * as Icons from "@/components/ui/icons";
import type { IsoDate } from "@/lib/date";
import { SKIN_TREND_CHOICES } from "@/features/progress/progress";
import styles from "./StyleGuide.module.css";

/**
 * `/styleguide` — the design system rendered live, from the real tokens and
 * the real components. It is what Figma was for until 1 Oct 2026: the place
 * to SEE the system before changing it. Nothing here is a copy — the swatches
 * are read from the stylesheets at runtime, and every component is the one the
 * screens import — so it cannot drift from what ships.
 *
 * ⚠️ It lives beside its route rather than in `features/` because it belongs
 * to no nav section and no screen imports it.
 */

/** every custom property declared on `:root`, in source order, deduplicated */
function useRootTokens(prefix: string) {
  const [names, setNames] = useState<string[]>([]);
  useEffect(() => {
    const found = new Set<string>();
    const walk = (rules: CSSRuleList) => {
      for (const rule of Array.from(rules)) {
        if (rule instanceof CSSStyleRule && rule.selectorText === ":root") {
          for (const prop of Array.from(rule.style)) {
            if (prop.startsWith(prefix)) found.add(prop);
          }
        } else if ("cssRules" in rule) {
          walk((rule as CSSGroupingRule).cssRules);
        }
      }
    };
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        walk(sheet.cssRules);
      } catch {
        /* a cross-origin sheet (the font) cannot be read, and has no tokens */
      }
    }
    setNames([...found]);
  }, [prefix]);
  return names;
}

function value(name: string) {
  return typeof window === "undefined"
    ? ""
    : getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.section} aria-labelledby={title}>
      <h2 id={title} className="t-h5">
        {title}
      </h2>
      {children}
    </section>
  );
}

const TYPE: [string, string][] = [
  ["t-headline", "headline · 36/44 Light"],
  ["t-brand", "wordmark · 20/24 Bold"],
  ["t-h2", "28/34 Regular"],
  ["t-h4-h3", "page title · 22/28 Regular"],
  ["t-h5", "panel label · 18/22 Regular"],
  ["t-h6", "16/20 Medium"],
  ["t-body1", "18/24 Regular"],
  ["t-body2", "body · 16/22 Regular"],
  ["t-kicker", "kicker · 16/20 Regular"],
  ["t-chip", "chip · 16/20 Regular"],
  ["t-body3", "14/20 Regular"],
  ["t-label", "tab · 14/20 Medium"],
  ["t-button", "button · 15/20 Medium"],
  ["t-label-sm", "12/16 Medium"],
  ["t-caption", "12/16 Regular"],
  ["t-overline", "12/16 SemiBold, tracked"],
  ["t-metric1", "metric · 56/60 Light"],
];

const GRADIENTS = [
  ["--gradient-canvas-mobile", "canvas — the ground, mobile"],
  ["--gradient-canvas-desktop", "canvas — the ground, desktop"],
  ["--gradient-brand", "brand — the primary action"],
  ["--surface-sheet", "sheet — the tray's sage frost"],
];


export function StyleGuide() {
  const colours = useRootTokens("--color-");
  const spaces = useRootTokens("--space-");
  const radii = useRootTokens("--radius-");
  const [chips, setChips] = useState<string[]>(["Redness"]);
  const [trend, setTrend] = useState("Slightly better");
  const [radio, setRadio] = useState("Combination");
  const [date, setDate] = useState<IsoDate | undefined>();
  const [query, setQuery] = useState("");
  const [sheet, setSheet] = useState(false);

  const semantic = colours.filter((c) => !/-(indigo|sage|blue|neutral|rose|mint|teal)-\d/.test(c));
  const primitives = colours.filter((c) => !semantic.includes(c));

  return (
    <main className={styles.page}>
      <h1 className="t-h4-h3">Style guide</h1>
      <p className="t-body3">
        Every token and component, rendered from the live stylesheets. Change
        the system in <code>app/tokens.css</code> and <code>app/globals.css</code>;
        this page follows.
      </p>

      <Section title="Type">
        <div className={styles.hero}>
          <p className="t-kicker">Welcome to</p>
          <h3 className="t-headline">
            Your skin,
            <br />
            <b>one day</b> at a time
          </h3>
        </div>
        <ul className={styles.type}>
          {TYPE.map(([c, note]) => (
            <li key={c}>
              <span className={`${styles.meta} t-caption`}>
                {c}
                <br />
                {note}
              </span>
              <span className={c}>Skin changes, one day at a time</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Gradients">
        <ul className={styles.gradients}>
          {GRADIENTS.map(([g, note]) => (
            <li key={g}>
              <span className={styles.gradient} style={{ background: `var(${g})` }} />
              <span className="t-caption">{g}</span>
              <span className={`${styles.meta} t-caption`}>{note}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Boxes — sheet and panel">
        <div className={styles.boxes}>
          <div className={`vg-sheet ${styles.sheetDemo}`}>
            <div className={styles.sheetHead}>
              <h3 className={`t-h4-h3 ${styles.sheetTitle}`}>
                {/* the chat panel's own orb — ChatPanel's header, 50px with the halo */}
                <Orb size="50px" animateIn halo />
                Check in
              </h3>
              <IconButton label="Close">
                <Icons.CloseIcon />
              </IconButton>
            </div>
            <div className={`vg-panel ${styles.panelDemo}`}>
              <p className={`t-h5 ${styles.panelLabel}`}>
                <Icons.SparkleIcon />
                Daily check-in
              </p>
              <p className="t-body2">How is your skin doing today?</p>
              <div
                className={styles.chipRow}
                role="radiogroup"
                aria-label="How is your skin doing today?"
              >
                {SKIN_TREND_CHOICES.map(({ label }) => (
                  <Chip
                    key={label}
                    label={label}
                    control="radio"
                    selected={trend === label}
                    onToggle={() => setTrend(label)}
                  />
                ))}
              </div>
              <div className={styles.fabRow}>
                <IconButton label="Add a note">
                  <Icons.NoteIcon />
                </IconButton>
                <IconButton label="Take a photo">
                  <Icons.CameraIcon />
                </IconButton>
                <IconButton label="Save check-in" variant="primary">
                  <Icons.ArrowRightIcon />
                </IconButton>
              </div>
            </div>
          </div>
          <div className={styles.boxStack}>
            <DataCard>
              <p className="t-overline">Day 18 · Redness</p>
              <p className="t-metric1">3</p>
              <p className="t-body3">Down from 5 a week ago.</p>
            </DataCard>
          </div>
        </div>
      </Section>

      <Section title="Round buttons">
        <div className={styles.row}>
          <IconButton label="Back" variant="outline">
            <Icons.ArrowLeftIcon />
          </IconButton>
          <IconButton label="Add">
            <Icons.PlusIcon />
          </IconButton>
          <IconButton label="Take a photo">
            <Icons.CameraIcon />
          </IconButton>
          <IconButton label="Continue" variant="primary">
            <Icons.ArrowRightIcon />
          </IconButton>
          <IconButton label="Close">
            <Icons.CloseIcon />
          </IconButton>
          <IconButton label="Disabled" disabled>
            <Icons.PlusIcon />
          </IconButton>
        </div>
      </Section>

      <Section title="Colour — semantic">
        <Swatches names={semantic} />
      </Section>
      <Section title="Colour — primitives">
        <Swatches names={primitives} />
      </Section>

      <Section title="Spacing">
        <ul className={styles.scale}>
          {spaces.map((s) => (
            <li key={s}>
              <span className={styles.bar} style={{ width: `var(${s})` }} />
              <span className="t-caption">{s} · {value(s)}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Radius">
        <ul className={styles.radii}>
          {radii.map((r) => (
            <li key={r}>
              <span className={styles.radius} style={{ borderRadius: `var(${r})` }} />
              <span className="t-caption">{r} · {value(r)}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Buttons">
        <div className={styles.row}>
          <Button>Continue</Button>
          <Button variant="secondary">Secondary</Button>
          <Button disabled>Disabled</Button>
          <Button size="md">Medium</Button>
          <Button size="md" variant="secondary" icon={<Icons.PlusIcon />}>
            With icon
          </Button>
        </div>
        <div className={styles.row}>
          <SmallButton label="Save & exit" />
          <SmallButton label="Update photo" arrow={false} icon={<Icons.CameraIcon />} />
          <SmallButton label="No arrow" arrow={false} />
          <SmallButton label="Disabled" disabled />
        </div>
      </Section>

      <Section title="Selection">
        <div className={styles.row}>
          {["Redness", "Itching", "Dryness"].map((o) => (
            <Chip
              key={o}
              label={o}
              selected={chips.includes(o)}
              onToggle={() =>
                setChips((prev) =>
                  prev.includes(o) ? prev.filter((x) => x !== o) : [...prev, o],
                )
              }
            />
          ))}
          <Chip label="Disabled" selected={false} disabled onToggle={() => {}} />
        </div>
        <div className={styles.stack} role="radiogroup" aria-label="Skin type">
          {["Dry", "Combination", "Oily"].map((o) => (
            <OptionRow
              key={o}
              control="radio"
              label={o}
              selected={radio === o}
              onSelect={() => setRadio(o)}
            />
          ))}
        </div>
        <div className={styles.stack}>
          <OptionRow control="checkbox" label="Checkbox, selected" selected onSelect={() => {}} />
          <OptionRow control="checkbox" label="Checkbox" selected={false} onSelect={() => {}} />
        </div>
        <div className={styles.row}>
          <Tag>Neutral tag</Tag>
          <Tag variant="brand">Brand tag</Tag>
        </div>
      </Section>

      <Section title="Fields">
        <div className={styles.stack}>
          <TextField placeholder="Text field" aria-label="Text field" />
          <DateField value={date} onChange={setDate} />
          <SearchField value={query} onChange={setQuery} label="Search" />
        </div>
      </Section>

      <Section title="Conversation">
        <div className={styles.stack}>
          <ChatBubble from="ai">How does your skin feel today?</ChatBubble>
          <ChatBubble from="user">A little tight around the nose.</ChatBubble>
        </div>
      </Section>

      <Section title="Surfaces">
        <DataCard>
          <p className="t-overline">Data card</p>
          <p className="t-metric2">72</p>
          <p className="t-body3">Surface system B — readouts.</p>
        </DataCard>
        <div className={styles.row}>
          <Orb size="96px" />
          <Button variant="secondary" size="md" onClick={() => setSheet(true)}>
            Open sheet
          </Button>
        </div>
        <Sheet open={sheet} onClose={() => setSheet(false)} title="Sheet">
          <p className="t-body3">The tray every overlay in the app uses.</p>
        </Sheet>
      </Section>

      <Section title="Icons">
        <ul className={styles.icons}>
          {Object.entries(Icons)
            .filter(([, v]) => typeof v === "function")
            .map(([name, Icon]) => {
              const Glyph = Icon as (p: { className?: string }) => ReactNode;
              return (
                <li key={name}>
                  <Glyph />
                  <span className="t-caption">{name.replace(/Icon$/, "")}</span>
                </li>
              );
            })}
        </ul>
      </Section>
    </main>
  );
}

function Swatches({ names }: { names: string[] }) {
  return (
    <ul className={styles.swatches}>
      {names.map((n) => (
        <li key={n}>
          <span className={styles.swatch} style={{ background: `var(${n})` }} />
          <span className="t-caption">{n.replace("--color-", "")}</span>
          <span className={`${styles.meta} t-caption`}>{value(n)}</span>
        </li>
      ))}
    </ul>
  );
}
