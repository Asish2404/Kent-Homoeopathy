# TODO - Notification Management Module

## Step 1: Model completion
- [x] Update `Backend/src/models/notification.model.js` to include required `notificationType` values:
  - `Medical Report`
  - `General Announcement`


## Step 2: Utility layer
- [x] Create `Backend/src/utils/notification.utils.js`

- [x] Common create notification helper (in-app)

  - [x] Read / mark all read / soft delete helpers

  - [x] Query builder for GET filters (type/priority/read/unread)

  - [x] Reusable auto-notification helper methods


## Step 3: Controller layer
- [ ] Create `Backend/src/controllers/notification.controller.js`
  - [x] Admin: `POST /api/notifications`

  - [x] User: `GET /api/notifications` (pagination + filters)

  - [x] User: `GET /api/notifications/:notificationId`

  - [x] User: `PATCH /api/notifications/:notificationId/read`

  - [x] User: `PATCH /api/notifications/read-all`

  - [x] Owner/Admin: `DELETE /api/notifications/:notificationId` (soft delete)


## Step 4: Routes
- [x] Create `Backend/src/routes/notification.routes.js`
  - [x] Apply `verifyJWT` and `isAdmin`



## Step 5: App mounting
- [x] Modify `Backend/src/app.js` to mount notification routes at `/api/notifications`


## Step 6: Verification
- [ ] `npm run dev` compiles successfully
- [ ] Thunder Client smoke tests for all endpoints
- [ ] Confirm completed modules untouched

