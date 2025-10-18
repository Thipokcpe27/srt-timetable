# 📊 การวิเคราะห์ระบบหลังบ้าน (Backend System Analysis)
## SRT Timetable - Information System Only

**เอกสารนี้**: วิเคราะห์และกำหนดระบบหลังบ้านสำหรับระบบให้ข้อมูลตารางเดินรถไฟ SRT  
**วันที่สร้าง**: 2025-01-08  
**สถานะปัจจุบัน**: Frontend-only with Mock Data  
**เป้าหมาย**: Information System with Real Database & API  

### ⚠️ Scope ของระบบ
- ✅ **ให้ข้อมูล**: ตารางเดินรถ, สถานี, ราคา, สิ่งอำนวยความสะดวก
- ✅ **ค้นหา**: ค้นหารถไฟตามต้นทาง-ปลายทาง
- ✅ **แสดงสถานะ**: สถานะรถไฟ real-time (ตรงเวลา/ล่าช้า/ยกเลิก)
- ✅ **วิเคราะห์**: สถิติการใช้งาน, รถไฟยอดนิยม
- ✅ **Admin**: จัดการข้อมูลรถไฟ, สถานี
- ❌ **ไม่มี**: ระบบจองตั๋ว, ชำระเงิน, user accounts

---

## 📋 สารบัญ

