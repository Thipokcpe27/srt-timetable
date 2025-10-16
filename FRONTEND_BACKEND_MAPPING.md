# Frontend - Backend Mapping Analysis

## 📊 สรุปภาพรวม

### ✅ Frontend ที่มีอยู่
- **หน้าค้นหารถไฟ** พร้อม UI/UX สมบูรณ์
- **ระบบเปรียบเทียบขบวน** (Train Comparison)
- **ประวัติการค้นหา** (Search History)
- **รถไฟยอดนิยม** (Popular Trains)
- **รถไฟท่องเที่ยว** (Tourist Trains)
- **ระบบ Accessibility** (WCAG AAA)

### ✅ Backend ที่สร้างแล้ว
- **ฐานข้อมูล SQL Server** (15 ตาราง)
- **Stored Procedures** (7 procedures)
- **Mock Data** (13 สถานี, 9 ขบวน)
- **Database Connection** พร้อมใช้งาน

---

## 🔄 การเชื่อมต่อ Frontend → Backend

### 1. **ข้อมูลสถานี (Stations)**

#### Frontend ต้องการ:
```typescript
interface Station {
  id: string;        // 'BKK', 'CNX'
  name: string;      // 'กรุงเทพ (หัวลำโพง)'
  code: string;      // 'BKK'
  city: string;      // 'กรุงเทพมหานคร'
  region: string;    // 'กลาง'
}
```

#### Database มี:
```sql
SELECT 
  StationId as id,
  NameTH as name,
  StationCode as code,
  City as city,
  Region as region
FROM Stations WHERE IsActive = 1
```

**✅ Status:** ตรงกัน 100% - พร้อมใช้งาน!

---

### 2. **ข้อมูลรถไฟ (Trains)**

#### Frontend ต้องการ:
```typescript
interface Train {
  id: string;                    // 'T001'
  trainNumber: string;           // 'SP001'
  trainName: string;             // 'ด่วนพิเศษกรุงเทพ-เชียงใหม่'
  origin: string;                // 'BKK'
  destination: string;           // 'CNX'
  departureTime: string;         // '08:30'
  arrivalTime: string;           // '20:15'
  duration: string;              // '11ชม. 45นาที'
  stops: string[];               // ['AYA', 'LPG']
  stopSchedules: StopSchedule[]; // ตารางเวลาแต่ละสถานี
  classes: TrainClass[];         // ชั้นที่นั่งและราคา
  amenities: Amenity[];          // สิ่งอำนวยความสะดวก
  operatingDays: string[];       // ['daily'] หรือ ['mon', 'tue']
}

interface TrainClass {
  id: string;          // 'first', 'business', 'economy'
  name: string;        // 'ชั้น 1'
  price: number;       // 1850
  features: string[];  // ['Wi-Fi', 'อาหารว่าง']
  available: number;   // 12 ที่ว่าง
  totalSeats: number;  // 20 ที่ทั้งหมด
}
```

#### Database มี:
```sql
-- ข้อมูลหลัก
SELECT 
  t.TrainId as id,
  t.TrainNumber as trainNumber,
  t.TrainName as trainName,
  t.OriginStationId as origin,
  t.DestinationStationId as destination,
  t.DepartureTime as departureTime,
  t.ArrivalTime as arrivalTime,
  t.DurationMinutes,
  t.Amenities,
  t.OperatingDays
FROM Trains t

-- ตารางเวลา (stops)
SELECT StationId, ArrivalTime, DepartureTime, SequenceNumber
FROM TrainSchedules WHERE TrainId = @TrainId

-- ชั้นที่นั่ง (classes)
SELECT tc.ClassId, tc.ClassName, tc.TotalSeats, tc.AvailableSeats
FROM TrainCompositions tc WHERE tc.TrainId = @TrainId

-- คำนวณราคา (จาก BaseFares + TrainFees + ACFees)
EXEC sp_CalculateFare @TrainId, @OriginId, @DestId, @ClassType
```

**⚠️ ความแตกต่าง:**
1. **Duration:** Database เก็บเป็น `DurationMinutes` (INT), Frontend ต้องการ string แบบ "11ชม. 45นาที"
2. **Stops:** ต้อง JOIN กับ TrainSchedules
3. **Classes:** ต้อง JOIN กับ TrainCompositions + คำนวณราคา
4. **OperatingDays:** Database: "MON,TUE,WED", Frontend: ['mon', 'tue', 'wed']

---

### 3. **การค้นหารถไฟ (Search)**

#### Frontend Flow:
```typescript
const handleSearch = (params: SearchParams) => {
  // params = { origin, destination, date, passengers, class }
  const results = searchTrains(params); // ค้นหาจาก mock data
  setSearchResults(results);
}
```

#### Backend ต้องทำ:
```sql
EXEC sp_SearchTrains 
  @OriginStationId = 'STN001',
  @DestinationStationId = 'STN006'
```

**🔧 ต้องปรับ:** Stored procedure รองรับ date และ passengers filtering

---

### 4. **รถไฟยอดนิยม (Popular Trains)**

#### Frontend ต้องการ:
```typescript
// แสดงรถไฟยอดนิยม 10 อันดับ พร้อม carousel
interface PopularTrain {
  trainId: string;
  trainNumber: string;
  origin: string;
  destination: string;
  searchCount: number;
  rank: number;
}
```

#### Database มี:
```sql
EXEC sp_GetPopularTrains @TopN = 10
```

**✅ Status:** พร้อมใช้งาน! มี stored procedure แล้ว

---

