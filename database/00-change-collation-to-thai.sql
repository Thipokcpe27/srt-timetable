-- ============================================
-- เปลี่ยน Collation เป็น THAI
-- ============================================

USE master;
GO

-- ตรวจสอบว่ามี database อยู่หรือไม่
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'RailwayManagement')
BEGIN
    PRINT '📝 กำลังเปลี่ยน Collation ของ RailwayManagement...';
    
    -- ต้องตั้งค่า SINGLE_USER ก่อนเพื่อป้องกันการเข้าถึงขณะเปลี่ยน collation
    ALTER DATABASE RailwayManagement SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    
    -- เปลี่ยน Collation เป็น Thai_CI_AS (Case Insensitive, Accent Sensitive)
    ALTER DATABASE RailwayManagement COLLATE Thai_CI_AS;
    
    -- คืนสถานะเป็น MULTI_USER
    ALTER DATABASE RailwayManagement SET MULTI_USER;
    
    PRINT '✅ เปลี่ยน Collation เป็น Thai_CI_AS สำเร็จ!';
END
ELSE
BEGIN
    PRINT '❌ ไม่พบ database RailwayManagement';
    PRINT '💡 กรุณารันสคริปต์ 01-create-database-and-tables.sql ก่อน';
END
GO

-- แสดงข้อมูล Collation ปัจจุบัน
USE RailwayManagement;
GO

SELECT 
    name AS DatabaseName,
    collation_name AS Collation
FROM sys.databases 
WHERE name = 'RailwayManagement';
GO

PRINT '';
PRINT '📊 ตรวจสอบ Collation ของตารางที่สำคัญ:';
GO

SELECT 
    t.name AS TableName,
    c.name AS ColumnName,
    c.collation_name AS Collation
FROM sys.tables t
INNER JOIN sys.columns c ON t.object_id = c.object_id
WHERE c.collation_name IS NOT NULL
ORDER BY t.name, c.column_id;
GO

PRINT '';
PRINT '💡 หมายเหตุ:';
PRINT '   - Thai_CI_AS = Case Insensitive, Accent Sensitive';
PRINT '   - เหมาะสำหรับภาษาไทย (รองรับการเรียงลำดับและเปรียบเทียบอักษรไทย)';
PRINT '   - NVARCHAR จะใช้ Collation นี้โดยอัตโนมัติ';
