# PostgreSQL Setup Guide (Neon.tech)

## 🎯 Overview

This guide will help you migrate the SRT Timetable system from SQL Server to PostgreSQL using [Neon.tech](https://neon.tech/), a serverless PostgreSQL platform perfect for Vercel deployments.

## 📋 Prerequisites

- GitHub account (for Neon sign-in)
- Vercel account (recommended)
- Basic understanding of environment variables

## 🚀 Step 1: Create Neon PostgreSQL Database

### 1.1 Sign Up for Neon.tech

1. Visit [https://neon.tech](https://neon.tech)
2. Click "Sign Up" or "Get Started"
3. Sign in with GitHub account
4. Complete the registration process

### 1.2 Create a New Project

1. Click "Create Project" or "New Project"
2. Fill in project details:
   - **Project Name**: `srt-timetable` (or your preferred name)
   - **Region**: Select closest to your users
     - `Asia Pacific (Singapore)` - สำหรับผู้ใช้ในประเทศไทย
     - `US East (Ohio)` - For US users
     - `Europe (Frankfurt)` - For EU users
   - **PostgreSQL Version**: 16 (recommended) or latest
   - **Compute Size**: Shared (Free tier) - perfect for development

3. Click "Create Project"

### 1.3 Get Database Connection String

After project creation, you'll see your connection details:

```
Connection String (with pooling):
postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

**Example:**
```
postgresql://neondb_owner:npg_abc123xyz@ep-cool-morning-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

**Important**:
- Copy the **Connection string with pooling** (recommended for Vercel)
- Keep this secure - it contains your password!
- The pooling connection uses port 5432 and PgBouncer

## 🔧 Step 2: Update Environment Variables

### 2.1 Update Local Environment (.env.local)

1. Open `.env.local` file
2. Replace the SQL Server DATABASE_URL with PostgreSQL:

```env
# Old SQL Server (Remove this)
# DATABASE_URL="sqlserver://localhost:1433;database=SRT_Timetable;user=sa;password=YourPassword123;encrypt=true;trustServerCertificate=true"

# New PostgreSQL (Neon.tech)
DATABASE_URL="postgresql://neondb_owner:your_password@ep-your-project.region.aws.neon.tech/neondb?sslmode=require"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-here"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### 2.2 Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Copy the output and paste it as your `NEXTAUTH_SECRET` value.

### 2.3 Update Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (`srt-timetable`)
3. Go to **Settings** → **Environment Variables**
4. Add/Update these variables:

```
DATABASE_URL = postgresql://neondb_owner:...@ep-....neon.tech/neondb?sslmode=require
NEXTAUTH_URL = https://srt-timetable.vercel.app
NEXTAUTH_SECRET = (paste your generated secret)
NEXT_PUBLIC_APP_URL = https://srt-timetable.vercel.app
NODE_ENV = production
```

**Important**: Make sure to select all environments (Production, Preview, Development)

## 📊 Step 3: Migrate Database Schema

### 3.1 Generate Prisma Client

```bash
npx prisma generate
```

### 3.2 Push Schema to PostgreSQL

```bash
npx prisma db push
```

This will create all 22 tables in your Neon PostgreSQL database.

Expected output:
```
🚀  Your database is now in sync with your Prisma schema.
✔ Generated Prisma Client
```

### 3.3 Seed Database with Sample Data

```bash
npx prisma db seed
```

This will populate your database with:
- 8 Train Types
- 14 Stations (Bangkok, Chiang Mai, etc.)
- 6 Sample Trains
- 1 Admin User (username: `admin`, password: `Admin123!`)
- 1 Admin Role (Superadmin)

Expected output:
```
✅ Seeding completed!
📊 Summary:
   - 8 train types created
   - 14 stations created
   - 6 trains created
   - 1 admin user created
```

## 🧪 Step 4: Test Database Connection

### 4.1 Test Prisma Connection

```bash
npx prisma studio
```

This opens Prisma Studio at `http://localhost:5555` where you can:
- View all tables
- Browse seeded data
- Test database connectivity

### 4.2 Test Application APIs

Start development server:

```bash
npm run dev
```

Test health endpoint:

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": "connected",
    "timestamp": "2025-..."
  }
}
```

Test stations API:

```bash
curl http://localhost:3000/api/stations
```

Should return 14 stations.

## 🌐 Step 5: Deploy to Vercel

### 5.1 Commit Changes

```bash
git add .
git commit -m "Migrate from SQL Server to PostgreSQL (Neon.tech)"
git push origin main
```

### 5.2 Vercel Auto-Deploy

Vercel will automatically:
1. Detect the git push
2. Start a new deployment
3. Run `prisma generate` (configured in `vercel.json`)
4. Build the Next.js application
5. Deploy to production

### 5.3 Verify Deployment

1. Wait for deployment to complete
2. Visit your production URL: `https://srt-timetable.vercel.app`
3. Test the application:
   - Homepage should load
   - Search for trains
   - Admin login at `/admin/login`

### 5.4 Troubleshooting Deployment

If deployment fails, check:

1. **Vercel Build Logs**:
   - Go to Vercel Dashboard → Deployments
   - Click on the failed deployment
   - View "Build Logs" tab

2. **Environment Variables**:
   - Verify all required variables are set
   - Check for typos in variable names
   - Ensure DATABASE_URL has no trailing spaces

3. **Prisma Generation**:
   - Ensure `vercel.json` has correct build command:
     ```json
     {
       "buildCommand": "prisma generate && next build"
     }
     ```

4. **Database Connection**:
   - Test connection string locally first
   - Verify `sslmode=require` is in the connection string
   - Check Neon project is active (not paused)

## 🔍 Step 6: Verify Production Database

### 6.1 Check Database Tables

