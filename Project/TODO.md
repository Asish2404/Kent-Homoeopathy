# Kent Homoeopharmacy - Production Polish Tracker

## Phase 1 — CRITICAL FIXES

### ✅ 1.1 Error Boundary (DONE)
- Created `src/components/ErrorBoundary.jsx`
- Wraps entire app in App.jsx
- Professional fallback UI with retry button

### ✅ 1.2 404 Page (DONE)
- Created `src/pages/NotFound.jsx`
- Added `<Route path="*" element={<NotFound />} />` in App.jsx

### ✅ 1.3 App.jsx Structure Fixes (DONE)
- ErrorBoundary wrapping RouterProvider
- NotFound route added
- Fixed missing `</Route>` closing tags in admin section
- All routes preserved

### ⬜ 1.4 Fix Product Details Routing
- [ ] Fetch product by ID from backend API
- [ ] Remove dependency on `location.state?.product`
- [ ] Support page refresh and direct URL access
- [ ] Add loading state while fetching

### ⬜ 1.5 Loading States
- [ ] Products catalog - loading skeleton
- [ ] Product Details - loading skeleton
- [ ] Doctors listing - loading skeleton
- [ ] Orders - loading skeleton
- [ ] Profile - loading skeleton
- [ ] Dashboard - loading skeleton
- [ ] Medical Reports - loading skeleton

### ⬜ 1.6 Empty States
- [ ] Replace blank tables with EmptyState components
- [ ] Orders empty state
- [ ] Wishlist empty state
- [ ] Cart empty state
- [ ] Medical Reports empty state

## Phase 2 — E-COMMERCE IMPROVEMENTS

### ✅ 2.0 Backend Constants (DONE)
- Created `Backend/src/constants.js` with configurable values

### ✅ 2.1 Product Model - isKentProduct (DONE)
- Added `isKentProduct: { type: Boolean, default: false }` to product schema

### ⬜ 2.2 Kent Shipping Discount
- [ ] Apply ₹50 discount when cart has isKentProduct items
- [ ] Display "Kent Product Discount -₹50" in checkout
- [ ] Use configurable constant

### ⬜ 2.3 COD Charge
- [ ] Add ₹50 COD charge when payment method is "Cash on Delivery"
- [ ] Display "COD Charge ₹50" in order summary
- [ ] Use configurable constant

### ⬜ 2.4 Coupon System Enhancement
- [ ] Admin CRUD: Create, Edit, Delete, Enable/Disable coupons
- [ ] Backend validation for expiry, usage limit, min order, max discount
- [ ] Percentage and Flat discount support
- [ ] Dynamic management (no JSON files)

## Phase 3 — UNIVERSAL SEARCH

### ⬜ 3.1 Upgrade SearchBox
- [ ] Search Products, Doctors, Categories, Lab Tests, FAQs
- [ ] Debounced search (300ms)
- [ ] Live suggestions dropdown
- [ ] Keyboard navigation (arrow keys, Enter, Escape)
- [ ] Mobile responsive
- [ ] Highlight matched text
- [ ] Empty result state
- [ ] Loading indicator

## Phase 4 — UI POLISH

### ⬜ 4.1 Navbar Responsiveness
- [ ] Improve mobile menu
- [ ] Fix search bar sizing

### ⬜ 4.2 Mobile Filters
- [ ] Collapsible filter panel on Products page

### ⬜ 4.3 Accessibility
- [ ] Add aria-labels where missing
- [ ] Ensure keyboard navigation
- [ ] Focus management

### ⬜ 4.4 General Polish
- [ ] Consistent typography
- [ ] Button consistency
- [ ] Card consistency
- [ ] Proper spacing
- [ ] Remove inline styles where possible

## Phase 5 — FINAL VERIFICATION
- [ ] Authentication flows
- [ ] Cart operations
- [ ] Wishlist
- [ ] Coupons
- [ ] Orders
- [ ] Payment (Razorpay + COD)
- [ ] COD Charge
- [ ] Kent Discount
- [ ] Doctor Booking
- [ ] Medical Reports
- [ ] Dashboard
- [ ] Admin Panel
- [ ] Universal Search
- [ ] Build verification (0 errors)
