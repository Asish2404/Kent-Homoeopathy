# TODO - Coupon Management Module

## Completed
- [x] Created `Backend/src/models/couponUsage.model.js`
- [x] Created `Backend/src/controllers/coupon.controller.js`
- [x] Created `Backend/src/routes/coupon.routes.js`
- [x] Modified `Backend/src/app.js` to register `/api/coupons`

## Pending Verification
- [ ] Run backend compilation (e.g., `npm run dev` / `node` startup) to confirm no syntax errors
- [ ] Thunder Client manual API checks
  - [ ] Admin: POST `/api/coupons`
  - [ ] Admin: GET `/api/coupons` (pagination/search/sort/filters)
  - [ ] Admin: GET `/api/coupons/:couponId`
  - [ ] Admin: PATCH `/api/coupons/:couponId`
  - [ ] Admin: DELETE `/api/coupons/:couponId`
  - [ ] User: POST `/api/coupons/validate`
  - [ ] User: POST `/api/coupons/apply`
  - [ ] User: POST `/api/coupons/remove`

