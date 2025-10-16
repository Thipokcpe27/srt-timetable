-- ============================================
-- สคริปต์เพิ่มข้อมูล Mock สำหรับทดสอบระบบ
-- ============================================

USE RailwayManagement;
GO

PRINT '📌 กำลังเพิ่มข้อมูล Mock...';
GO

-- ============================================
-- 1. ข้อมูลผู้ใช้งาน (Admin)
-- ============================================
PRINT '👤 เพิ่มข้อมูลผู้ใช้งาน...';

-- รหัสผ่าน: admin123 (ควรเข้ารหัสด้วย bcrypt ในระบบจริง)
INSERT INTO Users (UserId, Username, Email, PasswordHash, FirstName, LastName, Role, IsActive) VALUES
('USR001', 'admin', 'admin@railway.th', '$2b$10$example_hash_replace_with_real', N'ผู้ดูแล', N'ระบบ', 'SUPER_ADMIN', 1),
('USR002', 'manager', 'manager@railway.th', '$2b$10$example_hash_replace_with_real', N'จิรายุ', N'สมบัติ', 'ADMIN', 1);

PRINT '✅ เพิ่มผู้ใช้งาน 2 คน';
GO

-- ============================================
-- 2. ข้อมูลประเภทรถไฟ
-- ============================================
PRINT '🚂 เพิ่มข้อมูลประเภทรถไฟ...';

INSERT INTO TrainTypes (TrainTypeId, TypeCode, NameTH, NameEN, BaseMultiplier, IsActive) VALUES
('TT001', 'SPECIAL_EXPRESS', N'ด่วนพิเศษ', 'Special Express', 1.5, 1),
('TT002', 'EXPRESS', N'ด่วน', 'Express', 1.2, 1),
('TT003', 'RAPID', N'เร็ว', 'Rapid', 1.0, 1),
('TT004', 'ORDINARY', N'ธรรมดา', 'Ordinary', 0.8, 1);

PRINT '✅ เพิ่มประเภทรถไฟ 4 ประเภท';
GO

-- ============================================
-- 3. ข้อมูลสถานี
-- ============================================
PRINT '🏢 เพิ่มข้อมูลสถานี...';

INSERT INTO Stations (StationId, StationCode, NameTH, NameEN, City, Region, Latitude, Longitude, Facilities, IsActive) VALUES
-- ภาคกลาง
('STN001', 'BKK', N'กรุงเทพ (หัวลำโพง)', 'Bangkok', N'กรุงเทพมหานคร', N'กลาง', 13.736717, 100.516736, '["wifi","parking","restaurant","atm","toilet"]', 1),
('STN002', 'AYA', N'อยุธยา', 'Ayutthaya', N'พระนครศรีอยุธยา', N'กลาง', 14.369100, 100.577697, '["parking","restaurant","toilet"]', 1),
('STN003', 'LPI', N'ลพบุรี', 'Lopburi', N'ลพบุรี', N'กลาง', 14.799422, 100.619644, '["parking","restaurant","toilet"]', 1),

-- ภาคเหนือ
('STN004', 'PKN', N'พิษณุโลก', 'Phitsanulok', N'พิษณุโลก', N'เหนือ', 16.821261, 100.265650, '["wifi","parking","restaurant","toilet"]', 1),
('STN005', 'LPG', N'ลำปาง', 'Lampang', N'ลำปาง', N'เหนือ', 18.289100, 99.511269, '["parking","restaurant","toilet"]', 1),
('STN006', 'CNX', N'เชียงใหม่', 'Chiang Mai', N'เชียงใหม่', N'เหนือ', 18.796143, 98.986984, '["wifi","parking","restaurant","atm","toilet","hotel"]', 1),

-- ภาคตะวันออกเฉียงเหนือ
('STN007', 'KKN', N'ขอนแก่น', 'Khon Kaen', N'ขอนแก่น', N'อีสาน', 16.432100, 102.822555, '["wifi","parking","restaurant","atm","toilet"]', 1),
('STN008', 'UDN', N'อุดรธานี', 'Udon Thani', N'อุดรธานี', N'อีสาน', 17.364864, 102.815758, '["wifi","parking","restaurant","toilet"]', 1),
('STN009', 'NMA', N'นครราชสีมา (โคราช)', 'Nakhon Ratchasima', N'นครราชสีมา', N'อีสาน', 14.979900, 102.077933, '["wifi","parking","restaurant","atm","toilet"]', 1),

