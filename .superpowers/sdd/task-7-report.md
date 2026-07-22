# Task 7: 前端页面 — 支付页 & 订单页

## Status: DONE

## Commit: a0897dcb5b52c8c101a70da7ffc2aebf7eb23e70

## Files changed
- **src/pages/PayOrder.jsx** — replaced placeholder with full payment page: displays order info, QR code placeholder, file upload for payment screenshot with base64 conversion, and success state
- **src/pages/OrderList.jsx** — replaced placeholder with order list: fetches orders via `api.getOrders()`, shows empty state with CTA, renders order cards with status badge, type, word count, price, and date
- **src/pages/OrderDetail.jsx** — replaced placeholder with order detail page: shows order info, description, completed essay content with copy-to-clipboard, and status-dependent prompts/actions

## Verification
- `npm run build` passes (67 modules, 953ms)
- All pages use existing dependencies: `api.getOrder()`, `api.getOrders()`, `PriceTag`, `StatusBadge`
- Navigation paths: `/order/:id/pay` (PayOrder), `/orders` (OrderList), `/order/:id` (OrderDetail)

## Concerns
- The PayOrder page uses a raw `fetch` with `localStorage.getItem('essay_user_token')` directly rather than the `api.uploadPayment` helper or `getUserToken()` utility from api.js. This matches the brief spec but creates inconsistency with the rest of the codebase.