1. [ภาพรวมสถานะปัจจุบัน](#1-ภาพรวมสถานะปัจจุบัน)
2. [ระบบฐานข้อมูล](#2-ระบบฐานข้อมูล)
3. [ระบบ API Backend](#3-ระบบ-api-backend)
4. [ระบบ Admin Authentication](#4-ระบบ-admin-authentication)
5. [ระบบ Admin Panel](#5-ระบบ-admin-panel)
6. [ระบบ Analytics](#6-ระบบ-analytics)
7. [ระบบแจ้งเตือนสถานะรถไฟ](#7-ระบบแจ้งเตือนสถานะรถไฟ)
8. [ระบบ Cache & Performance](#8-ระบบ-cache--performance)
9. [แผนการพัฒนา](#9-แผนการพัฒนา)
10. [ประมาณการทรัพยากร](#10-ประมาณการทรัพยากร)

---

## 1. ภาพรวมสถานะปัจจุบัน

### ✅ สิ่งที่มีอยู่แล้ว (Frontend)
- ✅ UI/UX สมบูรณ์ (Next.js 15 + TypeScript)
- ✅ ระบบค้นหารถไฟ (Mock Data - 6 ขบวน)
- ✅ ระบบเปรียบเทียบรถไฟ (Compare up to 4 trains)
- ✅ ระบบกรองและเรียงลำดับ (4 วิธี)
- ✅ Search History (localStorage - 10 items)
- ✅ Popular Trains Section (Mock carousel)
- ✅ SRT Trips/Tourist Trains (6 แพ็กเกจ)
- ✅ Train Details (stops, schedules, classes, amenities)
- ✅ Accessibility Features (WCAG 2.2 AAA)
- ✅ Responsive Design
- ✅ Toast Notifications

### ❌ สิ่งที่ยังไม่มี (Backend)
- ❌ ฐานข้อมูล (Database)
- ❌ REST API
- ❌ Admin Panel
- ❌ Real-time Train Status
- ❌ Analytics System
- ❌ Image Upload/Storage

### 📊 โครงสร้างข้อมูลปัจจุบัน (Mock Data)
```typescript
- Stations: 12 สถานี
- Trains: 6 ขบวน
- Train Classes: 3 ชั้น/ขบวน
- Amenities: 8 รายการ
- Stop Schedules: เฉพาะ T001 (3 จุด)
- Tourist Trains: 6 แพ็กเกจ
```

---

## 2. ระบบฐานข้อมูล

### 🎯 เป้าหมาย
ฐานข้อมูลสำหรับเก็บข้อมูลรถไฟ, สถานี, สถานะ และสถิติการใช้งาน (ไม่มี user accounts)

### 📦 ตัวเลือก Database

#### ตัวเลือกที่ 1: Supabase (PostgreSQL) ⭐ แนะนำ
**ข้อดี:**
- ✅ PostgreSQL + REST API auto-generated
- ✅ Admin dashboard built-in
- ✅ Authentication for admin (ไม่ต้องเขียนเอง)
- ✅ File storage (รูปภาพ)
- ✅ Real-time subscriptions
- ✅ Free tier: 500MB database, 1GB storage

**ข้อเสีย:**
- ⚠️ Vendor lock-in (แต่เป็น PostgreSQL มาตรฐาน migrate ได้)

**เหมาะสม:** ⭐⭐⭐⭐⭐ ดีที่สุดสำหรับโปรเจคนี้

#### ตัวเลือกที่ 2: Railway + PostgreSQL
**ข้อดี:**
- ✅ PostgreSQL แท้
- ✅ ราคาถูก ($5/month)
- ✅ Deploy ง่าย

**ข้อเสีย:**
- ⚠️ ต้องเขียน API เอง
- ⚠️ ต้องจัดการ file storage เอง

**เหมาะสม:** ⭐⭐⭐ ถ้าต้องการ full control

#### ตัวเลือกที่ 3: Vercel Postgres + Blob Storage
**ข้อดี:**
- ✅ Integration กับ Vercel ดี
- ✅ Serverless
- ✅ จ่ายตามใช้

**ข้อเสีย:**
- ⚠️ ค่อนข้างแพง

**เหมาะสม:** ⭐⭐⭐⭐ ถ้าต้องการ all-in-one

### 📐 Database Schema (12 ตาราง)

```sql
-- ============================================
-- 1. STATIONS TABLE (สถานีรถไฟ)
-- ============================================
CREATE TABLE stations (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    name_en VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    region VARCHAR(50) NOT NULL, -- กลาง, เหนือ, ตะวันออกเฉียงเหนือ, ใต้
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    address TEXT,
    phone VARCHAR(20),
    facilities JSONB DEFAULT '[]', -- ["ATM", "Wi-Fi", "Parking"]
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_stations_region ON stations(region);
CREATE INDEX idx_stations_city ON stations(city);
CREATE INDEX idx_stations_active ON stations(is_active);

-- ============================================
-- 2. TRAINS TABLE (ข้อมูลรถไฟ)
-- ============================================
CREATE TABLE trains (
    id VARCHAR(10) PRIMARY KEY,
    train_number VARCHAR(20) UNIQUE NOT NULL,
    train_name VARCHAR(255) NOT NULL,
    train_name_en VARCHAR(255),
    train_type VARCHAR(50) NOT NULL, -- ด่วนพิเศษ, ด่วน, ธรรมดา, รถไฟชานเมือง
    origin_station_id VARCHAR(10) REFERENCES stations(id),
    destination_station_id VARCHAR(10) REFERENCES stations(id),
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    duration INTERVAL NOT NULL,
    distance_km INTEGER, -- ระยะทาง (กิโลเมตร)
    operating_days VARCHAR(50)[] DEFAULT ARRAY['daily'], -- ['daily'] หรือ ['monday', 'tuesday']
    is_active BOOLEAN DEFAULT true,
    notes TEXT, -- หมายเหตุเพิ่มเติม
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_trains_origin ON trains(origin_station_id);
CREATE INDEX idx_trains_destination ON trains(destination_station_id);
CREATE INDEX idx_trains_active ON trains(is_active);
CREATE INDEX idx_trains_type ON trains(train_type);

-- ============================================
-- 3. TRAIN_STOPS TABLE (สถานีที่แวะ)
-- ============================================
CREATE TABLE train_stops (
    id SERIAL PRIMARY KEY,
    train_id VARCHAR(10) REFERENCES trains(id) ON DELETE CASCADE,
    station_id VARCHAR(10) REFERENCES stations(id),
    stop_order INTEGER NOT NULL, -- ลำดับที่ (1, 2, 3, ...)
    arrival_time TIME, -- null สำหรับต้นทาง
    departure_time TIME, -- null สำหรับปลายทาง
    platform VARCHAR(10), -- ชานชาลา
    distance_from_origin INTEGER, -- กิโลเมตรจากสถานีต้นทาง
    duration_from_origin INTERVAL, -- เวลาจากสถานีต้นทาง
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_train_stops_train ON train_stops(train_id);
CREATE INDEX idx_train_stops_station ON train_stops(station_id);
CREATE UNIQUE INDEX idx_train_stops_unique ON train_stops(train_id, stop_order);

-- ============================================
-- 4. TRAIN_CLASSES TABLE (ชั้นที่นั่งและราคา)
-- ============================================
CREATE TABLE train_classes (
    id SERIAL PRIMARY KEY,
    train_id VARCHAR(10) REFERENCES trains(id) ON DELETE CASCADE,
    class_type VARCHAR(50) NOT NULL, -- first, business, economy
    class_name VARCHAR(100) NOT NULL, -- "ชั้น 1", "ชั้นธุรกิจ"
    class_name_en VARCHAR(100),
    base_price DECIMAL(10, 2) NOT NULL,
    total_seats INTEGER NOT NULL,
    features JSONB DEFAULT '[]', -- ["Wi-Fi", "ที่นั่งปรับเอน"]
    is_sleeper BOOLEAN DEFAULT false,
    seat_type VARCHAR(50), -- นั่ง, นอน, นอนปรับอากาศ
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_train_classes_train ON train_classes(train_id);

-- ============================================
-- 5. AMENITIES TABLE (สิ่งอำนวยความสะดวก)
-- ============================================
CREATE TABLE amenities (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    icon VARCHAR(10), -- emoji หรือ icon name
    category VARCHAR(50), -- connectivity, comfort, accessibility, dining
    created_at TIMESTAMP DEFAULT NOW()
);

-- Sample data
INSERT INTO amenities (id, name, name_en, icon, category) VALUES
('wifi', 'Wi-Fi ฟรี', 'Free Wi-Fi', '📶', 'connectivity'),
('power', 'ปลั๊กไฟ', 'Power Outlet', '🔌', 'connectivity'),
('ac', 'เครื่องปรับอากาศ', 'Air Conditioning', '❄️', 'comfort'),
('dining', 'รถเสบียง', 'Dining Car', '🍽️', 'dining'),
('accessible', 'เข้าถึงได้สำหรับผู้พิการ', 'Accessible', '♿', 'accessibility'),
('luggage', 'ที่เก็บกระเป๋า', 'Luggage Storage', '🧳', 'comfort'),
('toilet', 'ห้องน้ำ', 'Restroom', '🚻', 'comfort'),
('sleeper', 'ที่นอน', 'Sleeper', '🛏️', 'comfort');

-- ============================================
-- 6. TRAIN_AMENITIES TABLE (สิ่งอำนวยความสะดวกของรถไฟแต่ละขบวน)
-- ============================================
CREATE TABLE train_amenities (
    train_id VARCHAR(10) REFERENCES trains(id) ON DELETE CASCADE,
    amenity_id VARCHAR(20) REFERENCES amenities(id),
    is_available BOOLEAN DEFAULT true,
    notes TEXT, -- หมายเหตุเพิ่มเติม
    PRIMARY KEY (train_id, amenity_id)
);

-- ============================================
-- 7. TOURIST_TRAINS TABLE (รถไฟท่องเที่ยว/แพ็กเกจ)
-- ============================================
CREATE TABLE tourist_trains (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    category VARCHAR(50), -- luxury, cultural, scenic, adventure
    description TEXT,
    description_en TEXT,
    highlights JSONB DEFAULT '[]', -- ["วิวสวย", "อาหารพิเศษ"]
    route_info TEXT, -- "กรุงเทพ - น้ำตก - กาญจนบุรี"
    duration VARCHAR(50), -- "1 วัน 2 คืน"
    starting_price DECIMAL(10, 2),
    image_url TEXT,
    rating DECIMAL(2, 1) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    booking_url TEXT, -- Link ไปหน้าจองภายนอก (SRT D-Ticket)
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tourist_trains_category ON tourist_trains(category);
CREATE INDEX idx_tourist_trains_available ON tourist_trains(is_available);

-- ============================================
-- 8. TRAIN_STATUS TABLE (สถานะรถไฟ real-time)
-- ============================================
CREATE TABLE train_status (
    id SERIAL PRIMARY KEY,
    train_id VARCHAR(10) REFERENCES trains(id),
    status_date DATE NOT NULL,
    current_status VARCHAR(50) DEFAULT 'on_time', -- on_time, delayed, cancelled, completed
    delay_minutes INTEGER DEFAULT 0,
    current_station_id VARCHAR(10) REFERENCES stations(id),
    estimated_arrival TIME, -- เวลาถึงที่คาดการณ์ใหม่
    remarks TEXT, -- หมายเหตุ/เหตุผล
    last_updated TIMESTAMP DEFAULT NOW(),
    UNIQUE(train_id, status_date)
);

CREATE INDEX idx_train_status_train ON train_status(train_id);
CREATE INDEX idx_train_status_date ON train_status(status_date);
CREATE INDEX idx_train_status_status ON train_status(current_status);

-- ============================================
-- 9. SEARCH_HISTORY TABLE (ประวัติการค้นหา - anonymous)
-- ============================================
CREATE TABLE search_history (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(100), -- anonymous session
    origin_station_id VARCHAR(10) REFERENCES stations(id),
    destination_station_id VARCHAR(10) REFERENCES stations(id),
    search_date DATE,
    results_count INTEGER,
    user_agent TEXT, -- เก็บ browser/device info
    searched_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_search_history_date ON search_history(search_date);
CREATE INDEX idx_search_history_route ON search_history(origin_station_id, destination_station_id);

-- ============================================
-- 10. POPULAR_TRAINS TABLE (รถไฟยอดนิยม)
-- ============================================
CREATE TABLE popular_trains (
    train_id VARCHAR(10) PRIMARY KEY REFERENCES trains(id),
    search_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    rank INTEGER,
    trend VARCHAR(10) DEFAULT 'stable', -- up, down, stable
    last_updated TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_popular_trains_rank ON popular_trains(rank);

-- ============================================
-- 11. ADMIN_USERS TABLE (ผู้ดูแลระบบ)
-- ============================================
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(20) DEFAULT 'admin', -- admin, super_admin
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_active ON admin_users(is_active);

-- ============================================
-- 12. ADMIN_LOGS TABLE (ประวัติการแก้ไขของ admin)
-- ============================================
CREATE TABLE admin_logs (
    id SERIAL PRIMARY KEY,
    admin_id UUID REFERENCES admin_users(id),
    action VARCHAR(100) NOT NULL, -- create, update, delete
    resource VARCHAR(50), -- trains, stations, tourist_trains
    resource_id VARCHAR(100),
    changes JSONB DEFAULT '{}', -- บันทึกการเปลี่ยนแปลง
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_action ON admin_logs(action);
CREATE INDEX idx_admin_logs_resource ON admin_logs(resource);
CREATE INDEX idx_admin_logs_date ON admin_logs(created_at);
```

### 🔗 Relationships

```
stations (1) ----< trains (N) - origin
stations (1) ----< trains (N) - destination
stations (1) ----< train_stops (N)
trains (1) ----< train_stops (N)
trains (1) ----< train_classes (N)
trains (N) ----< amenities (N) - many-to-many through train_amenities
trains (1) ----< train_status (N)
trains (1) ----< popular_trains (1)
```

### 📊 ขนาดข้อมูลประมาณการ

```
Stations:         ~200 records        (20 KB)
Trains:           ~500 records        (100 KB)
Train Stops:      ~2,000 records      (200 KB)
Train Classes:    ~1,500 records      (150 KB)
Amenities:        ~20 records         (2 KB)
Train Amenities:  ~4,000 records      (40 KB)
Tourist Trains:   ~50 records         (50 KB)
Train Status:     ~365 x 500          (18 MB/year)
Search History:   ~100,000/month      (10 MB/month)
Popular Trains:   ~100 records        (10 KB)
Admin Users:      ~10 records         (1 KB)
Admin Logs:       ~1,000/month        (100 KB/month)

Total (Year 1):   ~50-100 MB
```

---

## 3. ระบบ API Backend

### 🎯 เป้าหมาย
REST API สำหรับให้ข้อมูล (ส่วนใหญ่เป็น read-only)

### 📦 Technology Stack แนะนำ

#### Next.js API Routes (แนะนำ) ⭐
```typescript
// ใช้ Next.js 15 App Router API Routes
app/
  api/
    stations/
      route.ts                 // GET /api/stations
      [id]/route.ts           // GET /api/stations/:id
    trains/
      route.ts                 // GET /api/trains
      [id]/route.ts           // GET /api/trains/:id
      search/route.ts         // POST /api/trains/search
      popular/route.ts        // GET /api/trains/popular
    tourist-trains/
      route.ts                 // GET /api/tourist-trains
      [id]/route.ts           // GET /api/tourist-trains/:id
    train-status/
      [id]/route.ts           // GET /api/train-status/:id
    analytics/
      route.ts                 // GET /api/analytics (public stats)
    admin/
      trains/route.ts         // POST, PUT, DELETE (protected)
      stations/route.ts       // POST, PUT, DELETE (protected)
      status/route.ts         // PUT (protected)
      auth/
        login/route.ts        // POST /api/admin/auth/login
```

### 📋 API Endpoints

#### 3.1 Public Endpoints (ไม่ต้อง auth)

```typescript
// ========================================
// STATIONS API
// ========================================
GET    /api/stations
Response: {
  success: true,
  data: [
    {
      id: "BKK",
      name: "กรุงเทพ (หัวลำโพง)",
      code: "BKK",
      city: "กรุงเทพมหานคร",
      region: "กลาง",
      latitude: 13.7372,
      longitude: 100.5498,
      facilities: ["ATM", "Wi-Fi", "Parking"]
    }
  ]
}

GET    /api/stations/:id
Response: {
  success: true,
  data: { /* station detail */ }
}

// ========================================
// TRAINS API
// ========================================
GET    /api/trains
Query: ?origin=BKK&destination=CNX&limit=20
Response: {
  success: true,
  data: [
    {
      id: "T001",
      trainNumber: "SP001",
      trainName: "ด่วนพิเศษกรุงเทพ-เชียงใหม่",
      origin: "BKK",
      destination: "CNX",
      departureTime: "08:30",
      arrivalTime: "20:15",
      duration: "11:45:00",
      distanceKm: 751,
      classes: [...],
      amenities: [...],
      stops: [...]
    }
  ],
  meta: {
    total: 156,
    page: 1,
    perPage: 20
  }
}

POST   /api/trains/search
Body: {
  origin: "BKK",
  destination: "CNX",
  date?: "2025-01-15" // optional
}
Response: { /* filtered trains */ }

GET    /api/trains/:id
Response: {
  success: true,
  data: {
    /* train detail with full stops, classes, amenities */
  }
}

GET    /api/trains/:id/stops
Response: {
  success: true,
  data: [
    {
      stopOrder: 1,
      station: { id: "BKK", name: "กรุงเทพ" },
      arrivalTime: null,
      departureTime: "08:30",
      platform: "3",
      distanceFromOrigin: 0
    }
  ]
}

GET    /api/trains/popular?limit=10
Response: {
  success: true,
  data: [
    {
      rank: 1,
      train: { /* train data */ },
      searchCount: 1250,
      trend: "up"
    }
  ]
}

// ========================================
// TOURIST TRAINS API
// ========================================
GET    /api/tourist-trains
Query: ?category=luxury&available=true
Response: {
  success: true,
  data: [
    {
      id: "TOUR001",
      name: "รถไฟหรูตะวันออก",
      category: "luxury",
      description: "...",
      routeInfo: "กรุงเทพ - อรัญประเทศ",
      duration: "2 วัน 1 คืน",
      startingPrice: 25000,
      rating: 4.8,
      reviewCount: 124,
      bookingUrl: "https://dticket.railway.co.th/..."
    }
  ]
}

GET    /api/tourist-trains/:id
Response: { /* detail */ }

// ========================================
// TRAIN STATUS API (Real-time)
// ========================================
GET    /api/train-status/:trainId
Query: ?date=2025-01-08
Response: {
  success: true,
  data: {
    trainId: "T001",
    date: "2025-01-08",
    currentStatus: "delayed",
    delayMinutes: 15,
    currentStation: { id: "AYA", name: "พระนครศรีอยุธยา" },
    remarks: "รอรถไฟขบวนหน้า",
    lastUpdated: "2025-01-08T10:30:00Z"
  }
}

// ========================================
// ANALYTICS API (Public stats)
// ========================================
GET    /api/analytics/public
Response: {
  success: true,
  data: {
    totalTrains: 500,
    totalStations: 200,
    popularRoutes: [
      { origin: "BKK", destination: "CNX", count: 15420 }
    ],
    searchesToday: 3250
  }
}
```

#### 3.2 Admin Endpoints (ต้อง auth)

```typescript
// ========================================
// ADMIN AUTH
// ========================================
POST   /api/admin/auth/login
Body: { email, password }
Response: {
  success: true,
  data: {
    token: "jwt_token_here",
    admin: { id, email, fullName, role }
  }
}

POST   /api/admin/auth/logout
GET    /api/admin/auth/me

// ========================================
// ADMIN - TRAINS MANAGEMENT
// ========================================
POST   /api/admin/trains
Body: { trainNumber, trainName, origin, destination, ... }

PUT    /api/admin/trains/:id
Body: { /* updated fields */ }

DELETE /api/admin/trains/:id

PUT    /api/admin/trains/:id/toggle-active
Body: { isActive: false }

// ========================================
// ADMIN - STATIONS MANAGEMENT
// ========================================
POST   /api/admin/stations
PUT    /api/admin/stations/:id
DELETE /api/admin/stations/:id

// ========================================
// ADMIN - TRAIN STATUS UPDATE
// ========================================
PUT    /api/admin/train-status/:trainId
Body: {
  date: "2025-01-08",
  status: "delayed",
  delayMinutes: 15,
  remarks: "รอรถไฟขบวนหน้า"
}

// ========================================
// ADMIN - TOURIST TRAINS
// ========================================
POST   /api/admin/tourist-trains
PUT    /api/admin/tourist-trains/:id
DELETE /api/admin/tourist-trains/:id

// ========================================
// ADMIN - ANALYTICS
// ========================================
GET    /api/admin/analytics/overview
GET    /api/admin/analytics/searches
GET    /api/admin/analytics/popular-routes
GET    /api/admin/logs
```

### 🔒 API Security

```typescript
// 1. Rate Limiting
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 req/min
});

// 2. Input Validation (Zod)
import { z } from "zod";

const searchSchema = z.object({
  origin: z.string().length(3),
  destination: z.string().length(3),
  date: z.string().optional()
});

// 3. CORS
const allowedOrigins = [
  'https://srt-timetable.vercel.app',
  'http://localhost:3000'
];

// 4. JWT for Admin
import jwt from 'jsonwebtoken';

const verifyAdmin = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET!);
};
```

---

## 4. ระบบ Admin Authentication

### 🎯 เป้าหมาย
Authentication สำหรับ admin เท่านั้น (ไม่มี public user accounts)

### 📦 ตัวเลือก

#### ตัวเลือกที่ 1: NextAuth.js (แนะนำ) ⭐
```bash
npm install next-auth
```

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Query admin_users table
        const admin = await db.admin_users.findOne({
          email: credentials.email
        });
        
        if (!admin) return null;
        
        const isValid = await compare(
          credentials.password,
          admin.password_hash
        );
        
        if (!isValid) return null;
        
        return {
          id: admin.id,
          email: admin.email,
          name: admin.full_name,
          role: admin.role
        };
      }
    })
  ],
  pages: {
    signIn: "/admin/login"
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.role = token.role;
      return session;
    }
  }
};

export default NextAuth(authOptions);
```

#### ตัวเลือกที่ 2: Supabase Auth
```typescript
// ใช้ Supabase Auth โดยตรง
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'admin@srt.com',
  password: 'password'
});
```

### 🔐 Admin Roles

```typescript
enum AdminRole {
  ADMIN = 'admin',           // จัดการข้อมูลทั่วไป
  SUPER_ADMIN = 'super_admin' // จัดการ admin accounts
}

// Permissions
const permissions = {
  admin: [
    'read_trains',
    'create_train',
    'update_train',
    'delete_train',
    'read_stations',
    'create_station',
    'update_station',
    'update_train_status',
    'read_analytics'
  ],
  super_admin: [
    // All admin permissions +
    'manage_admins',
    'view_admin_logs'
  ]
};
```

---

## 5. ระบบ Admin Panel

### 🎯 เป้าหมาย
Dashboard สำหรับ admin จัดการข้อมูลรถไฟ

### 📊 Admin Features

```typescript
/admin
  /login               - หน้า login
  /dashboard           - ภาพรวม (stats)
  /trains              - จัดการรถไฟ (CRUD)
    /new               - เพิ่มรถไฟใหม่
    /[id]/edit         - แก้ไขรถไฟ
  /stations            - จัดการสถานี (CRUD)
    /new
    /[id]/edit
  /tourist-trains      - จัดการรถไฟท่องเที่ยว
    /new
    /[id]/edit
  /train-status        - อัพเดทสถานะรถไฟ real-time
  /analytics           - สถิติการใช้งาน
  /logs                - ประวัติการแก้ไข
  /settings            - ตั้งค่า
```

### 🎨 UI Components

```typescript
// Tech Stack
- shadcn/ui components
- React Hook Form + Zod validation
- TanStack Table (data tables)
- Recharts (charts)
- React Dropzone (image upload)

// Key Components
1. DataTable (reusable)
   - Sorting
   - Filtering
   - Pagination
   - Bulk actions

2. TrainForm
   - Basic info
   - Stops management
   - Classes & pricing
   - Amenities selection

3. StationForm
   - Basic info
   - Location (map picker)
   - Facilities
   - Image upload

4. StatusUpdatePanel
   - Select train & date
   - Update status (on-time/delayed/cancelled)
   - Set delay minutes
   - Add remarks

5. AnalyticsDashboard
   - Stats cards
   - Charts (searches, popular routes)
   - Date range picker
```

### 📋 Dashboard Overview

```typescript
// /admin/dashboard
interface DashboardStats {
  totalTrains: number;
  activeTrains: number;
  totalStations: number;
  totalTouristTrains: number;
  searchesToday: number;
  searchesThisMonth: number;
  popularRouteToday: {
    origin: string;
    destination: string;
    count: number;
  };
  recentUpdates: AdminLog[];
}

// Widgets
1. Stats Cards (4 cards)
   - Total Trains
   - Active Trains
   - Stations
   - Searches Today

2. Popular Routes Chart (last 7 days)

3. Search Trends Chart (last 30 days)

4. Recent Activity Log (last 20 actions)

5. Quick Actions
   - Add New Train
   - Update Train Status
   - Add Station
```

---

## 6. ระบบ Analytics

### 🎯 เป้าหมาย
วิเคราะห์การใช้งานเว็บไซต์และพฤติกรรมผู้ใช้

### 📊 Metrics to Track

```typescript
// 1. Search Analytics
- Total searches
- Searches by route (origin → destination)
- Searches by date
- Search trends (daily/weekly/monthly)
- Most searched routes
- Peak search times

// 2. Train Analytics
- Most viewed trains
- Most compared trains
- Popular train types
- Popular classes

// 3. User Behavior
- Page views
- Session duration
- Device breakdown (mobile/desktop)
- Geographic distribution
- Bounce rate

// 4. Technical Metrics
- API response time
- Error rate
- Page load time
- Core Web Vitals
```

### 📈 Implementation

```typescript
// Track search
POST /api/analytics/track-search
Body: {
  origin: "BKK",
  destination: "CNX",
  resultsCount: 5,
  sessionId: "uuid"
}

// Track view
POST /api/analytics/track-view
Body: {
  trainId: "T001",
  sessionId: "uuid"
}

// Get analytics (admin)
GET /api/admin/analytics/searches
Query: ?startDate=2025-01-01&endDate=2025-01-31
Response: {
  totalSearches: 45620,
  byRoute: [
    { origin: "BKK", destination: "CNX", count: 5420 },
    { origin: "BKK", destination: "HYI", count: 4210 }
  ],
  trend: "up",
  growthRate: 15.5
}
```

### 🔧 Tools

```typescript
// 1. Google Analytics 4 (GA4)
- Page views
- Events
- User demographics

// 2. Vercel Analytics
- Performance metrics
- Core Web Vitals

// 3. Custom Analytics (Database)
- Search history table
- Popular trains table
- Custom queries
```

---

## 7. ระบบแจ้งเตือนสถานะรถไฟ

### 🎯 เป้าหมาย
แจ้งเตือนเมื่อรถไฟล่าช้าหรือยกเลิก (สำหรับแสดงบนหน้าเว็บ)

### 📢 Features

```typescript
// 1. Status Banner (หน้าหลัก)
<StatusBanner>
  ⚠️ รถไฟ SP001 ล่าช้า 15 นาที - อัพเดทเมื่อ 10:30
</StatusBanner>

// 2. Status Badge (TrainCard)
<TrainCard>
  <StatusBadge status="delayed" delayMinutes={15} />
</TrainCard>

// 3. Status Detail (TrainDetail page)
<StatusDetail>
  สถานะ: ล่าช้า 15 นาที
  อัพเดทล่าสุด: 10:30
  หมายเหตุ: รอรถไฟขบวนหน้า
  เวลาถึงที่คาดการณ์: 20:30 (เดิม 20:15)
</StatusDetail>

// 4. Real-time Updates (ถ้าทำ)
- WebSocket connection
- Auto refresh every 1 minute
- Server-Sent Events (SSE)
```

### 🔄 Update Flow

```
1. Admin อัพเดทสถานะผ่าน Admin Panel
   PUT /api/admin/train-status/:trainId
   
2. บันทึกลง train_status table
   
3. Frontend fetch สถานะใหม่
   GET /api/train-status/:trainId?date=today
   
4. แสดงผลบนหน้าเว็บ
   - Status banner
   - Train card badge
   - Detail page
```

---

## 8. ระบบ Cache & Performance

### 🎯 เป้าหมาย
เพิ่มความเร็ว ลดภาระ database

### ⚡ Caching Strategy

```typescript
// 1. Next.js Route Caching
export const revalidate = 300; // 5 minutes

// 2. API Route Caching
export async function GET(request: Request) {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
    }
  });
}