-- ภาคใต้
('STN010', 'HYI', N'หัวหิน', 'Hua Hin', N'ประจวบคีรีขันธ์', N'ใต้', 12.572178, 99.951653, '["wifi","parking","restaurant","toilet"]', 1),
('STN011', 'CPN', N'ชุมพร', 'Chumphon', N'ชุมพร', N'ใต้', 10.493053, 99.180008, '["parking","restaurant","toilet"]', 1),
('STN012', 'SKA', N'สุราษฎร์ธานี', 'Surat Thani', N'สุราษฎร์ธานี', N'ใต้', 9.132200, 99.333103, '["wifi","parking","restaurant","toilet"]', 1),
('STN013', 'HYA', N'หาดใหญ่', 'Hat Yai', N'สงขลา', N'ใต้', 7.008700, 100.478622, '["wifi","parking","restaurant","atm","toilet","hotel"]', 1);

PRINT '✅ เพิ่มสถานี 13 สถานี';
GO

-- ============================================
-- 4. ข้อมูลรถไฟ
-- ============================================
PRINT '🚄 เพิ่มข้อมูลรถไฟ...';

INSERT INTO Trains (TrainId, TrainNumber, TrainName, TrainTypeId, OriginStationId, DestinationStationId, TotalDistanceKm, DepartureTime, ArrivalTime, DurationMinutes, OperatingDays, Amenities, IsActive) VALUES
-- เส้นทางกรุงเทพ - เชียงใหม่
('TRN001', '1', N'ด่วนพิเศษ 1 กรุงเทพ-เชียงใหม่', 'TT001', 'STN001', 'STN006', 751, '18:00', '07:45', 825, 'MON,TUE,WED,THU,FRI,SAT,SUN', '["wifi","ac","food","sleeper"]', 1),
('TRN002', '3', N'ด่วนพิเศษ 3 กรุงเทพ-เชียงใหม่', 'TT001', 'STN001', 'STN006', 751, '15:10', '05:30', 860, 'MON,TUE,WED,THU,FRI,SAT,SUN', '["wifi","ac","food","sleeper"]', 1),
('TRN003', '13', N'ด่วน 13 กรุงเทพ-เชียงใหม่', 'TT002', 'STN001', 'STN006', 751, '08:30', '22:10', 820, 'MON,TUE,WED,THU,FRI,SAT,SUN', '["ac","food"]', 1),

-- เส้นทางกรุงเทพ - อุดรธานี
('TRN004', '25', N'ด่วนพิเศษ 25 กรุงเทพ-อุดรธานี', 'TT001', 'STN001', 'STN008', 568, '20:30', '07:40', 670, 'MON,TUE,WED,THU,FRI,SAT,SUN', '["wifi","ac","food","sleeper"]', 1),
('TRN005', '69', N'ด่วน 69 กรุงเทพ-อุดรธานี', 'TT002', 'STN001', 'STN008', 568, '08:00', '17:25', 565, 'MON,TUE,WED,THU,FRI,SAT,SUN', '["ac","food"]', 1),

-- เส้นทางกรุงเทพ - หาดใหญ่
('TRN006', '31', N'ด่วนพิเศษ 31 กรุงเทพ-หาดใหญ่', 'TT001', 'STN001', 'STN013', 945, '14:45', '09:00', 1095, 'MON,TUE,WED,THU,FRI,SAT,SUN', '["wifi","ac","food","sleeper"]', 1),
('TRN007', '83', N'ด่วน 83 กรุงเทพ-หาดใหญ่', 'TT002', 'STN001', 'STN013', 945, '17:35', '10:50', 1035, 'MON,TUE,WED,THU,FRI,SAT,SUN', '["ac","food"]', 1),

