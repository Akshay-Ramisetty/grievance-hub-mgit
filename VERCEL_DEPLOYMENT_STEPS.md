# 🚀 Deploy GrievanceHub-MGIT to Vercel

## ✅ Step-by-Step Guide

### Step 1: Go to Vercel
1. Open your browser and go to: **https://vercel.com**
2. Click **"Sign Up"** (top right)
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub account

### Step 2: Import Your Project
1. After signing in, click **"Add New..."** → **"Project"**
2. You'll see a list of your GitHub repositories
3. Find **"grievance-hub-mgit-frontend"**
4. Click **"Import"** next to it

### Step 3: Configure Project
Vercel will auto-detect Next.js settings. You should see:
- **Framework Preset**: Next.js ✅
- **Root Directory**: ./ ✅
- **Build Command**: `npm run build` ✅
- **Output Directory**: `.next` ✅

**Just click "Deploy"** - don't change anything!

### Step 4: Wait for Deployment
- Vercel will build your project (takes 2-3 minutes)
- You'll see a progress screen with logs
- When done, you'll see: 🎉 **"Congratulations!"**

### Step 5: Visit Your Site
You'll get a URL like:
- `https://grievance-hub-mgit-frontend.vercel.app`
- Or `https://grievance-hub-mgit-frontend-akshay.vercel.app`

Click on it to see your live website! 🌐

---

## 🔧 Important: Update API URL

Your frontend is now live, but it's still pointing to `localhost:8000` for the backend.

### Option A: Keep Backend Local (For Testing)
Your deployed site won't work fully because the backend is on your computer.

### Option B: Deploy Backend Too (Recommended)

#### Deploy Backend to Railway:

1. **Go to https://railway.app**
2. Sign in with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your repository
5. Railway will ask which folder - choose **"backend"**
6. Add environment variables:
   - Click **"Variables"** tab
   - Add these:
     ```
     SECRET_KEY=your-secret-key-here-make-it-random
     DEBUG=False
     ALLOWED_HOSTS=.railway.app
     EMAIL_HOST_USER=mgitgrievancehub@gmail.com
     EMAIL_HOST_PASSWORD=xyqyeruxwlewsmym
     EMAIL_HOST=smtp.gmail.com
     EMAIL_PORT=587
     EMAIL_USE_TLS=True
     ```
7. Click **"Deploy"**
8. You'll get a URL like: `https://your-backend.railway.app`

#### Update Frontend to Use Railway Backend:

1. Open `lib/api.ts` in your code
2. Change line 1:
   ```typescript
   const API_BASE_URL = 'https://your-backend.railway.app'
   ```
3. Save, commit, and push:
   ```bash
   git add lib/api.ts
   git commit -m "Update API URL for production"
   git push origin main
   ```
4. Vercel will automatically redeploy! ✨

---

## 🌐 Add Custom Domain (Later)

Once you have `mgitgrievancehub.ac.in`:

1. In Vercel dashboard → Your project → **Settings** → **Domains**
2. Click **"Add"**
3. Enter: `mgitgrievancehub.ac.in`
4. Vercel will show DNS records to add
5. Add those records in your domain registrar
6. Wait 24-48 hours
7. Done! Your site will be at `http://mgitgrievancehub.ac.in`

---

## 📝 Current Status

✅ Code pushed to GitHub
✅ Ready to deploy to Vercel
⏳ Waiting for you to deploy on Vercel
⏳ Backend needs to be deployed (Railway)
⏳ Custom domain (get from college IT)

---

## 🆘 Troubleshooting

### "Build Failed" on Vercel
- Check the build logs
- Make sure `package.json` has all dependencies
- Try running `npm run build` locally first

### "API Connection Failed"
- Backend is not deployed yet
- Update `API_BASE_URL` in `lib/api.ts`

### "Page Not Found"
- Clear browser cache
- Wait a few minutes for deployment to complete

---

## 💰 Cost

- **Vercel**: FREE ✅
- **Railway**: $5/month (or FREE tier with limitations)
- **Custom Domain**: FREE (if from college) or ₹500-1000/year

---

## 🎯 Next Steps

1. ✅ Deploy to Vercel (5 minutes)
2. ⏳ Deploy backend to Railway (10 minutes)
3. ⏳ Update API URL in frontend
4. ⏳ Get custom domain from college
5. ⏳ Connect custom domain to Vercel

**Start with Step 1 now!** Go to https://vercel.com 🚀
