"use client";

import { useState } from "react";
import { SearchBuilder } from "./SearchBuilder";

/**
 * Client wrapper for INPUT state. Holds tags and passes to SearchBuilder.
 * onSubmit will later trigger ANALYZING and Gemini; for now we just log.
 */
export function SearchBuilderWrapper() {
  const [tags, setTags] = useState<string[]>([]);

  function handleSubmit(submittedTags: string[]) {
    // TODO: set app state to ANALYZING, call Gemini, etc.
    console.log("Submitting tags:", submittedTags);
  }

  return (
    <SearchBuilder
      initialTags={tags}
      onTagsChange={setTags}
      onSubmit={handleSubmit}
      submitLabel="Curate Collection"
    />
  );
}
