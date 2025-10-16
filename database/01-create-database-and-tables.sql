-- ============================================
-- สคริปต์สร้างฐานข้อมูลและตารางทั้งหมด
-- ============================================

-- 1. สร้างฐานข้อมูล (ถ้ายังไม่มี)
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'RailwayManagement')
BEGIN
    CREATE DATABASE RailwayManagement;
    PRINT '✅ สร้างฐานข้อมูล RailwayManagement สำเร็จ';
END
ELSE
BEGIN
    PRINT '⚠️ ฐานข้อมูล RailwayManagement มีอยู่แล้ว';
END
GO

USE RailwayManagement;
GO

PRINT '📌 กำลังสร้างตารางทั้งหมด...';
GO

-- ============================================
-- ตารางหลัก: ผู้ใช้งาน (การจัดการแอดมิน)
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
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
    PRINT '✅ สร้างตาราง Users';
END
GO

-- ============================================
-- ตารางหลัก: สถานี
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Stations')
BEGIN
    CREATE TABLE Stations (
        StationId VARCHAR(50) PRIMARY KEY,
        StationCode VARCHAR(10) UNIQUE NOT NULL,
        NameTH NVARCHAR(200) NOT NULL,
        NameEN VARCHAR(200),
        City NVARCHAR(100),
        Region NVARCHAR(100),
        Latitude DECIMAL(10, 7),
        Longitude DECIMAL(10, 7),
        Facilities NVARCHAR(MAX),
        IsActive BIT DEFAULT 1,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE(),
        
        INDEX IX_Stations_Code (StationCode),
        INDEX IX_Stations_Region (Region),
        INDEX IX_Stations_IsActive (IsActive)
    );
    PRINT '✅ สร้างตาราง Stations';
END
GO

-- ============================================
-- ตารางหลัก: ประเภทรถไฟ
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TrainTypes')
BEGIN
    CREATE TABLE TrainTypes (
        TrainTypeId VARCHAR(50) PRIMARY KEY,
        TypeCode VARCHAR(20) UNIQUE NOT NULL,
        NameTH NVARCHAR(100) NOT NULL,
        NameEN VARCHAR(100),
        Description NVARCHAR(500),
        BaseMultiplier DECIMAL(5, 2) DEFAULT 1.0,
        IsActive BIT DEFAULT 1,
        
        INDEX IX_TrainTypes_Code (TypeCode)
    );
    PRINT '✅ สร้างตาราง TrainTypes';
END
GO

-- ============================================
-- ตารางหลัก: รถไฟ
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Trains')
BEGIN
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
        Amenities NVARCHAR(MAX),
        OperatingDays VARCHAR(100),
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
    PRINT '✅ สร้างตาราง Trains';
END
GO

-- ============================================
-- ตารางหลัก: ตารางเวลารถไฟ
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TrainSchedules')
BEGIN
    CREATE TABLE TrainSchedules (
        ScheduleId VARCHAR(50) PRIMARY KEY DEFAULT NEWID(),
        TrainId VARCHAR(50) NOT NULL,
        StationId VARCHAR(50) NOT NULL,
        SequenceNumber INT NOT NULL,
        ArrivalTime TIME,
        DepartureTime TIME,
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
    PRINT '✅ สร้างตาราง TrainSchedules';
END
GO

-- ============================================
-- อุปกรณ์: ประเภทตู้โดยสาร
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'BogieTypes')
BEGIN
    CREATE TABLE BogieTypes (
        BogieTypeId VARCHAR(50) PRIMARY KEY,
        TypeCode VARCHAR(20) UNIQUE NOT NULL,
        NameTH NVARCHAR(100) NOT NULL,
        NameEN VARCHAR(100),
        Description NVARCHAR(500),
        IsActive BIT DEFAULT 1,
        
        INDEX IX_BogieTypes_Code (TypeCode)
    );
    PRINT '✅ สร้างตาราง BogieTypes';
END
GO

-- ============================================
-- อุปกรณ์: ตู้โดยสาร
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Bogies')
BEGIN
    CREATE TABLE Bogies (
        BogieId VARCHAR(50) PRIMARY KEY,
        BogieCode VARCHAR(20) UNIQUE NOT NULL,
        BogieName NVARCHAR(100) NOT NULL,
        Abbreviation VARCHAR(10),
        BogieTypeId VARCHAR(50) NOT NULL,
        ClassType VARCHAR(20),
        Capacity INT NOT NULL,
        Features NVARCHAR(MAX),
        IsActive BIT DEFAULT 1,
        CreatedAt DATETIME DEFAULT GETDATE(),
        
        FOREIGN KEY (BogieTypeId) REFERENCES BogieTypes(BogieTypeId),
        
        INDEX IX_Bogies_Code (BogieCode),
        INDEX IX_Bogies_Type (BogieTypeId),
        INDEX IX_Bogies_Class (ClassType)
    );
    PRINT '✅ สร้างตาราง Bogies';
END
GO

