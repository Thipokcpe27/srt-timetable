# 🚀 Vercel Deployment Guide

## Quick Deploy

### Method 1: Deploy with Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed)
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
cd D:\Project\timetable
vercel
```

4. **Follow the prompts:**
   - Set up and deploy? **Yes**
   - Which scope? **Your account**
   - Link to existing project? **No**
   - What's your project's name? **srt-timetable**
   - In which directory is your code located? **./  (press Enter)**
   - Want to override settings? **No**

5. **Production Deployment**
```bash
vercel --prod
```

---

### Method 2: Deploy via Vercel Dashboard (Easiest)

1. **Push to GitHub first:**
```bash
git add .
git commit -m "Add Vercel deployment configuration"
git push origin main
```

2. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/new
   - Click "Import Git Repository"
   - Select your GitHub account
   - Choose `Thipokcpe27/srt-timetable`

3. **Configure Project:**
   - **Project Name:** `srt-timetable`
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./`
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)
   - **Install Command:** `npm install` (auto-detected)

4. **Environment Variables** (if needed):
   - Leave empty for now (no env variables required)

5. **Click "Deploy"**

6. **Wait 2-3 minutes** for deployment to complete

---

## 🌐 After Deployment

Your app will be available at:
- Production: `https://srt-timetable.vercel.app`
- Or custom domain: `https://your-custom-domain.com`

---

## 🔧 Configuration

The `vercel.json` file includes:

### Security Headers
- ✅ X-Content-Type-Options: nosniff
- ✅ X-Frame-Options: DENY
- ✅ X-XSS-Protection: 1; mode=block
- ✅ Referrer-Policy: strict-origin-when-cross-origin

### Regions
- Default: Singapore (sin1) - closest to Thailand
- Can be changed to other regions if needed

### Build Settings
- Framework: Next.js 15
- Build Command: `npm run build`
- Output Directory: `.next`

---

## 🔄 Automatic Deployments

After initial setup, Vercel will automatically:
- Deploy **Production** on push to `main` branch
- Deploy **Preview** on pull requests
- Run builds and checks before deployment

---

## 📊 Performance Optimization

Vercel automatically provides:
- ⚡ Edge Network CDN
- 🗜️ Automatic compression (Gzip/Brotli)
- 🖼️ Image optimization
- 📦 Code splitting
- 🔄 Incremental Static Regeneration (ISR)

---

## 🌍 Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

---

## 📝 Environment Variables (Future)

If you need to add environment variables:

1. Go to: https://vercel.com/[your-username]/srt-timetable/settings/environment-variables
2. Add variables:
   - `NEXT_PUBLIC_API_URL` (for future API)
   - `DATABASE_URL` (for future database)
   - etc.

---

## 🐛 Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure `npm run build` works locally
- Check for missing dependencies

### Page Not Found
- Verify routes are correct
- Check Next.js app router structure
- Ensure all pages have proper exports

### Slow Performance
- Enable analytics in Vercel dashboard
- Check bundle size with `npm run build`
- Use Next.js Image component for images

---

## 📈 Monitoring

Vercel provides:
- Real-time analytics
- Performance metrics
- Error tracking
- Deployment logs

Access at: https://vercel.com/[your-username]/srt-timetable/analytics

---

## 🔐 Security

Current setup includes:
- ✅ Security headers configured
- ✅ HTTPS by default
- ✅ DDoS protection
- ✅ Rate limiting (built-in)

---

## 💰 Pricing

**Free Tier** (Hobby) includes:
- Unlimited deployments
- 100GB bandwidth/month
- Automatic HTTPS
- Edge Network

Perfect for this project! 🎉

---

## 🚀 Quick Commands

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs

# Remove deployment
vercel remove [deployment-url]
```

---

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Vercel CLI](https://vercel.com/docs/cli)

---

**Ready to deploy!** 🚀

Choose your preferred method above and deploy your SRT Timetable to the world!
