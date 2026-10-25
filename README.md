# SKY PHONE SHOP

React + Vite + Tailwind + Supabase. Public read-only price list, manager-only editing, realtime sync.

```
sky-phone-shop/
├─ public/ logo.png banner.png mockup.png
├─ supabase/schema.sql        ← tables, RLS, functions, seed
├─ src/ main.jsx App.jsx Admin.jsx lib.js supabase.js index.css
├─ .env.example  index.html  package.json  tailwind.config.js ...
```

## 1. Supabase setup
1. Create a project at supabase.com (free tier; check current limits — inactive free projects may be paused).
2. SQL Editor → paste all of `supabase/schema.sql` → Run.
3. Authentication → Users → **Add user** (email + password, auto-confirm) for each manager.
4. Authentication → Sign In / Providers → **disable "Allow new users to sign up"** so strangers can't create accounts.
5. SQL Editor: `insert into public.managers(user_id) select id from auth.users where email='YOU@example.com';`
6. Project Settings → API → copy **Project URL** and **anon/publishable key**.

## 1b. No-login mode (current app)
The app has **no login**: the គ្រប់គ្រង tab edits directly. Run `supabase/open-access.sql` after `schema.sql` to allow this.
**Risk:** the anon key is visible in the browser, so anyone who finds the site can edit or delete data. Steps 3–5 above (manager accounts) are optional unless you revert.

## Photo upload
Run `supabase/storage.sql` once (creates the public `product-images` bucket). Then in the គ្រប់គ្រង form click or drop a photo; it is resized to WebP (≤900px) and its URL is saved automatically.

## Fonts
Khmer OS Battambang / Moul are Windows fonts. Phones lack them, so the site loads Google's Battambang/Moul. For the exact fonts, copy `KhmerOSbattambang.ttf` and `KhmerOSmuol.ttf` into `public/fonts/`.

## 2. Run locally
```
cp .env.example .env     # fill in URL + anon key
npm install
npm run dev              # http://localhost:5173
```

## 3. Deploy (free tier)
Push to GitHub → import in **Vercel** or **Netlify** → build `npm run build`, output `dist` → add env vars `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` → deploy.

## 4. Images and prices
- Log in via **គ្រប់គ្រងស្តុក** → ✏️ edit → paste an Image URL. Easy way: Supabase → Storage → new **public** bucket → upload → copy public URL.
- Edit price, preorder price, min/max range, stock, condition, notes in the same form. Preorder is never auto-calculated.
- Use − (sold) / + (restock); stock cannot go below 0. History is stored in `inventory_adjustments`.
- Low Stock = 1–2 units (change `LOW` in `src/lib.js`).

## 5. Security
- The anon key is public by design; safety comes from Row Level Security: everyone can **read** products/variants; only users listed in `managers` can write. The `managers` table has no API access.
- Never put the service-role key or database password in frontend code or Vercel/Netlify `VITE_*` variables.
- Keep sign-ups disabled and add managers only through the dashboard + SQL step above.
