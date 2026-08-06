# Mobile Responsiveness Fix - Task Tracker

## Plan (approved)
1. **Navbar** - Restructure mobile row [LOGO][SEARCH flex-1][icons]; slide-in drawer `min(82vw,320px)` + backdrop + body scroll-lock.
2. **Hero (SlideCard.jsx)** - Fix fixed `h-[78vh]` blank space; responsive height + min-height.
3. **Products filter drawer (ProductsCatalog.jsx)** - Mobile off-canvas/bottom-sheet with all filters + Clear All / Apply. Desktop sidebar unchanged.
4. **Doctor cards (Consult.jsx)** - Remove `auto-rows-fr` / `h-full`; `aspect-[4/3]` images; `h-auto` on mobile.
5. **Contact page (Contact.jsx)** - Show info cards on mobile (stack), remove overlap.
6. **Admin drawer (AdminLayout.jsx)** - `w-80` → `min(82vw,320px)`.
7. **Build verification** - `npm run build`.

## Status
- [x] Navbar
- [x] Hero (SlideCard)
- [x] Products filter drawer
- [x] Doctor cards
- [x] Contact info cards
- [x] Admin drawer
- [x] Build verification (`npm run build` succeeded)