// 3. ISR (Incremental Static Regeneration)
// app/trains/[id]/page.tsx
export const revalidate = 3600; // 1 hour

// 4. Redis Cache (Optional)
import { Redis } from '@upstash/redis';
const redis = Redis.fromEnv();

async function getTrains() {
  // Try cache first
  const cached = await redis.get('trains:all');
  if (cached) return cached;
  
  // Fetch from DB
  const trains = await db.trains.findMany();
  
  // Cache for 1 hour
  await redis.setex('trains:all', 3600, trains);
  
  return trains;
}
```

### 📊 Performance Targets

```typescript
✅ TTFB: < 200ms
✅ FCP: < 1s
✅ LCP: < 2.5s
✅ API Response: < 300ms
✅ Database Query: < 100ms
```

---

## 9. แผนการพัฒนา

### 📅 Phase 1: Foundation (2 สัปดาห์)

#### Week 1: Database & Basic API
- [ ] Setup Supabase project
- [ ] Create database schema (12 tables)
- [ ] Seed data
  - 20 stations
  - 10 trains (with stops, classes, amenities)
  - 6 tourist trains
  - 8 amenities
- [ ] Create API routes
  - GET /api/stations
  - GET /api/trains
  - POST /api/trains/search
  - GET /api/trains/:id
  - GET /api/tourist-trains

#### Week 2: Frontend Integration
- [ ] Replace mock data with real API
- [ ] Add loading states
- [ ] Add error handling
- [ ] Update TrainCard component
- [ ] Update TrainResults component
- [ ] Test search functionality
- [ ] Test popular trains
- [ ] Test tourist trains

**Deliverables:**
✅ Working database  
✅ Search with real data  
✅ All frontend features working  

---

### 📅 Phase 2: Admin Panel (2 สัปดาห์)

#### Week 3: Admin Auth & UI
- [ ] Setup NextAuth.js
- [ ] Create admin login page
- [ ] Create admin layout
- [ ] Create dashboard overview
- [ ] Stats widgets
- [ ] Charts (Recharts)

#### Week 4: CRUD Features
- [ ] Trains management
  - List trains (table)
  - Add new train (form)
  - Edit train (form)
  - Delete train (confirm)
  - Manage stops
  - Manage classes
- [ ] Stations management
  - List stations
  - Add/Edit/Delete
  - Image upload
- [ ] Tourist trains management
  - Add/Edit/Delete

**Deliverables:**
✅ Admin login  
✅ Dashboard  
✅ Full CRUD for trains & stations  

---

### 📅 Phase 3: Real-time Status & Analytics (1 สัปดาห์)

#### Week 5: Status & Analytics
- [ ] Train status update (admin)
- [ ] Display status on frontend
  - Status banner
  - Status badge on cards
  - Status detail page
- [ ] Analytics tracking
  - Track searches
  - Track views
- [ ] Analytics dashboard (admin)
  - Search trends chart
  - Popular routes
  - Stats summary

**Deliverables:**
✅ Real-time train status  
✅ Analytics system  

---

### 📅 Phase 4: Optimization & Launch (1 สัปดาห์)

#### Week 6: Polish & Deploy
- [ ] Performance optimization
  - Add caching
  - Image optimization
  - Code splitting
- [ ] Testing
  - E2E tests (Playwright)
  - Load testing
- [ ] Documentation
  - API docs
  - Admin user guide
- [ ] Deploy to production
  - Setup custom domain
  - SSL certificate
  - Monitoring (Sentry)

**Deliverables:**
✅ Production-ready app  
✅ Optimized performance  
✅ Live website  

---

### 🎯 Total Timeline: 6 สัปดาห์ (1.5 เดือน)

---

## 10. ประมาณการทรัพยากร

### 💰 ค่าใช้จ่าย (Monthly)

```typescript
// Hosting & Infrastructure
Supabase Free Tier:         $0
- 500MB database
- 1GB storage
- 50K monthly active users
- Unlimited API requests

