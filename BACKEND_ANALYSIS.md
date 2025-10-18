# 📊 การวิเคราะห์ระบบหลังบ้าน (Backend System Analysis)
## SRT Timetable Application - Information System Only

**เอกสารนี้**: วิเคราะห์และกำหนดระบบหลังบ้านที่จำเป็นสำหรับแอปพลิเคชันตารางเดินรถไฟ SRT  
**วันที่สร้าง**: 2025-01-08  
**สถานะปัจจุบัน**: Frontend-only with Mock Data  
**เป้าหมาย**: Information System with Real Database & API (ไม่มีระบบจอง)  
**⚠️ หมายเหตุ**: ระบบนี้เน้นการให้ข้อมูลอย่างเดียว ไม่มีระบบจองตั๋ว

---

## 📋 สารบัญ

1. [ภาพรวมสถานะปัจจุบัน](#1-ภาพรวมสถานะปัจจุบัน)
2. [ระบบฐานข้อมูล (Database)](#2-ระบบฐานข้อมูล-database)
3. [ระบบ API Backend](#3-ระบบ-api-backend)
4. [ระบบ Admin Authentication](#4-ระบบ-admin-authentication)
5. [ระบบ Admin Panel](#5-ระบบ-admin-panel)
6. [ระบบ Analytics & Monitoring](#6-ระบบ-analytics--monitoring)
7. [ระบบ Notifications (Train Status)](#7-ระบบ-notifications-train-status)
8. [ระบบ Cache & Performance](#8-ระบบ-cache--performance)
9. [แผนการพัฒนา (Roadmap)](#9-แผนการพัฒนา-roadmap)
10. [ประมาณการทรัพยากร](#10-ประมาณการทรัพยากร)

---

## 1. ภาพรวมสถานะปัจจุบัน

### ✅ สิ่งที่มีอยู่แล้ว (Frontend)
- ✅ UI/UX สมบูรณ์ (Next.js 15 + TypeScript)
- ✅ ระบบค้นหารถไฟ (Mock Data)
- ✅ ระบบเปรียบเทียบรถไฟ (Compare up to 4 trains)
- ✅ ระบบกรองและเรียงลำดับ (Filtering & Sorting)
- ✅ Search History (localStorage)
- ✅ Popular Trains Section (Mock Data)
- ✅ SRT Trips/Tourist Trains Section
- ✅ Accessibility Features (WCAG 2.2 AAA)
- ✅ Responsive Design
- ✅ Toast Notifications

### ❌ สิ่งที่ยังไม่มี (Backend)
- ❌ ฐานข้อมูล (Database)
- ❌ REST API
- ❌ Admin Authentication
- ❌ Admin Panel สำหรับจัดการข้อมูล
- ❌ Real-time Train Status
- ❌ Analytics System
- ❌ File Storage สำหรับรูปภาพ

### 📊 โครงสร้างข้อมูลปัจจุบัน
```typescript
// ข้อมูลที่มีอยู่ (Mock Data)
- Stations (12 สถานี)
- Trains (6 ขบวน)
- Train Classes (ชั้น 1, ธุรกิจ, ประหยัด)
- Amenities (Wi-Fi, ปลั๊กไฟ, ฯลฯ)
- Stop Schedules (เวลารถถึง-ออก)
- Tourist Trains (6 แพ็กเกจ)
```

---

## 2. ระบบฐานข้อมูล (Database)

### 🎯 เป้าหมาย
สร้างฐานข้อมูลที่รองรับข้อมูลรถไฟ, สถานี, สถานะรถไฟ และระบบวิเคราะห์การใช้งาน

### 📦 ตัวเลือก Database

#### ตัวเลือกที่ 1: PostgreSQL (แนะนำ) ⭐
**ข้อดี:**
- ✅ Open-source, ฟรี
- ✅ รองรับ JSON, Full-text Search
- ✅ Spatial data (GIS) สำหรับแผนที่
- ✅ Transaction support แข็งแกร่ง
- ✅ ใช้ได้กับ Vercel, Railway, Supabase

**ข้อเสีย:**
- ⚠️ ซับซ้อนกว่า SQLite
- ⚠️ ต้องการ Server/Hosting

**Use Cases:**
- Production-ready
- รองรับ user จำนวนมาก (10,000+ users)
- ต้องการ complex queries

#### ตัวเลือกที่ 2: MongoDB
**ข้อดี:**
- ✅ NoSQL, flexible schema
- ✅ ดีสำหรับ unstructured data
- ✅ Scale ง่าย (horizontal scaling)

**ข้อเสีย:**
- ⚠️ ไม่มี JOIN แบบ SQL
- ⚠️ Transaction support จำกัด
- ⚠️ ไม่เหมาะกับระบบจอง (ต้องการ ACID)

#### ตัวเลือกที่ 3: Supabase (PostgreSQL + Backend) ⚡
**ข้อดี:**
- ✅ PostgreSQL + REST API auto-generated
- ✅ Authentication built-in
- ✅ Real-time subscriptions
- ✅ File storage
- ✅ Free tier: 500MB database, 2GB storage

**ข้อเสีย:**
- ⚠️ Vendor lock-in
- ⚠️ Paid tier เริ่ม $25/month

**Use Cases:** (แนะนำสำหรับโปรเจคนี้)
- Rapid development
- ต้องการ auth + database + API
- Budget จำกัด

### 📐 Database Schema Design

**⚠️ หมายเหตุ:** Schema นี้ออกแบบสำหรับระบบให้ข้อมูลเท่านั้น ไม่มีตารางที่เกี่ยวกับการจอง, การชำระเงิน หรือ user accounts

#### 2.1 Tables หลัก (12 ตาราง)

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
    region VARCHAR(50) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    address TEXT,
    facilities JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_stations_region ON stations(region);
CREATE INDEX idx_stations_city ON stations(city);

-- ============================================
-- 2. TRAINS TABLE (ข้อมูลรถไฟ)
-- ============================================
CREATE TABLE trains (
    id VARCHAR(10) PRIMARY KEY,
    train_number VARCHAR(20) UNIQUE NOT NULL,
    train_name VARCHAR(255) NOT NULL,
    train_name_en VARCHAR(255),
    train_type VARCHAR(50) NOT NULL, -- ด่วนพิเศษ, ด่วน, ธรรมดา
    origin_station_id VARCHAR(10) REFERENCES stations(id),
    destination_station_id VARCHAR(10) REFERENCES stations(id),
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    duration INTERVAL NOT NULL,
    operating_days VARCHAR(50)[] DEFAULT ARRAY['daily'],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_trains_origin ON trains(origin_station_id);
CREATE INDEX idx_trains_destination ON trains(destination_station_id);
CREATE INDEX idx_trains_active ON trains(is_active);

-- ============================================
-- 3. TRAIN_STOPS TABLE (สถานีที่แวะ)
-- ============================================
CREATE TABLE train_stops (
    id SERIAL PRIMARY KEY,
    train_id VARCHAR(10) REFERENCES trains(id) ON DELETE CASCADE,
    station_id VARCHAR(10) REFERENCES stations(id),
    stop_order INTEGER NOT NULL,
    arrival_time TIME,
    departure_time TIME,
    platform VARCHAR(10),
    distance_from_origin INTEGER, -- กิโลเมตร
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_train_stops_train ON train_stops(train_id);
CREATE INDEX idx_train_stops_station ON train_stops(station_id);
CREATE UNIQUE INDEX idx_train_stops_unique ON train_stops(train_id, stop_order);

-- ============================================
-- 4. TRAIN_CLASSES TABLE (ชั้นที่นั่ง)
-- ============================================
CREATE TABLE train_classes (
    id SERIAL PRIMARY KEY,
    train_id VARCHAR(10) REFERENCES trains(id) ON DELETE CASCADE,
    class_type VARCHAR(50) NOT NULL, -- first, business, economy
    class_name VARCHAR(100) NOT NULL,
    class_name_en VARCHAR(100),
    base_price DECIMAL(10, 2) NOT NULL,
    total_seats INTEGER NOT NULL,
    features JSONB DEFAULT '[]',
    is_sleeper BOOLEAN DEFAULT false,
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
    icon VARCHAR(10),
    category VARCHAR(50), -- connectivity, comfort, accessibility
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 6. TRAIN_AMENITIES TABLE (สิ่งอำนวยความสะดวกของรถไฟ)
-- ============================================
CREATE TABLE train_amenities (
    train_id VARCHAR(10) REFERENCES trains(id) ON DELETE CASCADE,
    amenity_id VARCHAR(20) REFERENCES amenities(id),
    is_available BOOLEAN DEFAULT true,
    PRIMARY KEY (train_id, amenity_id)
);

-- ============================================
-- 7. USERS TABLE (ผู้ใช้งาน)
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- สำหรับ email/password auth
    full_name VARCHAR(255),
    phone VARCHAR(20),
    date_of_birth DATE,
    national_id VARCHAR(20), -- เลขบัตรประชาชน
    passport_no VARCHAR(20),
    role VARCHAR(20) DEFAULT 'user', -- user, admin, staff
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- 8. USER_PROFILES TABLE (โปรไฟล์ผู้ใช้)
-- ============================================
CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    avatar_url TEXT,
    address TEXT,
    district VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(10),
    emergency_contact VARCHAR(20),
    emergency_name VARCHAR(255),
    preferences JSONB DEFAULT '{}', -- notification preferences, language, etc.
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 9. BOOKINGS TABLE (การจอง)
-- ============================================
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_reference VARCHAR(20) UNIQUE NOT NULL, -- TH20250108XXXX
    user_id UUID REFERENCES users(id),
    train_id VARCHAR(10) REFERENCES trains(id),
    travel_date DATE NOT NULL,
    booking_status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, cancelled, completed
    payment_status VARCHAR(20) DEFAULT 'unpaid', -- unpaid, paid, refunded
    total_amount DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    final_amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    booked_at TIMESTAMP DEFAULT NOW(),
    confirmed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_train ON bookings(train_id);
CREATE INDEX idx_bookings_date ON bookings(travel_date);
CREATE INDEX idx_bookings_status ON bookings(booking_status);
CREATE INDEX idx_bookings_reference ON bookings(booking_reference);

-- ============================================
-- 10. BOOKING_PASSENGERS TABLE (ผู้โดยสาร)
-- ============================================
CREATE TABLE booking_passengers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    class_id INTEGER REFERENCES train_classes(id),
    passenger_type VARCHAR(20) DEFAULT 'adult', -- adult, child, senior, disabled
    title VARCHAR(10), -- นาย, นาง, นางสาว
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    national_id VARCHAR(20),
    passport_no VARCHAR(20),
    age INTEGER,
    seat_number VARCHAR(10),
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_booking_passengers_booking ON booking_passengers(booking_id);

-- ============================================
-- 11. PAYMENTS TABLE (การชำระเงิน)
-- ============================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id),
    payment_method VARCHAR(50) NOT NULL, -- credit_card, promptpay, bank_transfer
    amount DECIMAL(10, 2) NOT NULL,
    transaction_id VARCHAR(100) UNIQUE,
    payment_provider VARCHAR(50), -- omise, stripe, scb
    payment_status VARCHAR(20) DEFAULT 'pending', -- pending, success, failed, refunded
    payment_data JSONB DEFAULT '{}', -- raw payment response
    paid_at TIMESTAMP,
    refunded_at TIMESTAMP,
    refund_amount DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(payment_status);
CREATE INDEX idx_payments_transaction ON payments(transaction_id);

-- ============================================
-- 12. SEAT_AVAILABILITY TABLE (ที่นั่งว่าง)
-- ============================================
CREATE TABLE seat_availability (
    id SERIAL PRIMARY KEY,
    train_id VARCHAR(10) REFERENCES trains(id),
    class_id INTEGER REFERENCES train_classes(id),
    travel_date DATE NOT NULL,
    available_seats INTEGER NOT NULL,
    total_seats INTEGER NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(train_id, class_id, travel_date)
);

CREATE INDEX idx_seat_availability_train ON seat_availability(train_id);
CREATE INDEX idx_seat_availability_date ON seat_availability(travel_date);

-- ============================================
-- 13. TOURIST_TRAINS TABLE (รถไฟท่องเที่ยว)
-- ============================================
CREATE TABLE tourist_trains (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    category VARCHAR(50), -- luxury, cultural, scenic, adventure
    description TEXT,
    description_en TEXT,
    highlights JSONB DEFAULT '[]',
    route_info TEXT,
    duration VARCHAR(50),
    starting_price DECIMAL(10, 2),
    image_url TEXT,
    rating DECIMAL(2, 1) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    booking_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tourist_trains_category ON tourist_trains(category);
CREATE INDEX idx_tourist_trains_available ON tourist_trains(is_available);

-- ============================================
-- 14. SEARCH_HISTORY TABLE (ประวัติการค้นหา)
-- ============================================
CREATE TABLE search_history (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id), -- nullable for anonymous
    session_id VARCHAR(100),
    origin_station_id VARCHAR(10) REFERENCES stations(id),
    destination_station_id VARCHAR(10) REFERENCES stations(id),
    search_date DATE,
    results_count INTEGER,
    searched_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_search_history_user ON search_history(user_id);
CREATE INDEX idx_search_history_date ON search_history(search_date);

-- ============================================
-- 15. POPULAR_TRAINS TABLE (รถไฟยอดนิยม)
-- ============================================
CREATE TABLE popular_trains (
    train_id VARCHAR(10) PRIMARY KEY REFERENCES trains(id),
    search_count INTEGER DEFAULT 0,
    booking_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    trend VARCHAR(10) DEFAULT 'stable', -- up, down, stable
    rank INTEGER,
    last_updated TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 16. NOTIFICATIONS TABLE (การแจ้งเตือน)
-- ============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    type VARCHAR(50) NOT NULL, -- booking_confirmed, payment_success, train_delay
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    sent_at TIMESTAMP DEFAULT NOW(),
    read_at TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- ============================================
-- 17. TRAIN_STATUS TABLE (สถานะรถไฟ real-time)
-- ============================================
CREATE TABLE train_status (
    id SERIAL PRIMARY KEY,
    train_id VARCHAR(10) REFERENCES trains(id),
    travel_date DATE NOT NULL,
    current_status VARCHAR(50) DEFAULT 'on_time', -- on_time, delayed, cancelled
    delay_minutes INTEGER DEFAULT 0,
    current_station_id VARCHAR(10) REFERENCES stations(id),
    last_updated TIMESTAMP DEFAULT NOW(),
    UNIQUE(train_id, travel_date)
);

CREATE INDEX idx_train_status_train ON train_status(train_id);
CREATE INDEX idx_train_status_date ON train_status(travel_date);

-- ============================================
-- 18. ADMIN_LOGS TABLE (ประวัติการจัดการของ admin)
-- ============================================
CREATE TABLE admin_logs (
    id SERIAL PRIMARY KEY,
    admin_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(50), -- trains, bookings, users
    resource_id VARCHAR(100),
    changes JSONB DEFAULT '{}',
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_action ON admin_logs(action);
CREATE INDEX idx_admin_logs_date ON admin_logs(created_at);
```

#### 2.2 Relationships (ความสัมพันธ์)

```
stations (1) ----< trains (N) - origin
stations (1) ----< trains (N) - destination
trains (1) ----< train_stops (N)
trains (1) ----< train_classes (N)
trains (1) ----< bookings (N)
trains (N) ----< amenities (N) - many-to-many
users (1) ----< bookings (N)
bookings (1) ----< booking_passengers (N)
bookings (1) ----< payments (N)
train_classes (1) ----< booking_passengers (N)
```

#### 2.3 Sample Data Seeds

```sql
-- Insert sample stations
INSERT INTO stations (id, name, code, city, region, latitude, longitude) VALUES
('BKK', 'กรุงเทพ (หัวลำโพง)', 'BKK', 'กรุงเทพมหานคร', 'กลาง', 13.7372, 100.5498),
('CNX', 'เชียงใหม่', 'CNX', 'เชียงใหม่', 'เหนือ', 18.7883, 98.9853),
('HYI', 'หาดใหญ่', 'HYI', 'หาดใหญ่', 'ใต้', 7.0082, 100.4756);

-- Insert sample amenities
INSERT INTO amenities (id, name, name_en, icon, category) VALUES
('wifi', 'Wi-Fi ฟรี', 'Free Wi-Fi', '📶', 'connectivity'),
('power', 'ปลั๊กไฟ', 'Power Outlet', '🔌', 'connectivity'),
('ac', 'เครื่องปรับอากาศ', 'Air Conditioning', '❄️', 'comfort'),
('dining', 'รถเสบียง', 'Dining Car', '🍽️', 'comfort'),
('accessible', 'เข้าถึงได้สำหรับผู้พิการ', 'Accessible', '♿', 'accessibility');
```

---

## 3. ระบบ API Backend

### 🎯 เป้าหมาย
สร้าง REST API สำหรับเชื่อมต่อ Frontend กับ Database

### 📦 ตัวเลือก Technology Stack

#### ตัวเลือกที่ 1: Next.js API Routes (แนะนำ) ⭐
**ข้อดี:**
- ✅ ไม่ต้องตั้ง server แยก
- ✅ Deploy ร่วมกับ Frontend ได้เลย
- ✅ TypeScript support
- ✅ Serverless functions (Vercel)

**ข้อเสีย:**
- ⚠️ จำกัดด้วย 10s timeout (Vercel free)
- ⚠️ ไม่เหมาะกับ long-running tasks

**Structure:**
```
app/
  api/
    trains/
      route.ts          # GET /api/trains
      [id]/route.ts     # GET /api/trains/:id
    stations/
      route.ts          # GET /api/stations
    bookings/
      route.ts          # POST /api/bookings
      [id]/route.ts     # GET /api/bookings/:id
    auth/
      login/route.ts    # POST /api/auth/login
      register/route.ts # POST /api/auth/register
```

#### ตัวเลือกที่ 2: Express.js + TypeScript
**ข้อดี:**
- ✅ Flexible
- ✅ มี middleware มากมาย
- ✅ ใช้ได้กับ any hosting

**ข้อเสีย:**
- ⚠️ ต้องตั้ง server แยก
- ⚠️ Deploy ซับซ้อนกว่า

#### ตัวเลือกที่ 3: tRPC (Type-safe API)
**ข้อดี:**
- ✅ End-to-end type safety
- ✅ No API documentation needed
- ✅ ใช้ได้กับ Next.js

**ข้อเสีย:**
- ⚠️ Learning curve
- ⚠️ Frontend ต้องใช้ tRPC client

### 📋 API Endpoints Design

#### 3.1 Public Endpoints (ไม่ต้อง auth)

```typescript
// ========================================
// STATIONS API
// ========================================
GET    /api/stations
GET    /api/stations/:id
GET    /api/stations/search?q=กรุงเทพ

// ========================================
// TRAINS API
// ========================================
GET    /api/trains
GET    /api/trains/:id
POST   /api/trains/search
  Body: { origin, destination, date, passengers }
GET    /api/trains/:id/classes
GET    /api/trains/:id/availability?date=2025-01-15

// ========================================
// POPULAR TRAINS API
// ========================================
GET    /api/trains/popular?limit=10

// ========================================
// TOURIST TRAINS API
// ========================================
GET    /api/tourist-trains
GET    /api/tourist-trains/:id
```

#### 3.2 Protected Endpoints (ต้อง auth)

```typescript
// ========================================
// AUTH API
// ========================================
POST   /api/auth/register
  Body: { email, password, fullName, phone }
POST   /api/auth/login
  Body: { email, password }
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/forgot-password
  Body: { email }
POST   /api/auth/reset-password
  Body: { token, newPassword }

// ========================================
// USER PROFILE API
// ========================================
GET    /api/users/me/profile
PUT    /api/users/me/profile
  Body: { fullName, phone, address, ... }
GET    /api/users/me/bookings
GET    /api/users/me/search-history

// ========================================
// BOOKINGS API
// ========================================
POST   /api/bookings
  Body: { trainId, travelDate, passengers, classId }
GET    /api/bookings/:id
PUT    /api/bookings/:id/cancel
GET    /api/bookings/:id/receipt

// ========================================
// PAYMENTS API
// ========================================
POST   /api/payments/create
  Body: { bookingId, method }
POST   /api/payments/webhook (Omise/Stripe callback)
GET    /api/payments/:id/status

// ========================================
// NOTIFICATIONS API
// ========================================
GET    /api/notifications
PUT    /api/notifications/:id/read
PUT    /api/notifications/mark-all-read
```

#### 3.3 Admin Endpoints (ต้อง admin role)

```typescript
// ========================================
// ADMIN - TRAINS MANAGEMENT
// ========================================
POST   /api/admin/trains
PUT    /api/admin/trains/:id
DELETE /api/admin/trains/:id
PUT    /api/admin/trains/:id/toggle-active

// ========================================
// ADMIN - BOOKINGS MANAGEMENT
// ========================================
GET    /api/admin/bookings
PUT    /api/admin/bookings/:id/confirm
PUT    /api/admin/bookings/:id/cancel

// ========================================
// ADMIN - USERS MANAGEMENT
// ========================================
GET    /api/admin/users
PUT    /api/admin/users/:id/toggle-active

// ========================================
// ADMIN - ANALYTICS
// ========================================
GET    /api/admin/analytics/overview
GET    /api/admin/analytics/revenue
GET    /api/admin/analytics/popular-routes

// ========================================
// ADMIN - TRAIN STATUS
// ========================================
PUT    /api/admin/train-status/:trainId
  Body: { date, status, delayMinutes }
```

### 📝 API Response Format

```typescript
// Success Response
{
  "success": true,
  "data": { ... },
  "message": "สำเร็จ",
  "timestamp": "2025-01-08T10:00:00Z"
}

// Error Response
{
  "success": false,
  "error": {
    "code": "TRAIN_NOT_FOUND",
    "message": "ไม่พบรถไฟที่ค้นหา",
    "details": { ... }
  },
  "timestamp": "2025-01-08T10:00:00Z"
}

// Pagination Response
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "perPage": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

### 🔒 API Security

```typescript
// Middleware ที่ต้องมี
1. Rate Limiting (ป้องกัน DDoS)
   - 100 requests/minute per IP
   - 1000 requests/hour per user

2. CORS Configuration
   - Allow: app.srt-timetable.com
   - Methods: GET, POST, PUT, DELETE

3. Input Validation (Zod)
   - Validate ทุก request body
   - Sanitize input

4. JWT Authentication
   - Token expiry: 24 hours
   - Refresh token: 7 days

5. API Key for 3rd party
   - Rate limit: 1000/day
```

---

## 4. ระบบ Authentication & Authorization

### 🎯 เป้าหมาย
ระบบล็อกอิน/สมัครสมาชิก + การจัดการสิทธิ์

### 📦 ตัวเลือก Auth Solution

#### ตัวเลือกที่ 1: NextAuth.js (แนะนำ) ⭐
**ข้อดี:**
- ✅ Built for Next.js
- ✅ Support OAuth (Google, Facebook)
- ✅ JWT + Session
- ✅ TypeScript support

**ข้อเสีย:**
- ⚠️ Configuration ซับซ้อนนิดหน่อย

#### ตัวเลือกที่ 2: Supabase Auth
**ข้อดี:**
- ✅ Built-in auth
- ✅ Email verification
- ✅ Social login
- ✅ Row Level Security (RLS)

**ข้อเสีย:**
- ⚠️ Vendor lock-in

#### ตัวเลือกที่ 3: Custom JWT Auth
**ข้อดี:**
- ✅ Full control
- ✅ No dependencies

**ข้อเสีย:**
- ⚠️ ต้องเขียนเอง
- ⚠️ Security risks ถ้าทำผิด

### 🔐 Auth Features

```typescript
// Features ที่ต้องมี
1. ✅ Email/Password Registration
2. ✅ Email Verification
3. ✅ Login
4. ✅ Logout
5. ✅ Forgot Password
6. ✅ Reset Password
7. ✅ Change Password
8. ✅ OAuth Login (Google, Facebook)
9. ✅ JWT Token Management
10. ✅ Refresh Token
11. ✅ Role-based Access Control (RBAC)
12. ✅ Session Management
```

### 👥 User Roles

```typescript
enum UserRole {
  USER = 'user',           // ผู้ใช้ทั่วไป
  STAFF = 'staff',         // พนักงาน
  ADMIN = 'admin',         // ผู้ดูแลระบบ
  SUPER_ADMIN = 'super_admin' // ผู้ดูแลระบบสูงสุด
}

// Permissions
const permissions = {
  user: [
    'search_trains',
    'view_trains',
    'create_booking',
    'view_own_bookings',
    'cancel_own_booking'
  ],
  staff: [
    ...user_permissions,
    'view_all_bookings',
    'update_train_status',
    'send_notifications'
  ],
  admin: [
    ...staff_permissions,
    'manage_trains',
    'manage_stations',
    'manage_users',
    'view_analytics'
  ],
  super_admin: [
    ...admin_permissions,
    'manage_admins',
    'system_settings'
  ]
}
```

### 🔐 Security Implementation

```typescript
// Password Hashing (bcrypt)
import bcrypt from 'bcrypt';

const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// JWT Generation
import jwt from 'jsonwebtoken';

const generateToken = (userId: string, role: string) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  );
};

// Middleware Protection
const requireAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const requireRole = (role: UserRole) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};
```

---

## 5. ระบบการจอง (Booking System)

### 🎯 เป้าหมาย
ระบบจองตั๋วรถไฟแบบ real-time พร้อมจัดการที่นั่ง

### 📋 Booking Flow

```
1. ค้นหารถไฟ
   ↓
2. เลือกรถไฟ + ชั้น
   ↓
3. เลือกวันเดินทาง
   ↓
4. ใส่ข้อมูลผู้โดยสาร
   ↓
5. เลือกที่นั่ง (optional)
   ↓
6. ตรวจสอบข้อมูล
   ↓
7. ชำระเงิน
   ↓
8. ได้ booking reference
   ↓
9. รับ e-ticket ทาง email
```

### 🎫 Booking Features

```typescript
// 1. Create Booking (ต้อง lock ที่นั่ง 10 นาที)
POST /api/bookings
{
  trainId: "T001",
  travelDate: "2025-01-15",
  passengers: [
    {
      classId: 1,
      type: "adult",
      title: "นาย",
      firstName: "สมชาย",
      lastName: "ใจดี",
      nationalId: "1234567890123"
    }
  ]
}

// 2. Check Seat Availability
GET /api/trains/T001/availability?date=2025-01-15
Response:
{
  trainId: "T001",
  date: "2025-01-15",
  classes: [
    {
      classId: 1,
      className: "ชั้น 1",
      totalSeats: 20,
      availableSeats: 12,
      price: 1850
    }
  ]
}

// 3. Seat Selection (optional)
GET /api/trains/T001/seats?classId=1&date=2025-01-15
Response:
{
  seats: [
    { seatNumber: "A1", status: "available" },
    { seatNumber: "A2", status: "booked" },
    { seatNumber: "A3", status: "locked" } // locked for 10 min
  ]
}

// 4. Cancel Booking
PUT /api/bookings/:id/cancel
{
  reason: "เปลี่ยนใจ",
  refundMethod: "bank_transfer"
}
```

### ⚡ Race Condition Prevention

```typescript
// ใช้ Database Transaction + Row Locking
import { sql } from '@vercel/postgres';

async function bookSeats(trainId, classId, date, seatsNeeded) {
  const client = await sql.connect();
  
  try {
    await client.query('BEGIN');
    
    // Lock row for update
    const result = await client.query(`
      SELECT available_seats 
      FROM seat_availability
      WHERE train_id = $1 AND class_id = $2 AND travel_date = $3
      FOR UPDATE
    `, [trainId, classId, date]);
    
    const { available_seats } = result.rows[0];
    
    if (available_seats < seatsNeeded) {
      throw new Error('ที่นั่งไม่เพียงพอ');
    }
    
    // Update seats
    await client.query(`
      UPDATE seat_availability
      SET available_seats = available_seats - $1
      WHERE train_id = $2 AND class_id = $3 AND travel_date = $4
    `, [seatsNeeded, trainId, classId, date]);
    
    // Create booking
    const booking = await client.query(`
      INSERT INTO bookings (user_id, train_id, travel_date, ...)
      VALUES ($1, $2, $3, ...)
      RETURNING *
    `, [...]);
    
    await client.query('COMMIT');
    return booking.rows[0];
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

### ⏱️ Seat Lock System (ระบบล็อกที่นั่ง)

```typescript
// Lock ที่นั่งเมื่อเริ่มจอง (10 นาที)
CREATE TABLE seat_locks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    train_id VARCHAR(10),
    class_id INTEGER,
    travel_date DATE,
    seat_number VARCHAR(10),
    locked_by UUID, -- user_id or session_id
    locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

// Auto release expired locks
CREATE OR REPLACE FUNCTION release_expired_locks()
RETURNS void AS $$
BEGIN
    DELETE FROM seat_locks WHERE locked_until < NOW();
END;
$$ LANGUAGE plpgsql;

// Run every minute
SELECT cron.schedule('release-locks', '* * * * *', $$
    SELECT release_expired_locks()
$$);
```

### 📧 Booking Confirmation

```typescript
// หลังจองสำเร็จ
1. ✅ บันทึก booking ลง database
2. ✅ ส่ง email confirmation พร้อม e-ticket PDF
3. ✅ ส่ง SMS confirmation (optional)
4. ✅ สร้าง notification ในระบบ
5. ✅ อัพเดท popular trains stats
```

---

## 6. ระบบ Admin Panel

### 🎯 เป้าหมาย
Dashboard สำหรับ admin จัดการระบบ

### 📊 Admin Features

#### 6.1 Dashboard Overview
```typescript
// หน้าแรก admin
- 📈 Total bookings today/week/month
- 💰 Revenue today/week/month
- 👥 Active users count
- 🚆 Trains operating today
- ⚠️ Pending bookings
- 📉 Cancellation rate
- 🔥 Popular routes chart
- 📊 Revenue chart (last 30 days)
```

#### 6.2 Trains Management
```typescript
// /admin/trains
- ➕ Add new train
- ✏️ Edit train details
- 🗑️ Deactivate train
- 📋 View train schedule
- 🎫 Manage classes & pricing
- 🚏 Manage stops
- 🛠️ Manage amenities
```

#### 6.3 Bookings Management
```typescript
// /admin/bookings
- 📋 View all bookings (filterable)
- 🔍 Search booking by reference
- ✅ Confirm pending bookings
- ❌ Cancel bookings
- 💵 Issue refunds
- 📄 Generate reports
- 📧 Resend confirmation emails
```

#### 6.4 Users Management
```typescript
// /admin/users
- 👥 View all users
- 🔍 Search users
- 🔒 Deactivate/Activate accounts
- 👨‍💼 Change user roles
- 📊 View user booking history
- 📧 Send notifications to users
```

#### 6.5 Analytics
```typescript
// /admin/analytics
- 📊 Revenue Analytics
  - Daily/Weekly/Monthly revenue
  - Revenue by route
  - Revenue by class
  
- 🚆 Train Analytics
  - Most booked trains
  - Average occupancy rate
  - On-time performance
  
- 👥 User Analytics
  - New users growth
  - Active users
  - User retention rate
  
- 📈 Booking Analytics
  - Booking trends
  - Peak booking times
  - Cancellation rate
  - Average booking value
```

#### 6.6 Train Status Management
```typescript
// /admin/train-status
- 🚦 Update train status (on-time, delayed, cancelled)
- ⏱️ Set delay minutes
- 📢 Send notifications to affected passengers
- 📍 Update current location
```

### 🎨 Admin UI/UX

```typescript
// Tech Stack for Admin Panel
- Next.js App Router (/admin)
- shadcn/ui components
- Recharts for analytics
- React Table for data tables
- React Hook Form for forms

// Layout
/admin
  /dashboard        - Overview
  /trains           - Train management
  /bookings         - Booking management
  /users            - User management
  /analytics        - Analytics & reports
  /settings         - System settings
  /train-status     - Real-time status
  /notifications    - Send notifications
```

---

## 7. ระบบ Analytics & Monitoring

### 🎯 เป้าหมาย
ติดตามและวิเคราะห์พฤติกรรมผู้ใช้ + ประสิทธิภาพระบบ

### 📊 Analytics Features

#### 7.1 User Analytics
```typescript
// Google Analytics 4 / Plausible
- 📊 Page views
- 👥 Unique visitors
- ⏱️ Session duration
- 📍 Geographic distribution
- 📱 Device breakdown (mobile/desktop)
- 🔍 Search queries
- 🎯 Conversion rate (search → booking)
```

#### 7.2 Business Analytics
```typescript
// Custom Analytics in Database
- 💰 Revenue metrics
  - Total revenue
  - Revenue by route
  - Revenue by train type
  - Revenue by class
  
- 🎫 Booking metrics
  - Total bookings
  - Booking success rate
  - Average booking value
  - Cancellation rate
  
- 🚆 Train metrics
  - Occupancy rate
  - Popular routes
  - Peak travel times
  - Train utilization
```

#### 7.3 Technical Monitoring
```typescript
// Vercel Analytics / Sentry
- ⚡ Performance monitoring
  - Page load time
  - API response time
  - Core Web Vitals (LCP, FID, CLS)
  
- 🐛 Error tracking
  - JavaScript errors
  - API errors
  - 500 errors
  
- 🔔 Alerts
  - High error rate
  - Slow API
  - Database connection issues
```

### 📈 Metrics to Track

```typescript
// Key Performance Indicators (KPIs)
1. 📊 Conversion Rate
   - Search → View → Book → Pay
   
2. 💰 Revenue
   - Daily/Weekly/Monthly
   - Year-over-year growth
   
3. 👥 User Metrics
   - Daily Active Users (DAU)
   - Monthly Active Users (MAU)
   - User retention rate
   
4. 🎫 Booking Metrics
   - Average booking value
   - Booking lead time (얼마나 미리 จอง)
   - Cancellation rate
   
5. ⚡ Performance
   - API response time < 500ms
   - Page load time < 2s
   - Uptime > 99.9%
```

---

## 8. ระบบ Notifications

### 🎯 เป้าหมาย
แจ้งเตือนผู้ใช้งานผ่านหลายช่องทาง

### 📧 Email Notifications

```typescript
// ใช้ Resend.com / SendGrid / AWS SES

// Email Templates
1. ✅ Booking Confirmation
   - Booking reference
   - E-ticket PDF attachment
   - Train details
   - Payment receipt
   
2. ✅ Payment Success
   - Amount paid
   - Payment method
   - Invoice
   
3. ✅ Booking Cancellation
   - Cancellation confirmation
   - Refund details
   
4. ✅ Train Delay/Cancellation
   - New status
   - Alternative options
   
5. ✅ Email Verification
   - Verification link
   
6. ✅ Password Reset
   - Reset link
   
7. ✅ Booking Reminder
   - 24 hours before travel
```

### 📱 SMS Notifications (Optional)

```typescript
// ใช้ Twilio / AWS SNS

// SMS Templates
1. Booking confirmation (short)
2. Payment success
3. Booking reference
4. Train delay alert
```

### 🔔 Push Notifications (PWA)

```typescript
// Web Push API + Service Worker

// Push Templates
1. Booking confirmed
2. Train is delayed
3. Boarding soon (1 hour before)
4. Special promotions
```

### 📱 In-App Notifications

```typescript
// Notifications Table (ดูใน Database Schema)

// Notification Types
- booking_confirmed
- payment_success
- booking_cancelled
- train_delayed
- train_cancelled
- special_offer
- system_announcement
```

---

## 9. ระบบ Payment Gateway

### 🎯 เป้าหมาย
รับชำระเงินออนไลน์อย่างปลอดภัย

### 💳 Payment Methods

```typescript
// วิธีการชำระเงินที่ต้องรองรับ
1. 💳 Credit/Debit Card
   - Visa, Mastercard, JCB
   
2. 🏦 PromptPay QR
   - Real-time confirmation
   
3. 🏧 Internet Banking
   - SCB, Kbank, BBL, etc.
   
4. 💰 Mobile Banking
   - SCB Easy, K PLUS, etc.
   
5. 🏪 Counter Service
   - 7-Eleven, Family Mart (optional)
```

### 📦 Payment Provider Options

#### ตัวเลือกที่ 1: Omise (แนะนำสำหรับไทย) ⭐
**ข้อดี:**
- ✅ บริษัทไทย, support ดี
- ✅ รองรับ PromptPay
- ✅ รองรับธนาคารไทยทุกธนาคาร
- ✅ ค่าธรรมเนียม 2.95% + 3 บาท

**ข้อเสีย:**
- ⚠️ ต้องสมัครบริษัท (ไม่รับบุคคลธรรมดา)

**Website:** https://www.omise.co/th

#### ตัวเลือกที่ 2: SCB Easy App API
**ข้อดี:**
- ✅ ของ SCB
- ✅ Instant payment
- ✅ PromptPay support

**ข้อเสีย:**
- ⚠️ ต้องมีบัญชี SCB
- ⚠️ Documentation น้อย

#### ตัวเลือกที่ 3: Stripe
**ข้อดี:**
- ✅ International
- ✅ Developer-friendly
- ✅ Documentation ดี

**ข้อเสีย:**
- ⚠️ ไม่รองรับ PromptPay
- ⚠️ ไม่เหมาะกับผู้ใช้ไทย

### 💰 Payment Flow

```typescript
// Payment Process
1. User เลือกชำระเงิน
   ↓
2. สร้าง Payment Intent
   POST /api/payments/create
   {
     bookingId: "xxx",
     method: "credit_card"
   }
   ↓
3. เรียก Payment Gateway (Omise)
   - Create charge
   - Get payment form/QR
   ↓
4. User ชำระเงิน
   - ใส่ card info / สแกน QR
   ↓
5. Payment Gateway ส่ง callback
   POST /api/payments/webhook
   ↓
6. Verify payment signature
   ↓
7. Update booking status
   - booking.payment_status = 'paid'
   - booking.booking_status = 'confirmed'
   ↓
8. ส่ง confirmation email/SMS
   ↓
9. Redirect to success page
```

### 🔒 Payment Security

```typescript
// Security Measures
1. ✅ PCI DSS Compliance
   - ไม่เก็บ card info ในระบบ
   - ใช้ Payment Gateway tokenization
   
2. ✅ Webhook Signature Verification
   - Verify Omise signature
   - ป้องกัน fake webhook
   
3. ✅ HTTPS Only
   - SSL certificate
   
4. ✅ Amount Verification
   - เช็ค amount ที่ server side
   - ไม่เชื่อ amount จาก client
   
5. ✅ Idempotency
   - ป้องกันการจ่ายซ้ำ
   - ใช้ unique payment_id
```

### 💸 Refund System

```typescript
// Refund Rules
1. ยกเลิกก่อน 24 ชั่วโมง → คืนเงิน 100%
2. ยกเลิกก่อน 12 ชั่วโมง → คืนเงิน 50%
3. ยกเลิกภายใน 12 ชั่วโมง → ไม่คืนเงิน
4. รถไฟยกเลิก → คืนเงิน 100%

// Refund Process
PUT /api/bookings/:id/cancel
{
  reason: "เปลี่ยนใจ"
}
↓
Calculate refund amount
↓
POST /api/payments/:id/refund
{
  amount: 925, // 50%
  reason: "ยกเลิกก่อน 12 ชม."
}
↓
Call Omise refund API
↓
Update booking status
↓
Send refund confirmation email
```

---

## 10. ระบบ Cache & Performance

### 🎯 เป้าหมาย
เพิ่มความเร็ว ลด database load

### ⚡ Caching Strategy

#### 10.1 Browser Cache
```typescript
// Static Assets
- Images: cache 1 year
- CSS/JS: cache 1 year (with hash)
- Fonts: cache 1 year
```

#### 10.2 CDN Cache (Vercel Edge)
```typescript
// Pages
- Home: cache 5 minutes
- Static pages: cache 1 hour
- Train search results: no cache

// API Routes
- GET /api/stations: cache 1 day
- GET /api/trains: cache 1 hour
- GET /api/trains/:id: cache 30 minutes
- GET /api/trains/popular: cache 5 minutes
- POST endpoints: no cache
```

#### 10.3 Redis Cache (Optional)
```typescript
// Cache frequently accessed data
- Popular trains: TTL 5 minutes
- Station list: TTL 1 day
- Train list: TTL 1 hour
- Search results: TTL 10 minutes

// Implementation (Upstash Redis)
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

// Cache train data
async function getTrain(id: string) {
  // Try cache first
  const cached = await redis.get(`train:${id}`);
  if (cached) return cached;
  
  // Fetch from database
  const train = await db.trains.findById(id);
  
  // Cache for 30 minutes
  await redis.setex(`train:${id}`, 1800, train);
  
  return train;
}

// Invalidate cache when data changes
async function updateTrain(id: string, data: any) {
  await db.trains.update(id, data);
  await redis.del(`train:${id}`); // Clear cache
}
```

#### 10.4 Database Query Optimization
```typescript
// Indexes (already in schema)
- stations: region, city
- trains: origin, destination, active
- bookings: user_id, train_id, date, status

// Connection Pooling
- Max connections: 20
- Min connections: 2
- Idle timeout: 10s

// Query Optimization
- Use SELECT only needed fields
- Use LIMIT/OFFSET for pagination
- Use JOIN wisely
- Avoid N+1 queries
```

### 📊 Performance Targets

```typescript
// Target Metrics
✅ Time to First Byte (TTFB): < 200ms
✅ First Contentful Paint (FCP): < 1s
✅ Largest Contentful Paint (LCP): < 2.5s
✅ First Input Delay (FID): < 100ms
✅ Cumulative Layout Shift (CLS): < 0.1
✅ API Response Time: < 500ms
✅ Database Query Time: < 100ms
```

---

## 11. แผนการพัฒนา (Roadmap)

### 📅 Phase 1: Foundation (2-3 สัปดาห์)
**เป้าหมาย:** ระบบพื้นฐาน

#### Week 1: Database & Auth
- [ ] Setup PostgreSQL database (Supabase)
- [ ] Create database schema (18 tables)
- [ ] Seed initial data
- [ ] Setup NextAuth.js
- [ ] Implement registration/login
- [ ] Email verification system
- [ ] Password reset flow

#### Week 2: Core API
- [ ] Create API routes structure
- [ ] Implement Stations API
- [ ] Implement Trains API (CRUD)
- [ ] Implement Search API
- [ ] Implement Seat Availability API
- [ ] Add API validation (Zod)
- [ ] Add rate limiting

#### Week 3: Frontend Integration
- [ ] Replace mock data with real API
- [ ] Add authentication UI
- [ ] Add loading states
- [ ] Add error handling
- [ ] Test all features
- [ ] Fix bugs

**Deliverables:**
✅ Working database  
✅ Auth system  
✅ Search with real data  
✅ Basic API  

---

### 📅 Phase 2: Booking System (2-3 สัปดาห์)

#### Week 4: Booking API
- [ ] Implement Booking API
- [ ] Seat locking system
- [ ] Race condition handling
- [ ] Booking validation
- [ ] Cancellation system

#### Week 5: Payment Integration
- [ ] Setup Omise account
- [ ] Implement payment API
- [ ] Add payment methods (Card, PromptPay)
- [ ] Webhook handling
- [ ] Refund system

#### Week 6: Email & Notifications
- [ ] Setup Resend.com
- [ ] Create email templates
- [ ] Send booking confirmation
- [ ] Send payment confirmation
- [ ] Generate e-ticket PDF
- [ ] In-app notifications

**Deliverables:**
✅ Complete booking flow  
✅ Payment gateway working  
✅ Email notifications  
✅ E-tickets  

---

### 📅 Phase 3: Admin Panel (2 สัปดาห์)

#### Week 7: Admin UI
- [ ] Create admin layout
- [ ] Dashboard overview
- [ ] Trains management
- [ ] Bookings management
- [ ] Users management

#### Week 8: Analytics & Reports
- [ ] Revenue analytics
- [ ] Booking analytics
- [ ] Popular routes chart
- [ ] Export reports (CSV/PDF)
- [ ] Train status management

**Deliverables:**
✅ Admin dashboard  
✅ Management tools  
✅ Analytics  

---

### 📅 Phase 4: Advanced Features (3 สัปดาห์)

#### Week 9: Real-time Features
- [ ] Train status updates
- [ ] Real-time seat availability
- [ ] Live notifications
- [ ] WebSocket integration

#### Week 10: PWA & Mobile
- [ ] Service worker
- [ ] Offline mode
- [ ] Push notifications
- [ ] Install prompt
- [ ] Mobile app (React Native) - optional

#### Week 11: Performance & SEO
- [ ] Image optimization
- [ ] Code splitting
- [ ] Redis caching
- [ ] SEO optimization
- [ ] Sitemap generation

**Deliverables:**
✅ Real-time updates  
✅ PWA features  
✅ Optimized performance  

---

### 📅 Phase 5: Testing & Launch (1-2 สัปดาห์)

#### Week 12: Testing
- [ ] Unit tests (Jest)
- [ ] Integration tests
- [ ] E2E tests (Playwright)
- [ ] Load testing
- [ ] Security audit
- [ ] Accessibility testing

#### Week 13: Launch
- [ ] Setup production database
- [ ] Configure domain
- [ ] Setup monitoring (Sentry)
- [ ] Setup analytics (GA4)
- [ ] Deploy to production
- [ ] Monitor & fix issues

**Deliverables:**
✅ Production-ready app  
✅ All tests passing  
✅ Monitoring setup  
✅ Live website  

---

## 12. ประมาณการทรัพยากร

### 💰 ค่าใช้จ่าย (Monthly)

#### 12.1 Hosting & Infrastructure

```typescript
// Option 1: All Supabase (แนะนำสำหรับเริ่มต้น)
Supabase Pro Plan:         $25/month
- PostgreSQL database: 8GB
- 100GB bandwidth
- 100GB storage
- Auth included
- Real-time included

Vercel Pro:                 $20/month
- Next.js hosting
- Unlimited bandwidth
- Edge functions
- Analytics included

Total:                      $45/month
```

```typescript
// Option 2: Separate Services (สำหรับ scale)
Vercel Pro:                 $20/month
Railway (PostgreSQL):       $5/month (500MB)
Upstash Redis:              $10/month (optional)
Cloudinary (Images):        $0 (free tier 25GB)

Total:                      $35/month
```

#### 12.2 Third-party Services

```typescript
Email (Resend.com):         $0 (free: 3,000/month)
Payment (Omise):            2.95% + ฿3 per transaction
SMS (Twilio):               $0.05/SMS (optional)
Monitoring (Sentry):        $0 (free tier)
Analytics (Plausible):      $0 (free tier)

Total:                      $0 + transaction fees
```

#### 12.3 Development Time

```typescript
// Estimated Hours
Phase 1 (Foundation):       80-100 hours
Phase 2 (Booking):          60-80 hours
Phase 3 (Admin):            40-50 hours
Phase 4 (Advanced):         60-80 hours
Phase 5 (Testing):          20-30 hours

Total:                      260-340 hours

// If outsourcing
Freelancer Rate:            ฿500-1,500/hour
Total Cost:                 ฿130,000 - ฿510,000
```

### 👥 Team Requirements

```typescript
// Minimum Team (1 person full-stack)
- Full-stack Developer (TypeScript, Next.js, PostgreSQL)
- Time: 3-4 months part-time

// Optimal Team (3 people)
- Frontend Developer
- Backend Developer
- UI/UX Designer (optional)
- Time: 2-3 months
```

### 📊 Traffic & Scaling Estimates

```typescript
// Initial Launch (Month 1-3)
Users:                      1,000 - 5,000
Daily bookings:             10 - 50
Database size:              < 1GB
Bandwidth:                  < 10GB/month
Cost:                       $45/month

// Growth (Month 6-12)
Users:                      10,000 - 50,000
Daily bookings:             100 - 500
Database size:              2-5GB
Bandwidth:                  50-100GB/month
Cost:                       $80-150/month

// Scale (Year 2+)
Users:                      100,000+
Daily bookings:             1,000+
Database size:              10GB+
Bandwidth:                  500GB+/month
Cost:                       $300-500/month
```

---

## 🎯 สรุปและคำแนะนำ

### ✅ สิ่งที่ต้องทำเป็นอันดับแรก (Priority)

1. **Phase 1 - Foundation** (ต้องทำก่อน)
   - ✅ Setup database (Supabase)
   - ✅ Authentication system
   - ✅ Replace mock data with real API
   - ✅ Search functionality

2. **Phase 2 - Booking System** (สำคัญที่สุด)
   - ✅ Booking flow
   - ✅ Payment integration
   - ✅ Email notifications

3. **Phase 3 - Admin Panel** (จำเป็น)
   - ✅ Dashboard
   - ✅ Management tools
   - ✅ Analytics

4. **Phase 4 & 5 - Advanced** (ทำภายหลัง)
   - Real-time features
   - PWA
   - Performance optimization

### 🛠️ Tech Stack แนะนำ

```typescript
// Frontend (มีอยู่แล้ว)
✅ Next.js 15
✅ TypeScript
✅ Tailwind CSS
✅ React Hook Form

// Backend (ต้องเพิ่ม)
⭐ Supabase (Database + Auth + Storage)
⭐ Next.js API Routes
⭐ NextAuth.js (or Supabase Auth)
⭐ Zod (Validation)

// Payment
⭐ Omise (Thailand)

// Email
⭐ Resend.com

// Monitoring
⭐ Sentry (Errors)
⭐ Vercel Analytics (Performance)

// Optional
- Upstash Redis (Cache)
- Cloudinary (Images)
- Twilio (SMS)
```

### 💡 Tips for Success

1. **เริ่มจาก MVP**
   - ทำ core features ก่อน (search, book, pay)
   - Advanced features ทำทีหลัง

2. **ใช้ Existing Solutions**
   - Supabase แทน custom backend
   - NextAuth แทน custom auth
   - Omise แทน custom payment

3. **Focus on UX**
   - Loading states ชัดเจน
   - Error messages เป็นมิตร
   - Responsive design

4. **Security First**
   - Input validation
   - SQL injection prevention
   - Rate limiting
   - HTTPS only

5. **Monitor Everything**
   - Error tracking (Sentry)
   - Performance (Vercel Analytics)
   - User behavior (GA4)

---

## 📞 Next Steps

### 1. ตัดสินใจ Tech Stack
- Database: Supabase หรือ PostgreSQL?
- Auth: NextAuth หรือ Supabase Auth?
- Payment: Omise หรือ Stripe?

### 2. Setup Development Environment
```bash
# Install dependencies
npm install @supabase/supabase-js
npm install next-auth
npm install zod
npm install @omise/omise-node

# Create .env.local
DATABASE_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
NEXTAUTH_SECRET=
OMISE_PUBLIC_KEY=
OMISE_SECRET_KEY=
```

### 3. Start Phase 1
- สร้าง database schema
- Setup authentication
- สร้าง API routes
- Replace mock data

---

**เอกสารนี้สร้างโดย:** AI Assistant  
**วันที่:** 2025-01-08  
**เวอร์ชัน:** 1.0  
**สถานะ:** ✅ Complete

**คำถาม/ปรึกษาเพิ่มเติม:**
ถ้ามีคำถามเกี่ยวกับการ implement ส่วนใดก็ตาม สามารถถามได้เลยครับ 🚀
