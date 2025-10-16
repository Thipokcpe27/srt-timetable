# JSON-Based Backend System Design

## Overview
This document outlines a complete JSON-based backend system for the Railway Management Platform, using JSON files as the primary data storage instead of SQL Server.

---

## Architecture

```
data/
├── core/
│   ├── stations.json          # Station Management System
│   ├── trains.json             # Train Management System
│   ├── stops.json              # Stop/Schedule Management System
│   └── users.json              # Admin User Management System
├── equipment/
│   ├── bogies.json             # Bogie Management System
│   └── trailers.json           # Trailer/Bogie Assignment System
├── pricing/
│   ├── train-fees.json         # Train Fee Management System
│   ├── sleeper-fees.json       # Sleeper Fee Management System
│   ├── ac-fees.json            # AC Fee Management System
│   └── base-fares.json         # Price by Distance Management System
├── operations/
│   ├── bookings.json           # Booking/Reservation System (NEW)
│   ├── passengers.json         # Passenger Management System (NEW)
│   └── analytics.json          # Popular Trains Analytics (NEW)
└── metadata/
    └── system-config.json      # System configuration
```

---

## System 1: Admin User Management

**File:** `data/core/users.json`

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-01-08T10:30:00Z",
  "users": [
    {
      "id": "admin001",
      "username": "admin",
      "email": "admin@railway.th",
      "passwordHash": "bcrypt_hash_here",
      "role": "ADMIN",
      "firstName": "Admin",
      "lastName": "System",
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00Z",
      "lastLogin": "2025-01-08T09:00:00Z"
    }
  ]
}
```

**CRUD Operations:**
- ✅ Add/Edit/Delete/Enable/Disable users
- ✅ Simple array manipulation
- ✅ No complex queries needed

---

## System 2: Station Management

**File:** `data/core/stations.json`

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-01-08T10:30:00Z",
  "stations": [
    {
      "id": "BKK",
      "code": "BKK",
      "name": "กรุงเทพ (หัวลำโพง)",
      "nameEn": "Bangkok (Hua Lamphong)",
      "city": "กรุงเทพมหานคร",
      "region": "กลาง",
      "coordinates": {
        "lat": 13.7372,
        "lng": 100.5163
      },
      "facilities": ["wifi", "parking", "restaurant", "accessible"],
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-05T14:20:00Z"
    },
    {
      "id": "CNX",
      "code": "CNX",
      "name": "เชียงใหม่",
      "nameEn": "Chiang Mai",
      "city": "เชียงใหม่",
      "region": "เหนือ",
      "coordinates": {
        "lat": 18.7883,
        "lng": 98.9853
      },
      "facilities": ["wifi", "parking", "restaurant"],
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

**CRUD Operations:**
- ✅ Add new stations
- ✅ Edit station details
- ✅ Enable/Disable stations (isActive flag)
- ✅ Search by region, city, or code

---

## System 3: Stop/Schedule Management

**File:** `data/core/stops.json`

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-01-08T10:30:00Z",
  "schedules": [
    {
      "id": "schedule001",
      "trainId": "T001",
      "trainNumber": "SP001",
      "effectiveDate": "2025-01-01",
      "expiryDate": null,
      "stops": [
        {
          "sequence": 1,
          "stationId": "BKK",
          "arrivalTime": null,
          "departureTime": "08:30",
          "platformNumber": "3",
          "dwellTimeMinutes": 0
        },
        {
          "sequence": 2,
          "stationId": "AYA",
          "arrivalTime": "09:30",
          "departureTime": "09:35",
          "platformNumber": "1",
          "dwellTimeMinutes": 5
        },
        {
          "sequence": 3,
          "stationId": "LPG",
          "arrivalTime": "17:45",
          "departureTime": "17:50",
          "platformNumber": "2",
          "dwellTimeMinutes": 5
        },
        {
          "sequence": 4,
          "stationId": "CNX",
          "arrivalTime": "20:15",
          "departureTime": null,
          "platformNumber": "1",
          "dwellTimeMinutes": 0
        }
      ],
      "operatingDays": ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
      "isActive": true
    }
  ]
}
```

