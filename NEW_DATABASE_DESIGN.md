# New Database Design - SQL Server

## Strategy: Fresh Start + Data Migration

**Approach**: Design modern schema from scratch, import old data later  
**Timeline**: 2-4 days for complete system  
**Benefit**: No technical debt from old database

---

## Quick Implementation Path

```
Day 1: Design & Create Schema (4-6 hours)
├── Design ERD diagram
├── Create SQL Server database
├── Run schema creation scripts
└── Set up indexes and constraints

Day 2: Use JSON as Bridge (4-6 hours)
├── Export old database → JSON files
├── Transform JSON to match new schema
├── Import JSON → New SQL Server
└── Validate data integrity

Day 3: Build APIs (4-6 hours)
├── Create Next.js API routes
├── Connect to SQL Server
├── Test CRUD operations
└── Build admin panel

Day 4: Deploy & Test (2-4 hours)
├── Deploy database
├── Deploy application
├── End-to-end testing
└── Documentation
```

---

## Complete SQL Server Schema

### Core Tables

```sql
-- ============================================
-- CORE: Users (Admin Management)
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
-- CORE: Stations
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
-- CORE: Train Types
-- ============================================
CREATE TABLE TrainTypes (
    TrainTypeId VARCHAR(50) PRIMARY KEY,
    TypeCode VARCHAR(20) UNIQUE NOT NULL,
    NameTH NVARCHAR(100) NOT NULL,
    NameEN VARCHAR(100),
    Description NVARCHAR(500),
    BaseMultiplier DECIMAL(5, 2) DEFAULT 1.0, -- For fare calculation
    IsActive BIT DEFAULT 1,
    
    INDEX IX_TrainTypes_Code (TypeCode)
);

-- Insert default train types
INSERT INTO TrainTypes (TrainTypeId, TypeCode, NameTH, NameEN, BaseMultiplier) VALUES
('TT001', 'SPECIAL_EXPRESS', N'ด่วนพิเศษ', 'Special Express', 1.5),
('TT002', 'EXPRESS', N'ด่วน', 'Express', 1.2),
('TT003', 'RAPID', N'เร็ว', 'Rapid', 1.0),
('TT004', 'ORDINARY', N'ธรรมดา', 'Ordinary', 0.8),
('TT005', 'LUXURY', N'รถหรู', 'Luxury', 2.5);

-- ============================================
-- CORE: Trains
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
-- CORE: Train Schedules (Stops)
-- ============================================
CREATE TABLE TrainSchedules (
    ScheduleId VARCHAR(50) PRIMARY KEY DEFAULT NEWID(),
    TrainId VARCHAR(50) NOT NULL,
    StationId VARCHAR(50) NOT NULL,
    SequenceNumber INT NOT NULL,
    ArrivalTime TIME, -- NULL for origin
    DepartureTime TIME, -- NULL for destination
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
-- EQUIPMENT: Bogie Types
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

-- Insert default bogie types
INSERT INTO BogieTypes (BogieTypeId, TypeCode, NameTH, NameEN) VALUES
('BGT001', 'SLEEPER_1', N'ตู้นอนชั้น 1', 'First Class Sleeper'),
('BGT002', 'SLEEPER_2', N'ตู้นอนชั้น 2', 'Second Class Sleeper'),
('BGT003', 'SEAT_1', N'ตู้นั่งชั้น 1', 'First Class Seat'),
('BGT004', 'SEAT_2', N'ตู้นั่งชั้น 2', 'Second Class Seat'),
('BGT005', 'SEAT_3', N'ตู้นั่งชั้น 3', 'Third Class Seat'),
('BGT006', 'DINING', N'ตู้เสบียง', 'Dining Car');

-- ============================================
-- EQUIPMENT: Bogies (Individual Cars)
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
-- EQUIPMENT: Train Compositions (Bogie Assignments)
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
-- PRICING: Base Fares (Kilometer-based)
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

-- Insert sample base fares (per kilometer)
-- Example: Progressive pricing where rates change at different distances
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
-- PRICING: Train Fees (Vehicle Type Surcharge)
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
-- PRICING: Sleeper Fees
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

-- Insert sample sleeper fees
INSERT INTO SleeperFees (BogieTypeId, FeeAmount, Description) VALUES
('BGT001', 500, N'ห้องนอนส่วนตัว'),
('BGT002', 300, N'เตียงนอน 2 ชั้น');

-- ============================================
-- PRICING: AC Fees (Air Conditioning)
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

-- Insert sample AC fees
INSERT INTO ACFees (DistanceFromKm, DistanceToKm, FeeAmount, Description) VALUES
(1, 300, 50, N'ค่าแอร์ระยะทาง 1-300 กม.'),
(301, 500, 80, N'ค่าแอร์ระยะทาง 301-500 กม.'),
(501, 999999, 120, N'ค่าแอร์ระยะทาง 500+ กม.');



-- ============================================
-- ANALYTICS: Search History
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
-- ANALYTICS: Popular Trains (Materialized View)
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
-- SYSTEM: Audit Log
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

## Entity Relationship Diagram

```
Users (Admin)
    |
    └─> AuditLogs

