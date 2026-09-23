# Complete Production Deployment Guide: Hostinger & MongoDB Atlas

This guide provides exact, step-by-step instructions for deploying this full-stack MERN platform (**Dr. Kent Homeopathy**) to **Hostinger** using **MongoDB Atlas**.

---

## 1. Target Architecture Overview

```
                      Internet / Browser
                              │
             ┌────────────────┴────────────────┐
             ▼                                 ▼
   https://mydomain.com              https://api.mydomain.com
     (React Frontend)                 (Node.js / Express Backend)
   Hosted on Hostinger               Hosted on Hostinger
   LiteSpeed / Apache (public_html)  Node.js App Manager (or VPS PM2)
             │                                 │
      SPA Routes Handled                       │  Mongoose ODM
      via .htaccess Rewrite                    ▼
                                       MongoDB Atlas Cluster
                                      (Database: Kent / ReplicaSet)
```

- **Frontend Domain**: `https://mydomain.com` (and `https://www.mydomain.com`)
- **Backend API Subdomain**: `https://api.mydomain.com` (API routes served under `/api/*`)
- **Database**: MongoDB Atlas Cloud Database

---

## 2. Step A: MongoDB Atlas Setup

### 1. Create Atlas Cluster
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. Create or select a Project (e.g. `Kent-Web`).
3. Deploy a Database Cluster (Shared M0 free tier or dedicated M10+). Choose the cloud provider region closest to your Hostinger server data center (e.g., Mumbai, India `ap-south-1` or Frankfurt `eu-central-1`).

### 2. Configure Database User
1. In Atlas left sidebar, go to **Security** > **Database Access**.
2. Click **Add New Database User**.
3. Authentication Method: **Password**.
4. Set a strong username (e.g. `kent_prod_user`).
5. Generate a strong, secure password (store it safely; avoid special characters like `@`, `:`, `/`, `?` or URL-encode them).
6. Under **Database User Privileges**, select **Read and write to any database** (or restrict specifically to the `Kent` database).
7. Click **Add User**.

### 3. Configure Network Access (IP Whitelist)
In Atlas left sidebar, navigate to **Security** > **Network Access**:

> [!IMPORTANT]
> **Hostinger IP Whitelist Policy:**
>
> **Option 1 (Recommended - Hostinger VPS or Dedicated IP):**
> If your Hostinger plan provides a static server outbound IP address (available on Hostinger VPS or Cloud Hosting with Dedicated IP), click **Add IP Address** > enter your Hostinger Server IP address (`xxx.xxx.xxx.xxx/32`) > Comment: `Hostinger Backend Server` > click **Confirm**.
>
> **Option 2 (Hostinger Shared / Cloud Hosting with Dynamic Outbound IP):**
> Hostinger shared web hosting clusters route outbound traffic through rotating internal gateway IPs. If connection attempts fail with `MongooseServerSelectionError`, you must add `0.0.0.0/0` (Allow Access from Anywhere):
> - **Security Implications of `0.0.0.0/0`**:
>   - Anyone who acquires your connection string could attempt to access your database over the Internet.
>   - **Mandatory Mitigations**:
>     1. Use a long, cryptographically random database password (24+ characters).
>     2. Never commit the Atlas connection string to Git or public repositories.
>     3. Restrict the database user privileges strictly to the `Kent` database.
>     4. Enable Atlas two-factor authentication (2FA) for your MongoDB account.

### 4. Obtain the Connection String
1. In Atlas, go to **Databases** > Click **Connect** on your cluster.
2. Select **Drivers** (Node.js, version 5.5 or later).
3. Copy the SRV connection URI:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxxx.mongodb.net/Kent?retryWrites=true&w=majority
   ```
4. Replace `<username>` and `<password>` with your database user credentials.
5. Ensure the database name `Kent` is specified before the query string (`?retryWrites=true...`).

---

## 3. Step B: Environment Variables Configuration

### 1. Frontend Environment Variables (`Project/`)
The frontend is built using Vite. Vite embeds variables starting with `VITE_` into client code at build time.

| Variable Name | Required | Example Production Value | Description |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | **Yes** | `https://api.mydomain.com` | Base URL of your backend API subdomain. The app automatically resolves endpoint paths under `/api`. |
| `VITE_RAZORPAY_KEY_ID` | Optional | `rzp_live_xxxxxxxxxxxxxx` | Razorpay public Key ID (if online payments are active). |

