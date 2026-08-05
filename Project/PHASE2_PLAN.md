# Phase 2: Site-Wide Visual Polish + Approved Cleanup

This plan is built on the reviewed Phase 1 audit. It lists exactly which files will be
touched, what will change, and the approved removals. Phase 2 is VISUAL/UX POLISH ONLY —
no core functionality, routes, or data logic changes.

---

## A. APPROVED CLEANUP (from Phase 1 review)

| # | File | Change | Type |
|---|------|--------|------|
| A1 | `src/ProductDescription/Products.jsx` | Remove non-functional **Compare** button (empty handler) | Remove |
| A2 | `src/ProductDescription/Products.jsx` | Remove **"Helpful (N)"** button (no handler) | Remove |
| A3 | `src/ProductDescription/Products.jsx` | Remove **"Load More Reviews"** button (no pagination) | Remove |
| A4 | `src/Cart/Cart.jsx` | Remove **commented-out address block** + unused `pincode`/`addrOpen` state | Remove |
| A5 | `src/Profile/Profile.jsx` | Remove **`_ADDRESSES_PLACEHOLDER`** const | Remove |
| A6 | `src/Profile/PlaceholderContent.jsx` | Remove orphaned file | Remove |
| A7 | `src/components/EmptyState.jsx` | Remove **`TableEmptyState`** dead export | Remove |

## B. BEHAVIOR FIXES (keep element, fix honesty)

| # | File | Change | Type |
|---|------|--------|------|
| B1 | `src/ContactUS/Contact.jsx` | **DONE** — Contact form wired to NEW backend endpoint `POST /api/contact`. Added loading/success/error states. Backend: `contact.controller.js`, `contact.routes.js`, `email.utils.js`, registered in `app.js`. Saves to MongoDB `Contact` collection + optional email. | Fix |
| B2 | `src/pages/Payment.jsx` | **Net Banking** option: show as disabled/greyed with "Coming soon" instead of interactive-but-dead branch | Fix |
| B3 | `src/ProductDescription/Products.jsx` | **"Write a Review"** button: disabled state with "coming soon" tooltip | Fix |
| B4 | `src/ProductDescription/Products.jsx` | **Product-detail CTAs** (Free Consultation / Call Now): wire `Free Consultation` → `/Consult`, `Call Now` → `tel:` | Fix |
| B5 | `src/ProductDescription/Products.jsx` | **Consolidate** tabs + expandable sections: keep TABS, remove redundant expandable `Section` accordion panels | Fix |

## C. SITE-WIDE VISUAL POLISH

### C1. Color & Brand Consistency
- Confirm brand = `--brand-500/600/700` green (from `theme.js`/`index.css`). Use ONLY these
  + one neutral accent for badges/CTAs everywhere.
- Audit all primary CTA buttons ("Add to Cart", "Buy Now", "Proceed to Checkout", "Place
  Order") to a single consistent style: same color, radius, size, hover state.
  - Fix: `Cart.jsx`, `Checkout.jsx`, `Payment.jsx` currently use inline
    `linear-gradient(135deg,#16a34a,#059669)` + `rounded-2xl` — NOT the `.btn-primary`
    class. Consolidate to `.btn-primary` for consistency.

### C2. Card & Component Consistency
- One unified product card design. `ProductCard.jsx` is the shared card for Home sliders,
  Offers, Search (via ProductsCatalog), Combo, Related, Recently Viewed.
- **Flag:** `ProductsCatalog.jsx` uses a **different inline row-card layout** (horizontal
  list card) instead of `ProductCard`. Consolidating this risks changing the listing UX.
  → I will flag this and NOT force-merge it; instead I'll align its styling tokens
  (radius, shadow, price font size, button style) to match ProductCard.

### C3. Hero / Banner
- Homepage hero (`Carousel`/`SlideCard`) already has strong overlay + contrast. Mobile
  legibility: verify headline sizes on small screens, ensure one CTA focus.
- `OffersSection` / `OffersPage`: ensure consistent premium banner treatment.

### C4. Trust & Clarity
- Ensure price, discount %, savings amount consistently positioned on product cards.
- `ProductCard` already shows price + oldPrice + discount badge. Add consistent
  "In Stock"/"Only X left" indicator where data supports it (do NOT fabricate).
- Category nav + search already in Navbar (desktop + mobile) + Products sidebar.

### C5. Micro-interactions
- Consistent hover/press on cards + buttons via `.card-lift` + `.btn-primary` hover.
- **One signature animated moment** on homepage (hero carousel autoplay). Keep others calm.

### C6. Empty / Error States
- Cart-empty, search-no-results, offers-empty already have messages + next actions.
- Audit ProductsCatalog empty/error states; ensure a clear "Browse Products" next action.

---

## FILES TOUCHED (final list)

**Product detail**
- `src/ProductDescription/Products.jsx` (cleanup A1-A3, fixes B3-B5, polish C1)

**Cart / Checkout / Payment**
- `src/Cart/Cart.jsx` (cleanup A4, polish C1)
- `src/pages/Checkout.jsx` (polish C1)
- `src/pages/Payment.jsx` (fix B2, polish C1)

**Contact**
- `src/ContactUS/Contact.jsx` (fix B1, polish C1)

**Profile**
- `src/Profile/Profile.jsx` (cleanup A5)
- `src/Profile/PlaceholderContent.jsx` (delete, A6)

**Components**
- `src/components/EmptyState.jsx` (cleanup A7)
- `src/components/ProductCard.jsx` (polish C2/C4/C5)
- `src/components/ProductSlider.jsx` (polish C2 as needed)
- `src/components/Footer.jsx` (polish C1 — align CTA/trust strip)

**Home / Offers**
- `src/Home/Home.jsx` (polish C3/C5)
- `src/components/OffersSection.jsx` (polish C3)
- `src/pages/OffersPage.jsx` (polish C3/C6)

**Listing**
- `src/ProductsCatalog.jsx` (polish C2 tokens + C6 empty states)

**Theme**
- `src/index.css` (add any shared utility classes needed for consistency)

---

## NOT TOUCHED (intentionally kept)
- `src/admin/routes/adminRoutes.js` (recent WIP, keep)
- `src/data/doctors.json`, `src/data/labtests.json` (recent, keep)
- `src/data/Doctor.js`, `src/data/TimingSlots.js` (consultation data, keep)
- Footer `href="#"` links (legal/trust relevant — left for you to wire separately)
- Contact `href="#"` socials/Privacy (same)

## FOLLOW-UP
- Run `npm run build` / `npm run dev` to verify build passes after changes.
- Review each page section-by-section.
