# GitHub Pages Deployment Guide

## Quick Start

1. **Push your code to GitHub repository**
2. **Enable GitHub Pages** in repository settings
3. **Push to main/master** - automatic deployment will trigger

## Manual Deployment Steps

If you prefer to deploy manually:

```bash
# 1. Build the application for GitHub Pages
npm run build:gh-pages

# 2. Deploy to GitHub Pages
npm run deploy
```

## First Time Setup

### 1. Create GitHub Repository
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/toolkeepr-ui.git
git push -u origin main
```

### 2. Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll to **Pages** section
4. Under **Source**, select "Deploy from a branch"
5. Choose **gh-pages** branch
6. Click **Save**

### 3. Wait for Deployment
- GitHub will automatically deploy when you push to main/master
- Check the **Actions** tab to see deployment progress
- Your site will be available at: `https://YOUR_USERNAME.github.io/toolkeepr-ui/`

## Troubleshooting

### Build Errors
If you get budget errors, they've been configured for Material Design applications.

### Routing Issues
The 404.html and redirect scripts are configured to handle Angular SPA routing on GitHub Pages.

### Base Href
The application automatically sets the correct base href for GitHub Pages deployment.

## File Structure After Build

```
dist/toolkeepr-ui/
├── browser/              # This folder gets deployed to GitHub Pages
│   ├── index.html       # Main application
│   ├── 404.html         # SPA redirect handling
│   ├── *.js             # Application bundles
│   ├── *.css            # Styles
│   └── assets/          # Static assets
└── 3rdpartylicenses.txt
```

The GitHub Actions workflow specifically deploys the `browser/` folder contents to GitHub Pages.