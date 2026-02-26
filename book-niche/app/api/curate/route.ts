import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import type { AIResponse, BookRecommendation } from "@/lib/types";

const GEMINI_MODEL = "gemini-2.5-flash";

const genAI =
  typeof process.env.GEMINI_API_KEY === "string"
    ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    : null;

const AI_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  description:
    "AIResponse union type: either a clarification question or a list of book recommendations.",
  properties: {
    type: {
      type: Type.STRING,
      enum: ["clarification", "recommendations"],
      description:
        '"clarification" when asking a follow-up question, "recommendations" when returning books.',
    },
    question: {
      type: Type.STRING,
      description:
        "When type === \"clarification\", a single, beautifully written follow-up question.",
    },
    books: {
      type: Type.ARRAY,
      description:
        "When type === \"recommendations\", a curated list of matching books.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: "Book title.",
          },
          author: {
            type: Type.STRING,
            description: "Primary author name.",
          },
          description: {
            type: Type.STRING,
            description: "Short, vivid pitch of the book (2–4 sentences).",
          },
          matchReason: {
            type: Type.STRING,
            description:
              "Why this book fits the user's specific tags and vibes.",
          },
          genres: {
            type: Type.ARRAY,
            description: "Genres or shelving categories for the book.",
            items: {
              type: Type.STRING,
            },
          },
        },
        required: ["title", "author", "description", "matchReason", "genres"],
      },
    },
  },
  required: ["type"],
};

const SYSTEM_PROMPT = `
You are the Master Literary Archivist of a vast, enchanted library called BookNiche.

PHILOSOPHY & TONE
- You speak as a calm, erudite curator who loves helping readers find exactly the right stories.
- You think in terms of feelings, vibes, tropes, emotional arcs, and reading experiences — not just genres.
- Your goal is to create *discovery*, not just list books: every recommendation should feel intentional and lovingly chosen.

CURATION RULES
- When returning recommendations (type === "recommendations"):
  - Always curate a *diverse* list that mixes:
    - 1–2 well-known or mainstream bestsellers readers are likely to recognize.
    - 1–2 highly rated indie or self-published works that feel like hidden gems.
    - 1–2 deep niche / backlist / cult favorites that align *precisely* with the user's specific tropes and vibes.
  - For each book, explain *why* it matches the user's tags in matchReason:
    - Explicitly reference important tropes, character dynamics, emotional tone, or worldbuilding depth.
    - If a book only loosely matches, do **not** include it.
- You must actively search your knowledge to avoid recommending only the same handful of super-popular titles.
- Vary genres and subgenres when appropriate, but never at the expense of matching the user's requested tropes.

CLARIFICATION LOGIC
- You receive an array of tags (strings) representing vibes, tropes, sliders, and user preferences.
- First, evaluate whether the tags are specific enough to curate meaningful recommendations.
- Examples of *too vague* or *underspecified* requests:
  - ["magic"], ["romance"], ["fantasy"], ["something fun"], ["adventure"], ["books with dragons"].
  - Any tiny set of tags that could describe thousands of completely different reading experiences.
- When the request is *too vague*:
  - You **do not** guess.
  - You return type === "clarification" with a single, beautifully written, in-character follow-up question.
  - The question should be very focused and easy to answer, helping the user narrow things down (e.g., ask about tone, trope preferences, relationship dynamics, or pacing).
- When the tags are specific enough (e.g., include several concrete tropes, tonal descriptors, or sliders):
  - You skip clarification and instead return recommendations (type === "recommendations").

STRUCTURED OUTPUT
- You must return JSON that strictly conforms to the AIResponse union type:
  - Clarification case:
    { "type": "clarification", "question": "..." }
  - Recommendations case:
    {
      "type": "recommendations",
      "books": [
        {
          "title": "...",
          "author": "...",
          "description": "...",
          "matchReason": "...",
          "genres": ["...", "..."]
        }
      ]
    }
- Never mix both "question" and "books" in a meaningful way:
  - If type === "clarification", provide only a helpful question and omit books or leave it empty.
  - If type === "recommendations", omit "question" or leave it null/empty.
- The JSON must be valid, machine-readable, and contain no extra commentary or formatting.

ROLE
- You are not a chatty assistant. You are an archivist returning **data** to be rendered by a UI.
- All natural language should live inside "description" or "matchReason" or the clarification "question".
`;

