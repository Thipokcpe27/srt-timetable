# 🔌 API Endpoints Documentation
## SRT Timetable - Complete API Reference

**Version:** 1.0  
**Base URL:** `https://api.srt-timetable.com` (production)  
**Base URL:** `http://localhost:3000` (development)  
**Date:** 2025-01-08

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Public APIs](#public-apis)
3. [Admin APIs](#admin-apis)
4. [Pricing APIs](#pricing-apis)
5. [Analytics APIs](#analytics-apis)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)

---

## 🔐 Authentication

### Admin Authentication

All admin endpoints require JWT authentication via Bearer token.

```typescript
Headers:
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

### Login

```http
POST /api/admin/auth/login
```

**Request Body:**
```json
{
  "email": "admin@srt.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "expiresIn": 86400,
    "user": {
      "id": "uuid",
      "email": "admin@srt.com",
      "fullName": "Admin User",
      "role": "admin"
    }
  }
}
```

### Logout

```http
POST /api/admin/auth/logout
```

### Get Current User

```http
GET /api/admin/auth/me
```

---

## 🌐 Public APIs

### 1. Stations

#### Get All Stations

```http
GET /api/stations
```

**Query Parameters:**
- `region` (optional): Filter by region (กลาง, เหนือ, ใต้, ตะวันออกเฉียงเหนือ)
- `active` (optional): Filter by active status (true/false)
- `search` (optional): Search by name
- `lang` (optional): Language (th, en, cn) - default: th

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "stationCode": 1001,
      "codeTh": "กท.",
      "codeEn": "BKK",
      "nameTh": "กรุงเทพ (หัวลำโพง)",
      "nameEn": "Bangkok (Hua Lamphong)",
      "nameCn": "曼谷",
      "stationClass": "special",
      "latitude": 13.7372,
      "longitude": 100.5498,
      "facilities": ["ATM", "Wi-Fi", "Parking"],
      "imageUrl": "/images/stations/bkk.jpg",
      "isActive": true
    }
  ],
  "meta": {
    "total": 200,
    "count": 20
  }
}
```

#### Get Station by ID

```http
GET /api/stations/:id
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "stationCode": 1001,
    // ... full station details
    "trainsOrigin": 45,
    "trainsDestination": 42,
    "totalTrains": 87
  }
}
```

### 2. Trains

#### Search Trains

```http
POST /api/trains/search
```

**Request Body:**
```json
{
  "origin": "BKK",
  "destination": "CNX",
  "date": "2025-01-15",
  "passengers": 2,
  "class": 2,
  "trainType": "express_special"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "trainNumber": "SP001",
      "trainNameTh": "ด่วนพิเศษกรุงเทพ-เชียงใหม่",
      "trainNameEn": "Special Express Bangkok-Chiangmai",
      "trainType": {
        "code": "express_special",
        "nameTh": "ด่วนพิเศษ",
        "nameEn": "Special Express"
      },
      "origin": {
        "id": 1,
        "codeTh": "กท.",
        "nameTh": "กรุงเทพ"
      },
      "destination": {
        "id": 5,
        "codeTh": "ชม.",
        "nameTh": "เชียงใหม่"
      },
      "departureTime": "08:30",
      "arrivalTime": "20:15",
      "duration": "11:45:00",
      "distanceKm": 751,
      "stops": [
        {
          "order": 1,
          "stationName": "กรุงเทพ",
          "arrivalTime": null,
          "departureTime": "08:30"
        },
        {
          "order": 2,
          "stationName": "อยุธยา",
          "arrivalTime": "09:30",
          "departureTime": "09:35"
        }
      ],
      "classes": [
        {
          "id": 1,
          "className": "ชั้น 1",
          "price": 1850,
          "availableSeats": 12,
          "totalSeats": 20
        }
      ],
      "amenities": ["Wi-Fi", "AC", "Dining"],
      "pricing": {
        "class1": 1850,
        "class2": 1250,
        "class3": 650
      }
    }
  ],
  "meta": {
    "total": 5,
    "searchParams": {
      "origin": "BKK",
      "destination": "CNX"
    }
  }
}
```

#### Get All Trains

```http
GET /api/trains
```

**Query Parameters:**
- `trainType` (optional): Filter by train type
- `origin` (optional): Filter by origin station
- `destination` (optional): Filter by destination
- `active` (optional): Filter by active status
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

#### Get Train by ID

```http
GET /api/trains/:id
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "trainNumber": "SP001",
    // ... full train details
    "stops": [...],
    "classes": [...],
    "bogies": [...],
    "amenities": [...]
  }
}
```

#### Get Train Stops

```http
GET /api/trains/:id/stops
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "order": 1,
      "station": {
        "id": 1,
        "codeTh": "กท.",
        "nameTh": "กรุงเทพ"
      },
      "arrivalTime": null,
      "departureTime": "08:30",
      "platform": "3",
      "distanceFromOrigin": 0,
      "stopType": "stop"
    }
  ]
}
```

### 3. Popular Trains

```http
GET /api/trains/popular
```

**Query Parameters:**
- `limit` (optional): Number of results (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "train": {
        "id": 1,
        "trainNumber": "SP001",
        "trainName": "ด่วนพิเศษกรุงเทพ-เชียงใหม่"
      },
      "searchCount": 1250,
      "trend": "up",
      "trendPercentage": 15.5
    }
  ]
}
```

### 4. Tourist Trains

```http
GET /api/tourist-trains
```

**Query Parameters:**
- `category` (optional): luxury, cultural, scenic, adventure
- `available` (optional): Filter by availability

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "TOUR001",
      "nameTh": "รถไฟหรูตะวันออก",
      "nameEn": "Eastern & Oriental Express",
      "category": "luxury",
      "descriptionTh": "...",
      "routeInfo": "กรุงเทพ - อรัญประเทศ",
      "duration": "2 วัน 1 คืน",
      "startingPrice": 25000,
      "rating": 4.8,
      "reviewCount": 124,
      "imageUrl": "/images/tours/eastern-oriental.jpg",
      "bookingUrl": "https://dticket.railway.co.th/...",
      "isAvailable": true
    }
  ]
}
```

#### Get Tourist Train by ID

```http
GET /api/tourist-trains/:id
```

### 5. Train Status (Real-time)

```http
GET /api/train-status/:trainId
```

**Query Parameters:**
- `date` (optional): Date (YYYY-MM-DD) - default: today

**Response (200):**
```json
{
  "success": true,
  "data": {
    "trainId": 1,
    "trainNumber": "SP001",
    "date": "2025-01-08",
    "currentStatus": "delayed",
    "delayMinutes": 15,
    "currentStation": {
      "id": 3,
      "nameTh": "อยุธยา"
    },
    "estimatedArrival": "20:30",
    "originalArrival": "20:15",
    "remarks": "รอรถไฟขบวนหน้า",
    "lastUpdated": "2025-01-08T10:30:00Z"
  }
}
```

### 6. Announcements

```http
GET /api/announcements
```

**Query Parameters:**
- `trainId` (optional): Filter by train
- `active` (optional): Filter active announcements
- `lang` (optional): Language

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "titleTh": "ประกาศปรับเวลารถไฟ",
      "messageTh": "...",
      "priority": "high",
      "startDate": "2025-01-08",
      "endDate": "2025-01-15",
      "train": {
        "trainNumber": "SP001",
        "trainName": "..."
      }
    }
  ]
}
```

---

## 🔧 Admin APIs

All admin endpoints require authentication.

### 1. Stations Management

#### Get All Stations (Admin)

```http
GET /api/admin/stations
```

**Query Parameters:**
- `page`, `limit`, `search`, `region`, `active`

#### Create Station

```http
POST /api/admin/stations
```

**Request Body:**
```json
{
  "stationCode": 1500,
  "codeTh": "สท.",
  "codeEn": "STH",
  "codeCn": "示例",
  "nameTh": "สถานีทดสอบ",
  "nameEn": "Test Station",
  "nameCn": "测试站",
  "distanceForPricing": 50.5,
  "distanceActual": 51.0,
  "stationClass": "1",
  "latitude": 13.7563,
  "longitude": 100.5018,
  "address": "123 Test Road",
  "phone": "02-123-4567",
  "facilities": ["ATM", "Wi-Fi"],
  "imageUrl": "/images/stations/test.jpg",
  "isActive": true,
  "notes": "Test station"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 201,
    // ... created station data
  },
  "message": "Station created successfully"
}
```

#### Update Station

```http
PUT /api/admin/stations/:id
```

**Request Body:** (same as create, all fields optional)

#### Delete Station

```http
DELETE /api/admin/stations/:id
```

**Response (200):**
```json
{
  "success": true,
  "message": "Station deleted successfully"
}
```

#### Toggle Station Status

```http
PATCH /api/admin/stations/:id/toggle
```

### 2. Trains Management

#### Create Train

```http
POST /api/admin/trains
```

**Request Body:**
```json
{
  "trainNumber": "SP099",
  "trainNameTh": "ทดสอบ",
  "trainNameEn": "Test Train",
  "trainTypeId": 1,
  "originStationId": 1,
  "destinationStationId": 5,
  "departureTime": "08:00",
  "arrivalTime": "20:00",
  "duration": "12:00:00",
  "operatingDays": ["daily"],
  "runningOrder": 1,
  "serviceZone": "ภาคเหนือ",
  "totalDistanceKm": 751,
  "isActive": true,
  "notes": "Test train"
}
```

#### Update Train

```http
PUT /api/admin/trains/:id
```

#### Delete Train

```http
DELETE /api/admin/trains/:id
```

### 3. Train Stops Management

#### Get Train Stops

```http
GET /api/admin/trains/:trainId/stops
```

#### Create/Update Train Stops (Bulk)

```http
POST /api/admin/trains/:trainId/stops
```

**Request Body:**
```json
{
  "stops": [
    {
      "stationId": 1,
      "stopOrder": 1,
      "arrivalTime": null,
      "departureTime": "08:00",
      "stopType": "stop",
      "platform": "1"
    },
    {
      "stationId": 2,
      "stopOrder": 2,
      "arrivalTime": "09:00",
      "departureTime": "09:05",
      "stopType": "stop"
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "stopsCreated": 2,
    "distancesCalculated": true
  },
  "message": "Train stops updated successfully"
}
```

#### Delete Train Stop

```http
DELETE /api/admin/trains/:trainId/stops/:stopId
```

### 4. Bogies Management

#### Get All Bogies

```http
GET /api/admin/bogies
```

#### Create Bogie

```http
POST /api/admin/bogies
```

**Request Body:**
```json
{
  "bogieCode": "10",
  "bogieNameTh": "รถนั่งชั้น 1",
  "bogieNameEn": "First Class Seat",
  "bogieShortNameTh": "น.1",
  "class": 1,
  "seatCount": 40,
  "seatType": "sitting",
  "description": "...",
  "hasAircon": true,
  "isSleeper": false,
  "amenities": ["wifi", "power", "ac"],
  "imageUrl": "/images/bogies/10.jpg"
}
```

#### Update Bogie

```http
PUT /api/admin/bogies/:id
```

#### Delete Bogie

```http
DELETE /api/admin/bogies/:id
```

### 5. Train Compositions

#### Get Train Composition

```http
GET /api/admin/trains/:trainId/composition
```

#### Update Train Composition

```http
POST /api/admin/trains/:trainId/composition
```

**Request Body:**
```json
{
  "bogies": [
    {
      "bogieId": 1,
      "position": 1,
      "quantity": 2
    },
    {
      "bogieId": 2,
      "position": 2,
      "quantity": 3
    }
  ]
}
```

### 6. Pricing Management

#### Train Fares

```http
GET    /api/admin/pricing/train-fares
POST   /api/admin/pricing/train-fares
PUT    /api/admin/pricing/train-fares/:id
DELETE /api/admin/pricing/train-fares/:id
```

**Create Request Body:**
```json
{
  "trainTypeId": 1,
  "distanceFrom": 0,
  "distanceTo": 9999,
  "fare": 170,
  "effectiveDate": "2025-01-01",
  "notes": "..."
}
```

#### Distance Fare Ranges

```http
GET    /api/admin/pricing/distance-fares
POST   /api/admin/pricing/distance-fares
PUT    /api/admin/pricing/distance-fares/:id
DELETE /api/admin/pricing/distance-fares/:id
```

**Create Request Body:**
```json
{
  "class": 1,
  "distanceFrom": 1,
  "distanceTo": 50,
  "farePerKm": 6.00,
  "minimumFare": 6,
  "effectiveDate": "2025-01-01"
}
```

#### AC Fare Categories

```http
GET    /api/admin/pricing/ac-categories
POST   /api/admin/pricing/ac-categories
PUT    /api/admin/pricing/ac-categories/:id
DELETE /api/admin/pricing/ac-categories/:id
```

#### AC Fares

```http
GET    /api/admin/pricing/ac-fares
POST   /api/admin/pricing/ac-fares
PUT    /api/admin/pricing/ac-fares/:id
DELETE /api/admin/pricing/ac-fares/:id
```

**Create Request Body:**
```json
{
  "acCategoryId": 1,
  "distanceFrom": 1,
  "distanceTo": 300,
  "fare": 60,
  "effectiveDate": "2025-01-01"
}
```

#### Berth Fares

```http
GET    /api/admin/pricing/berth-fares
POST   /api/admin/pricing/berth-fares
PUT    /api/admin/pricing/berth-fares/:id
DELETE /api/admin/pricing/berth-fares/:id
```

**Create Request Body:**
```json
{
  "bogieId": 1,
  "berthType": "lower",
  "berthNameTh": "เตียงล่าง",
  "berthNameEn": "Lower Berth",
  "fare": 500,
  "effectiveDate": "2025-01-01"
}
```

### 7. Train Status Management

```http
PUT /api/admin/train-status/:trainId
```

**Request Body:**
```json
{
  "date": "2025-01-08",
  "currentStatus": "delayed",
  "delayMinutes": 15,
  "currentStationId": 3,
  "estimatedArrival": "20:30",
  "remarks": "รอรถไฟขบวนหน้า"
}
```

### 8. Announcements Management

```http
GET    /api/admin/announcements
POST   /api/admin/announcements
PUT    /api/admin/announcements/:id
DELETE /api/admin/announcements/:id
```

**Create Request Body:**
```json
{
  "trainId": null,
  "titleTh": "ประกาศ",
  "titleEn": "Announcement",
  "messageTh": "...",
  "messageEn": "...",
  "priority": "high",
  "startDate": "2025-01-08",
  "endDate": "2025-01-15",
  "showOnHomepage": true,
  "showInSearch": true,
  "isActive": true
}
```

### 9. Admin Users Management

```http
GET    /api/admin/users
POST   /api/admin/users
PUT    /api/admin/users/:id
DELETE /api/admin/users/:id
PATCH  /api/admin/users/:id/toggle
```

**Create Request Body:**
```json
{
  "email": "newadmin@srt.com",
  "password": "securepassword",
  "fullName": "New Admin",
  "phone": "02-123-4567",
  "role": "admin",
  "isActive": true
}
```

### 10. Admin Logs

```http
GET /api/admin/logs
```

**Query Parameters:**
- `adminId` (optional): Filter by admin user
- `action` (optional): Filter by action (create, update, delete)
- `resource` (optional): Filter by resource type
- `startDate` (optional): Filter by date range
- `endDate` (optional)
- `page`, `limit`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "admin": {
        "id": "uuid",
        "email": "admin@srt.com",
        "fullName": "Admin User"
      },
      "action": "update",
      "resource": "trains",
      "resourceId": "1",
      "changes": {
        "before": {...},
        "after": {...}
      },
      "ipAddress": "192.168.1.1",
      "createdAt": "2025-01-08T10:30:00Z"
    }
  ],
  "meta": {
    "total": 1500,
    "page": 1,
    "limit": 20
  }
}
```

---

## 💰 Pricing APIs

### Calculate Fare

```http
POST /api/pricing/calculate
```

**Request Body:**
```json
{
  "trainId": 1,
  "fromStationId": 1,
  "toStationId": 5,
  "class": 2,
  "bogieId": 2,
  "berthType": "lower"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "trainId": 1,
    "trainNumber": "SP001",
    "route": {
      "from": "กรุงเทพ",
      "to": "เชียงใหม่",
      "distance": 751
    },
    "pricing": {
      "distanceFare": 2300,
      "trainFare": 170,
      "acFare": 110,
      "berthFare": 500,
      "totalFare": 3080,
      "breakdown": [
        {
          "label": "ราคาตามระยะทาง (751 กม.)",
          "amount": 2300
        },
        {
          "label": "ค่าธรรมเนียมขบวน (ด่วนพิเศษ)",
          "amount": 170
        },
        {
          "label": "ค่าธรรมเนียมปรับอากาศ",
          "amount": 110
        },
        {
          "label": "ค่าเตียงล่าง",
          "amount": 500
        }
      ]
    }
  }
}
```

### Get Price List (Admin)

```http
GET /api/admin/pricing/preview
```

**Query Parameters:**
- `trainId` (required): Train ID
- `class` (optional): Filter by class

**Response (200):**
```json
{
  "success": true,
  "data": {
    "trainId": 1,
    "trainNumber": "SP001",
    "prices": [
      {
        "fromStation": "กรุงเทพ",
        "toStation": "อยุธยา",
        "distance": 71,
        "class1": 426,
        "class2": 284,
        "class3": 142
      },
      {
        "fromStation": "กรุงเทพ",
        "toStation": "เชียงใหม่",
        "distance": 751,
        "class1": 3080,
        "class2": 2050,
        "class3": 1025
      }
    ]
  }
}
```

---

## 📊 Analytics APIs

### Search Analytics

```http
GET /api/admin/analytics/searches
```

**Query Parameters:**
- `startDate` (optional): Start date (YYYY-MM-DD)
- `endDate` (optional): End date
- `groupBy` (optional): day, week, month

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalSearches": 45620,
    "byRoute": [
      {
        "origin": "BKK",
        "destination": "CNX",
        "count": 5420
      }
    ],
    "byDate": [
      {
        "date": "2025-01-08",
        "count": 1250
      }
    ],
    "trend": "up",
    "growthRate": 15.5
  }
}
```

### Popular Routes

```http
GET /api/admin/analytics/popular-routes
```

### Revenue Analytics (if booking enabled)

```http
GET /api/admin/analytics/revenue
```

### Dashboard Overview

```http
GET /api/admin/analytics/overview
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "trains": {
      "total": 156,
      "active": 145
    },
    "stations": {
      "total": 200
    },
    "searchesToday": 3250,
    "searchesThisMonth": 89000,
    "topRoute": {
      "origin": "BKK",
      "destination": "CNX",
      "count": 5420
    }
  }
}
```

---

## ❌ Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "ไม่พบรถไฟที่ค้นหา",
    "details": {
      "trainId": 999
    }
  },
  "timestamp": "2025-01-08T10:00:00Z"
}
```

