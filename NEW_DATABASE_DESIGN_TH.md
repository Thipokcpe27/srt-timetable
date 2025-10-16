# การออกแบบฐานข้อมูลใหม่ - SQL Server

## กลยุทธ์: เริ่มต้นใหม่ + การย้ายข้อมูล

**แนวทาง**: ออกแบบโครงสร้างใหม่ทั้งหมด นำเข้าข้อมูลเก่าในภายหลัง  
**ระยะเวลา**: 2-4 วันสำหรับระบบที่สมบูรณ์  
**ประโยชน์**: ไม่มีภาระทางเทคนิคจากฐานข้อมูลเก่า

---

## แผนการดำเนินงานอย่างรวดเร็ว

```
วันที่ 1: ออกแบบและสร้างโครงสร้างฐานข้อมูล (4-6 ชั่วโมง)
├── ออกแบบ ERD diagram
├── สร้างฐานข้อมูล SQL Server
├── รันสคริปต์สร้างโครงสร้าง
└── ตั้งค่า indexes และ constraints

วันที่ 2: ใช้ JSON เป็นสะพาน (4-6 ชั่วโมง)
├── ส่งออกฐานข้อมูลเก่า → ไฟล์ JSON
├── แปลง JSON ให้ตรงกับโครงสร้างใหม่
├── นำเข้า JSON → SQL Server ใหม่
└── ตรวจสอบความถูกต้องของข้อมูล

วันที่ 3: สร้าง APIs (4-6 ชั่วโมง)
├── สร้าง Next.js API routes
├── เชื่อมต่อกับ SQL Server
├── ทดสอบ CRUD operations
└── สร้างหน้าจัดการสำหรับแอดมิน

วันที่ 4: Deploy และทดสอบ (2-4 ชั่วโมง)
├── Deploy ฐานข้อมูล
├── Deploy แอปพลิเคชัน
├── ทดสอบแบบ end-to-end
└── จัดทำเอกสาร
```

---

## โครงสร้าง SQL Server แบบสมบูรณ์

### ตารางหลัก (Core Tables)

