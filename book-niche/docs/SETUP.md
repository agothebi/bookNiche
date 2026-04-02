# BookNiche — Setup Guide

Everything you need to do on your side to get Supabase auth and the app running.

---

## 1. Environment variables

Create or update `.env.local` in the **`book-niche/`** project root (same folder as `package.json`) with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

**Where to get these:**

- Open [Supabase Dashboard](https://supabase.com/dashboard) → your project.
- **Project URL:** Settings → General → Reference ID → `https://<REF>.supabase.co`.
- **Anon key:** Settings → API → Project API keys → `anon` (public) key.  
  If your project uses the new keys, use the **Publishable** key instead and name the variable `NEXT_PUBLIC_SUPABASE_ANON_KEY` (the app reads this name).
- **Gemini:** Create an API key in [Google AI Studio](https://aistudio.google.com/apikey) (or your Google Cloud project). The app reads **`GEMINI_API_KEY`** only on the server (`/api/curate`). Never use the `NEXT_PUBLIC_` prefix for this secret.

See also **`.env.example`** in `book-niche/` for a template.

Do not commit `.env.local`. It is usually in `.gitignore`.

### Production (Vercel, Netlify, etc.)

Set the **same three variables** in your host’s Environment Variables UI for Production (and Preview if you want curate/login to work on preview URLs).

If the Git repository root is **`bookNiche/`** and the Next.js app lives in **`book-niche/`**, you **must** set the deploy **Root directory** / **Base directory** to **`book-niche`**. Otherwise install/build will fail or run the wrong folder. (This repo’s GitHub Actions CI runs all npm commands with `working-directory: book-niche` for the same reason.)

---

## 2. Supabase SQL schema (SavedBook / wishlist)

1. In Supabase Dashboard go to **SQL Editor** → **New query**.
2. Copy the contents of **`supabase/schema-saved-books.sql`** from this repo.
3. Paste into the editor and click **Run**.

This creates:

- Table `public.saved_books` with columns: `id`, `user_id`, `title`, `author`, `description`, `match_reason`, `genres`, `saved_at`.
- RLS policies so users can only read/insert/update/delete their own rows.
- A unique constraint on `(user_id, title, author)` to avoid duplicate saves.

---

## 3. Supabase Auth settings

### Magic Link (email OTP)

1. In Dashboard go to **Authentication** → **Providers**.
2. Ensure **Email** is enabled.
3. Under **Email**, you can leave “Confirm email” on or off; Magic Link works either way.

### Google OAuth (optional)

1. **Authentication** → **Providers** → **Google** → Enable.
2. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/apis/credentials):
   - Application type: **Web application**.
   - Authorized redirect URIs:  
     `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
3. Copy **Client ID** and **Client Secret** into the Supabase Google provider settings.

### Redirect URLs (required for Magic Link and Google)

1. **Authentication** → **URL Configuration**.
2. Add to **Redirect URLs** (comma-separated or one per line, depending on UI):
   - `http://localhost:3000/auth/callback` (development on port 3000)
   - `http://localhost:3001/auth/callback` (development on port 3001)
   - `https://your-production-domain.com/auth/callback` (production when you deploy)

The app uses `/auth/callback` to exchange the auth code for a session, then redirects to `/`. Without these URLs, Magic Link and Google sign-in may fail.

### Production checklist (Supabase)

Use this on the **same Supabase project** referenced by your production `NEXT_PUBLIC_SUPABASE_*` variables:

1. **Site URL** — Authentication → URL Configuration → set **Site URL** to your live app origin (e.g. `https://your-domain.com`).
2. **Redirect URLs** — Include **`https://your-domain.com/auth/callback`** (and preview URLs if you use them).
3. **Database** — Run **`supabase/schema-saved-books.sql`** in the SQL Editor on this project if you have not already (wishlist requires `saved_books` + RLS).

---

## 4. Run the app

```bash
npm run dev
```

- Open **http://localhost:3000/login**.
- Use “Send Magic Link” (with an email you can access) or “Continue with Google” if configured.
- After signing in you should be redirected to `/`.

---

## 5. Troubleshooting

| Issue | What to check |
|--------|----------------|
| “Invalid API key” or no auth | `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`; restart `npm run dev` after changing env. |
| Magic link not arriving | Supabase Auth → Providers → Email; check rate limits and spam folder; for local dev you can use “Inbucket” in Supabase if enabled. |
| Redirect after login goes to wrong URL | Authentication → URL Configuration → Redirect URLs must include your app origin (e.g. `http://localhost:3000/`). |
| Google “redirect_uri_mismatch” | In Google Cloud Console, the redirect URI must be exactly `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`. |
| RLS errors on `saved_books` | Ensure you ran the full `schema-saved-books.sql` script so RLS and policies exist; user must be signed in. |
| “GEMINI_API_KEY is not configured” or 500 on curate | Set `GEMINI_API_KEY` in `.env.local` (dev) and in the host’s env (production); redeploy after changing. |
| Build/install fails on the host | Set deploy **Root directory** to **`book-niche`** when the repo root has no `package.json`. |

---

## Summary checklist

- [ ] `.env.local` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and **`GEMINI_API_KEY`**
- [ ] Run `supabase/schema-saved-books.sql` in Supabase SQL Editor
- [ ] Redirect URLs in Supabase include `http://localhost:3000/auth/callback` and **`https://your-production-domain/auth/callback`**
- [ ] **Site URL** in Supabase matches production origin
- [ ] Deploy host: **Root directory** = **`book-niche`**; production env vars match `.env.example`
- [ ] (Optional) Google OAuth configured and redirect URI set in Google Cloud + Supabase
- [ ] `npm run dev` and test login at `/login`
