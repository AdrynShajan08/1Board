# 1Board

An app to help me visualize my holdings on Coin (Zerodha MF).
This is a test.

# Zerodha Mutual Fund Dashboard

A comprehensive web application to automatically fetch, track, and visualize your mutual fund holdings from Zerodha with detailed analytics and performance metrics.

## 🌟 Features

- **Automated Data Sync**: Schedule daily updates of your MF holdings
- **Portfolio Summary**: Total invested, current value, P&L, and returns
- **Visual Analytics**:
  - Portfolio allocation pie chart
  - Historical performance line chart
  - Top & bottom performers bar charts
- **Detailed Holdings**: Complete table with all fund details
- **Manual Sync**: On-demand data refresh
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Free Deployment**: Deploy on Render + Vercel at zero cost

## 📋 Prerequisites

- Node.js (v16 or higher)
- Zerodha Kite Connect API credentials
- GitHub account (for deployment)

## 🚀 Quick Start (Local Development)

### 1. Get Zerodha API Credentials

1. Visit https://developers.kite.trade/
2. Create a new app
3. Note down your **API Key** and **API Secret**
4. Set redirect URL to `http://localhost:3000/callback`

### 2. Clone/Download the Project

```bash
git clone <your-repo-url>
cd zerodha-mf-dashboard
```

### 3. Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
```

**Edit `backend/.env`:**

```env
KITE_API_KEY=your_api_key_here
KITE_API_SECRET=your_api_secret_here
KITE_ACCESS_TOKEN=  # Leave empty for now

# For local PostgreSQL:
DB_HOST=localhost
DB_PORT=5432
DB_NAME=zerodha_mf_dashboard
DB_USER=postgres
DB_PASSWORD=your_password

PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
FETCH_SCHEDULE=30 12 * * *
```

### 4. Setup PostgreSQL (Windows)

**Option A: Install PostgreSQL**

1. Download from https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember the password you set for postgres user

**Option B: Use Docker**

```bash
docker run --name zerodha-postgres -e POSTGRES_PASSWORD=yourpassword -p 5432:5432 -d postgres
```

**Create Database:**

```bash
# Using psql command line
psql -U postgres
postgres=# CREATE DATABASE zerodha_mf_dashboard;
postgres=# \q
```

### 5. Get Access Token

```bash
# Start backend
cd backend
npm run dev

# In another terminal/browser:
# Visit: http://localhost:5000/api/auth/login-url
# Copy the login URL and open in browser
# After login, you'll get a request_token in the redirect URL

# Use Postman or curl:
curl -X POST http://localhost:5000/api/auth/session \
  -H "Content-Type: application/json" \
  -d "{\"request_token\": \"YOUR_REQUEST_TOKEN\"}"

# Copy the access_token and add to backend/.env:
# KITE_ACCESS_TOKEN=your_access_token_here

# Restart backend server
```

### 6. Fetch Initial Data

```bash
cd backend
npm run scheduler -- --once
```

### 7. Frontend Setup

```bash
cd frontend
npm install

# Create .env file
cp .env.example .env
```

**Edit `frontend/.env`:**

```env
VITE_API_URL=http://localhost:5000/api
```

**Start Frontend:**

```bash
npm run dev
```

### 8. Access Dashboard

Open: http://localhost:3000

## 🌐 Free Deployment (Production)

Deploy both backend and frontend for **FREE** using Render and Vercel.

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/zerodha-mf-dashboard.git
git push -u origin main
```

### Step 2: Deploy Database on Render

1. Go to https://render.com and sign up
2. Click **New +** → **PostgreSQL**
3. Settings:
   - Name: `zerodha-mf-db`
   - Database: `zerodha_mf_dashboard`
   - User: `zerodha_user`
   - Region: `Singapore` (or closest to you)
   - Plan: **Free**
4. Click **Create Database**
5. **Copy the Internal Database URL** (starts with `postgresql://`)

### Step 3: Deploy Backend on Render

1. Click **New +** → **Web Service**
2. Connect your GitHub repository
3. Settings:
   - Name: `zerodha-mf-backend`
   - Region: `Singapore`
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `node src/server.js`
   - Plan: **Free**
4. **Environment Variables** - Add these:
   ```
   NODE_ENV=production
   DATABASE_URL=<paste_internal_database_url_from_step2>
   KITE_API_KEY=your_api_key
   KITE_API_SECRET=your_api_secret
   KITE_ACCESS_TOKEN=your_access_token
   FRONTEND_URL=https://your-app.vercel.app
   FETCH_SCHEDULE=30 12 * * *
   PORT=5000
   ```
5. Click **Create Web Service**
6. **Copy your backend URL** (e.g., `https://zerodha-mf-backend.onrender.com`)

### Step 4: Deploy Scheduler on Render

1. Click **New +** → **Web Service**
2. Connect same GitHub repository
3. Settings:
   - Name: `zerodha-mf-scheduler`
   - Region: `Singapore`
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `node src/jobs/dataFetcher.js`
   - Plan: **Free**
4. **Environment Variables** - Same as backend
5. Click **Create Web Service**

### Step 5: Deploy Frontend on Vercel

1. Go to https://vercel.com and sign up
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Settings:
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **Environment Variables**:
   ```
   VITE_API_URL=https://zerodha-mf-backend.onrender.com/api
   ```
6. Click **Deploy**
7. **Copy your frontend URL** (e.g., `https://your-app.vercel.app`)

### Step 6: Update Backend CORS

1. Go back to Render → Your backend service
2. Update `FRONTEND_URL` environment variable:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
3. Backend will auto-redeploy

### Step 7: Initial Data Fetch

Since scheduler runs as a separate service, it will fetch data according to the schedule. To fetch immediately:

1. Use your backend API:

   ```bash
   curl -X POST https://zerodha-mf-backend.onrender.com/api/sync/fetch-now
   ```

2. Or use the "Sync Now" button in the frontend dashboard

## ⚠️ Important Notes for Free Tier

1. **Render Free Tier Limitations**:
   - Services spin down after 15 minutes of inactivity
   - First request after spin-down takes ~30 seconds
   - 750 hours/month (enough for 1 service running 24/7)
2. **Access Token Expiry**:
   - Zerodha access tokens expire daily
   - You need to regenerate and update on Render manually
   - Or implement auto-refresh (advanced)

3. **Database**:
   - Free PostgreSQL has 1GB storage limit
   - More than enough for MF holdings data

4. **Scheduler**:
   - Runs continuously on free tier
   - Fetches data daily at scheduled time

## 📁 Project Structure

```
zerodha-mf-dashboard/
├── backend/
│   ├── src/
│   │   ├── config/database.js
│   │   ├── services/
│   │   │   ├── kiteService.js
│   │   │   └── analyticsService.js
│   │   ├── jobs/dataFetcher.js
│   │   ├── routes/api.js
│   │   ├── models/Holdings.js
│   │   └── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── services/api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── vercel.json
│   └── .env
├── render.yaml
└── README.md
```

## 🔧 API Endpoints

- `GET /api/health` - Health check
- `GET /api/auth/login-url` - Get Kite login URL
- `POST /api/auth/session` - Generate access token
- `GET /api/portfolio/summary` - Portfolio summary
- `GET /api/portfolio/holdings` - All holdings
- `GET /api/portfolio/allocation` - Portfolio allocation
- `GET /api/portfolio/performance?days=30` - Performance
- `POST /api/sync/fetch-now` - Manual sync

## 🐛 Troubleshooting

### Backend not responding on Render

- First request takes ~30s (cold start on free tier)
- Check logs in Render dashboard

### Access Token Expired

1. Get new token locally
2. Update on Render dashboard
3. Restart service

### Database connection issues

- Verify DATABASE_URL is correct
- Check if database service is running

### Frontend can't connect to backend

- Verify VITE_API_URL in Vercel
- Check CORS settings (FRONTEND_URL in backend)

## 💰 Cost Breakdown

| Service     | Provider | Cost         |
| ----------- | -------- | ------------ |
| Backend API | Render   | **FREE**     |
| Scheduler   | Render   | **FREE**     |
| Database    | Render   | **FREE**     |
| Frontend    | Vercel   | **FREE**     |
| **Total**   |          | **$0/month** |

## 🎯 Future Enhancements

- [ ] Auto-refresh access token
- [ ] Email alerts for portfolio changes
- [ ] Export to Excel/PDF
- [ ] SIP tracking
- [ ] XIRR calculation
- [ ] Mobile app

## 📝 License

For personal use only. Comply with Zerodha's API terms.

## ⚠️ Disclaimer

Unofficial application, not affiliated with Zerodha. Use at your own risk.

---

Made with ❤️ for better portfolio management
