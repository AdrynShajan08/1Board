#!/bin/bash

echo "================================================"
echo "                 1Board
echo "  Coin MF Dashboard - Setup Script"
echo "================================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✓ Node.js found:${NC} $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm found:${NC} $(npm --version)"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠ PostgreSQL not found${NC}"
    echo "Please install PostgreSQL:"
    echo "  Ubuntu/Debian: sudo apt install postgresql"
    echo "  macOS: brew install postgresql"
else
    echo -e "${GREEN}✓ PostgreSQL found${NC}"
fi

echo ""
echo "Step 1: Installing backend dependencies..."
cd backend
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install backend dependencies${NC}"
    exit 1
fi

echo ""
echo "Step 2: Setting up environment file..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env file${NC}"
    echo -e "${YELLOW}⚠ Please edit backend/.env with your credentials${NC}"
else
    echo -e "${YELLOW}⚠ .env already exists, skipping${NC}"
fi

cd ..

echo ""
echo "Step 3: Installing frontend dependencies..."
cd frontend
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install frontend dependencies${NC}"
    exit 1
fi

cd ..

echo ""
echo "================================================"
echo -e "${GREEN}✓ Setup completed successfully!${NC}"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your Zerodha API credentials"
echo "2. Setup PostgreSQL database:"
echo "   sudo -u postgres psql"
echo "   CREATE DATABASE zerodha_mf_dashboard;"
echo "   CREATE USER your_user WITH PASSWORD 'your_password';"
echo "   GRANT ALL PRIVILEGES ON DATABASE zerodha_mf_dashboard TO your_user;"
echo ""
echo "3. Get access token:"
echo "   cd backend && npm run dev"
echo "   curl http://localhost:5000/api/auth/login-url"
echo "   # Follow authentication flow"
echo ""
echo "4. Fetch initial data:"
echo "   cd backend && npm run scheduler -- --once"
echo ""
echo "5. Start the application:"
echo "   Terminal 1: cd backend && npm run dev"
echo "   Terminal 2: cd frontend && npm run dev"
echo ""
echo "6. Open http://localhost:3000 in your browser"
echo ""
echo "For detailed instructions, see README.md"
echo "================================================"