# Homepage Redesign (Healthmug-style) — Implementation Tracker

## Architecture note
Repo uses MongoDB/Express backend + axios + localStorage cart/wishlist. Supabase references
in the spec are mapped to Mongo collections/routes and config-driven data layer.

## Steps
- [x] 0. Explore repo, confirm architecture, verify tag/category/brand taxonomy
- [x] 1. Create `src/data/homepage.js` (categories, healthConcerns, brands, homeServices, promoBanners)
- [x] 2. Create `src/components/HomeServiceStrip.jsx`
- [x] 3. Create `src/components/CategoryTile.jsx` + `ConcernTile.jsx`
- [x] 4. Create `src/components/BrandLogoStrip.jsx`
- [x] 5. Create `src/components/PromoBannerCarousel.jsx`
- [x] 6. Rewrite compact variant in `src/components/ProductCard.jsx` (qty stepper, size label, desktop labels)
- [x] 7. Update `src/components/ProductSlider.jsx` (desktop grid + compact + tightened spacing)
- [x] 8. Rewrite `src/components/Footer.jsx` (wider container, consistent padding)
- [x] 9. Rewrite `src/Home/Home.jsx` (new sections, wider container, tight spacing, loading/empty states)
- [x] 10. Add Mongo banner route + controller, register in app.js; fetch in PromoBannerCarousel with fallback
- [x] 11. Verify build (`npm run build`) and fix errors
