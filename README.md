# 1Board

A web app to help me visualize my holdings on Coin (Zerodha MF).
This is a test.

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

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Zerodha Kite Connect API credentials

## 🚀 Quick Start

### 1. Get Zerodha API Credentials

1. Visit https://developers.kite.trade/
2. Create a new app
3. Note down your **API Key** and **API Secret**
4. Set redirect URL to `http://localhost:3000/callback` (for development)

### 2. Database Setup

```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres psql
postgres=# CREATE DATABASE zerodha_mf_dashboard;
postgres=# CREATE USER your_user WITH PASSWORD 'your_password';
postgres=# GRANT ALL PRIVILEGES ON DATABASE zerodha_mf_dashboard TO your_user;
postgres=# \q
```

### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

**Configure `.env`:**

```env
KITE_API_KEY=your_api_key_here
KITE_API_SECRET=your_api_secret_here
KITE_ACCESS_TOKEN=  # Leave empty for now

DB_HOST=localhost
DB_PORT=5432
DB_NAME=zerodha_mf_dashboard
DB_USER=your_user
DB_PASSWORD=your_password

PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

FETCH_SCHEDULE=30 12 * * *  # 6 PM IST daily
```

### 4. Get Access Token (First Time Only)

```bash
# Start the backend server
npm run dev

# In another terminal, get the login URL
curl http://localhost:5000/api/auth/login-url

# Open the returned URL in browser
# Login with your Zerodha credentials
# After authorization, you'll be redirected with a request_token

# Exchange request_token for access_token
curl -X POST http://localhost:5000/api/auth/session \
  -H "Content-Type: application/json" \
  -d '{"request_token": "YOUR_REQUEST_TOKEN"}'

# Copy the returned access_token and add it to .env
# KITE_ACCESS_TOKEN=your_access_token_here
```

**Important**: Access tokens are valid for the entire trading day. You'll need to regenerate it when it expires.

### 5. Initial Data Fetch

```bash
# Fetch data manually for the first time
npm run scheduler -- --once
```

### 6. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 7. Access Dashboard

Open your browser and visit: http://localhost:3000

## 📁 Project Structure

```
zerodha-mf-dashboard/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # Database configuration
│   │   ├── services/
│   │   │   ├── kiteService.js       # Zerodha API integration
│   │   │   └── analyticsService.js  # Portfolio analytics
│   │   ├── jobs/
│   │   │   └── dataFetcher.js       # Scheduled data sync
│   │   ├── routes/
│   │   │   └── api.js               # API routes
│   │   ├── models/
│   │   │   └── Holdings.js          # Database model
│   │   └── server.js                # Express server
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   │   └── api.js               # API client
│   │   ├── App.jsx                  # Main dashboard
│   │   ├── App.css                  # Styles
│   │   └── index.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🔧 API Endpoints

### Authentication

- `GET /api/auth/login-url` - Get Kite login URL
- `POST /api/auth/session` - Generate access token
- `GET /api/auth/validate` - Validate session
- `GET /api/auth/profile` - Get user profile

### Portfolio

- `GET /api/portfolio/summary` - Portfolio summary
- `GET /api/portfolio/holdings` - All holdings
- `GET /api/portfolio/allocation` - Portfolio allocation
- `GET /api/portfolio/performance?days=30` - Historical performance
- `GET /api/portfolio/top-performers?limit=5` - Top performers
- `GET /api/portfolio/bottom-performers?limit=5` - Bottom performers

### Sync

- `POST /api/sync/fetch-now` - Manual data sync

## ⏰ Scheduled Jobs

The data fetcher runs automatically based on the cron schedule in `.env`:

```bash
# Start the scheduler (runs continuously)
npm run scheduler

# Run once and exit
npm run scheduler -- --once
```

**Default Schedule**: Daily at 6 PM IST (12:30 UTC)

To change schedule, edit `FETCH_SCHEDULE` in `.env`:

```
# Format: minute hour day month weekday
30 12 * * *      # Daily at 6 PM IST
0 9 * * 1-5      # Weekdays at 2:30 PM IST
0 0 * * *        # Daily at midnight
*/30 * * * *     # Every 30 minutes
```

## 🚀 Production Deployment

### Backend Deployment (Example: Ubuntu Server)

```bash
# Install PM2 for process management
npm install -g pm2

# Start backend server
cd backend
pm2 start src/server.js --name zerodha-backend

# Start scheduler
pm2 start src/jobs/dataFetcher.js --name zerodha-scheduler

# Setup PM2 to start on system boot
pm2 startup
pm2 save
```

### Frontend Deployment

```bash
# Build for production
cd frontend
npm run build

# Serve with nginx or any static file server
# The build output will be in the 'dist' folder
```

### Nginx Configuration Example

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔐 Security Best Practices

1. **Never commit `.env` file** - Add it to `.gitignore`
2. **Use environment variables** for all secrets
3. **Enable HTTPS** in production
4. **Restrict CORS** to your frontend domain only
5. **Use strong database passwords**
6. **Keep dependencies updated** - Run `npm audit` regularly
7. **Regenerate access token** when needed (expires daily)

## 🐛 Troubleshooting

### Database Connection Failed

- Ensure PostgreSQL is running: `sudo systemctl status postgresql`
- Check database credentials in `.env`
- Verify database exists: `psql -U your_user -d zerodha_mf_dashboard`

### Invalid Access Token

- Access tokens expire daily
- Regenerate using the `/api/auth/login-url` and `/api/auth/session` flow
- Update `KITE_ACCESS_TOKEN` in `.env`

### No Data Showing

- Run manual sync: `npm run scheduler -- --once`
- Check backend logs for errors
- Verify you have MF holdings in your Zerodha account

### CORS Errors

- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check browser console for specific CORS errors

## 📊 Database Schema

```sql
CREATE TABLE holdings (
    id SERIAL PRIMARY KEY,
    tradingsymbol VARCHAR(255) NOT NULL,
    folio VARCHAR(255),
    fund VARCHAR(255) NOT NULL,
    quantity DECIMAL(15,3) NOT NULL,
    average_price DECIMAL(15,2) NOT NULL,
    last_price DECIMAL(15,2) NOT NULL,
    last_price_date DATE,
    pnl DECIMAL(15,2) NOT NULL,
    invested_value DECIMAL(15,2) NOT NULL,
    current_value DECIMAL(15,2) NOT NULL,
    return_percentage DECIMAL(8,2) NOT NULL,
    fetch_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tradingsymbol ON holdings(tradingsymbol);
CREATE INDEX idx_fetch_date ON holdings(fetch_date);
```

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📝 License

This project is for personal use only. Ensure compliance with Zerodha's API terms of service.

## 📧 Support

For Zerodha API issues: https://kite.trade/forum/
For technical issues: Create an issue in this repository

## ⚠️ Disclaimer

This is an unofficial application and is not affiliated with Zerodha. Use at your own risk. Always verify data with official Zerodha platforms.

## 🎯 Future Enhancements

- [ ] Add authentication for dashboard
- [ ] Email/SMS alerts for significant portfolio changes
- [ ] Export data to Excel/PDF
- [ ] SIP tracking and projection
- [ ] Category-wise analysis (Equity/Debt/Hybrid)
- [ ] XIRR calculation
- [ ] Multi-user support
- [ ] Mobile app (React Native)

---

Made with ❤️ for better portfolio management
