#!/bin/bash

# CyberShield Security Monitor - Deployment Fix Script
# This script helps deploy your Supabase backend and GitHub Pages frontend

set -e

echo "🔐 CyberShield Security Monitor - Deployment Fix"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Check if in correct directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Are you in the project root?${NC}"
    exit 1
fi

echo -e "${BLUE}Step 1: Checking Supabase setup...${NC}"
echo "Your Supabase URL: https://pfrfeebtiktnfgdeoqvl.supabase.co"
echo ""

# Step 2: Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}Step 2: Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi
echo ""

# Step 3: Configure Supabase
echo -e "${BLUE}Step 3: Supabase Configuration${NC}"
echo -e "${YELLOW}IMPORTANT: You need your Supabase credentials!${NC}"
echo ""
echo "To find your credentials:"
echo "1. Go to: https://app.supabase.com"
echo "2. Select your project"
echo "3. Click Settings → API"
echo "4. Copy the 'anon' key"
echo ""

read -p "Enter your Supabase ANON key: " ANON_KEY

if [ -z "$ANON_KEY" ]; then
    echo -e "${RED}❌ Anon key is required!${NC}"
    exit 1
fi

# Step 4: Create local env file for testing
echo -e "${BLUE}Step 4: Creating local environment file...${NC}"
cat > .env.local << EOF
VITE_SUPABASE_URL=https://pfrfeebtiktnfgdeoqvl.supabase.co
VITE_SUPABASE_ANON_KEY=$ANON_KEY
VITE_SECURITY_MONITOR_URL=https://pfrfeebtiktnfgdeoqvl.supabase.co/functions/v1/security-monitor
EOF
echo -e "${GREEN}✓ Created .env.local${NC}"
echo ""

# Step 5: Test if we can build
echo -e "${BLUE}Step 5: Testing build...${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful!${NC}"
else
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi
echo ""

# Step 6: Deploy Supabase functions
echo -e "${BLUE}Step 6: Deploying Supabase functions...${NC}"
echo "This requires Supabase CLI. Installing..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Installing Supabase CLI globally..."
    npm install -g supabase
fi

echo ""
echo -e "${YELLOW}Next steps (must do manually):${NC}"
echo ""
echo "1. Login to Supabase:"
echo "   supabase login"
echo ""
echo "2. Link to your project:"
echo "   supabase link --project-ref pfrfeebtiktnfgdeoqvl"
echo ""
echo "3. Deploy the security-monitor function:"
echo "   supabase functions deploy security-monitor"
echo ""
echo "4. Set GitHub secret:"
echo "   Go to: https://github.com/Saumya-Choudhuri/CyberShield-Security-Monitor"
echo "   Settings → Secrets and variables → Actions"
echo "   New secret:"
echo "   Name: VITE_SUPABASE_ANON_KEY"
echo "   Value: $ANON_KEY"
echo ""
echo "5. Push changes to trigger deployment:"
echo "   git add ."
echo "   git commit -m 'Deploy configuration'"
echo "   git push origin main"
echo ""

echo -e "${GREEN}Local setup complete!${NC}"
echo ""
echo "Your app should be visible at:"
echo "https://saumya-choudhuri.github.io/CyberShield-Security-Monitor/"
echo ""
echo "Find more help in: DEPLOYMENT_FIX_GUIDE.md"
