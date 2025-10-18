# 🛠️ Technology Stack - SQL Server Version
## SRT Timetable Complete System

**Updated:** 2025-01-08  
**Database:** Microsoft SQL Server  
**Status:** Production-Ready Configuration

---

## 📊 Complete Tech Stack

### 🗄️ Database & Backend

#### Database: Microsoft SQL Server
```
✅ SQL Server 2019+ (recommended)
✅ SQL Server Express (free, up to 10GB)
✅ Azure SQL Database (cloud option)

Features:
- Full Unicode support (NVARCHAR for Thai/English/Chinese)
- JSON support (NVARCHAR(MAX) with JSON functions)
- Advanced indexing
- Triggers & Stored Procedures
- Full-text search
- High performance
```

#### ORM/Database Client
```typescript
Option 1: Prisma (แนะนำ) ⭐
- Modern ORM
- Type-safe
- Migration support
- SQL Server connector: @prisma/client + prisma-client-sqlserver
- Auto-generated types

npm install prisma @prisma/client
npm install -D prisma

// prisma/schema.prisma
datasource db {
  provider = "sqlserver"
  url      = env("DATABASE_URL")
}

Option 2: TypeORM
- Mature ORM
- Decorator-based
- SQL Server support built-in

npm install typeorm mssql

Option 3: Tedious (direct driver)
- Low-level SQL Server driver
- Full control
- More manual work

npm install tedious

Recommended: Prisma for type safety and developer experience
```

### 🔌 Backend Framework

```typescript
✅ Next.js 15 (App Router)
✅ TypeScript 5+
✅ API Routes (/app/api)

Connection String Format:
sqlserver://localhost:1433;database=SRTTimetable;user=sa;password=YourPassword;encrypt=true;trustServerCertificate=true
```

### 🎨 Frontend (unchanged)

```typescript
✅ Next.js 15 + React 18
✅ Tailwind CSS
✅ shadcn/ui components
✅ Lucide React icons
✅ React Hook Form + Zod
✅ next-i18next (multi-language)
```

---

## 🔧 Development Setup

### 1. SQL Server Installation Options

#### Option A: SQL Server Express (Free, Local)
```powershell
# Download from Microsoft
https://www.microsoft.com/en-us/sql-server/sql-server-downloads

# Install SQL Server Express 2019/2022
# Include Management Tools (SSMS)

# Default instance: localhost
# Port: 1433
```

#### Option B: Docker (Recommended for Development)
```bash
# Pull SQL Server image
docker pull mcr.microsoft.com/mssql/server:2019-latest

# Run container
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=YourStrong@Password" \
   -p 1433:1433 --name sql1 --hostname sql1 \
   -d mcr.microsoft.com/mssql/server:2019-latest

# Connect
sqlcmd -S localhost -U sa -P "YourStrong@Password"
```

#### Option C: Azure SQL Database (Cloud)
```
✅ Azure SQL Database (PaaS)
✅ Pay-as-you-go
✅ Auto-scaling
✅ Automatic backups
✅ High availability

Pricing:
- Basic: $5/month (2GB)
- Standard: $15-300/month
- Premium: $465+/month
```

### 2. Database Tools

```
✅ SQL Server Management Studio (SSMS)
   - Free, full-featured GUI
   - Query editor
   - Database designer
   
✅ Azure Data Studio
   - Cross-platform (Windows/Mac/Linux)
   - Modern UI
   - Extensions support
   
✅ VS Code Extensions:
   - SQL Server (mssql)
   - Database client
```

---

## 📦 Dependencies