```sql
-- ============================================
-- ตารางหลัก: ผู้ใช้งาน (การจัดการแอดมิน)
-- ============================================
CREATE TABLE Users (
    UserId VARCHAR(50) PRIMARY KEY DEFAULT NEWID(),
    Username VARCHAR(100) UNIQUE NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    FirstName NVARCHAR(100),
    LastName NVARCHAR(100),
    Role VARCHAR(20) DEFAULT 'ADMIN' CHECK (Role IN ('ADMIN', 'SUPER_ADMIN')),
    IsActive BIT DEFAULT 1,
    LastLoginAt DATETIME,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    
    INDEX IX_Users_Username (Username),
    INDEX IX_Users_Email (Email),
    INDEX IX_Users_IsActive (IsActive)
);

-- ============================================
-- ตารางหลัก: สถานี
-- ============================================
CREATE TABLE Stations (
    StationId VARCHAR(50) PRIMARY KEY,
    StationCode VARCHAR(10) UNIQUE NOT NULL,
    NameTH NVARCHAR(200) NOT NULL,
    NameEN VARCHAR(200),
    City NVARCHAR(100),
    Region NVARCHAR(100),
    Latitude DECIMAL(10, 7),
    Longitude DECIMAL(10, 7),
    Facilities NVARCHAR(MAX), -- JSON array: ["wifi", "parking", "restaurant"]
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    
    INDEX IX_Stations_Code (StationCode),
    INDEX IX_Stations_Region (Region),
    INDEX IX_Stations_IsActive (IsActive)
);

-- ============================================
-- ตารางหลัก: ประเภทรถไฟ
-- ============================================
CREATE TABLE TrainTypes (
    TrainTypeId VARCHAR(50) PRIMARY KEY,
    TypeCode VARCHAR(20) UNIQUE NOT NULL,
    NameTH NVARCHAR(100) NOT NULL,
    NameEN VARCHAR(100),
    Description NVARCHAR(500),
    BaseMultiplier DECIMAL(5, 2) DEFAULT 1.0, -- สำหรับการคำนวณค่าโดยสาร
    IsActive BIT DEFAULT 1,
    
    INDEX IX_TrainTypes_Code (TypeCode)
);

-- เพิ่มข้อมูลประเภทรถไฟเริ่มต้น
INSERT INTO TrainTypes (TrainTypeId, TypeCode, NameTH, NameEN, BaseMultiplier) VALUES
('TT001', 'SPECIAL_EXPRESS', N'ด่วนพิเศษ', 'Special Express', 1.5),
('TT002', 'EXPRESS', N'ด่วน', 'Express', 1.2),
('TT003', 'RAPID', N'เร็ว', 'Rapid', 1.0),
('TT004', 'ORDINARY', N'ธรรมดา', 'Ordinary', 0.8),
('TT005', 'LUXURY', N'รถหรู', 'Luxury', 2.5);

-- ============================================
-- ตารางหลัก: รถไฟ
-- ============================================
CREATE TABLE Trains (
    TrainId VARCHAR(50) PRIMARY KEY,
    TrainNumber VARCHAR(20) UNIQUE NOT NULL,
    TrainName NVARCHAR(200) NOT NULL,
    TrainTypeId VARCHAR(50) NOT NULL,
    OriginStationId VARCHAR(50) NOT NULL,
    DestinationStationId VARCHAR(50) NOT NULL,
    TotalDistanceKm INT,
    DepartureTime TIME NOT NULL,
    ArrivalTime TIME NOT NULL,
    DurationMinutes INT,
    AnnouncementNote NVARCHAR(MAX),
    Amenities NVARCHAR(MAX), -- JSON array
    OperatingDays VARCHAR(100), -- "MON,TUE,WED,THU,FRI,SAT,SUN"
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    
    FOREIGN KEY (TrainTypeId) REFERENCES TrainTypes(TrainTypeId),
    FOREIGN KEY (OriginStationId) REFERENCES Stations(StationId),
    FOREIGN KEY (DestinationStationId) REFERENCES Stations(StationId),
    
    INDEX IX_Trains_Number (TrainNumber),
    INDEX IX_Trains_Type (TrainTypeId),
    INDEX IX_Trains_Route (OriginStationId, DestinationStationId),
    INDEX IX_Trains_IsActive (IsActive)
);

-- ============================================
-- ตารางหลัก: ตารางเวลารถไฟ (จุดหยุด)
-- ============================================
CREATE TABLE TrainSchedules (
    ScheduleId VARCHAR(50) PRIMARY KEY DEFAULT NEWID(),
    TrainId VARCHAR(50) NOT NULL,
    StationId VARCHAR(50) NOT NULL,
    SequenceNumber INT NOT NULL,
    ArrivalTime TIME, -- NULL สำหรับสถานีต้นทาง
    DepartureTime TIME, -- NULL สำหรับสถานีปลายทาง
    PlatformNumber VARCHAR(10),
    DwellTimeMinutes INT DEFAULT 0,
    DistanceFromOriginKm INT,
    IsActive BIT DEFAULT 1,
    
    FOREIGN KEY (TrainId) REFERENCES Trains(TrainId) ON DELETE CASCADE,
    FOREIGN KEY (StationId) REFERENCES Stations(StationId),
    
    UNIQUE (TrainId, SequenceNumber),
    INDEX IX_Schedule_Train (TrainId),
    INDEX IX_Schedule_Station (StationId)
);

-- ============================================
-- อุปกรณ์: ประเภตู้โดยสาร
-- ============================================
CREATE TABLE BogieTypes (
    BogieTypeId VARCHAR(50) PRIMARY KEY,
    TypeCode VARCHAR(20) UNIQUE NOT NULL,
    NameTH NVARCHAR(100) NOT NULL,
    NameEN VARCHAR(100),
    Description NVARCHAR(500),
    IsActive BIT DEFAULT 1,
    
    INDEX IX_BogieTypes_Code (TypeCode)
);

-- เพิ่มข้อมูลประเภทตู้โดยสารเริ่มต้น
INSERT INTO BogieTypes (BogieTypeId, TypeCode, NameTH, NameEN) VALUES
('BGT001', 'SLEEPER_1', N'ตู้นอนชั้น 1', 'First Class Sleeper'),
('BGT002', 'SLEEPER_2', N'ตู้นอนชั้น 2', 'Second Class Sleeper'),
('BGT003', 'SEAT_1', N'ตู้นั่งชั้น 1', 'First Class Seat'),
('BGT004', 'SEAT_2', N'ตู้นั่งชั้น 2', 'Second Class Seat'),
('BGT005', 'SEAT_3', N'ตู้นั่งชั้น 3', 'Third Class Seat'),
('BGT006', 'DINING', N'ตู้เสบียง', 'Dining Car');

-- ============================================
-- อุปกรณ์: ตู้โดยสาร (แต่ละตู้)
-- ============================================
CREATE TABLE Bogies (
    BogieId VARCHAR(50) PRIMARY KEY,
    BogieCode VARCHAR(20) UNIQUE NOT NULL,
    BogieName NVARCHAR(100) NOT NULL,
    Abbreviation VARCHAR(10),
    BogieTypeId VARCHAR(50) NOT NULL,
    ClassType VARCHAR(20), -- 'FIRST', 'BUSINESS', 'ECONOMY'
    Capacity INT NOT NULL,
    Features NVARCHAR(MAX), -- JSON array
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    
    FOREIGN KEY (BogieTypeId) REFERENCES BogieTypes(BogieTypeId),
    
    INDEX IX_Bogies_Code (BogieCode),
    INDEX IX_Bogies_Type (BogieTypeId),
    INDEX IX_Bogies_Class (ClassType)
);

-- ============================================
-- อุปกรณ์: การจัดองค์ประกอบรถไฟ (การกำหนดตู้โดยสาร)
-- ============================================
CREATE TABLE TrainCompositions (
    CompositionId VARCHAR(50) PRIMARY KEY DEFAULT NEWID(),
    TrainId VARCHAR(50) NOT NULL,
    BogieId VARCHAR(50) NOT NULL,
    Position INT NOT NULL,
    ClassId VARCHAR(20) NOT NULL, -- 'first', 'business', 'economy'
    ClassName NVARCHAR(50),
    TotalSeats INT NOT NULL,
    AvailableSeats INT NOT NULL,
    EffectiveDate DATE DEFAULT GETDATE(),
    ExpiryDate DATE,
    IsActive BIT DEFAULT 1,
    
    FOREIGN KEY (TrainId) REFERENCES Trains(TrainId) ON DELETE CASCADE,
    FOREIGN KEY (BogieId) REFERENCES Bogies(BogieId),
    
    UNIQUE (TrainId, Position),
    INDEX IX_Composition_Train (TrainId),
    INDEX IX_Composition_Bogie (BogieId),
    CHECK (AvailableSeats <= TotalSeats)
);

-- ============================================
-- ราคา: ค่าโดยสารพื้นฐาน (ตามกิโลเมตร)
-- ============================================
CREATE TABLE BaseFares (
    FareId VARCHAR(50) PRIMARY KEY DEFAULT NEWID(),
    Kilometer INT NOT NULL UNIQUE,
    Class1Rate DECIMAL(10, 2) NOT NULL,
    Class2Rate DECIMAL(10, 2) NOT NULL,
    Class3Rate DECIMAL(10, 2) NOT NULL,
    Currency VARCHAR(3) DEFAULT 'THB',
    EffectiveDate DATE DEFAULT GETDATE(),
    ExpiryDate DATE,
    IsActive BIT DEFAULT 1,
    
    INDEX IX_Fares_Kilometer (Kilometer)
);

-- เพิ่มข้อมูลค่าโดยสารพื้นฐาน (ต่อกิโลเมตร)
-- ตัวอย่าง: ราคาแบบก้าวหน้าที่เปลี่ยนแปลงตามระยะทางต่างๆ
INSERT INTO BaseFares (Kilometer, Class1Rate, Class2Rate, Class3Rate) VALUES
(1, 25, 18, 12),
(2, 50, 36, 24),
(3, 75, 54, 36),
(10, 250, 180, 120),
(50, 1000, 800, 600),
(100, 1800, 1500, 1000),
(200, 3200, 2800, 1800),
(500, 7000, 6000, 4000);

-- ============================================
-- ราคา: ค่าธรรมเนียมรถไฟ (ค่าเพิ่มตามประเภทยานพาหนะ)
-- ============================================
CREATE TABLE TrainFees (
    FeeId VARCHAR(50) PRIMARY KEY DEFAULT NEWID(),
    TrainTypeId VARCHAR(50) NOT NULL,
    DistanceFromKm INT NOT NULL,
    DistanceToKm INT NOT NULL,
    FeeAmount DECIMAL(10, 2) NOT NULL,
    Currency VARCHAR(3) DEFAULT 'THB',
    IsActive BIT DEFAULT 1,
    
    FOREIGN KEY (TrainTypeId) REFERENCES TrainTypes(TrainTypeId),
    
    INDEX IX_TrainFees_Type (TrainTypeId),
    INDEX IX_TrainFees_Distance (DistanceFromKm, DistanceToKm)
);

-- ============================================
-- ราคา: ค่าตู้นอน
-- ============================================
CREATE TABLE SleeperFees (
    SleeperFeeId VARCHAR(50) PRIMARY KEY DEFAULT NEWID(),
    BogieTypeId VARCHAR(50) NOT NULL,
    FeeAmount DECIMAL(10, 2) NOT NULL,
    Currency VARCHAR(3) DEFAULT 'THB',
    Description NVARCHAR(200),
    IsActive BIT DEFAULT 1,
    
    FOREIGN KEY (BogieTypeId) REFERENCES BogieTypes(BogieTypeId),
    
    INDEX IX_SleeperFees_Type (BogieTypeId)
);

-- เพิ่มข้อมูลค่าตู้นอนตัวอย่าง
INSERT INTO SleeperFees (BogieTypeId, FeeAmount, Description) VALUES
('BGT001', 500, N'ห้องนอนส่วนตัว'),
('BGT002', 300, N'เตียงนอน 2 ชั้น');

-- ============================================
-- ราคา: ค่าแอร์ (Air Conditioning)
-- ============================================
CREATE TABLE ACFees (
    ACFeeId VARCHAR(50) PRIMARY KEY DEFAULT NEWID(),
    DistanceFromKm INT NOT NULL,
    DistanceToKm INT NOT NULL,
    FeeAmount DECIMAL(10, 2) NOT NULL,
    Currency VARCHAR(3) DEFAULT 'THB',
    Description NVARCHAR(200),
    IsActive BIT DEFAULT 1,
    
    INDEX IX_ACFees_Distance (DistanceFromKm, DistanceToKm)
);

-- เพิ่มข้อมูลค่าแอร์ตัวอย่าง
INSERT INTO ACFees (DistanceFromKm, DistanceToKm, FeeAmount, Description) VALUES
(1, 300, 50, N'ค่าแอร์ระยะทาง 1-300 กม.'),
(301, 500, 80, N'ค่าแอร์ระยะทาง 301-500 กม.'),
(501, 999999, 120, N'ค่าแอร์ระยะทาง 500+ กม.');


-- ============================================
-- การวิเคราะห์: ประวัติการค้นหา
-- ============================================
CREATE TABLE SearchHistory (
    SearchId VARCHAR(50) PRIMARY KEY DEFAULT NEWID(),
    TrainId VARCHAR(50),
    OriginStationId VARCHAR(50),
    DestinationStationId VARCHAR(50),
    SearchDate DATE DEFAULT CAST(GETDATE() AS DATE),
    SearchCount INT DEFAULT 1,
    
    FOREIGN KEY (TrainId) REFERENCES Trains(TrainId),
    FOREIGN KEY (OriginStationId) REFERENCES Stations(StationId),
    FOREIGN KEY (DestinationStationId) REFERENCES Stations(StationId),
    
    INDEX IX_Search_Train (TrainId),
    INDEX IX_Search_Route (OriginStationId, DestinationStationId),
    INDEX IX_Search_Date (SearchDate)
);

-- ============================================
-- การวิเคราะห์: รถไฟยอดนิยม (Materialized View)
-- ============================================
CREATE TABLE PopularTrains (
    TrainId VARCHAR(50) PRIMARY KEY,
    TrainNumber VARCHAR(20),
    SearchCount INT DEFAULT 0,
    Trend VARCHAR(10), -- 'UP', 'DOWN', 'STABLE'
    Rank INT,
    LastUpdated DATETIME DEFAULT GETDATE(),
    
    FOREIGN KEY (TrainId) REFERENCES Trains(TrainId) ON DELETE CASCADE
);

-- ============================================
-- ระบบ: บันทึกการตรวจสอบ (Audit Log)
-- ============================================
CREATE TABLE AuditLogs (
    LogId VARCHAR(50) PRIMARY KEY DEFAULT NEWID(),
    UserId VARCHAR(50),
    EntityType VARCHAR(50) NOT NULL, -- 'Train', 'Station', etc.
    EntityId VARCHAR(50) NOT NULL,
    Action VARCHAR(20) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
    OldValue NVARCHAR(MAX), -- JSON
    NewValue NVARCHAR(MAX), -- JSON
    IPAddress VARCHAR(50),
    UserAgent VARCHAR(500),
    CreatedAt DATETIME DEFAULT GETDATE(),
    
    FOREIGN KEY (UserId) REFERENCES Users(UserId),
    
    INDEX IX_Audit_User (UserId),
    INDEX IX_Audit_Entity (EntityType, EntityId),
    INDEX IX_Audit_Date (CreatedAt)
);
```