-- ============================================
-- อุปกรณ์: การจัดองค์ประกอบรถไฟ
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TrainCompositions')
BEGIN
    CREATE TABLE TrainCompositions (
        CompositionId VARCHAR(50) PRIMARY KEY DEFAULT NEWID(),
        TrainId VARCHAR(50) NOT NULL,
        BogieId VARCHAR(50) NOT NULL,
        Position INT NOT NULL,
        ClassId VARCHAR(20) NOT NULL,
        ClassName NVARCHAR(50),
        TotalSeats INT NOT NULL,
        AvailableSeats INT NOT NULL,
        EffectiveDate DATE DEFAULT CAST(GETDATE() AS DATE),
        ExpiryDate DATE,
        IsActive BIT DEFAULT 1,
        
        FOREIGN KEY (TrainId) REFERENCES Trains(TrainId) ON DELETE CASCADE,
        FOREIGN KEY (BogieId) REFERENCES Bogies(BogieId),
        
        UNIQUE (TrainId, Position),
        INDEX IX_Composition_Train (TrainId),
        INDEX IX_Composition_Bogie (BogieId),
        CHECK (AvailableSeats <= TotalSeats)
    );
    PRINT '✅ สร้างตาราง TrainCompositions';
END
GO

-- ============================================
-- ราคา: ค่าโดยสารพื้นฐาน
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'BaseFares')
BEGIN
    CREATE TABLE BaseFares (
        FareId VARCHAR(50) PRIMARY KEY DEFAULT NEWID(),
        Kilometer INT NOT NULL UNIQUE,
        Class1Rate DECIMAL(10, 2) NOT NULL,
        Class2Rate DECIMAL(10, 2) NOT NULL,
        Class3Rate DECIMAL(10, 2) NOT NULL,
        Currency VARCHAR(3) DEFAULT 'THB',
        EffectiveDate DATE DEFAULT CAST(GETDATE() AS DATE),
        ExpiryDate DATE,
        IsActive BIT DEFAULT 1,
        
        INDEX IX_Fares_Kilometer (Kilometer)
    );
    PRINT '✅ สร้างตาราง BaseFares';
END
GO

-- ============================================
-- ราคา: ค่าธรรมเนียมรถไฟ
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TrainFees')
BEGIN
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
    PRINT '✅ สร้างตาราง TrainFees';
END
GO

-- ============================================
-- ราคา: ค่าตู้นอน
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SleeperFees')
BEGIN
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
    PRINT '✅ สร้างตาราง SleeperFees';
END
GO

-- ============================================
-- ราคา: ค่าแอร์
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ACFees')
BEGIN
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
    PRINT '✅ สร้างตาราง ACFees';
END
GO

-- ============================================
-- การวิเคราะห์: ประวัติการค้นหา
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SearchHistory')
BEGIN
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
    PRINT '✅ สร้างตาราง SearchHistory';
END
GO

-- ============================================
-- การวิเคราะห์: รถไฟยอดนิยม
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PopularTrains')
BEGIN
    CREATE TABLE PopularTrains (
        TrainId VARCHAR(50) PRIMARY KEY,
        TrainNumber VARCHAR(20),
        SearchCount INT DEFAULT 0,
        Trend VARCHAR(10),
        Rank INT,
        LastUpdated DATETIME DEFAULT GETDATE(),
        
        FOREIGN KEY (TrainId) REFERENCES Trains(TrainId) ON DELETE CASCADE
    );
    PRINT '✅ สร้างตาราง PopularTrains';
END
GO

-- ============================================
-- ระบบ: บันทึกการตรวจสอบ
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AuditLogs')
BEGIN
    CREATE TABLE AuditLogs (
        LogId VARCHAR(50) PRIMARY KEY DEFAULT NEWID(),
        UserId VARCHAR(50),
        EntityType VARCHAR(50) NOT NULL,
        EntityId VARCHAR(50) NOT NULL,
        Action VARCHAR(20) NOT NULL,
        OldValue NVARCHAR(MAX),
        NewValue NVARCHAR(MAX),
        IPAddress VARCHAR(50),
        UserAgent VARCHAR(500),
        CreatedAt DATETIME DEFAULT GETDATE(),
        
        FOREIGN KEY (UserId) REFERENCES Users(UserId),
        
        INDEX IX_Audit_User (UserId),
        INDEX IX_Audit_Entity (EntityType, EntityId),
        INDEX IX_Audit_Date (CreatedAt)
    );
    PRINT '✅ สร้างตาราง AuditLogs';
END
GO

PRINT '';
PRINT '🎉 สร้างตารางทั้งหมดเสร็จสมบูรณ์!';
PRINT '📊 จำนวนตาราง: 15 ตาราง';
PRINT '';
PRINT '📝 ขั้นตอนถัดไป:';
PRINT '   1. รันสคริปต์ 02-insert-mock-data.sql เพื่อเพิ่มข้อมูลทดสอบ';
PRINT '   2. รันสคริปต์ 03-create-stored-procedures.sql เพื่อสร้าง stored procedures';