### Backend Dependencies

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    
    // Database
    "@prisma/client": "^5.x",
    "prisma": "^5.x",
    
    // Authentication
    "next-auth": "^4.24.0",
    "bcrypt": "^5.1.0",
    
    // Validation
    "zod": "^3.23.0",
    "@hookform/resolvers": "^3.9.0",
    "react-hook-form": "^7.53.0",
    
    // i18n
    "next-i18next": "^15.0.0",
    
    // Date/Time
    "date-fns": "^4.1.0",
    
    // Icons
    "lucide-react": "^0.462.0",
    
    // Cache (optional)
    "@upstash/redis": "^1.x",
    
    // Utils
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/bcrypt": "^5.0.0",
    "typescript": "^5",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8",
    
    // Testing
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "jest": "^29.0.0",
    "@playwright/test": "^1.40.0",
    
    // Linting
    "eslint": "^8",
    "eslint-config-next": "^15.0.0"
  }
}
```

---

## ⚙️ Configuration Files

### prisma/schema.prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlserver"
  url      = env("DATABASE_URL")
}

model Station {
  id                    Int       @id @default(autoincrement())
  stationCode          Int       @unique @map("station_code")
  codeTh               String    @map("code_th") @db.NVarChar(10)
  codeEn               String    @map("code_en") @db.NVarChar(10)
  codeCn               String?   @map("code_cn") @db.NVarChar(10)
  nameTh               String    @map("name_th") @db.NVarChar(255)
  nameEn               String    @map("name_en") @db.NVarChar(255)
  nameCn               String?   @map("name_cn") @db.NVarChar(255)
  distanceForPricing   Decimal   @default(0) @map("distance_for_pricing") @db.Decimal(10, 4)
  distanceActual       Decimal   @default(0) @map("distance_actual") @db.Decimal(10, 4)
  stationClass         String?   @map("station_class") @db.NVarChar(20)
  latitude             Decimal?  @db.Decimal(10, 8)
  longitude            Decimal?  @db.Decimal(11, 8)
  address              String?   @db.NVarChar(Max)
  phone                String?   @db.NVarChar(20)
  facilities           String?   @db.NVarChar(Max) // JSON
  imageUrl             String?   @map("image_url") @db.NVarChar(500)
  images               String?   @db.NVarChar(Max) // JSON
  isActive             Boolean   @default(true) @map("is_active")
  notes                String?   @db.NVarChar(Max)
  createdAt            DateTime  @default(now()) @map("created_at") @db.DateTime2
  updatedAt            DateTime  @default(now()) @updatedAt @map("updated_at") @db.DateTime2
  
  @@map("stations")
}

// ... more models
```

### .env.local

```env
# Database
DATABASE_URL="sqlserver://localhost:1433;database=SRTTimetable;user=sa;password=YourStrong@Password;encrypt=true;trustServerCertificate=true"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl

# Redis Cache (optional)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🚀 Hosting Options

### Database Hosting

#### Option 1: Azure SQL Database (แนะนำ) ⭐
```
✅ Pros:
- Managed service (no maintenance)
- Automatic backups
- High availability
- Scaling on demand
- Integration with Azure services

💰 Pricing:
- Basic (2GB): ~$5/month
- Standard S0 (250GB): ~$15/month
- Standard S1 (250GB): ~$30/month

Connection:
Server: your-server.database.windows.net
Port: 1433
```

#### Option 2: AWS RDS for SQL Server
```
✅ Pros:
- Managed service
- Multi-AZ deployment
- Read replicas
- Automated backups

💰 Pricing:
- db.t3.micro: ~$29/month
- db.t3.small: ~$58/month
```

#### Option 3: Self-hosted (VPS)
```
✅ Pros:
- Full control
- Lower cost for small DB
- Can use SQL Server Express (free)

💰 Providers:
- DigitalOcean: $12/month (2GB RAM)
- Linode: $12/month
- AWS EC2: Variable

⚠️ Cons:
- Need to manage yourself
- Backup responsibility
- Security updates
```

### Application Hosting

#### Option 1: Vercel (แนะนำ) ⭐
```
✅ Next.js optimized
✅ Free tier available
✅ Auto-scaling
✅ CDN included

💰 Pricing:
- Hobby: Free (personal projects)
- Pro: $20/month

⚠️ Note: 
- Serverless functions (10s timeout on free)
- Need persistent database connection handling
```

#### Option 2: Azure App Service
```
✅ Great integration with Azure SQL
✅ Easy deployment
✅ Windows/Linux support