---

## แผนภาพความสัมพันธ์ระหว่างตาราง (Entity Relationship Diagram)

```
Users (แอดมิน)
    |
    └─> AuditLogs

Stations ─┬─> Trains (ต้นทาง/ปลายทาง)
          └─> TrainSchedules

TrainTypes ─┬─> Trains
            └─> TrainFees

Trains ─┬─> TrainSchedules
        ├─> TrainCompositions
        └─> SearchHistory

BogieTypes ─┬─> Bogies
            └─> SleeperFees

Bogies ─> TrainCompositions

BaseFares (ราคาอิสระ)
ACFees (ราคาอิสระ)
```

---

## กลยุทธ์การย้ายข้อมูล

### ขั้นตอนที่ 1: ส่งออกฐานข้อมูลเก่าเป็น JSON

```sql
-- รันคำสั่งนี้ในฐานข้อมูลเก่าของคุณเมื่อเข้าถึงได้

-- ส่งออกข้อมูลสถานี
SELECT * FROM Stations FOR JSON PATH;

-- ส่งออกข้อมูลรถไฟ
SELECT * FROM Trains FOR JSON PATH;

-- บันทึกผลลัพธ์แต่ละคิวรีเป็นไฟล์ JSON
```

### ขั้นตอนที่ 2: แปลง JSON ให้ตรงกับโครงสร้างใหม่

สร้างไฟล์ `scripts/migrateOldData.ts`:

```typescript
import { dataSource as oldJson } from './oldDataFormat';
import sql from 'mssql';

// การตั้งค่าการแมป
const FIELD_MAPPINGS = {
  stations: {
    'old_station_id': 'StationId',
    'station_name_th': 'NameTH',
    'station_name_en': 'NameEN',
    // ... การแมปเพิ่มเติม
  },
  trains: {
    'old_train_id': 'TrainId',
    'train_no': 'TrainNumber',
    // ... การแมปเพิ่มเติม
  }
};

async function migrateStations(oldData: any[]) {
  for (const old of oldData) {
    const newStation = {
      StationId: old.old_station_id || generateId(),
      StationCode: old.station_code || extractCode(old.station_name_th),
      NameTH: old.station_name_th,
      NameEN: old.station_name_en || translateToEnglish(old.station_name_th),
      City: old.city,
      Region: old.region,
      Latitude: old.lat,
      Longitude: old.lng,
      IsActive: old.is_active !== false ? 1 : 0,
      CreatedAt: old.created_date || new Date(),
    };
    
    await insertStation(newStation);
  }
}

async function migrateTrains(oldData: any[]) {
  for (const old of oldData) {
    const newTrain = {
      TrainId: old.old_train_id || generateId(),
      TrainNumber: old.train_no,
      TrainName: old.train_name_th,
      TrainTypeId: mapTrainType(old.train_type),
      OriginStationId: old.origin_station,
      DestinationStationId: old.dest_station,
      DepartureTime: old.dept_time,
      ArrivalTime: old.arr_time,
      IsActive: old.is_active !== false ? 1 : 0,
    };
    
    await insertTrain(newTrain);
  }
}

// รันการย้ายข้อมูล
async function migrate() {
  const oldStations = await readJSON('old-data/stations.json');
  const oldTrains = await readJSON('old-data/trains.json');
  
  console.log('กำลังย้ายข้อมูลสถานี...');
  await migrateStations(oldStations);
  
  console.log('กำลังย้ายข้อมูลรถไฟ...');
  await migrateTrains(oldTrains);
  
  console.log('✅ การย้ายข้อมูลเสร็จสมบูรณ์!');
}

migrate().catch(console.error);
```

