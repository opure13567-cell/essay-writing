# Task 2 Report: Supabase Database & Utility Functions

## Status: DONE

## Commit

`bb49f4c` - Task 2: add database schema, backend utils, frontend api wrapper

## Files Created

| File | Purpose |
|------|---------|
| `supabase/schema.sql` | Database schema: `orders` table with indexes, `config` table with default pricing/template/payment QR config |
| `api/lib/supabase.js` | Exports `supabaseAdmin` (service_role key) and `supabaseClient` (anon key) |
| `api/lib/auth.js` | Exports `verifyAdmin(req)` — Bearer token check against `ADMIN_PASSWORD` env var |
| `api/lib/pricing.js` | Exports `calculatePrice(wordCount, pricingRules)` and `countWords(text)` |
| `src/utils/userToken.js` | Exports `getUserToken()` — localStorage-backed UUID for anonymous user identification |
| `src/utils/api.js` | Exports `api` object with all student- and admin-endpoint methods, auto-attaching `X-User-Token` header |

## Concerns

- The API wrapper (`src/utils/api.js`) runs in the browser but calls `/api/*` which is proxied to `localhost:3000` by Vite. The backend Express server for those routes will be created in a later task. No runtime testing was done (no Supabase project configured).
