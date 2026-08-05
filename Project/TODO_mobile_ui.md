# Mobile-First Layout + UI Clarity — Progress Tracker

## Status: IN PROGRESS

### Section 1: Mobile-first responsive layout + UI clarity ✅ COMPLETE (build passes)
- [x] `index.css` — base font-size 16px, tap-target helpers, mobile media queries
- [x] `ProductCard.jsx` — mobile width, whitespace, tap targets, hover/active states
- [x] `ProductSlider.jsx` — mobile padding/gap, arrows
- [x] `Home.jsx` — services strip, CTA banner, category chips mobile stacking
- [x] `Checkout.jsx` — mobile grid/stack fixes
- [x] `OffersPage.jsx` — mobile grid fixes
- [x] `Navbar.css` — verify mobile tap targets
- [x] `Cart.jsx` — item card mobile padding/image sizing (completed earlier)

### Section 2: Slider / Carousel improvements ✅ COMPLETE
- [x] `Carousel.jsx` — a11y roles/labels, pass active-index to slides, autoplay pause stays
- [x] `SlideCard.jsx` — eager-load only active slide, lazy others, fixed aspect-ratio (CLS), width/height attrs

### Section 3: Admin dashboard responsiveness
- [ ] `AdminLayout.jsx` — polish mobile drawer
- [ ] `Products.jsx` — responsive table/card layout + mobile modal
- [ ] `Orders.jsx` — responsive order layout
- [ ] `Dashboard.jsx` — responsive recent-orders table
- [ ] `OrderTable.jsx` — responsive stacked/card layout
- [ ] Other admin pages audit (Doctors/Customers/Inventory/Coupons/Reviews/Categories)

### Section 4: SEO improvements (hand-rolled Seo component)
- [ ] Create `Seo.jsx` (useEffect-based title/meta/OG updater)
- [ ] Apply Seo to Home, Products, Product detail, Offers, Cart, Checkout, Contact, Login
- [ ] Semantic HTML + one h1 per page + alt text fixes
- [ ] Add `public/sitemap.xml` and `public/robots.txt`
- [ ] Slug-based clean URLs (with _id fallback)

### Section 5: Performance / speed
- [ ] `App.jsx` — React.lazy + Suspense code-split admin routes
- [ ] `api.js` — lightweight in-memory GET cache (products/banners)
- [ ] Lazy-load images + width/height attrs audit
- [ ] Remove unused imports