### Error Codes

```typescript
// 400 Bad Request
INVALID_INPUT
VALIDATION_ERROR
MISSING_REQUIRED_FIELD

// 401 Unauthorized
UNAUTHORIZED
INVALID_TOKEN
TOKEN_EXPIRED

// 403 Forbidden
FORBIDDEN
INSUFFICIENT_PERMISSIONS

// 404 Not Found
RESOURCE_NOT_FOUND
TRAIN_NOT_FOUND
STATION_NOT_FOUND

// 409 Conflict
DUPLICATE_ENTRY
RESOURCE_CONFLICT

// 429 Too Many Requests
RATE_LIMIT_EXCEEDED

// 500 Internal Server Error
INTERNAL_SERVER_ERROR
DATABASE_ERROR
PRICING_CALCULATION_ERROR
```

---

## 🚦 Rate Limiting

### Limits

```typescript
// Public endpoints
100 requests per minute per IP
1000 requests per hour per IP

// Admin endpoints (authenticated)
200 requests per minute per user
5000 requests per hour per user

// Pricing calculation endpoint
50 requests per minute per IP
500 requests per hour per IP
```

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1609459200
```

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 60
  }
}
```

---

## 📝 Request/Response Examples

### Complete Search Flow

```bash
# 1. Search trains
curl -X POST https://api.srt-timetable.com/api/trains/search \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "BKK",
    "destination": "CNX",
    "date": "2025-01-15"
  }'

# 2. Get train details
curl https://api.srt-timetable.com/api/trains/1

# 3. Calculate price
curl -X POST https://api.srt-timetable.com/api/pricing/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "trainId": 1,
    "fromStationId": 1,
    "toStationId": 5,
    "class": 2,
    "bogieId": 2,
    "berthType": "lower"
  }'
```

