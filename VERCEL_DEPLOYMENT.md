# Vercel Deployment Guide for SRT Timetable

## ✅ STATUS: MIGRATED TO POSTGRESQL

The system has been successfully migrated from SQL Server to PostgreSQL (Neon.tech).

## 🚀 Quick Deploy

### Option 1: Use PostgreSQL with Neon.tech (CURRENT SETUP)

Vercel works best with PostgreSQL databases. You'll need to:

1. **Create a PostgreSQL Database**
   - Use [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
   - Or use [Neon](https://neon.tech/)
   - Or use [Supabase](https://supabase.com/)

2. **Update Prisma Schema**
   ```prisma
   datasource db {
     provider = "postgresql"  // Change from sqlserver
     url      = env("DATABASE_URL")
   }
   ```

3. **Set Environment Variables in Vercel**
   ```bash
   DATABASE_URL=postgresql://user:password@host:5432/database
   NEXTAUTH_URL=https://srt-timetable.vercel.app
   NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
   ```

### Option 2: Use Different Hosting (For SQL Server)

If you must use SQL Server:
- Deploy to **Azure App Service**
- Deploy to **AWS EC2/Elastic Beanstalk**
- Deploy to **Railway** (supports SQL Server)
- Deploy to **Render**

## 🔧 Quick Fix for Vercel

### Step 1: Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

### Step 2: Add Environment Variables in Vercel

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these variables:

```
NEXTAUTH_URL=https://srt-timetable.vercel.app
NEXTAUTH_SECRET=<output from openssl command>
DATABASE_URL=<your database url>
NEXT_PUBLIC_APP_URL=https://srt-timetable.vercel.app
NODE_ENV=production
```

### Step 3: Temporary Fix - Disable Features

Create `vercel.json`:

```json
{
  "env": {
    "NEXTAUTH_URL": "https://srt-timetable.vercel.app"
  },
  "build": {
    "env": {
      "NEXTAUTH_URL": "https://srt-timetable.vercel.app"
    }
  }
}
```

## 🎯 Recommended Approach

### Switch to PostgreSQL + Vercel Postgres

1. **Create Vercel Postgres Database**
   ```bash
   vercel postgres create
   ```

2. **Update `prisma/schema.prisma`**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Update field types** (SQL Server → PostgreSQL)
   - `DECIMAL` → `Decimal`
   - `NVARCHAR` → `String`
   - `DATETIME` → `DateTime`

4. **Generate new migration**
   ```bash
   npx prisma migrate dev --name switch_to_postgresql
   ```

5. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

## 📝 Environment Variables Checklist

Make sure these are set in Vercel:

- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `NEXTAUTH_URL` - Your Vercel URL
- [ ] `NEXTAUTH_SECRET` - Random secret (32+ characters)
- [ ] `NEXT_PUBLIC_APP_URL` - Your Vercel URL
- [ ] `NODE_ENV=production`

## 🔍 Debug Steps

1. **Check Vercel Logs**
   ```bash
   vercel logs
   ```

2. **Check Build Logs**
   - Go to Vercel Dashboard → Deployments → View Build Logs

3. **Test API Endpoint**
   ```bash
   curl https://srt-timetable.vercel.app/api/health
   ```

## ⚠️ Important Notes

1. **SQL Server is NOT supported on Vercel's serverless functions**
   - You MUST switch to PostgreSQL, MySQL, or MongoDB

2. **Prisma on Vercel**
   - Make sure `prisma generate` runs in build
   - Add to `package.json`:
     ```json
     "scripts": {
       "postinstall": "prisma generate"
     }
     ```

3. **Connection Pooling**
   - Use Prisma Data Proxy for PostgreSQL
   - Or use connection pooling (PgBouncer)

## 🚀 Quick Migration Script

```bash
# 1. Create Vercel Postgres
vercel postgres create srt-db

# 2. Get connection string
vercel env pull

# 3. Update Prisma schema to PostgreSQL
# (manually edit prisma/schema.prisma)

# 4. Push schema
npx prisma db push

# 5. Seed data
npx prisma db seed

# 6. Deploy
vercel --prod
```

## 📞 Need Help?

If you see this error:
- `NextAuth configuration error` → Check NEXTAUTH_URL and NEXTAUTH_SECRET
- `Database connection error` → Switch to PostgreSQL
- `Build failed` → Check `vercel logs`

---

**Current Status**: ✅ PostgreSQL (Neon.tech) - Production Ready
**Database Provider**: Neon.tech Serverless PostgreSQL
**Deployment Platform**: Vercel
**Last Updated**: January 2025

## 📚 Complete Setup Guide

For detailed step-by-step instructions, see:
- **[POSTGRESQL_SETUP_GUIDE.md](./POSTGRESQL_SETUP_GUIDE.md)** - Complete migration guide