-- เส้นทางกรุงเทพ - นครราชสีมา
('TRN008', '23', N'ด่วน 23 กรุงเทพ-นครราชสีมา', 'TT002', 'STN001', 'STN009', 264, '06:10', '10:35', 265, 'MON,TUE,WED,THU,FRI,SAT,SUN', '["ac","food"]', 1),
('TRN009', '137', N'เร็ว 137 กรุงเทพ-นครราชสีมา', 'TT003', 'STN001', 'STN009', 264, '12:00', '17:10', 310, 'MON,TUE,WED,THU,FRI,SAT,SUN', '["ac"]', 1);

PRINT '✅ เพิ่มขบวนรถไฟ 9 ขบวน';
GO

-- ============================================
-- 5. ข้อมูลตารางเวลา (ตัวอย่าง: ขบวน 1 กทม-เชียงใหม่)
-- ============================================
PRINT '📅 เพิ่มข้อมูลตารางเวลา...';

-- ขบวนด่วนพิเศษ 1 กรุงเทพ-เชียงใหม่
INSERT INTO TrainSchedules (TrainId, StationId, SequenceNumber, ArrivalTime, DepartureTime, DistanceFromOriginKm, IsActive) VALUES
('TRN001', 'STN001', 1, NULL, '18:00', 0, 1),          -- กรุงเทพ (ออก)
('TRN001', 'STN002', 2, '19:15', '19:25', 71, 1),      -- อยุธยา
('TRN001', 'STN003', 3, '21:05', '21:15', 153, 1),     -- ลพบุรี
('TRN001', 'STN004', 4, '23:55', '00:05', 377, 1),     -- พิษณุโลก
('TRN001', 'STN005', 5, '03:20', '03:30', 598, 1),     -- ลำปาง
('TRN001', 'STN006', 6, '07:45', NULL, 751, 1);        -- เชียงใหม่ (ถึง)

-- ขบวนด่วนพิเศษ 25 กรุงเทพ-อุดรธานี
INSERT INTO TrainSchedules (TrainId, StationId, SequenceNumber, ArrivalTime, DepartureTime, DistanceFromOriginKm, IsActive) VALUES
('TRN004', 'STN001', 1, NULL, '20:30', 0, 1),          -- กรุงเทพ (ออก)
('TRN004', 'STN002', 2, '21:45', '21:55', 71, 1),      -- อยุธยา
('TRN004', 'STN009', 3, '01:20', '01:35', 264, 1),     -- นครราชสีมา
('TRN004', 'STN007', 4, '04:50', '05:00', 445, 1),     -- ขอนแก่น
('TRN004', 'STN008', 5, '07:40', NULL, 568, 1);        -- อุดรธานี (ถึง)

-- ขบวนด่วนพิเศษ 31 กรุงเทพ-หาดใหญ่
INSERT INTO TrainSchedules (TrainId, StationId, SequenceNumber, ArrivalTime, DepartureTime, DistanceFromOriginKm, IsActive) VALUES
('TRN006', 'STN001', 1, NULL, '14:45', 0, 1),          -- กรุงเทพ (ออก)
('TRN006', 'STN010', 2, '18:30', '18:40', 229, 1),     -- หัวหิน
('TRN006', 'STN011', 3, '22:15', '22:25', 485, 1),     -- ชุมพร
('TRN006', 'STN012', 4, '02:45', '03:00', 651, 1),     -- สุราษฎร์ธานี
('TRN006', 'STN013', 5, '09:00', NULL, 945, 1);        -- หาดใหญ่ (ถึง)

PRINT '✅ เพิ่มตารางเวลา 3 ขบวน';
GO

-- ============================================
-- 6. ข้อมูลประเภทตู้โดยสาร
-- ============================================
PRINT '🚃 เพิ่มข้อมูลประเภทตู้โดยสาร...';

INSERT INTO BogieTypes (BogieTypeId, TypeCode, NameTH, NameEN, IsActive) VALUES
('BGT001', 'SLEEPER_1', N'ตู้นอนชั้น 1', 'First Class Sleeper', 1),
('BGT002', 'SLEEPER_2', N'ตู้นอนชั้น 2', 'Second Class Sleeper', 1),
('BGT003', 'SEAT_1', N'ตู้นั่งชั้น 1', 'First Class Seat', 1),
('BGT004', 'SEAT_2', N'ตู้นั่งชั้น 2', 'Second Class Seat', 1),
('BGT005', 'SEAT_3', N'ตู้นั่งชั้น 3', 'Third Class Seat', 1);

