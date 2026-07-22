# Task 5 Report: Frontend Routing and Layout Components

## Status: DONE

## Summary
Set up React Router with BrowserRouter, shared Layout component, StatusBadge and PriceTag UI components, and placeholder page components for all routes.

## Files Modified
- `D:/essay-writing/src/App.jsx` — replaced simple div with BrowserRouter + Routes + Route, wrapping content in Layout

## Files Created
- `D:/essay-writing/src/components/Layout.jsx` — shared layout with header (home link + "我的订单" button), main content area, and footer; renders children directly for `/admin`
- `D:/essay-writing/src/components/StatusBadge.jsx` — colored badge component mapping order statuses (pending_pay, paid, writing, done) to Chinese labels and color classes
- `D:/essay-writing/src/components/PriceTag.jsx` — price display with optional "含加急费" rush indicator and delivery note
- `D:/essay-writing/src/pages/Home.jsx` — placeholder "Home Page"
- `D:/essay-writing/src/pages/NewOrder.jsx` — placeholder "NewOrder Page"
- `D:/essay-writing/src/pages/PayOrder.jsx` — placeholder "PayOrder Page"
- `D:/essay-writing/src/pages/OrderList.jsx` — placeholder "OrderList Page"
- `D:/essay-writing/src/pages/OrderDetail.jsx` — placeholder "OrderDetail Page"
- `D:/essay-writing/src/pages/Admin.jsx` — placeholder "Admin Page"

## Routes Configured
| Path | Component |
|---|---|
| `/` | Home |
| `/order/new` | NewOrder |
| `/order/:id/pay` | PayOrder |
| `/orders` | OrderList |
| `/order/:id` | OrderDetail |
| `/admin` | Admin |

## Build Verification
- `npm run build` passed successfully (41 modules transformed, no errors)

## Commit
- Hash: `b2847bd`
- Message: "Task 5: add React Router, Layout, StatusBadge, PriceTag, and placeholder pages"

## Concerns
None.