> [!WARNING]
> Vite embeds `VITE_*` variables into client-side JavaScript bundles. **NEVER** place server secrets, database credentials, or private API keys in frontend environment variables.

### 2. Backend Environment Variables (`Backend/`)
Configured in Hostinger Node.js Application Manager or in `Backend/.env`:

| Variable Name | Required | Example Production Value | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | **Yes** | `4000` (or assigned by Hostinger) | Port Express listens on. In Hostinger Node.js Manager, `process.env.PORT` is set automatically. |
| `NODE_ENV` | **Yes** | `production` | Enforces production mode and strict CORS origin checks. |
| `MONGODB_URI` | **Yes** | `mongodb+srv://user:pass@cluster.mongodb.net/Kent?retryWrites=true&w=majority` | MongoDB Atlas production connection string. |
| `JWT_SECRET` | **Yes** | `e1a49f80c6d7a2e8b54f9104c958434b9e28d8442` | Cryptographically random secret (32+ chars) for JWT authentication. |
| `FRONTEND_URL` | **Yes** | `https://mydomain.com,https://www.mydomain.com` | Comma-separated list of allowed frontend domains. Requests from any other origin are rejected. |
| `RAZORPAY_KEY_ID` | Optional | `rzp_live_xxxxxxxxxxxxxx` | Razorpay Key ID for order creation. |
| `RAZORPAY_KEY_SECRET`| Optional | `your_razorpay_secret` | Razorpay Key Secret for payment signature verification. |
| `COUPON_RESERVATION_TIMEOUT_MINUTES` | Optional | `15` | Cart reservation timeout in minutes (default: 15). |

---

## 4. Step C: Domain, Subdomain & DNS Configuration

In your domain registrar / Hostinger DNS Management:

### 1. Main Domain (Frontend)
- Point `mydomain.com` and `www.mydomain.com` to your Hostinger server IP:
  ```
  Type: A      Name: @       Points to: <Hostinger_Server_IP>    TTL: 14400
  Type: CNAME  Name: www     Points to: mydomain.com             TTL: 14400
  ```

### 2. API Subdomain (Backend)
1. In Hostinger hPanel, go to **Websites** > **Domains** > **Subdomains**.
2. Create subdomain:
   - Subdomain name: `api`
   - Custom folder: check "Custom folder for subdomain" and set to `domains/api.mydomain.com/public_html` (or default).
3. Ensure DNS record exists:
  ```
  Type: A      Name: api     Points to: <Hostinger_Server_IP>    TTL: 14400
  ```

### 3. Install SSL Certificates
1. In Hostinger hPanel, go to **Security** > **SSL**.
2. Install a free **Let's Encrypt SSL** certificate on `mydomain.com` (including `www`).
3. Install a free **Let's Encrypt SSL** certificate on `api.mydomain.com`.
4. Enable **Force HTTPS** on both domains.

---

## 5. Step D: Backend Deployment on Hostinger

Hostinger supports Node.js applications through two main methods:
- **Method 1: Hostinger hPanel Node.js Application Manager** (Cloud Hosting / Business Web Hosting with Node.js support)
- **Method 2: Hostinger VPS** (Ubuntu / Debian with PM2 + Nginx)

Follow the section below that matches your Hostinger plan.

---

### Method 1: Hostinger hPanel Node.js Application Manager

#### 1. Upload Backend Code
1. On your local machine, ensure you do **NOT** upload `node_modules` or local `.env`:
   - Files to upload from `Backend/`:
     - `src/` (all directories and files)
     - `index.js`
     - `package.json`
     - `package-lock.json`
2. You can compress these into a `.zip` file:
   ```bash
   cd Backend
   zip -r backend_deploy.zip src index.js package.json package-lock.json
   ```
3. In Hostinger hPanel, open **File Manager**.
4. Navigate to your application root directory (for example, `/home/u123456789/api` or `/domains/api.mydomain.com/public_html`).
5. Upload `backend_deploy.zip` and click **Extract**.

