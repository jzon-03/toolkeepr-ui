#!/bin/bash

# GitHub Pages Setup Script for ToolKeepr

echo "🔧 ToolKeepr GitHub Pages Setup"
echo "==============================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📝 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit: ToolKeepr Tool Management System

Features:
- Dynamic tool type management with custom properties
- Comprehensive tool inventory with filtering and search
- Dashboard with statistics and recent activity
- Material Design responsive interface
- GitHub Pages deployment ready"
    
    echo ""
    echo "📡 Please add your GitHub remote:"
    echo "git remote add origin https://github.com/YOUR_USERNAME/toolkeepr-ui.git"
    echo "git push -u origin main"
else
    echo "✅ Git repository already initialized"
fi

echo ""
echo "🏗️  Building application for GitHub Pages..."
npm run build:gh-pages

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Push your code to GitHub: git push origin main"
    echo "2. Go to Repository Settings → Pages"
    echo "3. Select 'Deploy from a branch' and choose 'gh-pages'"
    echo "4. Your site will be available at: https://YOUR_USERNAME.github.io/toolkeepr-ui/"
    echo ""
    echo "🚀 For manual deployment, run: npm run deploy"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi