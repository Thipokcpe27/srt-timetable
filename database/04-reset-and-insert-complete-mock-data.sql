-- ============================================
-- สคริปต์ลบข้อมูลเก่าและเพิ่มข้อมูล Mock ใหม่แบบสมบูรณ์
-- ============================================

USE RailwayManagement;
GO

PRINT '🗑️ กำลังลบข้อมูลเก่าทั้งหมด...';
GO

-- ลบข้อมูลตามลำดับ (เพราะมี Foreign Key)
DELETE FROM SearchHistory;
DELETE FROM PopularTrains;
DELETE FROM AuditLogs;
DELETE FROM TrainCompositions;
DELETE FROM TrainSchedules;
DELETE FROM Trains;
DELETE FROM Bogies;
DELETE FROM BogieTypes;
DELETE FROM TrainFees;
DELETE FROM SleeperFees;
DELETE FROM ACFees;
DELETE FROM BaseFares;
DELETE FROM TrainTypes;
DELETE FROM Stations;
DELETE FROM Users;

PRINT '✅ ลบข้อมูลเก่าเสร็จสมบูรณ์';
PRINT '';
PRINT '📝 กำลังเพิ่มข้อมูล Mock ใหม่...';
GO

-- ============================================
-- 1. ผู้ใช้งาน
-- ============================================
PRINT '👤 เพิ่มผู้ใช้งาน...';

INSERT INTO Users (UserId, Username, Email, PasswordHash, FirstName, LastName, Role, IsActive) VALUES
('USR001', 'admin', 'admin@railway.th', '$2b$10$example_hash', N'ผู้ดูแล', N'ระบบ', 'SUPER_ADMIN', 1),
('USR002', 'manager', 'manager@railway.th', '$2b$10$example_hash', N'จิรายุ', N'สมบัติ', 'ADMIN', 1);

-- ============================================
-- 2. ประเภทรถไฟ
-- ============================================
PRINT '🚂 เพิ่มประเภทรถไฟ...';

INSERT INTO TrainTypes (TrainTypeId, TypeCode, NameTH, NameEN, BaseMultiplier, IsActive) VALUES
('TT001', 'SPECIAL_EXPRESS', N'ด่วนพิเศษ', 'Special Express', 1.5, 1),
('TT002', 'EXPRESS', N'ด่วน', 'Express', 1.2, 1),
('TT003', 'RAPID', N'เร็ว', 'Rapid', 1.0, 1),
('TT004', 'ORDINARY', N'ธรรมดา', 'Ordinary', 0.8, 1);

-- ============================================
-- 3. สถานี
-- ============================================
PRINT '🏢 เพิ่มสถานี...';

