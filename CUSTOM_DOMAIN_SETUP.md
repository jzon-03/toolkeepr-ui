# Custom Domain Configuration

## ✅ What's Been Configured

### 1. **CNAME File**
- Created `src/CNAME` with your custom domain: `tms.sharpfloornc.com`
- Added to Angular build assets to be included in deployment

### 2. **Base Href Updated**
- Changed from `/toolkeepr-ui/` to `/` for root domain deployment
- Updated build script: `ng build --configuration production --base-href /`

### 3. **SPA Routing Fixed**
- Simplified `index.html` - removed GitHub Pages specific redirects
- Updated `404.html` for custom domain SPA routing support

### 4. **Build Configuration**
- Angular assets now include CNAME file in the build output
- Application configured for root domain deployment

## 🔧 Next Steps

### 1. **DNS Configuration** (Required)
You need to configure your DNS records for `tms.sharpfloornc.com`:

**Option A: CNAME Record (Recommended)**
```
Type: CNAME
Name: tms.sharpfloornc.com
Value: jzon-03.github.io
```

**Option B: A Records**
```
Type: A
Name: tms.sharpfloornc.com
Value: 185.199.108.153
Value: 185.199.109.153
Value: 185.199.110.153
Value: 185.199.111.153
```

### 2. **GitHub Pages Settings**
1. Go to: https://github.com/jzon-03/toolkeepr-ui/settings/pages
2. In the **Custom domain** field, enter: `tms.sharpfloornc.com`
3. Check **Enforce HTTPS** (recommended)
4. Save

### 3. **Deploy the Changes**
```bash
git add .
git commit -m "Configure custom domain tms.sharpfloornc.com"
git push origin master
```

### 4. **Verification**
- Wait for DNS propagation (up to 24-48 hours)
- GitHub will automatically verify your domain
- Once verified, your app will be accessible at: https://tms.sharpfloornc.com

## 🚨 Important Notes

1. **DNS Propagation**: It may take time for DNS changes to propagate globally
2. **HTTPS**: GitHub Pages automatically provides SSL certificates for custom domains
3. **Subdomain**: If you want `www.tms.sharpfloornc.com` to work, add another CNAME record:
   ```
   Type: CNAME
   Name: www
   Value: tms.sharpfloornc.com
   ```

## 🔍 Troubleshooting

### Domain Not Working?
1. Check DNS records are correctly configured
2. Verify GitHub Pages settings show the custom domain
3. Wait for DNS propagation (use https://whatsmydns.net/ to check)
4. Ensure the CNAME file is in the deployed site root

### SSL Certificate Issues?
- GitHub automatically provisions SSL certificates
- This process can take a few minutes to hours after domain verification
- Make sure "Enforce HTTPS" is enabled in GitHub Pages settings

Your ToolKeepr application will be available at: **https://tms.sharpfloornc.com** once DNS is configured! 🚀