### 5. **ประวัติการค้นหา (Search History)**

#### Frontend:
```typescript
// เก็บใน localStorage ปัจจุบัน
searchHistoryService.addToHistory(params);
```

#### Backend:
```sql
EXEC sp_LogSearch 
  @TrainId = NULL,
  @OriginStationId = 'STN001',
  @DestinationStationId = 'STN006'
```

**🔧 ต้องทำ:** เปลี่ยนจาก localStorage เป็นเก็บใน database

---

## 🎯 แผนการทำงาน (Roadmap)

### Phase 1: API Routes สำหรับข้อมูลพื้นฐาน ✅ (วันนี้)
```
✅ /api/test-db          - ทดสอบการเชื่อมต่อ (เสร็จแล้ว)
⏳ /api/stations         - ดึงสถานีทั้งหมด
⏳ /api/stations/[id]    - ดึงข้อมูลสถานีเดี่ยว
```

### Phase 2: API Routes สำหรับการค้นหา (พรุ่งนี้)
```
⏳ /api/trains/search    - ค้นหาขบวนรถไฟ
⏳ /api/trains/[id]      - ดูรายละเอียดขบวน
⏳ /api/trains/[id]/schedule - ดูตารางเวลา
```

### Phase 3: API Routes สำหรับฟีเจอร์พิเศษ
```
⏳ /api/fare/calculate   - คำนวณค่าโดยสาร
⏳ /api/popular-trains   - รถไฟยอดนิยม
⏳ /api/search-history   - บันทึกและดึงประวัติ
```

### Phase 4: อัปเดต Frontend Components
```
⏳ อัปเดต TrainSearch - เรียก API แทน mock data
⏳ อัปเดต TrainResults - แสดงข้อมูลจาก API
⏳ อัปเดต PopularTrains - ใช้ข้อมูล real-time
⏳ อัปเดต SearchHistory - เก็บใน database
```

---

## 📋 ความแตกต่างที่ต้องจัดการ

### 1. **โครงสร้างข้อมูล**

| Field | Frontend | Database | Solution |
|-------|----------|----------|----------|
| Duration | `"11ชม. 45นาที"` | `705` (minutes) | แปลงใน API response |
| Amenities | `Amenity[]` objects | `JSON string` | Parse JSON ใน API |
| OperatingDays | `['daily']` | `"MON,TUE,WED"` | แปลง string → array |
| Stops | `string[]` | JOIN TrainSchedules | Query แยก |
| Classes | Full object | JOIN multiple tables | Complex query |

### 2. **การคำนวณราคา**

**Frontend (ปัจจุบัน):**
```typescript
classes: [
  { id: 'first', name: 'ชั้น 1', price: 1850 }  // Hard-coded
]
```

**Backend (ใหม่):**
```sql
-- คำนวณแบบไดนามิก
BaseFare (ตามระยะทาง) + 
TrainFee (ตามประเภทรถ) + 
ACFee (ถ้ามีแอร์) +
SleeperFee (ถ้าเป็นตู้นอน)
```

**Solution:** สร้าง API endpoint `/api/fare/calculate`

### 3. **Search Logic**

**Frontend (ปัจจุบัน):**
```typescript
// Client-side filtering
trains.filter(train => 
  train.origin === params.origin && 
  train.destination === params.destination
)
```

**Backend (ใหม่):**
```sql
-- Server-side query + complex joins
EXEC sp_SearchTrains WITH date/time filtering
```

---

## 🚀 ขั้นตอนถัดไป

### ขั้นที่ 1: สร้าง Basic API Routes (30 นาที)
```typescript
// /api/stations/route.ts
// /api/trains/search/route.ts
```

### ขั้นที่ 2: สร้าง Helper Functions (20 นาที)
```typescript
// lib/formatters.ts - แปลงข้อมูลจาก DB → Frontend format
```

### ขั้นที่ 3: อัปเดต Frontend (1 ชั่วโมง)
```typescript
// เปลี่ยนจาก mock data → API calls
```

### ขั้นที่ 4: Testing (30 นาที)
```
- ทดสอบ search
- ทดสอบ popular trains
- ทดสอบ fare calculation
```

---

## 💡 สิ่งที่ดี

✅ **Frontend UX/UI สมบูรณ์** - ไม่ต้องแก้ UI เลย  
✅ **Database Schema ครบถ้วน** - รองรับทุกฟีเจอร์  
✅ **Stored Procedures พร้อม** - Query ที่ซับซ้อนทำไว้แล้ว  
✅ **Type Safety** - TypeScript interfaces ครบทั้ง frontend

## ⚠️ สิ่งที่ต้องทำ

🔧 **ต้องสร้าง API Routes** - เชื่อมต่อ frontend กับ backend  
🔧 **ต้องแปลงข้อมูล** - Format data ให้ตรงกับ frontend interfaces  
🔧 **ต้องจัดการ Error** - Graceful fallback ถ้า API fail  
🔧 **ต้อง Migrate Search History** - จาก localStorage → database  

---

## 📝 สรุป

**Frontend:** 80% เสร็จแล้ว - UI/UX สมบูรณ์  
**Backend:** 70% เสร็จแล้ว - Database + Stored Procedures พร้อม  
**ที่ขาด:** API Layer (20-30%) - ตัวกลางเชื่อม Frontend ↔ Backend

**ระยะเวลาประมาณ:** 3-4 ชั่วโมง เพื่อเชื่อมต่อทั้งหมด

---

**คุณต้องการให้เริ่มสร้าง API Routes เลยไหมครับ?** 🚀
