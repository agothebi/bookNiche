# System Context & Role
Act as an expert Full-Stack Next.js Developer and Lead UX/UI Designer. Your task is to build a web application from scratch based on the detailed specifications below. Prioritize clean, maintainable TypeScript code, excellent component architecture, and a highly polished, aesthetic user interface.

# Project Overview
**Name:** BookNiche
**Concept:** A Japanese-inspired, aesthetically warm book discovery engine specializing in Fantasy and Romance tropes. 
**Core Loop:** Users log in, then input specific "vibes", tropes, or genres. They can type freely into a search bar (creating tag pills) OR click pre-selected trope pills and adjust sliders (e.g., "Angst Level", "Magic System") which automatically sync with the search bar. An AI "Curator" analyzes these tags. If the request is too broad, the AI asks a single clarification question. Once clarified, the AI returns a highly curated list of book recommendations. Users can save books to a wishlist or edit their search to tweak results.

# Tech Stack
- **Framework:** Next.js (App Router, React 19)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Auth & Database:** Supabase (Magic Link Email OTP + Google OAuth)
- **AI Integration:** `@google/genai` (Gemini API)
- **Icons:** `lucide-react` (or similar SVG icons)

# Application State & Flow
The application must handle authentication and strictly follow this state flow (`AppState`):
1. `AUTH`: User must log in via Email Magic Link (OTP) or Google OAuth before accessing the app.
2. `INPUT`: The search builder state. User enters tags or clicks manual selections.
3. `ANALYZING`: Loading state while the AI processes the tags.
4. `CLARIFYING`: The AI has returned a follow-up question. The user is prompted to type an answer.
5. `LOADING_FINAL`: Loading state while the AI processes the tags + the user's clarification answer.
6. `RESULTS`: Displaying the final array of book recommendations.
7. `EDITING`: From `RESULTS`, the user can click "Edit Search" to return to `INPUT` with all their previous tags and slider values intact, allowing them to toggle/add/remove items and re-submit without starting from scratch.

# Core Functional Requirements
1. **Authentication System:** 
   - A beautiful login page.
   - Users enter their email to receive a one-time code (Magic Link) or click "Continue with Google".
   - Protected routes: Unauthenticated users cannot access the search engine or wishlist.
2. **Interactive Search Builder:** 
   - A main search bar where typed text converts into visual "tag" pills.
   - **Manual Selections:** Directly under the search bar, display categorized options (e.g., "Popular Tropes" like *Enemies to Lovers*, *Found Family*).
   - **Sliders:** Include a few sliders for granular tweaks (e.g., *Spiciness: 1-5*, *Worldbuilding depth*).
   - **Bidirectional Sync:** Clicking a manual trope pill or adjusting a slider MUST automatically add/update a corresponding pill in the main search bar (e.g., adjusting a slider to 4 adds a "High Spiciness" pill). The LLM must receive this unified list of tags.
3. **Two-Step AI Flow:** 
   - Send the unified tags to Gemini. Instruct the AI to either return a list of books OR a clarification question if the tags are ambiguous.
   - If a question was asked, send the original tags + the user's answer back to Gemini to get the final recommendations.
4. **Wishlist Feature:** 
   - On the `RESULTS` view, every book card has a "Save to Wishlist" button.
   - Clicking this saves the book data to the user's Supabase database.
   - Provide a dedicated `/wishlist` page or a slide-out panel to view saved books.
5. **Edit Search:** 
   - Instead of just a "Start Over" button, provide an "Edit Search" button on the results page. This restores the `INPUT` state with the exact tags and slider positions the user just used, allowing rapid iteration.

# Data Models (TypeScript Interfaces)
Ensure the AI returns structured JSON that matches these interfaces, and set up your Supabase schema to handle the Wishlist:

```typescript
export interface BookRecommendation {
  title: string;
  author: string;
  description: string;
  matchReason: string; // Why this fits the user's specific tags
  genres: string[];
}

export type AIResponse = 
  | { type: 'clarification'; question: string }
  | { type: 'recommendations'; books: BookRecommendation[] };

export interface SavedBook extends BookRecommendation {
  id: string;
  user_id: string;
  saved_at: string;
}

UI/UX & Aesthetic Guidelines
The UI should be beautiful, immersive, and feel like a cozy, magical library. Do not hardcode rigid pixel values for layouts; use responsive Tailwind classes (flex, grid, max-w) so the UI is flexible.
Color Palette (Japanese/Sakura Theme):
Backgrounds: Warm off-whites, soft creams (#fff1f2 or similar).
Accents: Sakura pinks/rose (#fb7185, #f43f5e) and Mikan/warm oranges (#fb923c).
Text: Deep stone/charcoal for readability, avoiding pure black.
Typography:
Headings/Logos: An elegant Serif font (e.g., 'Cinzel', 'Playfair Display', or 'Cormorant Garamond').
Body/UI Text: A clean, rounded Sans-Serif (e.g., 'Zen Maru Gothic', 'Inter', or 'Nunito').
Animations & Micro-interactions:
Use soft fade-ins for state transitions (animate-fade-in).
Add ambient, slow-moving background elements (e.g., large, heavily blurred, low-opacity colored circles that float in the background).
Buttons should have satisfying hover states and disabled states (with loading spinners).
Copywriting Tone:
Magical, polite, and curatorial.
Examples: "Curate Collection", "Consulting...", "Curator's Question", "The spirits of the library are quiet."

Project Rules & Constraints
This document serves as the master blueprint. Do not generate the entire application at once. We will build this iteratively, milestone by milestone, starting with the database schema, moving to authentication, building the UI components, and finally integrating the Gemini AI state machine.