1. Go to [Neon Console](https://console.neon.tech)
2. Select your project
3. Click "Tables" tab
4. Verify all 22 tables exist:
   - `stations`, `trains`, `train_types`
   - `train_stops`, `route_distances`
   - `bogies`, `train_compositions`
   - `amenities`, `bogie_amenities`
   - `train_fares`, `distance_fares`, `ac_fares`, `berth_fares`
   - `price_adjustments`, `fare_formulas`
   - `announcements`
   - `admin_users`, `admin_roles`, `admin_logs`

### 6.2 Check Data

1. In Neon Console, click "SQL Editor"
2. Run queries to verify data:

```sql
-- Check stations
SELECT COUNT(*) FROM stations;
-- Should return: 14

-- Check trains
SELECT COUNT(*) FROM trains;
-- Should return: 6

-- Check admin user
SELECT username, email FROM admin_users;
-- Should return: admin user
```

## 📱 Step 7: Test Production Application

### 7.1 Public Pages

1. **Homepage**: `https://srt-timetable.vercel.app`
   - Should load without errors
   - Search form should be visible
   - Popular trains carousel should work

2. **Train Search**: Search Bangkok → Chiang Mai
   - Should return train results
   - Click on a train card
   - Details should display

### 7.2 Admin Panel

1. **Login**: `https://srt-timetable.vercel.app/admin/login`
   - Username: `admin`
   - Password: `Admin123!`
   - Should redirect to `/admin` dashboard

2. **Dashboard**: Should show:
   - System statistics
   - Quick actions
   - Recent activity

3. **Data Management**:
   - Test Stations page
   - Test Trains page
   - Verify CRUD operations work

## 🎉 Success Checklist

- [ ] Neon PostgreSQL project created
- [ ] Database connection string obtained
- [ ] Local `.env.local` updated with PostgreSQL URL
- [ ] Vercel environment variables configured
- [ ] `npx prisma generate` successful
- [ ] `npx prisma db push` successful
- [ ] `npx prisma db seed` successful
- [ ] Local development server works (`npm run dev`)
- [ ] API endpoints return data
- [ ] Changes committed and pushed to GitHub
- [ ] Vercel deployment successful
- [ ] Production site loads without errors
- [ ] Admin login works
- [ ] Database queries work in production

## 🆘 Common Issues & Solutions

### Issue 1: "Environment variable not found: DATABASE_URL"

**Solution**:
1. Verify `.env.local` exists in project root
2. Check variable name is exactly `DATABASE_URL`
3. Restart development server after changing `.env.local`

### Issue 2: "Can't reach database server"

**Solution**:
1. Verify connection string is correct
2. Check Neon project is not paused (free tier pauses after inactivity)
3. Ensure `sslmode=require` is in the connection string
4. Test connection with `npx prisma db pull`

### Issue 3: "Table doesn't exist"

**Solution**:
1. Run `npx prisma db push` to create tables
2. Check Neon Console → Tables to verify
3. If tables exist but error persists, try `npx prisma generate` again

### Issue 4: "NextAuth configuration error"

**Solution**:
1. Verify `NEXTAUTH_URL` matches your domain
2. Check `NEXTAUTH_SECRET` is set and not empty
3. Generate new secret: `openssl rand -base64 32`
4. Update Vercel environment variables

### Issue 5: "Prisma Client is not generated"

**Solution**:
```bash
# Clean and regenerate
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma
npx prisma generate
npm run dev
```

## 📊 Database Management

### Using Prisma Studio

```bash
npx prisma studio
```

Opens web interface at `http://localhost:5555` to:
- Browse all tables
- Edit data directly
- Run quick queries
- Test relationships

### Using Neon SQL Editor

1. Go to Neon Console
2. Click "SQL Editor"
3. Run SQL queries directly:

```sql
-- Get all trains with their types
SELECT t.train_number, t.train_name_th, tt.name_th as type
FROM trains t
JOIN train_types tt ON t.train_type_id = tt.id;

-- Get stations with train counts
SELECT s.name_th,
       COUNT(DISTINCT t1.id) as departing_trains,
       COUNT(DISTINCT t2.id) as arriving_trains
FROM stations s
LEFT JOIN trains t1 ON s.id = t1.origin_station_id
LEFT JOIN trains t2 ON s.id = t2.destination_station_id
GROUP BY s.id, s.name_th;
```

## 🔒 Security Best Practices

1. **Never commit `.env.local`** - Already in `.gitignore`
2. **Rotate credentials** periodically
3. **Use Neon's pooling connection** for better performance
4. **Enable Neon's branch protection** for production database
5. **Set up database backups** in Neon Console
6. **Monitor query performance** using Neon's Query Dashboard
7. **Use Vercel's preview deployments** for testing before production

## 💰 Neon Pricing (as of 2025)

### Free Tier
- **Storage**: 0.5 GB
- **Compute**: 100 hours/month
- **Branches**: 10
- **Projects**: 1
- **Perfect for**: Development, small projects, testing

### Pro Tier ($19/month)
- **Storage**: 10 GB included
- **Compute**: Unlimited
- **Branches**: Unlimited
- **Projects**: Unlimited
- **Auto-scaling**: Yes
- **Perfect for**: Production apps, startups

## 📚 Additional Resources

- **Neon Documentation**: https://neon.tech/docs
- **Prisma Documentation**: https://www.prisma.io/docs
- **Vercel Documentation**: https://vercel.com/docs
- **PostgreSQL Tutorial**: https://www.postgresqltutorial.com/

---

**Migration Status**: ✅ **READY FOR PRODUCTION**
**Database**: PostgreSQL 16 (Neon.tech)
**Hosting**: Vercel
**Last Updated**: January 2025