PRINT '✅ เพิ่มประเภทตู้โดยสาร 5 ประเภท';
GO

-- ============================================
-- 7. ข้อมูลตู้โดยสาร
-- ============================================
PRINT '🎫 เพิ่มข้อมูลตู้โดยสาร...';

INSERT INTO Bogies (BogieId, BogieCode, BogieName, Abbreviation, BogieTypeId, ClassType, Capacity, Features, IsActive) VALUES
-- ตู้นอนชั้น 1
('BOG001', 'SL1-001', N'ตู้นอนชั้น 1 ห้องเดี่ยว', N'นน.1', 'BGT001', 'FIRST', 10, '["ac","wifi","power_outlet","private_room"]', 1),
-- ตู้นอนชั้น 2
('BOG002', 'SL2-001', N'ตู้นอนชั้น 2 (แอร์)', N'นน.2', 'BGT002', 'BUSINESS', 36, '["ac","power_outlet"]', 1),
('BOG003', 'SL2-002', N'ตู้นอนชั้น 2 (พัดลม)', N'นน.2', 'BGT002', 'BUSINESS', 48, '["fan"]', 1),
-- ตู้นั่งชั้น 1
('BOG004', 'ST1-001', N'ตู้นั่งชั้น 1', N'นง.1', 'BGT003', 'FIRST', 40, '["ac","wifi","power_outlet","reclining_seat"]', 1),
-- ตู้นั่งชั้น 2
('BOG005', 'ST2-001', N'ตู้นั่งชั้น 2 (แอร์)', N'นง.2', 'BGT004', 'BUSINESS', 64, '["ac","power_outlet"]', 1),
('BOG006', 'ST2-002', N'ตู้นั่งชั้น 2 (พัดลม)', N'นง.2', 'BGT004', 'BUSINESS', 72, '["fan"]', 1),
-- ตู้นั่งชั้น 3
('BOG007', 'ST3-001', N'ตู้นั่งชั้น 3', N'นง.3', 'BGT005', 'ECONOMY', 88, '["fan"]', 1);

PRINT '✅ เพิ่มตู้โดยสาร 7 ตู้';
GO

-- ============================================
-- 8. ข้อมูลการจัดองค์ประกอบรถไฟ (ตัวอย่าง: ขบวน 1)
-- ============================================
PRINT '🔗 เพิ่มข้อมูลการจัดองค์ประกอบรถไฟ...';

-- ขบวนด่วนพิเศษ 1 กรุงเทพ-เชียงใหม่
INSERT INTO TrainCompositions (TrainId, BogieId, Position, ClassId, ClassName, TotalSeats, AvailableSeats, IsActive) VALUES
('TRN001', 'BOG001', 1, 'first', N'ชั้น 1', 10, 10, 1),
('TRN001', 'BOG002', 2, 'business', N'ชั้น 2', 36, 36, 1),
('TRN001', 'BOG002', 3, 'business', N'ชั้น 2', 36, 36, 1),
('TRN001', 'BOG005', 4, 'business', N'ชั้น 2 นั่ง', 64, 64, 1),
('TRN001', 'BOG006', 5, 'economy', N'ชั้น 2 นั่ง', 72, 72, 1);

PRINT '✅ เพิ่มการจัดองค์ประกอบรถไฟ 1 ขบวน';
GO

-- ============================================
-- 9. ข้อมูลอัตราค่าโดยสาร (ตามกิโลเมตร)
-- ============================================
PRINT '💰 เพิ่มข้อมูลอัตราค่าโดยสาร...';

