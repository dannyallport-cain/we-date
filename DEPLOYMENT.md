# WeDate Deployment Guide

This guide will walk you through deploying WeDate to Vercel (frontend) and Railway (database).

## Prerequisites

- GitHub account
- Vercel account (sign up at https://vercel.com)
- Railway account (sign up at https://railway.app)

## Step 1: Set Up Railway Database

1. Go to https://railway.app and sign in
2. Click "New Project"
3. Select "Provision PostgreSQL"
4. Once created, click on the PostgreSQL service
5. Go to the "Variables" tab
6. Copy the `DATABASE_URL` value (it will look like: `postgresql://postgres:...@...railway.app:...`)
7. Keep this window open - you'll need this URL for Vercel

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to https://vercel.com and sign in
2. Click "Add New..." → "Project"
3. Import your GitHub repository (`dannyallport-cain/we-date`)
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   
5. Add Environment Variables:
   - Click "Environment Variables"
   - Add the following variables:
     ```
     DATABASE_URL=<your-railway-database-url>
     JWT_SECRET=<generate-a-random-secret-key>
     NODE_ENV=production
     ```
   
   To generate a JWT_SECRET, you can use:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   
6. Click "Deploy"
7. Wait for the deployment to complete (usually 2-3 minutes)
8. Once deployed, click "Visit" to see your live app

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Add environment variables:
   ```bash
   vercel env add DATABASE_URL
   vercel env add JWT_SECRET
   vercel env add NODE_ENV
   ```

5. Deploy to production:
   ```bash
   vercel --prod
   ```

## Step 3: Configure Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions

## Step 4: Verify Deployment

1. Visit your deployed app URL
2. Try signing up with a test account
3. Test the login functionality
4. Check that the swipe interface loads

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string from Railway | `postgresql://postgres:...@...railway.app:...` |
| `JWT_SECRET` | Secret key for JWT token generation | `your-random-64-character-hex-string` |
| `NODE_ENV` | Environment mode | `production` |

## Troubleshooting

### Database Connection Issues

If you get database connection errors:

1. Check that `DATABASE_URL` is correctly set in Vercel
2. Ensure Railway database is running
3. Check Railway logs for any database errors
4. Verify SSL is enabled in Railway (should be by default)

### Build Failures

If the build fails:

1. Check the build logs in Vercel
2. Ensure all dependencies are in `package.json`
3. Try building locally first: `npm run build`
4. Check for TypeScript errors

### Authentication Issues

If JWT authentication isn't working:

1. Verify `JWT_SECRET` is set in Vercel
2. Check browser console for token errors
3. Ensure cookies/localStorage is enabled

## Database Maintenance

### Viewing Data

Connect to your Railway database using any PostgreSQL client:

```bash
psql <your-database-url>
```

### Backing Up Data

Railway automatically backs up your database. To create a manual backup:

1. Go to Railway dashboard
2. Click on your PostgreSQL service
3. Go to "Backups" tab
4. Click "Create Backup"

### Database Schema

The app automatically creates these tables on first run:

- `users` - User profiles and authentication
- `swipes` - User swipe history
- `matches` - Mutual matches
- `messages` - Chat messages (for future feature)

## Monitoring

### Vercel Analytics

Enable Vercel Analytics to track:
- Page views
- Performance metrics
- Error rates

### Railway Monitoring

Check Railway dashboard for:
- Database usage
- Connection count
- Query performance

## Scaling

### Vercel

- Automatically scales with traffic
- No configuration needed
- Upgrade plan for higher limits

### Railway

- Database scales with usage
- Monitor connection pool size
- Upgrade plan for more resources

## Security Best Practices

1. **Never commit** `.env` files to git
2. **Rotate** JWT_SECRET periodically
3. **Use strong** database passwords (Railway generates these)
4. **Enable** 2FA on Vercel and Railway accounts
5. **Monitor** for unusual activity
6. **Keep dependencies** updated: `npm audit fix`

## Cost Estimation

### Free Tier Limits

**Vercel (Hobby Plan - Free)**
- Unlimited deployments
- 100GB bandwidth/month
- Serverless function executions

**Railway (Free Plan)**
- $5 credit/month
- Pay for what you use
- Typically covers small apps

### Expected Costs

For a small app with ~100-500 users:
- Vercel: Free
- Railway: $5-10/month

## Support

If you encounter issues:

1. Check this deployment guide
2. Review the main README.md
3. Check Vercel and Railway documentation
4. Open an issue on GitHub

## Next Steps

After deployment:

1. Test all features thoroughly
2. Set up monitoring and alerts
3. Configure custom domain
4. Add analytics
5. Plan for scaling
6. Implement real-time chat (future feature)

---

Congratulations! Your WeDate app is now live and ready for users! 🎉