INSERT INTO Stations (StationId, StationCode, NameTH, NameEN, City, Region, Latitude, Longitude, Facilities, IsActive) VALUES
-- ภาคกลาง
('STN001', 'BKK', N'กรุงเทพ (หัวลำโพง)', 'Bangkok', N'กรุงเทพมหานคร', N'กลาง', 13.736717, 100.516736, '["wifi","parking","restaurant","atm","toilet"]', 1),
('STN002', 'AYA', N'อยุธยา', 'Ayutthaya', N'พระนครศรีอยุธยา', N'กลาง', 14.369100, 100.577697, '["parking","restaurant","toilet"]', 1),
('STN003', 'LPI', N'ลพบุรี', 'Lopburi', N'ลพบุรี', N'กลาง', 14.799422, 100.619644, '["parking","restaurant","toilet"]', 1),
-- ภาคเหนือ
('STN004', 'PKN', N'พิษณุโลก', 'Phitsanulok', N'พิษณุโลก', N'เหนือ', 16.821261, 100.265650, '["wifi","parking","restaurant","toilet"]', 1),
('STN005', 'LPG', N'ลำปาง', 'Lampang', N'ลำปาง', N'เหนือ', 18.289100, 99.511269, '["parking","restaurant","toilet"]', 1),
('STN006', 'CNX', N'เชียงใหม่', 'Chiang Mai', N'เชียงใหม่', N'เหนือ', 18.796143, 98.986984, '["wifi","parking","restaurant","atm","toilet"]', 1),
-- ภาคตะวันออกเฉียงเหนือ
('STN007', 'KKN', N'ขอนแก่น', 'Khon Kaen', N'ขอนแก่น', N'อีสาน', 16.432100, 102.822555, '["wifi","parking","restaurant","atm","toilet"]', 1),
('STN008', 'UDN', N'อุดรธานี', 'Udon Thani', N'อุดรธานี', N'อีสาน', 17.364864, 102.815758, '["wifi","parking","restaurant","toilet"]', 1),
('STN009', 'NMA', N'นครราชสีมา (โคราช)', 'Nakhon Ratchasima', N'นครราชสีมา', N'อีสาน', 14.979900, 102.077933, '["wifi","parking","restaurant","atm","toilet"]', 1),
-- ภาคใต้
('STN010', 'HYI', N'หัวหิน', 'Hua Hin', N'ประจวบคีรีขันธ์', N'ใต้', 12.572178, 99.951653, '["wifi","parking","restaurant","toilet"]', 1),
('STN011', 'CPN', N'ชุมพร', 'Chumphon', N'ชุมพร', N'ใต้', 10.493053, 99.180008, '["parking","restaurant","toilet"]', 1),
('STN012', 'SKA', N'สุราษฎร์ธานี', 'Surat Thani', N'สุราษฎร์ธานี', N'ใต้', 9.132200, 99.333103, '["wifi","parking","restaurant","toilet"]', 1),
('STN013', 'HYA', N'หาดใหญ่', 'Hat Yai', N'สงขลา', N'ใต้', 7.008700, 100.478622, '["wifi","parking","restaurant","atm","toilet"]', 1);

-- ============================================
-- 4. รถไฟ
-- ============================================
PRINT '🚄 เพิ่มรถไฟ...';

INSERT INTO Trains (TrainId, TrainNumber, TrainName, TrainTypeId, OriginStationId, DestinationStationId, TotalDistanceKm, DepartureTime, ArrivalTime, DurationMinutes, OperatingDays, Amenities, IsActive) VALUES
-- กรุงเทพ - เชียงใหม่
('TRN001', '1', N'ด่วนพิเศษ 1 กรุงเทพ-เชียงใหม่', 'TT001', 'STN001', 'STN006', 751, '18:00', '07:45', 825, 'MON,TUE,WED,THU,FRI,SAT,SUN', '["wifi","ac","food","sleeper"]', 1),
('TRN002', '3', N'ด่วนพิเศษ 3 กรุงเทพ-เชียงใหม่', 'TT001', 'STN001', 'STN006', 751, '15:10', '05:30', 860, 'MON,TUE,WED,THU,FRI,SAT,SUN', '["wifi","ac","food","sleeper"]', 1),
('TRN003', '13', N'ด่วน 13 กรุงเทพ-เชียงใหม่', 'TT002', 'STN001', 'STN006', 751, '08:30', '22:10', 820, 'MON,TUE,WED,THU,FRI,SAT,SUN', '["ac","food"]', 1),
-- กรุงเทพ - อุดรธานี
('TRN004', '25', N'ด่วนพิเศษ 25 กรุงเทพ-อุดรธานี', 'TT001', 'STN001', 'STN008', 568, '20:30', '07:40', 670, 'MON,TUE,WED,THU,FRI,SAT,SUN', '["wifi","ac","food","sleeper"]', 1),
('TRN005', '69', N'ด่วน 69 กรุงเทพ-อุดรธานี', 'TT002', 'STN001', 'STN008', 568, '08:00', '17:25', 565, 'MON,TUE,WED,THU,FRI,SAT,SUN', '["ac","food"]', 1),
-- กรุงเทพ - หาดใหญ่
('TRN006', '31', N'ด่วนพิเศษ 31 กรุงเทพ-หาดใหญ่', 'TT001', 'STN001', 'STN013', 945, '14:45', '09:00', 1095, 'MON,TUE,WED,THU,FRI,SAT,SUN', '["wifi","ac","food","sleeper"]', 1),
('TRN007', '83', N'ด่วน 83 กรุงเทพ-หาดใหญ่', 'TT002', 'STN001', 'STN013', 945, '17:35', '10:50', 1035, 'MON,TUE,WED,THU,FRI,SAT,SUN', '["ac","food"]', 1),
-- กรุงเทพ - นครราชสีมา
('TRN008', '23', N'ด่วน 23 กรุงเทพ-นครราชสีมา', 'TT002', 'STN001', 'STN009', 264, '06:10', '10:35', 265, 'MON,TUE,WED,THU,FRI,SAT,SUN', '["ac","food"]', 1),
('TRN009', '137', N'เร็ว 137 กรุงเทพ-นครราชสีมา', 'TT003', 'STN001', 'STN009', 264, '12:00', '17:10', 310, 'MON,TUE,WED,THU,FRI,SAT,SUN', '["ac"]', 1);

