"use client";

import { useState, useCallback, useEffect } from "react";
import { Search, X, Sparkles } from "lucide-react";
import { TROPE_CATEGORIES, SLIDER_CONFIGS } from "@/lib/search-config";
import type { SliderConfig } from "@/lib/types";

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
    deriveSliderValuesFromTags(initialTags)
  );

  const notifyTags = useCallback(
    (next: string[]) => {
      setTags(next);
      onTagsChange?.(next);
    },
    [onTagsChange]
  );

  useEffect(() => {
    if (initialTags.length > 0) {
      setTags(initialTags);
      setSliderValues(deriveSliderValuesFromTags(initialTags));
    }
  }, [initialTags.join(",")]);

  function deriveSliderValuesFromTags(tagList: string[]): Record<string, number> {
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
  }

  function removeTag(tag: string) {
    const next = tags.filter((x) => x !== tag);
    notifyTags(next);
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
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Search bar with tag pills */}
      <div className="space-y-3">
        <label className="font-serif text-lg font-medium text-[var(--foreground)]">
          What are you in the mood for?
        </label>
        <div className="min-h-14 rounded-2xl border border-[var(--border)] bg-white/90 shadow-sm shadow-[var(--sakura)]/5 flex flex-wrap items-center gap-2 p-3 focus-within:ring-2 focus-within:ring-[var(--ring)]/40 focus-within:border-[var(--sakura)] transition">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-full bg-[var(--sakura)]/15 text-[var(--sakura-deep)] px-3 py-1.5 text-sm font-medium"
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
          ))}
          <span className="inline-flex flex-1 min-w-[140px] items-center gap-2">
            <Search
              className="w-5 h-5 shrink-0 text-[var(--foreground-muted)]"
              strokeWidth={1.5}
            />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Type a trope or vibe…"
              className="flex-1 min-w-0 bg-transparent text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none py-1.5"
            />
          </span>
        </div>
        <p className="text-xs text-[var(--foreground-muted)]">
          Press Enter or comma to add a tag. Click a pill below or move the
          sliders to add more.
        </p>
      </div>

      {/* Manual trope pills by category */}
      <div className="space-y-4">
        <h2 className="font-serif text-lg font-medium text-[var(--foreground)]">
          Popular tropes
        </h2>
        <div className="flex flex-col gap-6">
          {TROPE_CATEGORIES.map((cat) => (
            <div key={cat.label} className="space-y-2">
              <p className="text-sm font-medium text-[var(--foreground-muted)]">
                {cat.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {cat.tropes.map((trope) => {
                  const selected = tags.includes(trope);
                  return (
                    <button
                      key={trope}
                      type="button"
                      onClick={() => handleTropeClick(trope)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition border ${
                        selected
                          ? "bg-[var(--sakura)] text-white border-[var(--sakura-deep)] shadow-sm"
                          : "bg-white/80 text-[var(--foreground)] border-[var(--border)] hover:border-[var(--sakura)]/60 hover:bg-[var(--sakura)]/10"
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

      {/* Sliders */}
      <div className="space-y-6">
        <h2 className="font-serif text-lg font-medium text-[var(--foreground)]">
          Fine-tune
        </h2>
        <div className="flex flex-col gap-6">
          {SLIDER_CONFIGS.map((config) => {
            const value = sliderValues[config.id] ?? config.min;
            const label = config.valueLabels[value - config.min];
            return (
              <div key={config.id} className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <label
                    htmlFor={config.id}
                    className="text-sm font-medium text-[var(--foreground)]"
                  >
                    {config.label}
                  </label>
                  <span className="text-xs text-[var(--foreground-muted)]">
                    {label}
                  </span>
                </div>
                <input
                  id={config.id}
                  type="range"
                  min={config.min}
                  max={config.max}
                  value={value}
                  onChange={(e) =>
                    handleSliderChange(config, parseInt(e.target.value, 10))
                  }
                  className="w-full h-2 rounded-full appearance-none bg-[var(--border)] accent-[var(--sakura)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--sakura)] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-0"
                />
              </div>
            );
          })}
        </div>
      </div>

      {onSubmit && (
        <div className="pt-4">
          <button
            type="button"
            onClick={() => onSubmit(tags)}
            disabled={tags.length === 0}
            className="w-full py-4 rounded-2xl bg-[var(--sakura)] text-white font-serif text-lg font-medium hover:bg-[var(--sakura-deep)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/50 focus:ring-offset-2 focus:ring-offset-[var(--background)] transition disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-lg shadow-[var(--sakura)]/20"
          >
            <Sparkles className="w-5 h-5" strokeWidth={1.5} />
            {submitLabel}
          </button>
        </div>
      )}
    </div>
  );
}