**CRUD Operations:**
- ✅ Add/Edit/Delete schedules
- ✅ Manage stops per train
- ✅ Update arrival/departure times
- ✅ Close/Archive old schedules

---

## System 4: Train Management

**File:** `data/core/trains.json`

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-01-08T10:30:00Z",
  "trains": [
    {
      "id": "T001",
      "trainNumber": "SP001",
      "trainName": "ด่วนพิเศษกรุงเทพ-เชียงใหม่",
      "trainType": "SPECIAL_EXPRESS",
      "originStationId": "BKK",
      "destinationStationId": "CNX",
      "totalDistance": 751,
      "announcementNote": "ขอความกรุณาผู้โดยสารทุกท่านโปรดเก็บสัมภาระให้เรียบร้อย",
      "amenities": ["wifi", "power", "ac", "dining", "accessible", "luggage", "toilet"],
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-05T14:20:00Z"
    }
  ]
}
```

**CRUD Operations:**
- ✅ Add new trains
- ✅ Edit train details (number, name, type, route, notes)
- ✅ Delete trains
- ✅ Close/Deactivate trains (isActive)

---

## System 5: Bogie Management

**File:** `data/equipment/bogies.json`

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-01-08T10:30:00Z",
  "bogies": [
    {
      "id": "BOG001",
      "bogieCode": "SLE-1A",
      "bogieName": "ตู้นอนชั้น 1 แอร์",
      "abbreviation": "SLE1A",
      "bogieType": "SLEEPER_CLASS1",
      "classType": "FIRST_CLASS",
      "capacity": 20,
      "features": ["AC", "PRIVATE_CABIN", "TOILET", "WIFI"],
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00Z"
    },
    {
      "id": "BOG002",
      "bogieCode": "SLE-2A",
      "bogieName": "ตู้นอนชั้น 2 แอร์",
      "abbreviation": "SLE2A",
      "bogieType": "SLEEPER_CLASS2",
      "classType": "BUSINESS_CLASS",
      "capacity": 40,
      "features": ["AC", "BUNK_BED", "WIFI"],
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00Z"
    },
    {
      "id": "BOG003",
      "bogieCode": "SIT-3A",
      "bogieName": "ตู้นั่งชั้น 3 แอร์",
      "abbreviation": "SIT3A",
      "bogieType": "SEAT_CLASS3",
      "classType": "ECONOMY_CLASS",
      "capacity": 80,
      "features": ["AC", "STANDARD_SEAT"],
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ],
  "bogieTypes": [
    {
      "id": "SLEEPER_CLASS1",
      "name": "ตู้นอนชั้น 1",
      "description": "ห้องนอนส่วนตัวพร้อมสิ่งอำนวยความสะดวกครบครัน"
    },
    {
      "id": "SLEEPER_CLASS2",
      "name": "ตู้นอนชั้น 2",
      "description": "เตียงนอน 2 ชั้นแบบแชร์"
    },
    {
      "id": "SEAT_CLASS3",
      "name": "ตู้นั่งชั้น 3",
      "description": "ที่นั่งมาตรฐานพร้อมปลั๊กไฟ"
    }
  ]
}
```

**CRUD Operations:**
- ✅ Add/Edit/Delete bogies
- ✅ Manage bogie types
- ✅ Close/Archive bogies

---

## System 6: Trailer Management

