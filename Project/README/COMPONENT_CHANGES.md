Navbar
- Hooks Added: none
- Functions Modified: `handleWishlistOpen`, `handleSearch`
- Props Changed: none
- Why: To support global search and show login message when wishlist clicked by unauthenticated users

Login
- Hooks Added: `useLocation`
- States Added: none (uses existing `status` to show message)
- Functions Modified: `useEffect` to read `location.state.message`
- Why: Display "Please login to continue." when redirected from wishlist

ProductsCatalog
- Hooks Added: `useLocation`, `useEffect`
- States Modified: `query`, `activeCategory` initialized from URL
- Functions Added: Effect to read URLSearchParams and reset filters
- Why: Make search global and filter products automatically via URL

ProductCard
- Functions Modified: Add/Buy `onClick` handlers now `preventDefault()` and `stopPropagation()` before performing cart actions
- Why: Prevent page jumping/scrolling when buttons are inside interactive elements

Footer
- Props Changed: none
- Why: Replace logo with Kent.png and update address

SubscribeCard
- New Component: `SubscribeCard`
- Props: `onSubscribe` (optional callback)
- Why: Premium newsletter UI used in Footer (accessible, responsive, and visually distinct)