---

## สคริปต์ตั้งค่าอย่างรวดเร็ว

สร้างไฟล์ `scripts/setupDatabase.sql`:

```sql
-- รันคำสั่งนี้เพื่อตั้งค่าทุกอย่างใน 5 นาที!

-- 1. สร้างฐานข้อมูล
CREATE DATABASE RailwayManagement;
GO

USE RailwayManagement;
GO

-- 2. รันคำสั่ง CREATE TABLE ทั้งหมดข้างต้น
-- (คัดลอกและวางส่วนโครงสร้างทั้งหมด)

-- 3. สร้าง stored procedures สำหรับการทำงานทั่วไป

CREATE PROCEDURE sp_SearchTrains
    @OriginId VARCHAR(50),
    @DestId VARCHAR(50)
AS
BEGIN
    SELECT t.*, 
           o.NameTH as OriginName,
           d.NameTH as DestName,
           tt.NameTH as TrainTypeName
    FROM Trains t
    JOIN Stations o ON t.OriginStationId = o.StationId
    JOIN Stations d ON t.DestinationStationId = d.StationId
    JOIN TrainTypes tt ON t.TrainTypeId = tt.TrainTypeId
    WHERE t.OriginStationId = @OriginId 
      AND t.DestinationStationId = @DestId
      AND t.IsActive = 1;
END;
GO

CREATE PROCEDURE sp_CalculateFare
    @TrainId VARCHAR(50),
    @OriginId VARCHAR(50),
    @DestId VARCHAR(50),
    @ClassType VARCHAR(20)
AS
BEGIN
    DECLARE @Distance INT = 
        (SELECT SUM(DistanceFromOriginKm) 
         FROM TrainSchedules 
         WHERE TrainId = @TrainId 
           AND SequenceNumber BETWEEN 
               (SELECT SequenceNumber FROM TrainSchedules WHERE TrainId = @TrainId AND StationId = @OriginId)
           AND 
               (SELECT SequenceNumber FROM TrainSchedules WHERE TrainId = @TrainId AND StationId = @DestId));
    
    -- คำนวณค่าโดยสารพื้นฐาน (ตามกิโลเมตร)
    -- หาระยะทางกิโลเมตรที่ใกล้ที่สุดที่ <= ระยะทางจริง
    DECLARE @BaseFare DECIMAL(10,2) = 
        (SELECT TOP 1
            CASE @ClassType
                WHEN '1' THEN Class1Rate
                WHEN '2' THEN Class2Rate
                WHEN '3' THEN Class3Rate
            END
         FROM BaseFares
         WHERE Kilometer <= @Distance
           AND IsActive = 1
         ORDER BY Kilometer DESC);
    
    SELECT @BaseFare as TotalFare, @Distance as Distance;
END;
GO

CREATE PROCEDURE sp_GetPopularTrains
    @TopN INT = 10
AS
BEGIN
    UPDATE PopularTrains SET
        SearchCount = (SELECT COUNT(*) FROM SearchHistory WHERE TrainId = PopularTrains.TrainId),
        LastUpdated = GETDATE();
    
    SELECT TOP (@TopN) 
        pt.*,
        t.TrainNumber,
        t.TrainName
    FROM PopularTrains pt
    JOIN Trains t ON pt.TrainId = t.TrainId
    ORDER BY pt.Rank;
END;
GO

-- 4. สร้างผู้ใช้แอดมินเริ่มต้น
INSERT INTO Users (UserId, Username, Email, PasswordHash, FirstName, LastName, Role) VALUES
('ADMIN001', 'admin', 'admin@railway.th', 
 '$2b$10$example_hash_replace_with_real', -- ใช้ bcrypt!
 'Admin', 'System', 'SUPER_ADMIN');

PRINT '✅ การตั้งค่าฐานข้อมูลเสร็จสมบูรณ์!';
```

---

## ขั้นตอนถัดไป (เรียงตามลำดับความสำคัญ)

1. **รันการสร้างโครงสร้าง** (30 นาที)
2. **เพิ่มข้อมูลตัวอย่าง** (1 ชั่วโมง)
3. **สร้างการเชื่อมต่อ API** (2 ชั่วโมง)
4. **สร้างหน้าแอดมินแรก** (2 ชั่วโมง)
5. **เมื่อมีฐานข้อมูลเก่า: รันการย้ายข้อมูล** (2-4 ชั่วโมง)

**รวม**: 1-2 วันสู่ระบบที่พร้อมใช้งานเต็มรูปแบบ!

---

## Connection String (Next.js)

```typescript
// lib/db/sqlServer.ts
import sql from 'mssql';

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

let pool: sql.ConnectionPool;

export async function getConnection() {
  if (!pool) {
    pool = await sql.connect(config);
  }
  return pool;
}

export { sql };
```

`.env.local`:
```
DB_USER=admin
DB_PASSWORD=your_password
DB_SERVER=localhost
DB_NAME=RailwayManagement
```

---

## สรุปโครงสร้างตาราง

### ตารางหลัก (Core Tables)
1. **Users** - ข้อมูลผู้ดูแลระบบ
2. **Stations** - สถานีรถไฟทั้งหมด
3. **TrainTypes** - ประเภทรถไฟ (ด่วนพิเศษ, ด่วน, เร็ว, ธรรมดา, รถหรู)
4. **Trains** - ข้อมูลขบวนรถไฟ
5. **TrainSchedules** - ตารางเวลาและจุดหยุดของแต่ละขบวน

### ตารางอุปกรณ์ (Equipment Tables)
6. **BogieTypes** - ประเภทตู้โดยสาร
7. **Bogies** - ตู้โดยสารแต่ละตู้
8. **TrainCompositions** - การจัดตู้โดยสารในแต่ละขบวน

### ตารางราคา (Pricing Tables)
9. **BaseFares** - ค่าโดยสารพื้นฐานตามกิโลเมตร
10. **TrainFees** - ค่าธรรมเนียมตามประเภทรถไฟ
11. **SleeperFees** - ค่าตู้นอน
12. **ACFees** - ค่าแอร์

### ตารางการวิเคราะห์ (Analytics Tables)
13. **SearchHistory** - ประวัติการค้นหา
14. **PopularTrains** - ขบวนรถไฟยอดนิยม

### ตารางระบบ (System Tables)
15. **AuditLogs** - บันทึกการเปลี่ยนแปลงทั้งหมดในระบบ

---

## จุดเด่นของการออกแบบนี้

### 1. ความสมบูรณ์ของข้อมูล
- มี **Foreign Keys** ครบถ้วนเพื่อรักษาความสัมพันธ์ระหว่างตาราง
- มี **Check Constraints** เพื่อป้องกันข้อมูลไม่ถูกต้อง
- มี **Unique Constraints** เพื่อป้องกันข้อมูลซ้ำ