INSERT INTO BaseFares (Kilometer, Class1Rate, Class2Rate, Class3Rate, IsActive) VALUES
(1, 25, 18, 12, 1),
(5, 100, 75, 50, 1),
(10, 180, 130, 90, 1),
(20, 320, 240, 160, 1),
(50, 700, 550, 380, 1),
(100, 1300, 1000, 700, 1),
(150, 1850, 1450, 1000, 1),
(200, 2400, 1900, 1300, 1),
(250, 2900, 2300, 1600, 1),
(300, 3400, 2700, 1900, 1),
(400, 4300, 3400, 2400, 1),
(500, 5200, 4100, 2900, 1),
(600, 6000, 4800, 3400, 1),
(700, 6800, 5400, 3800, 1),
(800, 7500, 6000, 4200, 1),
(900, 8200, 6500, 4600, 1),
(1000, 9000, 7000, 5000, 1);

PRINT '✅ เพิ่มอัตราค่าโดยสาร 17 ระดับ';
GO

-- ============================================
-- 10. ข้อมูลค่าธรรมเนียมรถไฟ
-- ============================================
PRINT '💵 เพิ่มข้อมูลค่าธรรมเนียมรถไฟ...';

-- รถด่วนพิเศษ
INSERT INTO TrainFees (TrainTypeId, DistanceFromKm, DistanceToKm, FeeAmount, IsActive) VALUES
('TT001', 1, 100, 100, 1),
('TT001', 101, 300, 150, 1),
('TT001', 301, 500, 200, 1),
('TT001', 501, 9999, 250, 1),
-- รถด่วน
('TT002', 1, 100, 60, 1),
('TT002', 101, 300, 90, 1),
('TT002', 301, 500, 120, 1),
('TT002', 501, 9999, 150, 1);

PRINT '✅ เพิ่มค่าธรรมเนียมรถไฟ';
GO

-- ============================================
-- 11. ข้อมูลค่าตู้นอน
-- ============================================
PRINT '🛏️ เพิ่มข้อมูลค่าตู้นอน...';

INSERT INTO SleeperFees (BogieTypeId, FeeAmount, Description, IsActive) VALUES
('BGT001', 600, N'ตู้นอนชั้น 1 - ห้องส่วนตัว มีห้องน้ำในห้อง', 1),
('BGT002', 350, N'ตู้นอนชั้น 2 - เตียงนอน 2 ชั้น', 1);

PRINT '✅ เพิ่มค่าตู้นอน';
GO

-- ============================================
-- 12. ข้อมูลค่าแอร์
-- ============================================
PRINT '❄️ เพิ่มข้อมูลค่าแอร์...';

INSERT INTO ACFees (DistanceFromKm, DistanceToKm, FeeAmount, Description, IsActive) VALUES
(1, 100, 30, N'ค่าแอร์ระยะทาง 1-100 กม.', 1),
(101, 300, 60, N'ค่าแอร์ระยะทาง 101-300 กม.', 1),
(301, 500, 90, N'ค่าแอร์ระยะทาง 301-500 กม.', 1),
(501, 9999, 120, N'ค่าแอร์ระยะทาง 500+ กม.', 1);

PRINT '✅ เพิ่มค่าแอร์';
GO

PRINT '';
PRINT '🎉 เพิ่มข้อมูล Mock เสร็จสมบูรณ์!';
PRINT '';
PRINT '📊 สรุปข้อมูลที่เพิ่ม:';
PRINT '   - ผู้ใช้งาน: 2 คน';
PRINT '   - ประเภทรถไฟ: 4 ประเภท';
PRINT '   - สถานี: 13 สถานี';
PRINT '   - ขบวนรถไฟ: 9 ขบวน';
PRINT '   - ตารางเวลา: 3 ขบวน';
PRINT '   - ประเภทตู้โดยสาร: 5 ประเภท';
PRINT '   - ตู้โดยสาร: 7 ตู้';
PRINT '   - การจัดองค์ประกอบรถไฟ: 1 ขบวน';
PRINT '   - อัตราค่าโดยสาร: 17 ระดับ';
PRINT '   - ค่าธรรมเนียมรถไฟ: 8 รายการ';
PRINT '   - ค่าตู้นอน: 2 รายการ';
PRINT '   - ค่าแอร์: 4 รายการ';
PRINT '';
PRINT '📝 ขั้นตอนถัดไป:';
PRINT '   - รันสคริปต์ 03-create-stored-procedures.sql';