function isBookRecommendation(value: unknown): value is BookRecommendation {
  if (!value || typeof value !== "object") return false;
  const b = value as Partial<BookRecommendation>;
  return (
    typeof b.title === "string" &&
    typeof b.author === "string" &&
    typeof b.description === "string" &&
    typeof b.matchReason === "string" &&
    Array.isArray(b.genres) &&
    b.genres.every((g) => typeof g === "string")
  );
}

function isAIResponse(value: unknown): value is AIResponse {
  if (!value || typeof value !== "object") return false;
  const v = value as any;
  if (v.type === "clarification") {
    // Gemini may include an empty books array alongside the question; accept both forms
    return typeof v.question === "string";
  }
  if (v.type === "recommendations") {
    return (
      Array.isArray(v.books) && v.books.every((b: unknown) => isBookRecommendation(b))
    );
  }
  return false;
}

export async function POST(request: Request) {
  try {
    if (!genAI) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured on the server." },
        { status: 500 },
      );
    }

    const body = await request.json().catch(() => null);
    const tags = (body as { tags?: unknown })?.tags;
    const clarificationAnswer =
      typeof (body as any)?.clarificationAnswer === "string"
        ? (body as any).clarificationAnswer.trim()
        : null;

    if (!Array.isArray(tags) || tags.some((t) => typeof t !== "string")) {
      return NextResponse.json(
        { error: "Invalid request body. Expected { tags: string[] }." },
        { status: 400 },
      );
    }

    const trimmedTags = tags.map((t) => t.trim()).filter((t) => t.length > 0);

    if (trimmedTags.length === 0) {
      return NextResponse.json(
        { error: "At least one non-empty tag is required." },
        { status: 400 },
      );
    }


    const userPromptParts = [
      "You will receive an array of tags provided by a reader.",
      "Each tag may represent a trope, vibe, slider descriptor (e.g. 'High Spiciness'), or genre hint.",
      "",
      "Tags:",
      JSON.stringify(trimmedTags, null, 2),
    ];

    if (clarificationAnswer) {
      userPromptParts.push(
        "",
        "The reader has already been asked a clarification question and provided this answer:",
        `"${clarificationAnswer}"`,
        "",
        "Use both the tags AND this clarification answer to immediately return book recommendations.",
        "Do NOT ask another clarification question.",
      );
    } else {
      userPromptParts.push(
        "",
        "1. Decide if these tags are too vague to meaningfully curate books.",
        "2. If they are too vague, return type === 'clarification' with a single helpful follow-up question.",
        "3. If they are specific enough, return type === 'recommendations' with a well-curated list of books as described in your instructions.",
      );
    }

    const userPrompt = userPromptParts.join("\n");

    const result = await genAI.models.generateContent({
      model: GEMINI_MODEL,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: AI_RESPONSE_SCHEMA,
        temperature: 0.7,
      },
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }],
        },
      ],
    });

    const raw = result.text;

    if (!raw) {
      return NextResponse.json(
        { error: "Gemini returned an empty response." },
        { status: 502 },
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      return NextResponse.json(
        {
          error: "Failed to parse Gemini JSON response.",
          details: raw,
        },
        { status: 502 },
      );
    }

    if (!isAIResponse(parsed)) {
      return NextResponse.json(
        {
          error: "Gemini response did not match AIResponse schema.",
          details: parsed,
        },
        { status: 502 },
      );
    }

    return NextResponse.json(parsed, { status: 200 });
  } catch (error) {
    console.error("[api/curate] Unexpected error", error);
    return NextResponse.json(
      { error: "Unexpected server error while curating books." },
      { status: 500 },
    );
  }
}