Vercel Free Tier:            $0
- 100GB bandwidth
- Unlimited deployments
- Edge functions

Cloudinary Free:             $0
- 25GB storage
- 25GB bandwidth
(สำหรับรูปภาพรถไฟ/สถานี)

Total:                       $0/month 🎉
```

```typescript
// เมื่อ scale ขึ้น (10,000+ users/day)
Supabase Pro:                $25/month
- 8GB database
- 100GB storage
- Automatic backups

Vercel Pro:                  $20/month
- 1TB bandwidth
- Advanced analytics

Cloudinary Pro:              $99/month
- 190GB storage/month
(หรือใช้ Supabase storage แทน)

Total:                       $45-144/month
```

### 👥 Development Team

```typescript
// Minimum (1 คน)
Full-stack Developer:        
- TypeScript, Next.js, PostgreSQL
- Timeline: 6 สัปดาห์ full-time
- หรือ 12 สัปดาห์ part-time

// Optimal (2 คน)
Frontend Developer:          4 สัปดาห์
Backend Developer:           4 สัปดาห์
(ทำพร้อมกัน = 4 สัปดาห์จบ)
```

### 📊 Estimated Costs (Development)

```typescript
// Freelancer Rates (Thailand)
Junior:                      ฿300-500/hour
Mid-level:                   ฿500-800/hour
Senior:                      ฿800-1,500/hour

// Total Hours: 180-240 hours
Junior:                      ฿54,000 - ฿120,000
Mid-level:                   ฿90,000 - ฿192,000
Senior:                      ฿144,000 - ฿360,000
```

---

## 🎯 สรุปและคำแนะนำ

### ✅ สิ่งที่ต้องทำเป็นอันดับแรก

1. **Phase 1 - Database & API** (ต้องทำก่อน)
   - ✅ Setup Supabase
   - ✅ Create database schema
   - ✅ Seed data
   - ✅ Create API routes
   - ✅ Replace mock data

2. **Phase 2 - Admin Panel** (จำเป็น)
   - ✅ Admin login
   - ✅ Trains CRUD
   - ✅ Stations CRUD

3. **Phase 3 - Status & Analytics** (สำคัญ)
   - ✅ Train status system
   - ✅ Analytics tracking

4. **Phase 4 - Launch** (สุดท้าย)
   - Optimization
   - Testing
   - Deploy

### 🛠️ Tech Stack แนะนำ

```typescript
✅ Frontend (มีอยู่แล้ว)
- Next.js 15 + TypeScript
- Tailwind CSS
- shadcn/ui

✅ Backend (ต้องเพิ่ม)
- Supabase (Database + Storage + Auth)
- Next.js API Routes
- NextAuth.js