### Admin Operations

```bash
# 1. Login
TOKEN=$(curl -X POST https://api.srt-timetable.com/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@srt.com",
    "password": "password"
  }' | jq -r '.data.token')

# 2. Create station
curl -X POST https://api.srt-timetable.com/api/admin/stations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "stationCode": 1500,
    "codeTh": "สท.",
    "nameTh": "สถานีทดสอบ",
    "isActive": true
  }'

# 3. Update train
curl -X PUT https://api.srt-timetable.com/api/admin/trains/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "departureTime": "08:00"
  }'

# 4. View logs
curl https://api.srt-timetable.com/api/admin/logs?page=1&limit=20 \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔄 Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response includes:**
```json
{
  "data": [...],
  "meta": {
    "total": 500,
    "page": 1,
    "limit": 20,
    "totalPages": 25,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## 🔍 Filtering & Sorting

### Common Query Parameters

- `sort`: Sort field (e.g., `createdAt`, `-createdAt` for descending)
- `fields`: Select specific fields (comma-separated)
- `search`: Search across multiple fields
- `filter[field]`: Filter by field value

**Example:**
```http
GET /api/trains?sort=-departureTime&fields=trainNumber,trainName&filter[trainType]=express_special
```

---

## 📚 Additional Resources

- [Database Schema](./DATABASE_SCHEMA_COMPLETE.sql)
- [Pricing Engine Architecture](./PRICING_ENGINE_ARCHITECTURE.md)
- [Testing Strategy](./TESTING_STRATEGY.md)
- [Deployment Guide](./FULL_SYSTEM_DEVELOPMENT_PLAN.md)

---

**Last Updated:** 2025-01-08  
**API Version:** 1.0  
**Status:** Complete Documentation

---

**Support:** For API support, contact dev@srt-timetable.com
