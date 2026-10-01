# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:


## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
# KopiKita

## Supabase Setup

1. Create a Supabase project.
2. Open the project's SQL Editor and run [`supabase/schema.sql`](supabase/schema.sql). It creates and seeds the menu tables and applies row-level security policies.
3. Run [`supabase/storage.sql`](supabase/storage.sql) in the SQL Editor to create the public `menu-images` bucket and admin-only upload policies.
4. Copy `.env.example` to `.env.local`. Set `VITE_SUPABASE_URL` to the Project URL and `VITE_SUPABASE_ANON_KEY` to the project's publishable key (or legacy anon key).
5. Create an admin user in Supabase Authentication.
6. In the SQL Editor, set that user's admin role by replacing the email in the commented SQL at the bottom of `supabase/schema.sql` and running it. Sign in again after changing the role so the new JWT contains the role.
7. Restart the dev server with `npm run dev`.

The site reads menu items publicly. Customers can submit orders, but only an authenticated user with `app_metadata.role = 'admin'` can read orders or manage menu items. The admin login is available at `/admin`.

Admin shortcuts in the header open the order queue and menu manager. Uploading a product photo accepts JPG, PNG, or WebP up to 5 MB and stores it in Supabase Storage.

Only the Supabase publishable/anon key belongs in `.env.local`; never put a service-role key in a `VITE_` variable or browser code. `.env.local` is ignored by git.

When Supabase is not configured, the existing localStorage demo mode remains available. The SQL seed inserts the 14 default menu items; existing browser-only menu edits and demo orders are not automatically migrated.

## Development

```sh
npm install
npm run dev
npm run lint
npm run build
```
