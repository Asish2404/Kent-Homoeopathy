Update 01 2026-07-06
Files Modified:
- src/components/Navbar.jsx
- src/Login/Login.jsx
- src/ProductsCatalog.jsx
- src/Home/Home.jsx
- src/components/ProductCard.jsx
- src/components/Footer.jsx
- src/ContactUS/Contact.jsx
- src/Profile/Profile.jsx
 - src/components/SubscribeCard.jsx (new)
 - src/components/Carousel.jsx (arrow repositioning)
 - src/components/Footer.jsx (newsletter now uses `SubscribeCard`)
 - src/Login/Login.jsx (ESLint state initialization fix)
 - src/ProductsCatalog.jsx (ESLint handling for URL-driven filters)
 - src/Profile/Profile.jsx (initialize `tab` from `location.state`)

Reason:
- Implemented global search handling, category-specific view-all routes, wishlist redirect message, add-to-cart behavior fixes, branding and address updates.

Features Added:
- Global search redirect from navbar to `/Products?query=`.
- Category-specific View All buttons that pass `category` query param.
- Login displays redirect messages (e.g., "Please login to continue.").
- Add-to-cart buttons prevent default to avoid accidental scrolling.

Bugs Fixed:
- Fixed Add To Cart unexpected scroll to footer.
- Fixed wishlist redirect behavior for unauthenticated users.

Notes:
- More improvements planned: hero arrow repositioning, newsletter redesign, mobile header spacing, accessibility checks.
Notes:
- Hero arrows moved to avoid overlap; mobile uses autoplay-only controls.
- Newsletter redesigned: new `SubscribeCard` component added and wired into the Footer.
- Fixed several ESLint issues related to state initialization to improve developer DX.