-- ============================================
-- 5. ตารางเวลา (ทุกขบวน)
-- ============================================
PRINT '📅 เพิ่มตารางเวลา...';

-- ขบวน 1: กรุงเทพ-เชียงใหม่
INSERT INTO TrainSchedules (TrainId, StationId, SequenceNumber, ArrivalTime, DepartureTime, DistanceFromOriginKm) VALUES
('TRN001', 'STN001', 1, NULL, '18:00', 0),
('TRN001', 'STN002', 2, '19:15', '19:25', 71),
('TRN001', 'STN003', 3, '21:05', '21:15', 153),
('TRN001', 'STN004', 4, '23:55', '00:05', 377),
('TRN001', 'STN005', 5, '03:20', '03:30', 598),
('TRN001', 'STN006', 6, '07:45', NULL, 751);

-- ขบวน 2: กรุงเทพ-เชียงใหม่
INSERT INTO TrainSchedules (TrainId, StationId, SequenceNumber, ArrivalTime, DepartureTime, DistanceFromOriginKm) VALUES
('TRN002', 'STN001', 1, NULL, '15:10', 0),
('TRN002', 'STN002', 2, '16:30', '16:40', 71),
('TRN002', 'STN004', 3, '20:45', '21:00', 377),
('TRN002', 'STN005', 4, '00:15', '00:25', 598),
('TRN002', 'STN006', 5, '05:30', NULL, 751);

-- ขบวน 3: กรุงเทพ-เชียงใหม่
INSERT INTO TrainSchedules (TrainId, StationId, SequenceNumber, ArrivalTime, DepartureTime, DistanceFromOriginKm) VALUES
('TRN003', 'STN001', 1, NULL, '08:30', 0),
('TRN003', 'STN002', 2, '09:45', '09:55', 71),
('TRN003', 'STN003', 3, '11:30', '11:40', 153),
('TRN003', 'STN004', 4, '14:25', '14:40', 377),
('TRN003', 'STN005', 5, '18:50', '19:00', 598),
('TRN003', 'STN006', 6, '22:10', NULL, 751);

-- ขบวน 4: กรุงเทพ-อุดรธานี
INSERT INTO TrainSchedules (TrainId, StationId, SequenceNumber, ArrivalTime, DepartureTime, DistanceFromOriginKm) VALUES
('TRN004', 'STN001', 1, NULL, '20:30', 0),
('TRN004', 'STN002', 2, '21:45', '21:55', 71),
('TRN004', 'STN009', 3, '01:20', '01:35', 264),
('TRN004', 'STN007', 4, '04:50', '05:00', 445),
('TRN004', 'STN008', 5, '07:40', NULL, 568);