**File:** `data/equipment/trailers.json`

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-01-08T10:30:00Z",
  "trainCompositions": [
    {
      "id": "COMP001",
      "trainId": "T001",
      "trainNumber": "SP001",
      "effectiveDate": "2025-01-01",
      "expiryDate": null,
      "bogies": [
        {
          "position": 1,
          "bogieId": "BOG001",
          "bogieCode": "SLE-1A",
          "classId": "first",
          "className": "ชั้น 1",
          "totalSeats": 20,
          "availableSeats": 12
        },
        {
          "position": 2,
          "bogieId": "BOG002",
          "bogieCode": "SLE-2A",
          "classId": "business",
          "className": "ชั้นธุรกิจ",
          "totalSeats": 40,
          "availableSeats": 28
        },
        {
          "position": 3,
          "bogieId": "BOG003",
          "bogieCode": "SIT-3A",
          "classId": "economy",
          "className": "ชั้นประหยัด",
          "totalSeats": 80,
          "availableSeats": 45
        }
      ],
      "isActive": true
    }
  ]
}
```

**CRUD Operations:**
- ✅ Assign bogies to trains
- ✅ Manage bogie positions
- ✅ Update seat availability
- ✅ Add/Delete/Edit compositions

---

## System 7: Train Fee Management

**File:** `data/pricing/train-fees.json`

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-01-08T10:30:00Z",
  "trainFees": [
    {
      "id": "FEE001",
      "vehicleType": "SPECIAL_EXPRESS",
      "vehicleTypeName": "ด่วนพิเศษ",
      "startKm": 0,
      "endKm": 100,
      "feeRate": 50,
      "currency": "THB",
      "isActive": true
    },
    {
      "id": "FEE002",
      "vehicleType": "SPECIAL_EXPRESS",
      "vehicleTypeName": "ด่วนพิเศษ",
      "startKm": 101,
      "endKm": 300,
      "feeRate": 35,
      "currency": "THB",
      "isActive": true
    },
    {
      "id": "FEE003",
      "vehicleType": "EXPRESS",
      "vehicleTypeName": "ด่วน",
      "startKm": 0,
      "endKm": 100,
      "feeRate": 30,
      "currency": "THB",
      "isActive": true
    }
  ]
}
```

**CRUD Operations:**
- ✅ Add/Edit/Delete fee rates
- ✅ Manage by vehicle type and distance ranges

---

## System 8: Sleeper Fee Management

**File:** `data/pricing/sleeper-fees.json`

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-01-08T10:30:00Z",
  "sleeperFees": [
    {
      "id": "SLEEP001",
      "carCode": "SLE-1A",
      "carName": "ตู้นอนชั้น 1 แอร์",
      "feeAmount": 500,
      "currency": "THB",
      "description": "ห้องนอนส่วนตัว",
      "isActive": true
    },
    {
      "id": "SLEEP002",
      "carCode": "SLE-2A",
      "carName": "ตู้นอนชั้น 2 แอร์",
      "feeAmount": 300,
      "currency": "THB",
      "description": "เตียงนอน 2 ชั้น",
      "isActive": true
    }
  ]
}
```

**CRUD Operations:**
- ✅ Add/Edit/Delete sleeper fees
- ✅ Manage by car code

---

## System 9: AC Fee Management

**File:** `data/pricing/ac-fees.json`

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-01-08T10:30:00Z",
  "acFees": [
    {
      "id": "AC001",
      "distanceRangeStart": 1,
      "distanceRangeEnd": 300,
      "feeAmount": 50,
      "currency": "THB",
      "description": "ค่าแอร์ระยะทาง 1-300 กม.",
      "isActive": true
    },
    {
      "id": "AC002",
      "distanceRangeStart": 301,
      "distanceRangeEnd": 500,
      "feeAmount": 80,
      "currency": "THB",
      "description": "ค่าแอร์ระยะทาง 301-500 กม.",
      "isActive": true
    },
    {
      "id": "AC003",
      "distanceRangeStart": 501,
      "distanceRangeEnd": 999999,
      "feeAmount": 120,
      "currency": "THB",
      "description": "ค่าแอร์ระยะทาง 500+ กม.",
      "isActive": true
    }
  ]
}
```

**CRUD Operations:**
- ✅ Add/Edit/Delete AC fees
- ✅ Manage by distance tiers

---

## System 10: Price by Distance Management

