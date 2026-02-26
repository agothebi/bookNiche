import type { SliderConfig } from "./types";

/**
 * Tropes by category for manual selection pills.
 * Clicking a pill toggles that tag in the unified list.
 */
export const TROPE_CATEGORIES: { label: string; tropes: string[] }[] = [
  {
    label: "Popular Tropes",
    tropes: [
      "Enemies to Lovers",
      "Found Family",
      "Slow Burn",
      "Fake Dating",
      "Second Chance",
      "Grumpy Sunshine",
      "Forced Proximity",
      "Only One Bed",
    ],
  },
  {
    label: "Fantasy",
    tropes: [
      "Magic System",
      "Epic Quest",
      "Chosen One",
      "Dark Lord",
      "Mystical Creatures",
      "Political Intrigue",
      "Soft Magic",
      "Hard Magic",
    ],
  },
  {
    label: "Romance Vibes",
    tropes: [
      "Cozy",
      "Angsty",
      "Comedic",
      "Dark Romance",
      "Sweet",
      "Steamy",
      "Emotional",
      "Lighthearted",
    ],
  },
];

/**
 * Sliders: value N maps to valueLabels[N - min].
 * Changing a slider replaces any tag that matches one of its valueLabels.
 */
export const SLIDER_CONFIGS: SliderConfig[] = [
  {
    id: "spiciness",
    label: "Spiciness",
    min: 1,
    max: 5,
    valueLabels: [
      "No Spice",
      "Low Spiciness",
      "Medium Spiciness",
      "High Spiciness",
      "Very Spicy",
    ],
  },
  {
    id: "angst",
    label: "Angst Level",
    min: 1,
    max: 5,
    valueLabels: [
      "No Angst",
      "Light Angst",
      "Moderate Angst",
      "High Angst",
      "Heavy Angst",
    ],
  },
  {
    id: "worldbuilding",
    label: "Worldbuilding Depth",
    min: 1,
    max: 5,
    valueLabels: [
      "Minimal Worldbuilding",
      "Light Worldbuilding",
      "Moderate Worldbuilding",
      "Rich Worldbuilding",
      "Deep Worldbuilding",
    ],
  },
];