-- ขบวน 5: กรุงเทพ-อุดรธานี
INSERT INTO TrainSchedules (TrainId, StationId, SequenceNumber, ArrivalTime, DepartureTime, DistanceFromOriginKm) VALUES
('TRN005', 'STN001', 1, NULL, '08:00', 0),
('TRN005', 'STN002', 2, '09:15', '09:25', 71),
('TRN005', 'STN009', 3, '12:30', '12:45', 264),
('TRN005', 'STN007', 4, '15:10', '15:20', 445),
('TRN005', 'STN008', 5, '17:25', NULL, 568);

-- ขบวน 6: กรุงเทพ-หาดใหญ่
INSERT INTO TrainSchedules (TrainId, StationId, SequenceNumber, ArrivalTime, DepartureTime, DistanceFromOriginKm) VALUES
('TRN006', 'STN001', 1, NULL, '14:45', 0),
('TRN006', 'STN010', 2, '18:30', '18:40', 229),
('TRN006', 'STN011', 3, '22:15', '22:25', 485),
('TRN006', 'STN012', 4, '02:45', '03:00', 651),
('TRN006', 'STN013', 5, '09:00', NULL, 945);

-- ขบวน 7: กรุงเทพ-หาดใหญ่
INSERT INTO TrainSchedules (TrainId, StationId, SequenceNumber, ArrivalTime, DepartureTime, DistanceFromOriginKm) VALUES
('TRN007', 'STN001', 1, NULL, '17:35', 0),
('TRN007', 'STN010', 2, '21:20', '21:30', 229),
('TRN007', 'STN011', 3, '01:15', '01:25', 485),
('TRN007', 'STN012', 4, '06:00', '06:15', 651),
('TRN007', 'STN013', 5, '10:50', NULL, 945);

-- ขบวน 8: กรุงเทพ-นครราชสีมา
INSERT INTO TrainSchedules (TrainId, StationId, SequenceNumber, ArrivalTime, DepartureTime, DistanceFromOriginKm) VALUES
('TRN008', 'STN001', 1, NULL, '06:10', 0),
('TRN008', 'STN002', 2, '07:20', '07:30', 71),
('TRN008', 'STN009', 3, '10:35', NULL, 264);

-- ขบวน 9: กรุงเทพ-นครราชสีมา
INSERT INTO TrainSchedules (TrainId, StationId, SequenceNumber, ArrivalTime, DepartureTime, DistanceFromOriginKm) VALUES
('TRN009', 'STN001', 1, NULL, '12:00', 0),
('TRN009', 'STN002', 2, '13:15', '13:25', 71),
('TRN009', 'STN009', 3, '17:10', NULL, 264);

-- ============================================
-- 6. ประเภทตู้โดยสาร
-- ============================================
PRINT '🚃 เพิ่มประเภทตู้โดยสาร...';

INSERT INTO BogieTypes (BogieTypeId, TypeCode, NameTH, NameEN) VALUES
('BGT001', 'SLEEPER_1', N'ตู้นอนชั้น 1', 'First Class Sleeper'),
('BGT002', 'SLEEPER_2', N'ตู้นอนชั้น 2', 'Second Class Sleeper'),
('BGT003', 'SEAT_1', N'ตู้นั่งชั้น 1', 'First Class Seat'),
('BGT004', 'SEAT_2', N'ตู้นั่งชั้น 2', 'Second Class Seat'),
('BGT005', 'SEAT_3', N'ตู้นั่งชั้น 3', 'Third Class Seat');

-- ============================================
-- 7. ตู้โดยสาร
-- ============================================
PRINT '🎫 เพิ่มตู้โดยสาร...';