✅ Tools
- Zod (Validation)
- TanStack Table (Admin tables)
- Recharts (Charts)
- Cloudinary (Images) หรือ Supabase Storage
```

### 💡 Key Advantages

1. **ไม่มีระบบจอง = เรียบง่าย**
   - ไม่ต้องจัดการ payment gateway
   - ไม่ต้อง handle race conditions
   - ไม่ต้อง user management
   - ไม่ต้อง email notifications

2. **ฟรีทั้งหมด (จนกว่าจะ scale)**
   - Supabase Free Tier เพียงพอมาก
   - Vercel Free Tier deploy ได้เลย
   - ไม่ต้องจ่ายอะไรเลย

3. **พัฒนาเร็ว**
   - 6 สัปดาห์เสร็จ (1 คน full-time)
   - หรือ 3 เดือนถ้าทำ part-time

---

## 📞 Next Steps

### 1. ตัดสินใจ
- ✅ ใช้ Supabase?
- ✅ ใช้ NextAuth.js หรือ Supabase Auth?
- ✅ เริ่มเมื่อไหร่?

### 2. Setup Environment
```bash
# Install dependencies
npm install @supabase/supabase-js
npm install next-auth
npm install zod
npm install @tanstack/react-table
npm install recharts

# Environment variables
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

### 3. เริ่ม Phase 1
- สร้าง Supabase project
- Run database schema
- สร้าง API routes แรก
- Test กับ Frontend

---

**เอกสารนี้สร้างโดย:** AI Assistant  
**วันที่:** 2025-01-08  
**เวอร์ชัน:** 2.0 (Information System Only)  
**สถานะ:** ✅ Complete

**พร้อมเริ่มพัฒนาเมื่อไหร่ก็บอกได้เลยครับ!** 🚀