### 2. ประสิทธิภาพ
- มี **Indexes** ในคอลัมน์ที่มีการค้นหาบ่อย
- มี **Composite Indexes** สำหรับการค้นหาแบบหลายเงื่อนไข
- การออกแบบที่ **Normalized** เพื่อลดความซ้ำซ้อนของข้อมูล

### 3. ความยืดหยุ่น
- รองรับ **JSON fields** สำหรับข้อมูลที่มีโครงสร้างไม่แน่นอน
- มี **EffectiveDate/ExpiryDate** สำหรับการจัดการราคาแบบมีช่วงเวลา
- มี **IsActive flags** สำหรับการลบข้อมูลแบบ soft delete

### 4. การตรวจสอบ
- มี **AuditLogs** เพื่อบันทึกการเปลี่ยนแปลงทั้งหมด
- เก็บข้อมูล **Old/New values** เป็น JSON
- บันทึก **IP Address และ User Agent**

### 5. การวิเคราะห์
- มี **SearchHistory** เพื่อติดตามพฤติกรรมผู้ใช้
- มี **PopularTrains** เพื่อแสดงขบวนยอดนิยม
- สามารถวิเคราะห์ **เส้นทางที่ได้รับความนิยม**

---

---

## คำอธิบายรายละเอียดการทำงานของแต่ละตาราง

### 1. ตาราง Users (ผู้ใช้งานระบบ)

**วัตถุประสงค์**: จัดการข้อมูลผู้ดูแลระบบและสิทธิ์การเข้าถึง

**ฟิลด์สำคัญ**:
- `UserId`: รหัสเฉพาะของผู้ใช้ (Primary Key)
- `Username`: ชื่อผู้ใช้สำหรับเข้าสู่ระบบ (ห้ามซ้ำ)
- `Email`: อีเมลสำหรับติดต่อและรีเซ็ตรหัสผ่าน (ห้ามซ้ำ)
- `PasswordHash`: รหัสผ่านที่เข้ารหัสด้วย bcrypt
- `Role`: บทบาท (ADMIN หรือ SUPER_ADMIN)
- `IsActive`: สถานะการใช้งาน (1 = ใช้งานได้, 0 = ปิดการใช้งาน)
- `LastLoginAt`: วันเวลาที่เข้าสู่ระบบครั้งล่าสุด

**การใช้งาน**:
- ใช้สำหรับการ Login/Logout
- ตรวจสอบสิทธิ์การเข้าถึงฟีเจอร์ต่างๆ
- SUPER_ADMIN สามารถจัดการผู้ใช้อื่นได้
- ADMIN สามารถแก้ไขข้อมูลรถไฟและสถานีเท่านั้น

**ตัวอย่างการใช้งาน**:
```sql
-- ตรวจสอบการเข้าสู่ระบบ
SELECT * FROM Users 
WHERE Username = @username 
  AND IsActive = 1;

-- อัปเดตเวลาเข้าสู่ระบบล่าสุด
UPDATE Users 
SET LastLoginAt = GETDATE() 
WHERE UserId = @userId;
```

---

### 2. ตาราง Stations (สถานีรถไฟ)

**วัตถุประสงค์**: เก็บข้อมูลสถานีรถไฟทั้งหมดในระบบ

**ฟิลด์สำคัญ**:
- `StationId`: รหัสเฉพาะของสถานี (Primary Key)
- `StationCode`: รหัสสถานีแบบสั้น (เช่น BKK, CNX) - ห้ามซ้ำ
- `NameTH`: ชื่อสถานีภาษาไทย (ใช้แสดงบนเว็บไซต์)
- `NameEN`: ชื่อสถานีภาษาอังกฤษ
- `City`: เมือง
- `Region`: ภูมิภาค (เหนือ, ใต้, อีสาน, กลาง)
- `Latitude/Longitude`: พิกัดสำหรับแสดงแผนที่
- `Facilities`: สิ่งอำนวยความสะดวก (JSON: ["wifi", "parking", "restaurant"])
- `IsActive`: สถานะการใช้งาน

**การใช้งาน**:
- ใช้ในการค้นหาเส้นทาง (ต้นทาง-ปลายทาง)
- แสดงข้อมูลสถานีในตารางเวลา
- แสดงแผนที่และสิ่งอำนวยความสะดวก
- กรองตามภูมิภาค

**ตัวอย่างการใช้งาน**:
```sql
-- ค้นหาสถานีในภูมิภาคเหนือ
SELECT * FROM Stations 
WHERE Region = N'เหนือ' 
  AND IsActive = 1;

-- ค้นหาสถานีที่มี WiFi
SELECT * FROM Stations 
WHERE Facilities LIKE '%wifi%' 
  AND IsActive = 1;
```

---

### 3. ตาราง TrainTypes (ประเภทรถไฟ)

**วัตถุประสงค์**: จัดหมวดหมู่ประเภทของรถไฟและตัวคูณค่าโดยสาร

**ฟิลด์สำคัญ**:
- `TrainTypeId`: รหัสเฉพาะของประเภทรถไฟ
- `TypeCode`: รหัสย่อ (เช่น SPECIAL_EXPRESS, EXPRESS)
- `NameTH`: ชื่อประเภทภาษาไทย (เช่น ด่วนพิเศษ, ด่วน, เร็ว)
- `BaseMultiplier`: ตัวคูณสำหรับคำนวณค่าโดยสาร
  - รถด่วนพิเศษ: 1.5 (แพงกว่าปกติ 50%)
  - รถด่วน: 1.2
  - รถเร็ว: 1.0
  - รถธรรมดา: 0.8 (ถูกกว่าปกติ 20%)
  - รถหรู: 2.5

**การใช้งาน**:
- ใช้ในการคำนวณค่าโดยสาร
- แสดงประเภทรถไฟในผลการค้นหา
- กรองการค้นหาตามประเภทรถไฟ

**ตัวอย่างการใช้งาน**:
```sql
-- ดึงข้อมูลประเภทรถไฟทั้งหมดที่ใช้งานได้
SELECT * FROM TrainTypes 
WHERE IsActive = 1 
ORDER BY BaseMultiplier DESC;
```

---

### 4. ตาราง Trains (ข้อมูลขบวนรถไฟ)

**วัตถุประสงค์**: เก็บข้อมูลขบวนรถไฟแต่ละขบวน

