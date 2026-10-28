# OneP — Next.js + Supabase starter

A mobile-first social feed / marketplace starter using Next.js App Router, Tailwind CSS, Supabase Auth, PostgreSQL, and Storage.

## Included
- Home feed with a responsive layout and mobile bottom navigation
- Google OAuth sign-in flow and secure server-side callback
- Profile sign-in status and sign-out
- Create-post form with a maximum of two images
- Serverless `POST /api/posts` route that enforces the two-image limit
- Marketplace and chat placeholder pages
- Supabase schema with profiles, products, posts, post images, follows, chats, messages, RLS policies, and a post-images bucket

> This is a starter project, not a finished marketplace/chat product. Payment processing, full chat UI/realtime, likes/comments, and product creation/checkout still need implementation.

## Requirements
- Node.js 20.9+ recommended
- A Supabase project
- A Google Cloud OAuth client for Google sign-in

## 1. Install
```bash
npm install
```

## 2. Configure environment
Copy `.env.example` to `.env.local`, then set your Supabase project URL and publishable/anon key.

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Do not put a Supabase service-role key in a `NEXT_PUBLIC_` variable or commit secrets.

## 3. Set up the database
In the Supabase Dashboard, open SQL Editor, paste `supabase/schema.sql`, and run it. Review the SQL and policies before using in production.

## 4. Enable Google sign-in
In Supabase Dashboard:
1. Open Authentication → Sign In / Providers → Google and enable Google.
2. Configure the Google OAuth client ID and secret from Google Cloud.
3. In Authentication → URL Configuration, set **Site URL** to `http://localhost:3000` for local development.
4. Add these **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://YOUR-VERCEL-DOMAIN.vercel.app/auth/callback`
   - Your custom domain callback, if applicable: `https://yourdomain.com/auth/callback`

The app requests the callback URL dynamically from the current site origin, with `?next=/profile`. Add exact production callback URLs to Supabase's allow list. In Google Cloud OAuth client, add the Supabase Auth callback URI shown in the Supabase Google provider setup (commonly `https://YOUR_PROJECT.supabase.co/auth/v1/callback`) as an authorized redirect URI. This is different from the app's `/auth/callback`.

## 5. Run locally
```bash
npm run dev
```
Visit `http://localhost:3000`.

## 6. Deploy to Vercel
1. Push the folder to GitHub.
2. Import the repository in Vercel.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables.
4. Deploy.
5. Update Supabase Authentication URL Configuration with the production site URL and callback allow list.
6. Update Google OAuth authorized origins/redirect URI according to the Google provider setup instructions.

## Routes
- `/` — feed
- `/login` — Google sign-in
- `/auth/callback` — OAuth code exchange
- `/create` — post composer
- `/market` — marketplace placeholder
- `/chat` — chat placeholder
- `/profile` — session and sign-out
- `POST /api/posts` — create post, max two images

## Push to GitHub
```bash
git init
git add .
git commit -m "Initial OneP project"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```
If the repo already has a remote, use `git remote -v` to inspect it rather than adding a second origin.
