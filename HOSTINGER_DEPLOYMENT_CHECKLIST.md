# Hostinger Production Deployment Checklist

Use this checklist to track your production deployment progress for **Dr. Kent Homeopathy**.

---

## Phase 1: Database Setup (MongoDB Atlas)

- [ ] **MongoDB Atlas Cluster Created**
  - Database cluster deployed in target region.
- [ ] **MongoDB Database User Configured**
  - Secure username and password created (24+ characters).
  - Privileges restricted to the `Kent` database.
- [ ] **MongoDB IP / Network Access Configured**
  - Hostinger server outbound IP added to Atlas IP Access list (or `0.0.0.0/0` if dynamic host IPs are used, with documented security mitigations).
- [ ] **Database Connection String Prepared**
  - Format: `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/Kent?retryWrites=true&w=majority`
  - Tested locally or via connection test.

---

## Phase 2: Domain, Subdomain & SSL Setup (Hostinger)

- [ ] **Main Domain Connected**
  - `mydomain.com` and `www.mydomain.com` DNS A records pointing to Hostinger server IP.
- [ ] **API Subdomain Created**
  - Subdomain `api.mydomain.com` created in Hostinger hPanel.
  - DNS A record for `api` pointing to Hostinger server IP.
- [ ] **SSL / TLS Enabled & Enforced**
  - Let's Encrypt SSL certificate issued for `mydomain.com` and `www.mydomain.com`.
  - Let's Encrypt SSL certificate issued for `api.mydomain.com`.
  - **Force HTTPS** toggle enabled for both domains.

---

## Phase 3: Backend Deployment (Hostinger Node.js Manager / VPS)

- [ ] **Backend Source Code Prepared**
  - Only `src/`, `index.js`, `package.json`, and `package-lock.json` prepared (excluding `node_modules` and local `.env`).
- [ ] **Backend Files Uploaded to Hostinger**
  - Files placed in application root (e.g., `api/` or `domains/api.mydomain.com/public_html`).
- [ ] **Hostinger Node.js Application Created**
  - Node.js version set to **20.x LTS** (or 22.x LTS).
  - Application mode set to **Production**.
  - Application root set to target directory.
  - Startup file set to `src/index.js` (or `index.js`).
- [ ] **Production Environment Variables Configured in Hostinger**
  - [ ] `PORT=4000` (or host assigned)
  - [ ] `NODE_ENV=production`
  - [ ] `MONGODB_URI=mongodb+srv://...`
  - [ ] `JWT_SECRET=your_production_secret_32_chars_min`
  - [ ] `FRONTEND_URL=https://mydomain.com,https://www.mydomain.com`
  - [ ] `RAZORPAY_KEY_ID=` (if applicable)
  - [ ] `RAZORPAY_KEY_SECRET=` (if applicable)
- [ ] **Dependencies Installed on Hostinger**
  - `npm install --omit=dev` executed cleanly in Hostinger console / button.
- [ ] **Backend Started & Health Verified**
  - Hostinger Node.js application status shows **RUNNING**.
  - `curl -I https://api.mydomain.com/` returns `200 OK` ("Backend Running").
  - `curl https://api.mydomain.com/api/test` returns `{"message":"Frontend Connected Successfully"}`.

---

## Phase 4: Frontend Build & Deployment

- [ ] **Production Environment File Configured**
  - `Project/.env` configured with `VITE_API_URL=https://api.mydomain.com`.
- [ ] **Frontend Production Build Executed**
  - `npm run build` executed in `Project/`.
  - Build finished with zero errors.
  - `Project/dist/` contains `index.html`, `assets/`, and `.htaccess`.
- [ ] **Frontend Files Uploaded to `public_html`**
  - All contents of `Project/dist/` uploaded into Hostinger `public_html/`.
  - Verified that `.htaccess` exists in `public_html/`.
- [ ] **React SPA Routing Verified**
  - Navigated to `https://mydomain.com/login` and refreshed page. No 404 error returned.
  - Navigated to `https://mydomain.com/Products` and refreshed page. No 404 error returned.

---

## Phase 5: Security & Verification

- [ ] **CORS Strict Policy Verified**
  - Allowed origin test: `curl -I -H "Origin: https://mydomain.com" https://api.mydomain.com/api/test` returns `access-control-allow-origin: https://mydomain.com`.
  - Blocked origin test: `curl -I -H "Origin: https://unauthorized-site.com" https://api.mydomain.com/api/test` does NOT return allow header.
- [ ] **No Localhost URLs Remaining in Production**
  - Frontend bundle requests only `https://api.mydomain.com`.
  - No hardcoded `localhost:4000` or `localhost:5174` in client-side production network traffic.
- [ ] **No Secrets Exposed in Source Code or Git**
  - `.gitignore` ignores `.env` and `.env.*`.
  - No database passwords or JWT secrets committed.
- [ ] **Login & Authentication Verified**
  - User and admin login tested on production website.
  - JWT token saved to `localStorage` and sent with requests via `Authorization: Bearer <token>`.
- [ ] **Database Operations Verified Live**
  - Products catalog rendered from MongoDB Atlas.
  - Cart operations and order placement flow tested end-to-end.
- [ ] **Final Production Test Completed**
  - Entire user journey (Home -> Products -> Details -> Cart -> Checkout -> Tracking) confirmed live.