**ฟิลด์สำคัญ**:
- `TrainId`: รหัสเฉพาะของขบวนรถไฟ
- `TrainNumber`: หมายเลขขบวนรถไฟ (เช่น 101, 255) - ห้ามซ้ำ
- `TrainName`: ชื่อขบวนรถไฟ (เช่น "รถด่วนพิเศษ 101 กรุงเทพ-เชียงใหม่")
- `TrainTypeId`: อ้างอิงไปยัง TrainTypes
- `OriginStationId`: สถานีต้นทาง
- `DestinationStationId`: สถานีปลายทาง
- `TotalDistanceKm`: ระยะทางรวมเป็นกิโลเมตร
- `DepartureTime`: เวลาออกจากสถานีต้นทาง
- `ArrivalTime`: เวลาถึงสถานีปลายทาง
- `DurationMinutes`: ระยะเวลาเดินทางเป็นนาที
- `AnnouncementNote`: ประกาศพิเศษ (เช่น "เฉพาะวันจันทร์-ศุกร์")
- `Amenities`: สิ่งอำนวยความสะดวก (JSON: ["wifi", "food", "ac"])
- `OperatingDays`: วันที่วิ่ง (เช่น "MON,TUE,WED,THU,FRI")

**การใช้งาน**:
- แสดงรายการขบวนรถไฟในผลการค้นหา
- คำนวณเวลาเดินทาง
- ตรวจสอบว่าวิ่งในวันที่เลือกหรือไม่
- แสดงรายละเอียดขบวนรถไฟ

**ตัวอย่างการใช้งาน**:
```sql
-- ค้นหาขบวนรถไฟจากกรุงเทพไปเชียงใหม่
SELECT t.*, 
       o.NameTH as OriginName, 
       d.NameTH as DestName,
       tt.NameTH as TypeName
FROM Trains t
JOIN Stations o ON t.OriginStationId = o.StationId
JOIN Stations d ON t.DestinationStationId = d.StationId
JOIN TrainTypes tt ON t.TrainTypeId = tt.TrainTypeId
WHERE o.StationCode = 'BKK' 
  AND d.StationCode = 'CNX'
  AND t.IsActive = 1;

-- หาขบวนที่วิ่งในวันจันทร์
SELECT * FROM Trains 
WHERE OperatingDays LIKE '%MON%' 
  AND IsActive = 1;
```

---

### 5. ตาราง TrainSchedules (ตารางเวลารถไฟ)

**วัตถุประสงค์**: เก็บข้อมูลจุดหยุดทุกสถานีของแต่ละขบวนรถไฟ

**ฟิลด์สำคัญ**:
- `ScheduleId`: รหัสเฉพาะของตารางเวลา
- `TrainId`: อ้างอิงไปยัง Trains
- `StationId`: อ้างอิงไปยัง Stations
- `SequenceNumber`: ลำดับการหยุด (1, 2, 3, ...)
- `ArrivalTime`: เวลาถึงสถานี (NULL สำหรับสถานีต้นทาง)
- `DepartureTime`: เวลาออกจากสถานี (NULL สำหรับสถานีปลายทาง)
- `PlatformNumber`: หมายเลขชานชาลา
- `DwellTimeMinutes`: เวลาที่หยุดพัก (นาที)
- `DistanceFromOriginKm`: ระยะทางจากสถานีต้นทาง

**การใช้งาน**:
- แสดงตารางเวลาแบบละเอียดของแต่ละขบวน
- คำนวณระยะทางระหว่างสถานี
- คำนวณค่าโดยสารระหว่างสถานีใดก็ได้
- ตรวจสอบว่าขบวนรถไฟผ่านสถานีใดบ้าง

**ตัวอย่างการใช้งาน**:
```sql
-- แสดงตารางเวลาของขบวนรถไฟ 101
SELECT ts.*, s.NameTH as StationName
FROM TrainSchedules ts
JOIN Stations s ON ts.StationId = s.StationId
WHERE ts.TrainId = 'TRAIN101'
  AND ts.IsActive = 1
ORDER BY ts.SequenceNumber;

-- คำนวณระยะทางระหว่าง 2 สถานี
SELECT 
    MAX(DistanceFromOriginKm) - MIN(DistanceFromOriginKm) as Distance
FROM TrainSchedules
WHERE TrainId = 'TRAIN101'
  AND StationId IN ('STATION1', 'STATION2');
```

---

### 6. ตาราง BogieTypes (ประเภทตู้โดยสาร)

**วัตถุประสงค์**: จัดหมวดหมู่ประเภทของตู้โดยสาร

**ฟิลด์สำคัญ**:
- `BogieTypeId`: รหัสเฉพาะของประเภทตู้โดยสาร
- `TypeCode`: รหัสย่อ (เช่น SLEEPER_1, SEAT_1)
- `NameTH`: ชื่อประเภทภาษาไทย
  - ตู้นอนชั้น 1 (First Class Sleeper)
  - ตู้นอนชั้น 2 (Second Class Sleeper)
  - ตู้นั่งชั้น 1, 2, 3
  - ตู้เสบียง (Dining Car)

**การใช้งาน**:
- จัดหมวดหมู่ตู้โดยสาร
- กำหนดค่าตู้นอน (เชื่อมกับ SleeperFees)

**ตัวอย่างการใช้งาน**:
```sql
-- ดึงประเภทตู้นอนทั้งหมด
SELECT * FROM BogieTypes 
WHERE TypeCode LIKE 'SLEEPER%' 
  AND IsActive = 1;
```

---

### 7. ตาราง Bogies (ตู้โดยสาร)

**วัตถุประสงค์**: เก็บข้อมูลตู้โดยสารแต่ละตู้

**ฟิลด์สำคัญ**:
- `BogieId`: รหัสเฉพาะของตู้โดยสาร
- `BogieCode`: รหัสตู้โดยสาร (เช่น SL1-001, ST2-052)
- `BogieName`: ชื่อตู้โดยสาร
- `Abbreviation`: ตัวย่อ (เช่น นน.1, นง.2)
- `BogieTypeId`: อ้างอิงไปยัง BogieTypes
- `ClassType`: ประเภทชั้น (FIRST, BUSINESS, ECONOMY)
- `Capacity`: จำนวนที่นั่ง/เตียงทั้งหมด
- `Features`: คุณสมบัติพิเศษ (JSON: ["ac", "wifi", "power_outlet"])

**การใช้งาน**:
- จัดการตู้โดยสารในคลัง
- กำหนดตู้โดยสารให้กับขบวนรถไฟ
- ตรวจสอบจำนวนที่นั่ง

**ตัวอย่างการใช้งาน**:
```sql
-- หาตู้นอนชั้น 1 ที่มี WiFi
SELECT b.* 
FROM Bogies b
JOIN BogieTypes bt ON b.BogieTypeId = bt.BogieTypeId
WHERE bt.TypeCode = 'SLEEPER_1'
  AND b.Features LIKE '%wifi%'
  AND b.IsActive = 1;
```

---

### 8. ตาราง TrainCompositions (การจัดองค์ประกอบรถไฟ)

**วัตถุประสงค์**: กำหนดว่าแต่ละขบวนรถไฟมีตู้โดยสารอะไรบ้าง

