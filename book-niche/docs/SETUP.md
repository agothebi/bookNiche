# BookNiche — Setup Guide

Everything you need to do on your side to get Supabase auth and the app running.

---

## 1. Environment variables

Create or update `.env.local` in the project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Where to get these:**

- Open [Supabase Dashboard](https://supabase.com/dashboard) → your project.
- **Project URL:** Settings → General → Reference ID → `https://<REF>.supabase.co`.
- **Anon key:** Settings → API → Project API keys → `anon` (public) key.  
  If your project uses the new keys, use the **Publishable** key instead and name the variable `NEXT_PUBLIC_SUPABASE_ANON_KEY` (the app reads this name).

Do not commit `.env.local`. It is usually in `.gitignore`.

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

---

## Summary checklist

- [ ] `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Run `supabase/schema-saved-books.sql` in Supabase SQL Editor
- [ ] Redirect URLs in Supabase include `http://localhost:3000/` (and production URL later)
- [ ] (Optional) Google OAuth configured and redirect URI set in Google Cloud + Supabase
- [ ] `npm run dev` and test login at `/login`
