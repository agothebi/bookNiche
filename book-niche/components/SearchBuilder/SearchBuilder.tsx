"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Search, X, ArrowRight, SlidersHorizontal } from "lucide-react";
import { TROPE_CATEGORIES, SLIDER_CONFIGS } from "@/lib/search-config";
import type { SliderConfig } from "@/lib/types";

const CURATED_VIBES: { title: string; tags: string[] }[] = [
  {
    title: "The Royal Betrayal",
    tags: ["Political Intrigue", "Dark Lord", "Epic Quest"],
  },
  {
    title: "Cozy Tavern",
    tags: ["Cozy", "Found Family", "Soft Magic"],
  },
  {
    title: "Burning Slow",
    tags: ["Slow Burn", "Enemies to Lovers", "High Spiciness"],
  },
];

export interface SearchBuilderProps {
  initialTags?: string[];
  onTagsChange?: (tags: string[]) => void;
  onSubmit?: (tags: string[]) => void;
  submitLabel?: string;
}

export function SearchBuilder({
  initialTags = [],
  onTagsChange,
  onSubmit,
  submitLabel = "Curate Collection",
}: SearchBuilderProps) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [inputValue, setInputValue] = useState("");
  const [sliderValues, setSliderValues] = useState<Record<string, number>>(() =>
    deriveSliderValuesFromTags(initialTags),
  );
  const [lastTagHighlighted, setLastTagHighlighted] = useState(false);
  const [browseOpen, setBrowseOpen] = useState(false);
  const browseRef = useRef<HTMLDivElement>(null);

  const notifyTags = useCallback(
    (next: string[]) => {
      setTags(next);
      onTagsChange?.(next);
    },
    [onTagsChange],
  );

  useEffect(() => {
    if (initialTags.length > 0) {
      setTags(initialTags);
      setSliderValues(deriveSliderValuesFromTags(initialTags));
    }
  }, [initialTags.join(",")]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        browseOpen &&
        browseRef.current &&
        !browseRef.current.contains(e.target as Node)
      ) {
        setBrowseOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [browseOpen]);

  function deriveSliderValuesFromTags(
    tagList: string[],
  ): Record<string, number> {
    const out: Record<string, number> = {};
    for (const config of SLIDER_CONFIGS) {
      for (let v = config.min; v <= config.max; v++) {
        const label = config.valueLabels[v - config.min];
        if (tagList.includes(label)) {
          out[config.id] = v;
          break;
        }
      }
      if (out[config.id] == null) out[config.id] = config.min;
    }
    return out;
  }

  function addTag(tag: string) {
    const t = tag.trim();
    if (!t || tags.includes(t)) return;
    const next = [...tags, t];
    notifyTags(next);
    setLastTagHighlighted(false);
  }

  function removeTag(tag: string) {
    const next = tags.filter((x) => x !== tag);
    notifyTags(next);
    setLastTagHighlighted(false);
    setSliderValues((prev) => {
      const nextSliders = { ...prev };
      for (const config of SLIDER_CONFIGS) {
        const label = config.valueLabels[prev[config.id] - config.min];
        if (label === tag) {
          nextSliders[config.id] = config.min;
          break;
        }
      }
      return nextSliders;
    });
  }

  function removeLastTag() {
    if (tags.length === 0) return;
    removeTag(tags[tags.length - 1]);
  }

  function applyVibeCard(cardTags: string[]) {
    setTags(cardTags);
    setSliderValues(deriveSliderValuesFromTags(cardTags));
    notifyTags(cardTags);
    setLastTagHighlighted(false);
  }

  function handleSliderChange(config: SliderConfig, value: number) {
    setSliderValues((prev) => ({ ...prev, [config.id]: value }));
    const newLabel = config.valueLabels[value - config.min];
    const next = tags.filter((t) => !config.valueLabels.includes(t));
    next.push(newLabel);
    notifyTags(next);
  }

  function handleTropeClick(trope: string) {
    if (tags.includes(trope)) {
      removeTag(trope);
    } else {
      addTag(trope);
    }
  }

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
      setInputValue("");
      setLastTagHighlighted(false);
      return;
    }

    if (e.key === "Backspace") {
      if (inputValue.length > 0) {
        setLastTagHighlighted(false);
        return;
      }
      if (tags.length === 0) return;
      e.preventDefault();
      if (lastTagHighlighted) {
        removeLastTag();
        setLastTagHighlighted(false);
      } else {
        setLastTagHighlighted(true);
      }
      return;
    }

    if (lastTagHighlighted && !e.ctrlKey && !e.metaKey && !e.altKey) {
      setLastTagHighlighted(false);
    }
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
    if (e.target.value.length > 0) setLastTagHighlighted(false);
  }

  const showKbdHint = inputValue.length === 0;

  return (
    <div className="relative w-full max-w-4xl mx-auto animate-in fade-in duration-500">
      {/* Premium editorial header */}
      <div className="text-center mb-10 sm:mb-12">
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight mb-3 text-[var(--foreground)]">
          Find your next{" "}
          <em className="italic text-[var(--sakura-deep)]">obsession.</em>
        </h1>
        <p className="text-sm sm:text-base text-[var(--foreground-muted)] font-medium max-w-md mx-auto">
          Discover books by the feelings they give you, not just the genre.
        </p>
      </div>

      {/* Pill search bar + filters + inline submit */}
      <div className="relative" ref={browseRef}>
        <div
          className="min-h-[6rem] rounded-4xl sm:rounded-full border border-[var(--border)] bg-white shadow-lg shadow-rose-900/10 focus-within:shadow-xl focus-within:shadow-rose-500/15 focus-within:border-[var(--sakura)]/60 flex flex-wrap items-center gap-2 sm:gap-3 pl-5 pr-2 py-4 sm:pl-6 sm:pr-2 sm:py-5 transition-shadow duration-200"
          role="search"
        >
          <Search
            className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 text-[var(--foreground-muted)]"
            strokeWidth={1.5}
          />
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
            {tags.map((tag, i) => {
              const isLast = i === tags.length - 1;
              const highlighted = isLast && lastTagHighlighted;
              return (
                <span
                  key={tag}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-all ${
                    highlighted
                      ? "bg-[var(--sakura)]/25 text-[var(--sakura-deep)] ring-2 ring-[var(--sakura)] ring-offset-2 ring-offset-white"
                      : "bg-[var(--sakura)]/15 text-[var(--sakura-deep)]"
                  }`}
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="rounded-full p-0.5 hover:bg-[var(--sakura)]/30 transition"
                    aria-label={`Remove ${tag}`}
                  >
                    <X className="w-3.5 h-3.5" strokeWidth={2} />
                  </button>
                </span>
              );
            })}
            <span className="inline-flex flex-1 min-w-[120px] sm:min-w-[160px] items-center">
              <input
                type="text"
                value={inputValue}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => setBrowseOpen(true)}
                placeholder="Type a trope or vibe…"
                className="flex-1 min-w-0 bg-transparent text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none py-2 text-lg sm:text-xl"
              />
            </span>
          </div>
          <kbd
            className={`hidden sm:inline-flex pointer-events-none select-none rounded-lg border border-[var(--border)] bg-[var(--background-soft)]/80 px-2.5 py-1.5 font-sans text-xs font-medium text-[var(--foreground-muted)] transition-opacity duration-200 ${
              showKbdHint ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden
          >
            Press Enter ↵
          </kbd>
          <button
            type="button"
            onClick={() => setBrowseOpen((o) => !o)}
            aria-label="Browse tropes and filters"
            className={`shrink-0 flex items-center justify-center w-10 h-10 rounded-full border transition ${
              browseOpen
                ? "border-[var(--sakura)] bg-[var(--sakura)]/10 text-[var(--sakura-deep)]"
                : "border-[var(--border)] bg-[var(--background-soft)]/80 text-[var(--foreground-muted)] hover:border-[var(--sakura)]/50 hover:text-[var(--foreground)]"
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" strokeWidth={1.5} />
          </button>
          {onSubmit && (
            <button
              type="button"
              onClick={() => onSubmit(tags)}
              disabled={tags.length === 0}
              aria-label="Submit search"
              className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-[var(--sakura-deep)] text-white shadow-sm hover:bg-[var(--sakura-deep)]/90 disabled:opacity-50 disabled:pointer-events-none transition"
            >
              <ArrowRight className="w-5 h-5" strokeWidth={2} />
            </button>
          )}
        </div>

        {/* Frosted-glass dropdown: tropes + sliders */}
        {browseOpen && (
          <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-[var(--border)] bg-white/70 backdrop-blur-xl shadow-xl shadow-rose-900/10 overflow-hidden">
            <div className="p-4 sm:p-5 max-h-[min(70vh,28rem)] overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                <div className="space-y-3">
                  <h2 className="font-serif text-base font-medium text-[var(--foreground)]">
                    Popular tropes
                  </h2>
                  <div className="flex flex-col gap-3">
                    {TROPE_CATEGORIES.map((cat) => (
                      <div key={cat.label} className="space-y-1.5">
                        <p className="text-xs font-medium text-[var(--foreground-muted)]">
                          {cat.label}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {cat.tropes.map((trope) => {
                            const selected = tags.includes(trope);
                            return (
                              <button
                                key={trope}
                                type="button"
                                onClick={() => handleTropeClick(trope)}
                                className={`rounded-full px-3 py-1.5 text-xs font-medium transition border ${
                                  selected
                                    ? "bg-[var(--sakura)] text-white border-[var(--sakura-deep)]"
                                    : "bg-white/90 text-[var(--foreground)] border-[var(--border)] hover:border-[var(--sakura)]/50 hover:bg-[var(--sakura)]/10"
                                }`}
                              >
                                {trope}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h2 className="font-serif text-base font-medium text-[var(--foreground)]">
                    Fine-tune
                  </h2>
                  <div className="space-y-4">
                    {SLIDER_CONFIGS.map((config) => {
                      const value = sliderValues[config.id] ?? config.min;
                      const label = config.valueLabels[value - config.min];
                      return (
                        <div key={config.id} className="space-y-1.5">
                          <div className="flex justify-between items-baseline">
                            <label
                              htmlFor={`browse-${config.id}`}
                              className="text-xs font-medium text-[var(--foreground)]"
                            >
                              {config.label}
                            </label>
                            <span className="text-xs text-[var(--foreground-muted)]">
                              {label}
                            </span>
                          </div>
                          <input
                            id={`browse-${config.id}`}
                            type="range"
                            min={config.min}
                            max={config.max}
                            value={value}
                            onChange={(e) =>
                              handleSliderChange(
                                config,
                                parseInt(e.target.value, 10),
                              )
                            }
                            className="w-full h-2 rounded-full appearance-none bg-[var(--border)] accent-[var(--sakura)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--sakura)] [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-0"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Curated vibes cards */}
      <div className="mt-10 sm:mt-12">
        <h2 className="font-serif text-sm font-medium text-[var(--foreground-muted)] text-center mb-4">
          Or start with a curated vibe…
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CURATED_VIBES.map((vibe) => (
            <button
              key={vibe.title}
              type="button"
              onClick={() => applyVibeCard(vibe.tags)}
              className="text-left rounded-2xl border border-[var(--border)] bg-white/60 backdrop-blur-sm p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <p className="font-serif text-base font-medium text-[var(--foreground)] mb-2">
                {vibe.title}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {vibe.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block rounded-full bg-[var(--foreground)]/10 text-[var(--foreground-muted)] text-xs px-2 py-0.5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