**ฟิลด์สำคัญ**:
- `CompositionId`: รหัสเฉพาะของการจัดองค์ประกอบ
- `TrainId`: อ้างอิงไปยัง Trains
- `BogieId`: อ้างอิงไปยัง Bogies
- `Position`: ตำแหน่งของตู้โดยสาร (1, 2, 3, ...)
- `ClassId`: รหัสชั้น (first, business, economy)
- `TotalSeats`: จำนวนที่นั่งทั้งหมด
- `AvailableSeats`: จำนวนที่นั่งว่าง (สำหรับระบบจองในอนาคต)
- `EffectiveDate`: วันที่เริ่มใช้การจัดองค์ประกอบนี้
- `ExpiryDate`: วันที่สิ้นสุด (NULL = ใช้งานตลอด)

**การใช้งาน**:
- แสดงโครงสร้างตู้โดยสารของขบวนรถไฟ
- เปลี่ยนองค์ประกอบตู้โดยสารตามฤดูกาล
- ตรวจสอบที่นั่งว่าง

**ตัวอย่างการใช้งาน**:
```sql
-- แสดงองค์ประกอบตู้โดยสารของขบวนรถไฟ 101
SELECT 
    tc.Position,
    b.BogieName,
    bt.NameTH as BogieType,
    tc.TotalSeats,
    tc.AvailableSeats
FROM TrainCompositions tc
JOIN Bogies b ON tc.BogieId = b.BogieId
JOIN BogieTypes bt ON b.BogieTypeId = bt.BogieTypeId
WHERE tc.TrainId = 'TRAIN101'
  AND tc.IsActive = 1
  AND (tc.ExpiryDate IS NULL OR tc.ExpiryDate >= GETDATE())
ORDER BY tc.Position;
```

---

### 9. ตาราง BaseFares (ค่าโดยสารพื้นฐาน)

**วัตถุประสงค์**: เก็บอัตราค่าโดยสารตามระยะทางและชั้นที่นั่ง

**ฟิลด์สำคัญ**:
- `FareId`: รหัสเฉพาะของอัตราค่าโดยสาร
- `Kilometer`: ระยะทางเป็นกิโลเมตร (1, 2, 3, 10, 50, 100, ...)
- `Class1Rate`: อัตราค่าโดยสารชั้น 1 (บาท)
- `Class2Rate`: อัตราค่าโดยสารชั้น 2 (บาท)
- `Class3Rate`: อัตราค่าโดยสารชั้น 3 (บาท)
- `EffectiveDate`: วันที่เริ่มใช้อัตรานี้
- `ExpiryDate`: วันที่สิ้นสุด

**วิธีการคำนวณ**:
1. หาระยะทางระหว่างสถานีต้นทางและปลายทาง (เช่น 127 กม.)
2. หา Kilometer ที่ใกล้เคียงที่สุดที่ <= ระยะทางจริง (เช่น 100 กม.)
3. ใช้อัตราค่าโดยสารจากแถวนั้น

**การใช้งาน**:
- คำนวณค่าโดยสารพื้นฐาน
- อัปเดตอัตราค่าโดยสารตามช่วงเวลา

**ตัวอย่างการใช้งาน**:
```sql
-- หาอัตราค่าโดยสารสำหรับระยะทาง 127 กม. ชั้น 2
DECLARE @Distance INT = 127;

SELECT TOP 1 Class2Rate
FROM BaseFares
WHERE Kilometer <= @Distance
  AND IsActive = 1
  AND (EffectiveDate IS NULL OR EffectiveDate <= GETDATE())
  AND (ExpiryDate IS NULL OR ExpiryDate >= GETDATE())
ORDER BY Kilometer DESC;
```

---

### 10. ตาราง TrainFees (ค่าธรรมเนียมรถไฟ)

**วัตถุประสงค์**: ค่าธรรมเนียมเพิ่มเติมตามประเภทรถไฟและระยะทาง

**ฟิลด์สำคัญ**:
- `FeeId`: รหัสเฉพาะ
- `TrainTypeId`: อ้างอิงไปยัง TrainTypes
- `DistanceFromKm`: ระยะทางเริ่มต้น
- `DistanceToKm`: ระยะทางสิ้นสุด
- `FeeAmount`: จำนวนเงินค่าธรรมเนียม (บาท)

**ตัวอย่าง**:
- รถด่วนพิเศษ ระยะทาง 1-100 กม. = +100 บาท
- รถด่วนพิเศษ ระยะทาง 101-300 กม. = +200 บาท
- รถหรู ระยะทาง 1-100 กม. = +500 บาท

**การใช้งาน**:
- เพิ่มค่าธรรมเนียมในการคำนวณราคารวม
- `ราคารวม = ค่าโดยสารพื้นฐาน + ค่าธรรมเนียมรถไฟ + ค่าตู้นอน + ค่าแอร์`

---

### 11. ตาราง SleeperFees (ค่าตู้นอน)

**วัตถุประสงค์**: ค่าธรรมเนียมสำหรับการใช้ตู้นอน

**ฟิลด์สำคัญ**:
- `SleeperFeeId`: รหัสเฉพาะ
- `BogieTypeId`: อ้างอิงไปยัง BogieTypes
- `FeeAmount`: ค่าธรรมเนียม (บาท)
- `Description`: คำอธิบาย

**ตัวอย่าง**:
- ตู้นอนชั้น 1 (ห้องส่วนตัว) = +500 บาท
- ตู้นอนชั้น 2 (เตียง 2 ชั้น) = +300 บาท

**การใช้งาน**:
- เพิ่มค่าธรรมเนียมเมื่อเลือกตู้นอน
- แสดงราคาตู้นอนในหน้ารายละเอียด

---

### 12. ตาราง ACFees (ค่าแอร์)

**วัตถุประสงค์**: ค่าธรรมเนียมสำหรับตู้โดยสารแอร์

**ฟิลด์สำคัญ**:
- `ACFeeId`: รหัสเฉพาะ
- `DistanceFromKm`: ระยะทางเริ่มต้น
- `DistanceToKm`: ระยะทางสิ้นสุด
- `FeeAmount`: ค่าธรรมเนียม (บาท)

**ตัวอย่าง**:
- ระยะทาง 1-300 กม. = +50 บาท
- ระยะทาง 301-500 กม. = +80 บาท
- ระยะทาง 500+ กม. = +120 บาท

**การใช้งาน**:
- เพิ่มค่าธรรมเนียมเมื่อเลือกตู้แอร์
- คำนวณตามระยะทางเดินทาง

---

### 13. ตาราง SearchHistory (ประวัติการค้นหา)

**วัตถุประสงค์**: บันทึกการค้นหาของผู้ใช้เพื่อวิเคราะห์

**ฟิลด์สำคัญ**:
- `SearchId`: รหัสเฉพาะ
- `TrainId`: ขบวนรถไฟที่ถูกค้นหา/ดู (NULL = ค้นหาเส้นทาง)
- `OriginStationId`: สถานีต้นทาง
- `DestinationStationId`: สถานีปลายทาง
- `SearchDate`: วันที่ค้นหา
- `SearchCount`: จำนวนครั้งที่ค้นหา (เพิ่มทีละ 1)

**การใช้งาน**:
- บันทึกทุกครั้งที่มีการค้นหา
- วิเคราะห์เส้นทางที่ได้รับความนิยม
- หาขบวนรถไฟที่ถูกดูบ่อยที่สุด
- แนะนำเส้นทางยอดนิยมบนหน้าแรก

