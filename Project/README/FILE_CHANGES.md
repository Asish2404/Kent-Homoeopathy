src/components/Navbar.jsx
- Added: Kent logo usage
- Modified: Wishlist redirect to send unauthenticated users to Login with message

src/Login/Login.jsx
- Modified: Reads `location.state.message` and displays it at top of the login card

src/ProductsCatalog.jsx
- Modified: Reads URL search params (`query`, `category`) on mount and applies only those filters while resetting others

src/Home/Home.jsx
- Modified: Category chips and product sliders now send `category` query param to `/Products` for category-specific View All

src/components/ProductCard.jsx
- Modified: Added event prevention on Add/Buy buttons to avoid anchor/submit default scrolling

src/components/Footer.jsx
- Modified: Replaced icon with `Kent.png` logo and updated address
src/components/SubscribeCard.jsx
- Added: New premium newsletter subscribe card used by Footer

src/components/Carousel.jsx
- Modified: Moved desktop carousel arrows further outside the hero content and hid mobile arrows to avoid overlapping hero content

src/Login/Login.jsx
- Modified: Initialize `email` / `rememberMe` and `status` from `localStorage`/`location.state` to avoid effect-based state updates (ESLint fix)

src/ProductsCatalog.jsx
- Modified: Added ESLint exception around URL-param effect to preserve URL-driven filter behavior while avoiding cascading renders

src/Profile/Profile.jsx
- Modified: Initialize `tab` from `location.state` to avoid setState-in-effect ESLint issue

src/ContactUS/Contact.jsx
- Modified: Updated address to provided address

src/Profile/Profile.jsx
- Modified: Updated stored addresses to reflect provided address
