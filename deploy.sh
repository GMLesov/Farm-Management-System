#!/bin/bash

echo "🚀 Deploying Farm Management System..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Deploy Frontend to Vercel
echo -e "${BLUE}📦 Deploying Frontend to Vercel...${NC}"
cd web-dashboard
vercel --prod
cd ..
echo -e "${GREEN}✅ Frontend deployed!${NC}"
echo ""

# 2. Deploy Backend to Render
echo -e "${BLUE}🔧 Deploying Backend to Render...${NC}"
echo "Please go to https://render.com and:"
echo "1. Click 'New +' → 'Blueprint'"
echo "2. Connect your GitHub repo"
echo "3. Render will auto-deploy using render.yaml"
echo ""

# 3. Build Android APK
echo -e "${BLUE}📱 Building Android APK...${NC}"
cd mobile
npm install
cd android
./gradlew assembleRelease
cd ../..
echo -e "${GREEN}✅ APK built at: mobile/android/app/build/outputs/apk/release/app-release.apk${NC}"
echo ""

# 4. Push to GitHub
echo -e "${BLUE}📤 Pushing to GitHub...${NC}"
git add .
git commit -m "Deploy: Update all deployment configs"
git push origin main
echo -e "${GREEN}✅ Pushed to GitHub!${NC}"
echo ""

echo "🎉 Deployment complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Frontend: Check Vercel dashboard for URL"
echo "2. Backend: Go to https://render.com to connect repo"
echo "3. GitHub Pages: Will auto-deploy demo.html to https://GMLesov.github.io/farm-management-system/"
echo "4. APK: Upload to GitHub Releases manually or create a tag"
