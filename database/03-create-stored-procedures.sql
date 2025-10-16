-- ============================================
-- สคริปต์สร้าง Stored Procedures
-- ============================================

USE RailwayManagement;
GO

PRINT '📌 กำลังสร้าง Stored Procedures...';
GO

-- ============================================
-- 1. ค้นหาขบวนรถไฟ (ตามสถานีต้นทางและปลายทาง)
-- ============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_SearchTrains')
    DROP PROCEDURE sp_SearchTrains;
GO

CREATE PROCEDURE sp_SearchTrains
    @OriginStationId VARCHAR(50),
    @DestinationStationId VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        t.TrainId,
        t.TrainNumber,
        t.TrainName,
        t.TotalDistanceKm,
        t.DepartureTime,
        t.ArrivalTime,
        t.DurationMinutes,
        t.Amenities,
        t.OperatingDays,
        tt.NameTH as TrainTypeName,
        tt.TypeCode as TrainTypeCode,
        o.NameTH as OriginName,
        o.StationCode as OriginCode,
        d.NameTH as DestinationName,
        d.StationCode as DestinationCode
    FROM Trains t
    JOIN TrainTypes tt ON t.TrainTypeId = tt.TrainTypeId
    JOIN Stations o ON t.OriginStationId = o.StationId
    JOIN Stations d ON t.DestinationStationId = d.StationId
    WHERE t.OriginStationId = @OriginStationId
      AND t.DestinationStationId = @DestinationStationId
      AND t.IsActive = 1
    ORDER BY t.DepartureTime;
END;
GO

PRINT '✅ สร้าง sp_SearchTrains';
GO

-- ============================================
-- 2. คำนวณค่าโดยสาร
-- ============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_CalculateFare')
    DROP PROCEDURE sp_CalculateFare;
GO

CREATE PROCEDURE sp_CalculateFare
    @TrainId VARCHAR(50),
    @OriginStationId VARCHAR(50),
    @DestinationStationId VARCHAR(50),
    @ClassType VARCHAR(20) -- '1', '2', '3'
AS
BEGIN
    SET NOCOUNT ON;
    
    -- คำนวณระยะทาง
    DECLARE @Distance INT;
    DECLARE @OriginSeq INT;
    DECLARE @DestSeq INT;
    
    SELECT @OriginSeq = SequenceNumber FROM TrainSchedules 
    WHERE TrainId = @TrainId AND StationId = @OriginStationId;
    
    SELECT @DestSeq = SequenceNumber FROM TrainSchedules 
    WHERE TrainId = @TrainId AND StationId = @DestinationStationId;
    
    SELECT @Distance = 
        ABS((SELECT DistanceFromOriginKm FROM TrainSchedules WHERE TrainId = @TrainId AND StationId = @DestinationStationId) -
        (SELECT DistanceFromOriginKm FROM TrainSchedules WHERE TrainId = @TrainId AND StationId = @OriginStationId));
    
    -- หาค่าโดยสารพื้นฐาน
    DECLARE @BaseFare DECIMAL(10,2) = 0;
    
    SELECT TOP 1 @BaseFare = 
        CASE @ClassType
            WHEN '1' THEN Class1Rate
            WHEN '2' THEN Class2Rate
            WHEN '3' THEN Class3Rate
            ELSE Class3Rate
        END
    FROM BaseFares
    WHERE Kilometer <= @Distance
      AND IsActive = 1
    ORDER BY Kilometer DESC;
    
    -- หาค่าธรรมเนียมรถไฟ
    DECLARE @TrainFee DECIMAL(10,2) = 0;
    DECLARE @TrainTypeId VARCHAR(50);
    
    SELECT @TrainTypeId = TrainTypeId FROM Trains WHERE TrainId = @TrainId;
    
    SELECT TOP 1 @TrainFee = FeeAmount
    FROM TrainFees
    WHERE TrainTypeId = @TrainTypeId
      AND @Distance BETWEEN DistanceFromKm AND DistanceToKm
      AND IsActive = 1;
    
    -- หาค่าแอร์ (ถ้ามี)
    DECLARE @ACFee DECIMAL(10,2) = 0;
    
    SELECT TOP 1 @ACFee = FeeAmount
    FROM ACFees
    WHERE @Distance BETWEEN DistanceFromKm AND DistanceToKm
      AND IsActive = 1;
    
    -- คำนวณรวม
    DECLARE @TotalFare DECIMAL(10,2) = ISNULL(@BaseFare, 0) + ISNULL(@TrainFee, 0) + ISNULL(@ACFee, 0);
    
    -- ส่งผลลัพธ์
    SELECT 
        @Distance as Distance,
        @BaseFare as BaseFare,
        @TrainFee as TrainFee,
        @ACFee as ACFee,
        0 as SleeperFee,
        @TotalFare as TotalFare,
        'THB' as Currency;
END;
GO

PRINT '✅ สร้าง sp_CalculateFare';
GO

-- ============================================
-- 3. ดึงตารางเวลาของขบวนรถไฟ
-- ============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetTrainSchedule')
    DROP PROCEDURE sp_GetTrainSchedule;
GO

CREATE PROCEDURE sp_GetTrainSchedule
    @TrainId VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        ts.ScheduleId,
        ts.SequenceNumber,
        s.StationCode,
        s.NameTH as StationName,
        s.NameEN as StationNameEN,
        ts.ArrivalTime,
        ts.DepartureTime,
        ts.PlatformNumber,
        ts.DwellTimeMinutes,
        ts.DistanceFromOriginKm
    FROM TrainSchedules ts
    JOIN Stations s ON ts.StationId = s.StationId
    WHERE ts.TrainId = @TrainId
      AND ts.IsActive = 1
    ORDER BY ts.SequenceNumber;
END;
GO

PRINT '✅ สร้าง sp_GetTrainSchedule';
GO

-- ============================================
-- 4. ดึงข้อมูลรถไฟยอดนิยม
-- ============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetPopularTrains')
    DROP PROCEDURE sp_GetPopularTrains;
GO

CREATE PROCEDURE sp_GetPopularTrains
    @TopN INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    
    -- อัปเดตข้อมูลก่อน
    MERGE INTO PopularTrains AS target
    USING (
        SELECT 
            t.TrainId,
            t.TrainNumber,
            COUNT(sh.SearchId) as SearchCount
        FROM Trains t
        LEFT JOIN SearchHistory sh ON t.TrainId = sh.TrainId
        WHERE sh.SearchDate >= DATEADD(month, -1, GETDATE())
        GROUP BY t.TrainId, t.TrainNumber
    ) AS source
    ON target.TrainId = source.TrainId
    WHEN MATCHED THEN
        UPDATE SET 
            target.SearchCount = source.SearchCount,
            target.LastUpdated = GETDATE()
    WHEN NOT MATCHED BY TARGET THEN
        INSERT (TrainId, TrainNumber, SearchCount, Rank, LastUpdated)
        VALUES (source.TrainId, source.TrainNumber, source.SearchCount, 0, GETDATE());
    
    -- กำหนด Rank
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
    
    -- ดึงข้อมูล Top N
    SELECT TOP (@TopN)
        pt.TrainId,
        pt.TrainNumber,
        t.TrainName,
        pt.SearchCount,
        pt.Trend,
        pt.Rank,
        tt.NameTH as TrainTypeName,
        o.NameTH as OriginName,
        d.NameTH as DestinationName
    FROM PopularTrains pt
    JOIN Trains t ON pt.TrainId = t.TrainId
    JOIN TrainTypes tt ON t.TrainTypeId = tt.TrainTypeId
    JOIN Stations o ON t.OriginStationId = o.StationId
    JOIN Stations d ON t.DestinationStationId = d.StationId
    ORDER BY pt.Rank;
END;
GO

PRINT '✅ สร้าง sp_GetPopularTrains';
GO

-- ============================================
-- 5. บันทึกประวัติการค้นหา
-- ============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_LogSearch')
    DROP PROCEDURE sp_LogSearch;
GO

CREATE PROCEDURE sp_LogSearch
    @TrainId VARCHAR(50) = NULL,
    @OriginStationId VARCHAR(50) = NULL,
    @DestinationStationId VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Today DATE = CAST(GETDATE() AS DATE);
    
    -- ตรวจสอบว่ามีข้อมูลในวันนี้แล้วหรือยัง
    IF EXISTS (
        SELECT 1 FROM SearchHistory 
        WHERE SearchDate = @Today
          AND (TrainId = @TrainId OR (@TrainId IS NULL AND TrainId IS NULL))
          AND (OriginStationId = @OriginStationId OR (@OriginStationId IS NULL AND OriginStationId IS NULL))
          AND (DestinationStationId = @DestinationStationId OR (@DestinationStationId IS NULL AND DestinationStationId IS NULL))
    )
    BEGIN
        -- อัปเดตจำนวน
        UPDATE SearchHistory
        SET SearchCount = SearchCount + 1
        WHERE SearchDate = @Today
          AND (TrainId = @TrainId OR (@TrainId IS NULL AND TrainId IS NULL))
          AND (OriginStationId = @OriginStationId OR (@OriginStationId IS NULL AND OriginStationId IS NULL))
          AND (DestinationStationId = @DestinationStationId OR (@DestinationStationId IS NULL AND DestinationStationId IS NULL));
    END
    ELSE
    BEGIN
        -- เพิ่มข้อมูลใหม่
        INSERT INTO SearchHistory (TrainId, OriginStationId, DestinationStationId, SearchDate, SearchCount)
        VALUES (@TrainId, @OriginStationId, @DestinationStationId, @Today, 1);
    END
