#!/bin/bash

# 🚀 Curlea Analytics Dashboard - Quick Deploy Script
# This script helps you deploy the dashboard to Netlify

echo "🚀 Curlea Analytics Dashboard Deployment"
echo "========================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the analytics-dashboard directory"
    echo "   Current directory: $(pwd)"
    echo "   Expected: curlea-luxe-animation-main/analytics-backend/analytics-dashboard/"
    exit 1
fi

echo "✅ Found package.json - we're in the right directory"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found"
    echo "   Please create .env with your Supabase credentials:"
    echo "   VITE_SUPABASE_URL=your_supabase_url"
    echo "   VITE_SUPABASE_ANON_KEY=your_anon_key"
    exit 1
fi

echo "✅ Found .env file"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "✅ Dependencies ready"

# Build the project
echo "🔨 Building dashboard for production..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🎉 Your dashboard is ready for deployment!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Push your code to GitHub:"
    echo "   git add ."
    echo "   git commit -m 'Deploy analytics dashboard'"
    echo "   git push origin main"
    echo ""
    echo "2. Create new Netlify site:"
    echo "   - Go to https://app.netlify.com"
    echo "   - Click 'New site from Git'"
    echo "   - Select your repository"
    echo "   - Set base directory: analytics-backend/analytics-dashboard"
    echo "   - Set build command: npm install && npm run build"
    echo "   - Set publish directory: dist"
    echo ""
    echo "3. Add environment variables in Netlify:"
    echo "   VITE_SUPABASE_URL=$(grep VITE_SUPABASE_URL .env | cut -d'=' -f2)"
    echo "   VITE_SUPABASE_ANON_KEY=$(grep VITE_SUPABASE_ANON_KEY .env | cut -d'=' -f2)"
    echo ""
    echo "4. Deploy and enjoy your real-time analytics dashboard! 🚀"
    echo ""
    echo "📁 Built files are in the 'dist' directory"
    echo "🌐 Dashboard will be available at your Netlify URL"
else
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi
