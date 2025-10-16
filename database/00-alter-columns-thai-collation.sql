-- ============================================
-- เปลี่ยน Collation ของ Columns ภาษาไทยเป็น Thai_CI_AS
-- ============================================

USE RailwayManagement;
GO

PRINT '📝 กำลังเปลี่ยน Collation ของคอลัมน์ที่เก็บภาษาไทย...';
GO

-- TrainTypes
ALTER TABLE TrainTypes ALTER COLUMN NameTH NVARCHAR(100) COLLATE Thai_CI_AS NULL;
PRINT '✅ TrainTypes.NameTH';

-- Stations (ต้อง drop index ก่อน)
IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Stations_Region')
    DROP INDEX IX_Stations_Region ON Stations;

ALTER TABLE Stations ALTER COLUMN NameTH NVARCHAR(200) COLLATE Thai_CI_AS NOT NULL;
ALTER TABLE Stations ALTER COLUMN City NVARCHAR(100) COLLATE Thai_CI_AS NULL;
ALTER TABLE Stations ALTER COLUMN Region NVARCHAR(50) COLLATE Thai_CI_AS NULL;

-- สร้าง index ใหม่
CREATE NONCLUSTERED INDEX IX_Stations_Region ON Stations(Region);
PRINT '✅ Stations (NameTH, City, Region)';

-- Trains
ALTER TABLE Trains ALTER COLUMN TrainName NVARCHAR(200) COLLATE Thai_CI_AS NULL;
ALTER TABLE Trains ALTER COLUMN AnnouncementNote NVARCHAR(500) COLLATE Thai_CI_AS NULL;
PRINT '✅ Trains (TrainName, AnnouncementNote)';

-- BogieTypes
ALTER TABLE BogieTypes ALTER COLUMN NameTH NVARCHAR(100) COLLATE Thai_CI_AS NULL;
PRINT '✅ BogieTypes.NameTH';

-- Bogies
ALTER TABLE Bogies ALTER COLUMN BogieName NVARCHAR(100) COLLATE Thai_CI_AS NULL;
ALTER TABLE Bogies ALTER COLUMN Abbreviation NVARCHAR(10) COLLATE Thai_CI_AS NULL;
PRINT '✅ Bogies (BogieName, Abbreviation)';

-- TrainCompositions
ALTER TABLE TrainCompositions ALTER COLUMN ClassName NVARCHAR(100) COLLATE Thai_CI_AS NULL;
PRINT '✅ TrainCompositions.ClassName';

-- SleeperFees
ALTER TABLE SleeperFees ALTER COLUMN Description NVARCHAR(200) COLLATE Thai_CI_AS NULL;
PRINT '✅ SleeperFees.Description';

-- ACFees
ALTER TABLE ACFees ALTER COLUMN Description NVARCHAR(200) COLLATE Thai_CI_AS NULL;
PRINT '✅ ACFees.Description';

-- Users
ALTER TABLE Users ALTER COLUMN FirstName NVARCHAR(100) COLLATE Thai_CI_AS NULL;
ALTER TABLE Users ALTER COLUMN LastName NVARCHAR(100) COLLATE Thai_CI_AS NULL;
PRINT '✅ Users (FirstName, LastName)';

GO

PRINT '';
PRINT '🎉 เปลี่ยน Collation สำเร็จ!';
PRINT '';
PRINT '📊 ตรวจสอบ Collation ของคอลัมน์ภาษาไทย:';
GO

-- แสดงเฉพาะคอลัมน์ที่เป็น Thai_CI_AS
SELECT 
    t.name AS TableName,
    c.name AS ColumnName,
    c.collation_name AS Collation
FROM sys.tables t
INNER JOIN sys.columns c ON t.object_id = c.object_id
WHERE c.collation_name = 'Thai_CI_AS'
ORDER BY t.name, c.column_id;
GO

PRINT '';
PRINT '✅ พร้อมเพิ่มข้อมูลภาษาไทยแล้ว!';