💰 Pricing:
- Free tier available
- Basic: ~$13/month
- Standard: ~$50/month
```

---

## 💰 Cost Estimation (Monthly)

### Minimum Setup (Development/Small Production)
```
Database:
- SQL Server Express (self-hosted): $0
- or Azure SQL Basic: $5

Hosting:
- Vercel Free: $0
- or Vercel Pro: $20

Cache (optional):
- Upstash Redis Free: $0

Total: $0 - $25/month
```

### Recommended Setup (Production)
```
Database:
- Azure SQL Standard S1: $30

Hosting:
- Vercel Pro: $20

Cache:
- Upstash Redis: $10

Monitoring:
- Sentry Free: $0

Total: ~$60/month
```

### Enterprise Setup
```
Database:
- Azure SQL Standard S3: $115
- or Premium tier: $465+

Hosting:
- Vercel Enterprise: Custom
- or Azure App Service: $50+

Cache:
- Redis Enterprise: $50+

Monitoring & Analytics:
- Sentry Pro: $26+
- Analytics: $20+

Total: $250 - $500+/month
```

---

## 🔒 Security Considerations

### SQL Server Security

```sql
-- 1. Use strong SA password
-- Minimum 8 characters, mixed case, numbers, symbols

-- 2. Create application user (don't use SA)
CREATE LOGIN srt_app WITH PASSWORD = 'StrongPassword123!';
CREATE USER srt_app FOR LOGIN srt_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON SCHEMA::dbo TO srt_app;

-- 3. Enable encryption
-- Use encrypt=true in connection string

-- 4. IP restrictions (Azure SQL)
-- Configure firewall rules

-- 5. Enable auditing
-- Track all database access
```

### Application Security

```typescript
// 1. Environment variables
// Never commit .env files

// 2. SQL injection prevention
// Prisma/parameterized queries

// 3. Rate limiting
// API routes protection

// 4. CORS configuration
// Restrict origins

// 5. Authentication
// NextAuth.js with secure session
```

---

## 🧪 Testing with SQL Server

### Test Database Setup

```sql
-- Create test database
CREATE DATABASE SRTTimetable_Test;
GO

-- Run schema
USE SRTTimetable_Test;
GO
-- Execute DATABASE_SCHEMA_SQLSERVER.sql

-- Seed test data
-- Execute seed scripts
```

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

// tests/setup.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL,
    },
  },
});

beforeAll(async () => {
  // Connect to test database
  await prisma.$connect();
});

afterAll(async () => {
  // Cleanup
  await prisma.$disconnect();
});
```

---

## 📚 Additional Resources

### Documentation
- [SQL Server Documentation](https://docs.microsoft.com/en-us/sql/)
- [Prisma with SQL Server](https://www.prisma.io/docs/concepts/database-connectors/sql-server)
- [Azure SQL Database](https://docs.microsoft.com/en-us/azure/azure-sql/)
- [Next.js with Prisma](https://www.prisma.io/nextjs)

### Tools
- [SQL Server Management Studio](https://aka.ms/ssmsfullsetup)
- [Azure Data Studio](https://aka.ms/azuredatastudio)
- [Prisma Studio](https://www.prisma.io/studio)

---

## ✅ Checklist for Setup

```
Development:
  ✅ Install SQL Server (Express/Docker)
  ✅ Install SSMS or Azure Data Studio
  ✅ Create database
  ✅ Run schema script
  ✅ Setup Prisma
  ✅ Configure .env.local
  ✅ Test connection
  ✅ Seed initial data

Production:
  ✅ Choose hosting (Azure SQL recommended)
  ✅ Create production database
  ✅ Run migrations
  ✅ Configure firewall rules
  ✅ Setup backups
  ✅ Enable monitoring
  ✅ Test connection from app
  ✅ Deploy application
```

---

**Created by:** AI Assistant  
**Date:** 2025-01-08  
**Status:** ✅ Complete SQL Server Configuration  
**Ready for:** Development & Production

---

SQL Server is enterprise-ready and perfect for this project! 🚀
