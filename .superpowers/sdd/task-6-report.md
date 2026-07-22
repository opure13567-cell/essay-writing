# Task 6 Report

## Status: DONE

**Commit:** `b97d217`

## What was done

1. **Home.jsx** (`src/pages/Home.jsx`) — Replaced placeholder with full implementation: hero section with title/tagline, pricing table (3 tiers), service info cards, and "立即下单" CTA button that navigates to `/order/new`.

2. **OrderForm.jsx** (`src/components/OrderForm.jsx`) — Created reusable form component with:
   - Order type selector (5 types in a 3-column grid)
   - Description textarea with character count (excluding punctuation and whitespace)
   - Placeholder file upload area
   - Rush order toggle (switch component)
   - Submit button with loading state and disabled state

3. **NewOrder.jsx** (`src/pages/NewOrder.jsx`) — Replaced placeholder with real page:
   - Wraps `OrderForm` component
   - Calls `api.createOrder()` on submit
   - Navigates to `/order/:id/pay` on success
   - Displays error banner on failure

## Verification

- `npm run build` passes successfully (65 modules, 0 errors)
- No file was deleted; only the two placeholders were overwritten and one new file created
