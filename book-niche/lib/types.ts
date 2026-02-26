/**
 * Application state flow (PRD).
 */
export type AppState =
  | "AUTH"
  | "INPUT"
  | "ANALYZING"
  | "CLARIFYING"
  | "LOADING_FINAL"
  | "RESULTS"
  | "EDITING";

/**
 * Unified tag list sent to the AI. Built from search bar input, trope pills, and sliders.
 */
export type SearchState = {
  tags: string[];
};

/**
 * Slider config for mapping value → tag label (for sync with search bar).
 */
export interface SliderConfig {
  id: string;
  label: string;
  min: number;
  max: number;
  /** Labels for each integer value; index = value - min. Used to add/update a single tag per slider. */
  valueLabels: string[];
}

/**
 * Book recommendation from AI (PRD).
 */
export interface BookRecommendation {
  title: string;
  author: string;
  description: string;
  matchReason: string;
  genres: string[];
}

/**
 * AI response: either clarification or recommendations (PRD).
 */
export type AIResponse =
  | { type: "clarification"; question: string }
  | { type: "recommendations"; books: BookRecommendation[] };

/**
 * Saved book in DB (PRD).
 */
export interface SavedBook extends BookRecommendation {
  id: string;
  user_id: string;
  saved_at: string;
}