END;
GO

PRINT '✅ สร้าง sp_LogSearch';
GO

-- ============================================
-- 6. ดึงข้อมูลสถานีทั้งหมด
-- ============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetAllStations')
    DROP PROCEDURE sp_GetAllStations;
GO

CREATE PROCEDURE sp_GetAllStations
    @Region NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        StationId,
        StationCode,
        NameTH,
        NameEN,
        City,
        Region,
        Latitude,
        Longitude,
        Facilities
    FROM Stations
    WHERE IsActive = 1
      AND (@Region IS NULL OR Region = @Region)
    ORDER BY Region, NameTH;
END;
GO

PRINT '✅ สร้าง sp_GetAllStations';
GO

-- ============================================
-- 7. ดึงข้อมูลรถไฟโดยละเอียด
-- ============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetTrainDetails')
    DROP PROCEDURE sp_GetTrainDetails;
GO

CREATE PROCEDURE sp_GetTrainDetails
    @TrainId VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- ข้อมูลหลัก
    SELECT 
        t.TrainId,
        t.TrainNumber,
        t.TrainName,
        t.TotalDistanceKm,
        t.DepartureTime,
        t.ArrivalTime,
        t.DurationMinutes,
        t.AnnouncementNote,
        t.Amenities,
        t.OperatingDays,
        tt.NameTH as TrainTypeName,
        tt.TypeCode as TrainTypeCode,
        tt.BaseMultiplier,
        o.StationCode as OriginCode,
        o.NameTH as OriginName,
        o.NameEN as OriginNameEN,
        d.StationCode as DestinationCode,
        d.NameTH as DestinationName,
        d.NameEN as DestinationNameEN
    FROM Trains t
    JOIN TrainTypes tt ON t.TrainTypeId = tt.TrainTypeId
    JOIN Stations o ON t.OriginStationId = o.StationId
    JOIN Stations d ON t.DestinationStationId = d.StationId
    WHERE t.TrainId = @TrainId;
    
    -- ตารางเวลา
    SELECT 
        ts.SequenceNumber,
        s.StationCode,
        s.NameTH as StationName,
        ts.ArrivalTime,
        ts.DepartureTime,
        ts.DistanceFromOriginKm
    FROM TrainSchedules ts
    JOIN Stations s ON ts.StationId = s.StationId
    WHERE ts.TrainId = @TrainId
      AND ts.IsActive = 1
    ORDER BY ts.SequenceNumber;
    
    -- องค์ประกอบตู้โดยสาร
    SELECT 
        tc.Position,
        b.BogieCode,
        b.BogieName,
        bt.NameTH as BogieTypeName,
        tc.ClassId,
        tc.ClassName,
        tc.TotalSeats,
        tc.AvailableSeats,
        b.Features
    FROM TrainCompositions tc
    JOIN Bogies b ON tc.BogieId = b.BogieId
    JOIN BogieTypes bt ON b.BogieTypeId = bt.BogieTypeId
    WHERE tc.TrainId = @TrainId
      AND tc.IsActive = 1
    ORDER BY tc.Position;
END;
GO

PRINT '✅ สร้าง sp_GetTrainDetails';
GO

PRINT '';
PRINT '🎉 สร้าง Stored Procedures ทั้งหมดเสร็จสมบูรณ์!';
PRINT '';
PRINT '📝 Stored Procedures ที่สร้าง:';
PRINT '   1. sp_SearchTrains - ค้นหาขบวนรถไฟ';
PRINT '   2. sp_CalculateFare - คำนวณค่าโดยสาร';
PRINT '   3. sp_GetTrainSchedule - ดึงตารางเวลา';
PRINT '   4. sp_GetPopularTrains - ดึงรถไฟยอดนิยม';
PRINT '   5. sp_LogSearch - บันทึกประวัติการค้นหา';
PRINT '   6. sp_GetAllStations - ดึงข้อมูลสถานี';
PRINT '   7. sp_GetTrainDetails - ดึงข้อมูลรถไฟโดยละเอียด';
PRINT '';
PRINT '✅ พร้อมใช้งาน! ต่อไปจะสร้างการเชื่อมต่อจาก Next.js';