Stations ─┬─> Trains (Origin/Destination)
          └─> TrainSchedules

TrainTypes ─┬─> Trains
            └─> TrainFees

Trains ─┬─> TrainSchedules
        ├─> TrainCompositions
        └─> SearchHistory

BogieTypes ─┬─> Bogies
            └─> SleeperFees

Bogies ─> TrainCompositions

BaseFares (standalone pricing)
ACFees (standalone pricing)
```

---

## Data Migration Strategy

### Step 1: Export Old Database to JSON

```sql
-- Run this in your OLD database when you get access

-- Export stations
SELECT * FROM Stations FOR JSON PATH;

-- Export trains
SELECT * FROM Trains FOR JSON PATH;

-- Save each query result to JSON files
```

### Step 2: Transform JSON to New Schema

Create `scripts/migrateOldData.ts`:

```typescript
import { dataSource as oldJson } from './oldDataFormat';
import sql from 'mssql';

// Mapping configuration
const FIELD_MAPPINGS = {
  stations: {
    'old_station_id': 'StationId',
    'station_name_th': 'NameTH',
    'station_name_en': 'NameEN',
    // ... more mappings
  },
  trains: {
    'old_train_id': 'TrainId',
    'train_no': 'TrainNumber',
    // ... more mappings
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

// Run migration
async function migrate() {
  const oldStations = await readJSON('old-data/stations.json');
  const oldTrains = await readJSON('old-data/trains.json');
  
  console.log('Migrating stations...');
  await migrateStations(oldStations);
  
  console.log('Migrating trains...');
  await migrateTrains(oldTrains);
  
  console.log('✅ Migration complete!');
}

migrate().catch(console.error);
```

---

## Quick Setup Script

Create `scripts/setupDatabase.sql`:

```sql
-- Run this to set up everything in 5 minutes!

-- 1. Create database
CREATE DATABASE RailwayManagement;
GO

USE RailwayManagement;
GO

-- 2. Run all CREATE TABLE statements above
-- (Copy-paste the entire schema section)

-- 3. Create stored procedures for common operations

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
    
    -- Get base fare (kilometer-based lookup)
    -- Find the closest kilometer entry that is <= the actual distance
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

-- 4. Create default admin user
INSERT INTO Users (UserId, Username, Email, PasswordHash, FirstName, LastName, Role) VALUES
('ADMIN001', 'admin', 'admin@railway.th', 
 '$2b$10$example_hash_replace_with_real', -- Use bcrypt!
 'Admin', 'System', 'SUPER_ADMIN');

PRINT '✅ Database setup complete!';
```

---

## Next Steps (Priority Order)

1. **Run schema creation** (30 minutes)
2. **Insert sample data** (1 hour)
3. **Build API connection** (2 hours)
4. **Create first admin page** (2 hours)
5. **When old DB available: Run migration** (2-4 hours)

**Total**: 1-2 days to fully operational system!

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

**Status**: ✅ Complete new schema designed  
**Ready**: Yes - can implement immediately  
**Migration**: Ready when old database available