**ตัวอย่างการใช้งาน**:
```sql
-- เส้นทางยอดนิยม 10 อันดับ
SELECT TOP 10
    o.NameTH as Origin,
    d.NameTH as Destination,
    SUM(SearchCount) as TotalSearches
FROM SearchHistory sh
JOIN Stations o ON sh.OriginStationId = o.StationId
JOIN Stations d ON sh.DestinationStationId = d.StationId
WHERE SearchDate >= DATEADD(month, -1, GETDATE())
GROUP BY o.NameTH, d.NameTH
ORDER BY TotalSearches DESC;
```

---

### 14. ตาราง PopularTrains (รถไฟยอดนิยม)

**วัตถุประสงค์**: เก็บข้อมูลขบวนรถไฟที่ได้รับความนิยม (Materialized View)

**ฟิลด์สำคัญ**:
- `TrainId`: อ้างอิงไปยัง Trains
- `TrainNumber`: หมายเลขขบวนรถไฟ
- `SearchCount`: จำนวนครั้งที่ถูกค้นหา
- `Trend`: แนวโน้ม ('UP', 'DOWN', 'STABLE')
- `Rank`: อันดับความนิยม (1, 2, 3, ...)
- `LastUpdated`: วันเวลาที่อัปเดตล่าสุด

**การใช้งาน**:
- แสดงขบวนรถไฟยอดนิยมบนหน้าแรก
- วิเคราะห์แนวโน้มความนิยม
- อัปเดตข้อมูลทุกวันหรือทุกชั่วโมง

**ตัวอย่างการใช้งาน**:
```sql
-- อัปเดตข้อมูลรถไฟยอดนิยม (รันทุกวัน)
UPDATE PopularTrains SET
    SearchCount = (
        SELECT COUNT(*) 
        FROM SearchHistory 
        WHERE TrainId = PopularTrains.TrainId
          AND SearchDate >= DATEADD(month, -1, GETDATE())
    ),
    LastUpdated = GETDATE();

-- กำหนดอันดับใหม่
WITH RankedTrains AS (
    SELECT 
        TrainId,
        ROW_NUMBER() OVER (ORDER BY SearchCount DESC) as NewRank
    FROM PopularTrains
)
UPDATE pt
SET pt.Rank = rt.NewRank
FROM PopularTrains pt
JOIN RankedTrains rt ON pt.TrainId = rt.TrainId;
```

---

### 15. ตาราง AuditLogs (บันทึกการตรวจสอบ)

**วัตถุประสงค์**: บันทึกการเปลี่ยนแปลงทั้งหมดในระบบ

**ฟิลด์สำคัญ**:
- `LogId`: รหัสเฉพาะ
- `UserId`: ผู้ใช้ที่ทำการเปลี่ยนแปลง
- `EntityType`: ประเภทของข้อมูล (Train, Station, etc.)
- `EntityId`: รหัสของข้อมูลที่ถูกเปลี่ยนแปลง
- `Action`: การกระทำ (CREATE, UPDATE, DELETE)
- `OldValue`: ค่าเก่า (JSON)
- `NewValue`: ค่าใหม่ (JSON)
- `IPAddress`: IP ที่ทำการเปลี่ยนแปลง
- `UserAgent`: Browser/Device ที่ใช้
- `CreatedAt`: วันเวลาที่ทำการเปลี่ยนแปลง

**การใช้งาน**:
- ตรวจสอบประวัติการแก้ไข
- ตรวจสอบว่าใครแก้ไขข้อมูลเมื่อไหร่
- ย้อนกลับข้อมูล (Rollback) เมื่อเกิดข้อผิดพลาด
- รักษาความปลอดภัย (Security Audit)

**ตัวอย่างการใช้งาน**:
```sql
-- บันทึกการแก้ไขข้อมูลรถไฟ
INSERT INTO AuditLogs (UserId, EntityType, EntityId, Action, OldValue, NewValue, IPAddress)
VALUES (
    @userId,
    'Train',
    'TRAIN101',
    'UPDATE',
    '{"TrainName":"รถด่วน 101","DepartureTime":"06:00"}',
    '{"TrainName":"รถด่วนพิเศษ 101","DepartureTime":"06:30"}',
    @ipAddress
);

-- ดูประวัติการแก้ไขของขบวนรถไฟ 101
SELECT 
    al.*,
    u.Username
FROM AuditLogs al
JOIN Users u ON al.UserId = u.UserId
WHERE al.EntityType = 'Train'
  AND al.EntityId = 'TRAIN101'
ORDER BY al.CreatedAt DESC;
```

---

## สรุปการทำงานของระบบโดยรวม

### 1. กระบวนการค้นหารถไฟ
```
1. ผู้ใช้เลือกสถานีต้นทางและปลายทาง
2. ระบบค้นหาจาก Trains ที่ตรงกับเส้นทาง
3. ตรวจสอบจาก TrainSchedules ว่าขบวนใดผ่านทั้ง 2 สถานี
4. แสดงผลพร้อมข้อมูลจาก TrainTypes และ Stations
5. บันทึกการค้นหาลง SearchHistory
```

### 2. กระบวนการคำนวณค่าโดยสาร
```
1. คำนวณระยะทางจาก TrainSchedules
2. ดึงค่าโดยสารพื้นฐานจาก BaseFares (ตามระยะทางและชั้น)
3. ดึงค่าธรรมเนียมรถไฟจาก TrainFees (ตามประเภทรถไฟ)
4. ดึงค่าตู้นอนจาก SleeperFees (ถ้าเลือกตู้นอน)
5. ดึงค่าแอร์จาก ACFees (ถ้าเลือกตู้แอร์)
6. รวมทั้งหมด = BaseFare + TrainFee + SleeperFee + ACFee
```

### 3. กระบวนการจัดการข้อมูล (Admin)
```
1. แอดมินเข้าสู่ระบบผ่าน Users
2. แก้ไขข้อมูล (Stations, Trains, etc.)
3. ระบบบันทึกทุกการเปลี่ยนแปลงลง AuditLogs
4. ข้อมูลถูกอัปเดตในฐานข้อมูล
5. แสดงผลที่อัปเดตบนเว็บไซต์ทันที
```

### 4. กระบวนการวิเคราะห์ความนิยม
```
1. SearchHistory บันทึกการค้นหาทุกครั้ง
2. Scheduled job รันทุกวัน/ชั่วโมง
3. นับจำนวนการค้นหาของแต่ละขบวน
4. อัปเดต PopularTrains ด้วยข้อมูลใหม่
5. แสดงขบวนยอดนิยมบนหน้าแรก
```

---

**สถานะ**: ✅ โครงสร้างใหม่ที่สมบูรณ์พร้อมคำอธิบายรายละเอียด  
**พร้อมใช้งาน**: ใช่ - สามารถเริ่มดำเนินการได้ทันที  
**การย้ายข้อมูล**: พร้อมเมื่อมีฐานข้อมูลเก่า
