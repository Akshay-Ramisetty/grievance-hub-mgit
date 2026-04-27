# GrievanceHub-MGIT Deployment Guide

## Quick Deployment (Recommended)

### Step 1: Deploy Frontend to Vercel

1. **Push to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to https://vercel.com
   - Sign in with GitHub
   - Click "New Project"
   - Import your `grievance-hub-mgit-frontend` repository
   - Vercel will auto-detect Next.js
   - Click "Deploy"
   - Your site will be live at: `https://your-project.vercel.app`

### Step 2: Deploy Backend to Railway

1. **Prepare Backend**:
   - Make sure `backend/requirements.txt` exists
   - Create `backend/Procfile`:
     ```
     web: gunicorn grievancehub.wsgi --log-file -
     ```
   - Add `gunicorn` to requirements.txt

2. **Deploy to Railway**:
   - Go to https://railway.app
   - Sign in with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Choose the `backend` folder
   - Add environment variables:
     - `DJANGO_SECRET_KEY`: (generate a new one)
     - `DEBUG`: False
     - `ALLOWED_HOSTS`: your-backend.railway.app
     - `EMAIL_HOST_USER`: mgitgrievancehub@gmail.com
     - `EMAIL_HOST_PASSWORD`: xyqyeruxwlewsmym
   - Deploy!
   - You'll get a URL like: `https://your-backend.railway.app`

3. **Update Frontend API URL**:
   - In `lib/api.ts`, change:
     ```typescript
     const API_BASE_URL = 'https://your-backend.railway.app'
     ```
   - Commit and push (Vercel will auto-redeploy)

### Step 3: Configure Backend CORS

Update `backend/grievancehub/settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    'https://your-project.vercel.app',
    'http://localhost:3000',  # for local development
]

ALLOWED_HOSTS = ['your-backend.railway.app', 'localhost']
```

## Alternative: Deploy Both on Railway

You can deploy both frontend and backend on Railway:

1. Create two services in Railway:
   - Service 1: Frontend (Next.js)
   - Service 2: Backend (Django)

2. Railway will auto-detect and deploy both

## Alternative: Deploy on Render

**Frontend:**
- Go to https://render.com
- New Static Site
- Connect GitHub repo
- Build command: `npm run build`
- Publish directory: `.next`

**Backend:**
- New Web Service
- Connect GitHub repo
- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `gunicorn grievancehub.wsgi:application`

## Environment Variables Needed

### Backend (.env)
```
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=your-backend-url.com
DATABASE_URL=your-database-url (if using PostgreSQL)
EMAIL_HOST_USER=mgitgrievancehub@gmail.com
EMAIL_HOST_PASSWORD=xyqyeruxwlewsmym
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

## Database Migration

After deploying backend, run migrations:
```bash
# On Railway/Render, this happens automatically if you add to Procfile:
release: python manage.py migrate
```

Or manually via Railway CLI:
```bash
railway run python manage.py migrate
railway run python manage.py seed_admin
```

## Custom Domain (Optional)

### Vercel:
1. Go to Project Settings → Domains
2. Add your custom domain (e.g., grievancehub.mgit.edu)
3. Update DNS records as instructed

### Railway:
1. Go to Service Settings → Domains
2. Add custom domain
3. Update DNS records

## Testing Deployment

1. Visit your Vercel URL
2. Try registering a student
3. Submit a complaint
4. Check if emails are sent
5. Login as admin and test dashboard

## Troubleshooting

### Frontend can't connect to backend:
- Check CORS settings in Django
- Verify API_BASE_URL in lib/api.ts
- Check browser console for errors

### Backend errors:
- Check Railway/Render logs
- Verify environment variables
- Ensure migrations ran successfully

### Email not working:
- Verify Gmail credentials
- Check "Less secure app access" or use App Password
- Check backend logs for SMTP errors

## Cost

- **Vercel**: Free tier (perfect for this project)
- **Railway**: $5/month (includes database)
- **Render**: Free tier available (with limitations)
- **Total**: Can be completely FREE or ~$5/month

## Recommended Setup

✅ **Frontend**: Vercel (Free)
✅ **Backend**: Railway ($5/month) or Render (Free)
✅ **Database**: Railway PostgreSQL (included) or SQLite (free but not recommended for production)

## Quick Commands

```bash
# Commit and push changes
git add .
git commit -m "Update for deployment"
git push origin main

# Vercel will auto-deploy on push!
```

## Support

If you encounter issues:
1. Check deployment logs on Vercel/Railway
2. Verify environment variables
3. Test API endpoints directly
4. Check CORS and ALLOWED_HOSTS settings