INSERT INTO Bogies (BogieId, BogieCode, BogieName, Abbreviation, BogieTypeId, ClassType, Capacity, Features) VALUES
-- ตู้นอนชั้น 1
('BOG001', 'SL1-001', N'ตู้นอนชั้น 1 ห้องเดี่ยว', N'นน.1', 'BGT001', 'FIRST', 10, '["ac","wifi","power","sleeper"]'),
-- ตู้นอนชั้น 2
('BOG002', 'SL2-001', N'ตู้นอนชั้น 2 (แอร์)', N'นน.2', 'BGT002', 'BUSINESS', 36, '["ac","power","sleeper"]'),
('BOG003', 'SL2-002', N'ตู้นอนชั้น 2 (พัดลม)', N'นน.2', 'BGT002', 'BUSINESS', 48, '["sleeper"]'),
-- ตู้นั่งชั้น 1
('BOG004', 'ST1-001', N'ตู้นั่งชั้น 1', N'นง.1', 'BGT003', 'FIRST', 40, '["ac","wifi","power"]'),
-- ตู้นั่งชั้น 2
('BOG005', 'ST2-001', N'ตู้นั่งชั้น 2 (แอร์)', N'นง.2', 'BGT004', 'BUSINESS', 64, '["ac","power"]'),
('BOG006', 'ST2-002', N'ตู้นั่งชั้น 2 (พัดลม)', N'นง.2', 'BGT004', 'BUSINESS', 72, '[]'),
-- ตู้นั่งชั้น 3
('BOG007', 'ST3-001', N'ตู้นั่งชั้น 3', N'นง.3', 'BGT005', 'ECONOMY', 88, '[]');

-- ============================================
-- 8. การจัดองค์ประกอบรถไฟ (ทุกขบวน)
-- ============================================
PRINT '🔗 เพิ่มการจัดองค์ประกอบรถไฟ...';

-- ขบวนด่วนพิเศษ (มีตู้นอน)
INSERT INTO TrainCompositions (TrainId, BogieId, Position, ClassId, ClassName, TotalSeats, AvailableSeats) VALUES
-- TRN001
('TRN001', 'BOG001', 1, 'first', N'ชั้น 1', 10, 10),
('TRN001', 'BOG002', 2, 'business', N'ชั้น 2', 36, 36),
('TRN001', 'BOG005', 3, 'business', N'ชั้น 2 นั่ง', 64, 64),
('TRN001', 'BOG007', 4, 'economy', N'ชั้น 3', 88, 88),
-- TRN002
('TRN002', 'BOG001', 1, 'first', N'ชั้น 1', 10, 8),
('TRN002', 'BOG002', 2, 'business', N'ชั้น 2', 36, 30),
('TRN002', 'BOG005', 3, 'business', N'ชั้น 2 นั่ง', 64, 50),
-- TRN003 (ด่วน - ไม่มีตู้นอน)
('TRN003', 'BOG004', 1, 'first', N'ชั้น 1', 40, 35),
('TRN003', 'BOG005', 2, 'business', N'ชั้น 2', 64, 55),
('TRN003', 'BOG007', 3, 'economy', N'ชั้น 3', 88, 70),
-- TRN004
('TRN004', 'BOG001', 1, 'first', N'ชั้น 1', 10, 10),
('TRN004', 'BOG002', 2, 'business', N'ชั้น 2', 36, 36),
('TRN004', 'BOG007', 3, 'economy', N'ชั้น 3', 88, 88),
-- TRN005 (ด่วน)
('TRN005', 'BOG005', 1, 'business', N'ชั้น 2', 64, 60),
('TRN005', 'BOG007', 2, 'economy', N'ชั้น 3', 88, 80),
-- TRN006
('TRN006', 'BOG001', 1, 'first', N'ชั้น 1', 10, 7),
('TRN006', 'BOG002', 2, 'business', N'ชั้น 2', 36, 28),
('TRN006', 'BOG005', 3, 'business', N'ชั้น 2 นั่ง', 64, 50),
-- TRN007 (ด่วน)
('TRN007', 'BOG004', 1, 'first', N'ชั้น 1', 40, 30),
('TRN007', 'BOG005', 2, 'business', N'ชั้น 2', 64, 50),
('TRN007', 'BOG007', 3, 'economy', N'ชั้น 3', 88, 65),
-- TRN008 (ด่วน)
('TRN008', 'BOG005', 1, 'business', N'ชั้น 2', 64, 55),
('TRN008', 'BOG007', 2, 'economy', N'ชั้น 3', 88, 75),
-- TRN009 (เร็ว)
('TRN009', 'BOG006', 1, 'business', N'ชั้น 2', 72, 65),
('TRN009', 'BOG007', 2, 'economy', N'ชั้น 3', 88, 80);