#### 2. Configure Node.js Application in hPanel
1. In hPanel, go to **Advanced** > **Node.js** (or search "Node.js").
2. Click **Create Application**:
   - **Node.js Version**: Select **20.x LTS** (or 22.x LTS).
   - **Application Mode**: **Production**.
   - **Application Root**: Enter the directory where backend files reside (e.g. `api` or `domains/api.mydomain.com/public_html`).
   - **Application Startup File**: `src/index.js` (or `index.js`).
   - **Application URL**: Select `https://api.mydomain.com`.
3. In the **Environment Variables** section of the Node.js manager, add:
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = `<your_atlas_connection_string>`
   - `JWT_SECRET` = `<your_jwt_secret>`
   - `FRONTEND_URL` = `https://mydomain.com,https://www.mydomain.com`
   - `PORT` = `4000` (or let Hostinger assign it)
   - `RAZORPAY_KEY_ID` = (optional)
   - `RAZORPAY_KEY_SECRET` = (optional)
4. Click **Create** / **Save**.

#### 3. Install Dependencies & Start
1. In the Node.js application card, click **Run NPM Install** (or use Hostinger's integrated SSH/terminal: `npm install --omit=dev`).
2. Click **Start** (or **Restart**).
3. Test your backend API in your browser or with cURL:
   ```bash
   curl https://api.mydomain.com/
   # Expected output: Backend Running

   curl https://api.mydomain.com/api/test
   # Expected output: {"message":"Frontend Connected Successfully"}
   ```

---

### Method 2: Hostinger VPS (Nginx + PM2)

If you are using a Hostinger Linux VPS:

#### 1. Setup Node.js on VPS
```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git

# Install PM2 process manager
sudo npm install -g pm2
```

#### 2. Deploy Backend Code
```bash
mkdir -p /var/www/kent-backend
# Upload your Backend files into /var/www/kent-backend

cd /var/www/kent-backend
npm install --omit=dev

# Create production .env
nano .env
# Paste your production variables:
# PORT=4000
# NODE_ENV=production
# MONGODB_URI=mongodb+srv://...
# JWT_SECRET=...
# FRONTEND_URL=https://mydomain.com,https://www.mydomain.com
```

#### 3. Start Backend with PM2
```bash
pm2 start src/index.js --name "kent-backend"
pm2 save
pm2 startup
```

#### 4. Configure Nginx Reverse Proxy for `api.mydomain.com`
Create `/etc/nginx/sites-available/api.mydomain.com`:
```nginx
server {
    server_name api.mydomain.com;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Enable site and install SSL with Certbot:
```bash
sudo ln -s /etc/nginx/sites-available/api.mydomain.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.mydomain.com
```

---

## 6. Step E: Frontend Build & Deployment

### 1. Build the Production Bundle Locally (or on CI)
1. Open terminal on your local machine in the `Project` folder:
   ```bash
   cd "/Users/asish/Desktop/Old laptop files/Kent web/Project"
   ```
2. Create or verify `.env` in `Project/`:
   ```bash
   # Set the production API URL pointing to your backend subdomain
   echo "VITE_API_URL=https://api.mydomain.com" > .env
   ```
3. Run the production build:
   ```bash
   npm run build
   ```
   Or from the root directory:
   ```bash
   npm run build:frontend
   ```
4. Verify the build output:
   - Check that `Project/dist/` contains:
     - `index.html`
     - `.htaccess` (copied automatically from `Project/public/.htaccess`)
     - `assets/` (bundled JS, CSS, images)
     - `favicon.svg`

### 2. Upload Frontend to Hostinger
1. In Hostinger hPanel, go to **File Manager**.
2. Select your main domain `mydomain.com`.
3. Open the `public_html` directory.
4. If there are default Hostinger placeholder files (e.g. `default.php`), delete them.
5. Upload all files and folders from `Project/dist/` directly into `public_html/`.
   - Result in `public_html/`:
     ```
     public_html/
     ├── .htaccess
     ├── index.html
     ├── favicon.svg
     ├── icons.svg
     ├── images/
     └── assets/
     ```
6. Ensure `.htaccess` is present in `public_html/`. (In hPanel File Manager, ensure "Show hidden files" is enabled if `.htaccess` is not immediately visible).

---

## 7. Step F: Verification & Testing

### 1. Verify Backend Health
Run from your local terminal:
```bash
# 1. Test basic connectivity
curl -I https://api.mydomain.com/

# 2. Test API endpoint
curl https://api.mydomain.com/api/test
# Expected: {"message":"Frontend Connected Successfully"}

# 3. Test CORS policy from allowed origin
curl -I -H "Origin: https://mydomain.com" https://api.mydomain.com/api/test
# Expected response headers:
# access-control-allow-origin: https://mydomain.com
# access-control-allow-credentials: true

# 4. Test CORS policy rejection from unauthorized origin
curl -I -H "Origin: https://unauthorized-domain.com" https://api.mydomain.com/api/test
# Expected: NO access-control-allow-origin header
```

### 2. Verify Frontend SPA Routing
1. Open `https://mydomain.com` in your browser.
2. Verify home page loads with styles and assets.
3. Navigate to `https://mydomain.com/login`.
4. **Hard refresh the browser (Ctrl+F5 or Cmd+Shift+R)**.
   - If `.htaccess` is working properly, the page reloads cleanly into `/login` without returning a 404 error.
5. Navigate to `https://mydomain.com/Products` and `https://mydomain.com/doctors`.
   - Verify product and doctor cards render.

### 3. Verify Full-Stack Data Flow & Auth
1. Log in with an admin or user account on `https://mydomain.com/login`.
2. Inspect browser Network tab:
   - Ensure the request targets `https://api.mydomain.com/api/auth/login`.
   - Verify status code `200 OK`.
   - Verify JWT token is received and stored in `localStorage`.
3. Browse products, add an item to the cart, and proceed to checkout.
4. Verify cart and address calls reach `https://api.mydomain.com/api/*` successfully.

---

## 8. Step G: How to Restart & Check Logs on Hostinger

### 1. Restart Backend on Hostinger
- **hPanel Node.js Manager**: Navigate to **Advanced** > **Node.js** > Click the **Restart** button next to your application.
- **VPS / PM2**: Run `pm2 restart kent-backend` or `pm2 reload kent-backend`.

### 2. View Backend Logs
- **hPanel Node.js Manager**: Click **Logs** on the Node.js application card to view real-time standard output and error output.
- **VPS / PM2**: Run `pm2 logs kent-backend --lines 100`.

---

## 9. Step H: Production Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **`MongooseServerSelectionError: Could not connect to any servers in your MongoDB Atlas cluster`** | Hostinger server IP is not whitelisted in Atlas Network Access. | Add Hostinger server IP to Atlas Network Access. If dynamic, add `0.0.0.0/0` with strong password and database-specific user privileges. |
| **`CORS blocked: Origin ... not permitted`** | Requesting domain does not match `FRONTEND_URL`. | Update `FRONTEND_URL` in Hostinger Node.js environment variables to include exact frontend origins: `https://mydomain.com,https://www.mydomain.com`. |
| **404 Not Found on page refresh (e.g. `/login`, `/Products`)** | Missing `.htaccess` rewrite rules in `public_html/`. | Ensure `Project/public/.htaccess` was uploaded to `public_html/.htaccess`. Verify `mod_rewrite` is active. |
| **500 Internal Server Error on API requests** | Missing environment variable (e.g. `JWT_SECRET` or `MONGODB_URI`). | Check Hostinger Node.js Application logs. Ensure all required variables from `Backend/.env.example` are populated in Hostinger settings. |
| **`Mixed Content: This request has been blocked; the content must be served over HTTPS`** | Frontend is on HTTPS but `VITE_API_URL` uses `http://` or vice versa. | Always set `VITE_API_URL=https://api.mydomain.com` with valid SSL on both domains. Rebuild frontend with `npm run build`. |
| **`Node.js application fails to start on Hostinger`** | Wrong startup file path or syntax error. | Ensure Startup file is set to `src/index.js` or `index.js`. Verify Node.js version is set to 20.x LTS. |
