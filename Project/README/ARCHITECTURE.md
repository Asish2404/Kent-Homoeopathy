Navbar -> Search -> Products Page
- `Navbar` captures search text and navigates to `/Products?query=...`.
- `ProductsCatalog` reads `location.search` on mount and applies `query` and `category` params while resetting other filters.

Home -> Category Chips -> Products Page
- `Home` category chips now navigate to `/Products?category={id}` so `ProductsCatalog` shows only that category.

ProductCard -> Cart Context
- `ProductCard` interacts with `CartContext` through `addToCart` and `toggleWishlist`.
- Add/Buy buttons now prevent default behavior to avoid scrolling or form submission side-effects.

Newsletter
- `SubscribeCard` component added and placed inside `Footer` for a premium, accessible subscription UI.

Carousel
- Carousel arrows moved outward on desktop and mobile arrows hidden to ensure hero content is never overlapped by controls. Mobile uses autoplay-only controls.

Rationale
- URL-driven filtering ensures deep-linking and a global search experience.
- Resetting non-specified filters keeps behavior predictable when opening category or query links from other pages.