-- ============================================
-- 9. อัตราค่าโดยสาร
-- ============================================
PRINT '💰 เพิ่มอัตราค่าโดยสาร...';

INSERT INTO BaseFares (Kilometer, Class1Rate, Class2Rate, Class3Rate) VALUES
(1, 25, 18, 12),
(5, 100, 75, 50),
(10, 180, 130, 90),
(20, 320, 240, 160),
(50, 700, 550, 380),
(100, 1300, 1000, 700),
(150, 1850, 1450, 1000),
(200, 2400, 1900, 1300),
(250, 2900, 2300, 1600),
(300, 3400, 2700, 1900),
(400, 4300, 3400, 2400),
(500, 5200, 4100, 2900),
(600, 6000, 4800, 3400),
(700, 6800, 5400, 3800),
(800, 7500, 6000, 4200),
(900, 8200, 6500, 4600),
(1000, 9000, 7000, 5000);

-- ============================================
-- 10. ค่าธรรมเนียมรถไฟ
-- ============================================
PRINT '💵 เพิ่มค่าธรรมเนียมรถไฟ...';

INSERT INTO TrainFees (TrainTypeId, DistanceFromKm, DistanceToKm, FeeAmount) VALUES
-- ด่วนพิเศษ
('TT001', 1, 100, 100),
('TT001', 101, 300, 150),
('TT001', 301, 500, 200),
('TT001', 501, 9999, 250),
-- ด่วน
('TT002', 1, 100, 60),
('TT002', 101, 300, 90),
('TT002', 301, 500, 120),
('TT002', 501, 9999, 150);

-- ============================================
-- 11. ค่าตู้นอน
-- ============================================
PRINT '🛏️ เพิ่มค่าตู้นอน...';

INSERT INTO SleeperFees (BogieTypeId, FeeAmount, Description) VALUES
('BGT001', 600, N'ตู้นอนชั้น 1 - ห้องส่วนตัว'),
('BGT002', 350, N'ตู้นอนชั้น 2 - เตียงนอน 2 ชั้น');

-- ============================================
-- 12. ค่าแอร์
-- ============================================
PRINT '❄️ เพิ่มค่าแอร์...';

INSERT INTO ACFees (DistanceFromKm, DistanceToKm, FeeAmount, Description) VALUES
(1, 100, 30, N'ค่าแอร์ระยะทาง 1-100 กม.'),
(101, 300, 60, N'ค่าแอร์ระยะทาง 101-300 กม.'),
(301, 500, 90, N'ค่าแอร์ระยะทาง 301-500 กม.'),
(501, 9999, 120, N'ค่าแอร์ระยะทาง 500+ กม.');

GO

PRINT '';
PRINT '🎉 เพิ่มข้อมูล Mock ใหม่เสร็จสมบูรณ์!';
PRINT '';
PRINT '📊 สรุปข้อมูล:';
PRINT '   - ผู้ใช้งาน: 2 คน';
PRINT '   - ประเภทรถไฟ: 4 ประเภท';
PRINT '   - สถานี: 13 สถานี';
PRINT '   - ขบวนรถไฟ: 9 ขบวน';
PRINT '   - ตารางเวลา: 9 ขบวน (ครบทุกขบวน)';
PRINT '   - ประเภทตู้โดยสาร: 5 ประเภท';
PRINT '   - ตู้โดยสาร: 7 ตู้';
PRINT '   - การจัดองค์ประกอบ: 9 ขบวน (ครบทุกขบวน)';
PRINT '   - อัตราค่าโดยสาร: 17 ระดับ';
PRINT '';
PRINT '✅ พร้อมใช้งาน!';