**File:** `data/pricing/base-fares.json`

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-01-08T10:30:00Z",
  "baseFares": [
    {
      "id": "FARE001",
      "kilometerStart": 0,
      "kilometerEnd": 50,
      "class1Fare": 3.5,
      "class2Fare": 2.5,
      "class3Fare": 1.5,
      "currency": "THB",
      "unit": "PER_KM",
      "isActive": true
    },
    {
      "id": "FARE002",
      "kilometerStart": 51,
      "kilometerEnd": 200,
      "class1Fare": 3.0,
      "class2Fare": 2.0,
      "class3Fare": 1.2,
      "currency": "THB",
      "unit": "PER_KM",
      "isActive": true
    },
    {
      "id": "FARE003",
      "kilometerStart": 201,
      "kilometerEnd": 500,
      "class1Fare": 2.5,
      "class2Fare": 1.8,
      "class3Fare": 1.0,
      "currency": "THB",
      "unit": "PER_KM",
      "isActive": true
    },
    {
      "id": "FARE004",
      "kilometerStart": 501,
      "kilometerEnd": 999999,
      "class1Fare": 2.0,
      "class2Fare": 1.5,
      "class3Fare": 0.8,
      "currency": "THB",
      "unit": "PER_KM",
      "isActive": true
    }
  ]
}
```

**CRUD Operations:**
- ✅ Add/Edit/Delete base fares
- ✅ Manage by distance ranges and class

---

## Bonus Systems (NEW)

### System 11: Booking Management

**File:** `data/operations/bookings.json`

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-01-08T10:30:00Z",
  "bookings": [
    {
      "id": "BK202501080001",
      "bookingNumber": "SRT-2025-001",
      "passengerId": "PASS001",
      "trainId": "T001",
      "trainNumber": "SP001",
      "travelDate": "2025-01-15",
      "originStationId": "BKK",
      "destinationStationId": "CNX",
      "classId": "first",
      "seatNumber": "1A",
      "bogieCode": "SLE-1A",
      "baseFare": 1350,
      "trainFee": 250,
      "sleeperFee": 500,
      "acFee": 120,
      "totalAmount": 2220,
      "status": "CONFIRMED",
      "paymentStatus": "PAID",
      "paymentMethod": "CREDIT_CARD",
      "bookedAt": "2025-01-08T10:15:00Z"
    }
  ]
}
```

### System 12: Analytics

**File:** `data/operations/analytics.json`

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-01-08T10:30:00Z",
  "popularTrains": [
    {
      "trainId": "T001",
      "trainNumber": "SP001",
      "searchCount": 1250,
      "bookingCount": 320,
      "trend": "UP",
      "rank": 1
    }
  ],
  "statistics": {
    "totalBookings": 15420,
    "totalRevenue": 45670000,
    "averageOccupancy": 78.5
  }
}
```

---

## Implementation Strategy

### Phase 1: Convert Current Data (1 hour)
1. Convert `trainData.ts` → `trains.json`
2. Convert `stations` → `stations.json`
3. Add missing stopSchedules to T002-T005

### Phase 2: Create Pricing Data (2 hours)
1. Design realistic pricing tiers
2. Create all 4 pricing JSON files
3. Calculate prices based on formulas

### Phase 3: Equipment Management (2 hours)
1. Create bogies.json (all bogie types)
2. Create trailers.json (train compositions)
3. Link with trains

### Phase 4: Admin & Operations (3 hours)
1. Create users.json with admin system
2. Create bookings.json (sample data)
3. Create analytics.json (real popular trains)

---

## Data Access Layer

Create utility functions to read/write JSON files:

```typescript
// lib/data/dataAccess.ts
export async function readJSON<T>(filePath: string): Promise<T> {
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}

export async function writeJSON<T>(filePath: string, data: T): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}
```

---

## Advantages vs Disadvantages

See: `JSON_VS_SQL_COMPARISON.md` (to be created)

---

## Next Steps

1. Create `/data` directory structure
2. Convert existing data to JSON format
3. Build admin panel for JSON editing
4. Implement data validation
5. Add backup/restore functionality

---

**Status**: Design Complete ✅  
**Ready for Implementation**: Yes  
**Estimated Setup Time**: 8-10 hours
