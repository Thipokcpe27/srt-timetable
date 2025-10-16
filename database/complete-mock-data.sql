-- ============================================
-- ข้อมูล Mock แบบสมบูรณ์ - ครบทุกเส้นทาง
-- ============================================

USE RailwayManagement;
GO

-- ลบข้อมูลเก่า
DELETE FROM SearchHistory;
DELETE FROM PopularTrains;
DELETE FROM AuditLogs;
DELETE FROM TrainCompositions;
DELETE FROM TrainSchedules;
DELETE FROM Trains;
DELETE FROM TrainFees;
DELETE FROM Bogies;
DELETE FROM SleeperFees;
DELETE FROM ACFees;
DELETE FROM BogieTypes;
DELETE FROM BaseFares;
DELETE FROM TrainTypes;
DELETE FROM Stations;
DELETE FROM Users;
GO

PRINT '📝 เพิ่มข้อมูล Mock แบบสมบูรณ์...';
GO

-- Users
INSERT INTO Users (UserId, Username, Email, PasswordHash, FirstName, LastName, Role) VALUES
('USR001', 'admin', 'admin@railway.th', '$2b$10$hash', N'Admin', N'System', 'SUPER_ADMIN');

-- TrainTypes
INSERT INTO TrainTypes (TrainTypeId, TypeCode, NameTH, NameEN, BaseMultiplier) VALUES
('TT001', 'SPECIAL_EXPRESS', N'ด่วนพิเศษ', 'Special Express', 1.5),
('TT002', 'EXPRESS', N'ด่วน', 'Express', 1.2),
('TT003', 'RAPID', N'เร็ว', 'Rapid', 1.0),
('TT004', 'ORDINARY', N'ธรรมดา', 'Ordinary', 0.8);

-- Stations (13 สถานี)
INSERT INTO Stations (StationId, StationCode, NameTH, NameEN, City, Region, Facilities) VALUES
('STN001', 'BKK', N'กรุงเทพ (หัวลำโพง)', 'Bangkok', N'กรุงเทพมหานคร', N'กลาง', '["wifi","parking","restaurant","atm","toilet"]'),
('STN002', 'AYA', N'อยุธยา', 'Ayutthaya', N'พระนครศรีอยุธยา', N'กลาง', '["parking","restaurant","toilet"]'),
('STN003', 'LPI', N'ลพบุรี', 'Lopburi', N'ลพบุรี', N'กลาง', '["parking","toilet"]'),
('STN004', 'PKN', N'พิษณุโลก', 'Phitsanulok', N'พิษณุโลก', N'เหนือ', '["wifi","parking","restaurant","toilet"]'),
('STN005', 'LPG', N'ลำปาง', 'Lampang', N'ลำปาง', N'เหนือ', '["parking","restaurant","toilet"]'),
('STN006', 'CNX', N'เชียงใหม่', 'Chiang Mai', N'เชียงใหม่', N'เหนือ', '["wifi","parking","restaurant","atm","toilet"]'),
('STN007', 'KKN', N'ขอนแก่น', 'Khon Kaen', N'ขอนแก่น', N'อีสาน', '["wifi","parking","restaurant","atm","toilet"]'),
('STN008', 'UDN', N'อุดรธานี', 'Udon Thani', N'อุดรธานี', N'อีสาน', '["wifi","parking","restaurant","toilet"]'),
('STN009', 'NMA', N'นครราชสีมา (โคราช)', 'Nakhon Ratchasima', N'นครราชสีมา', N'อีสาน', '["wifi","parking","restaurant","atm","toilet"]'),
('STN010', 'HYI', N'หัวหิน', 'Hua Hin', N'ประจวบคีรีขันธ์', N'ใต้', '["wifi","parking","restaurant","toilet"]'),
('STN011', 'CPN', N'ชุมพร', 'Chumphon', N'ชุมพร', N'ใต้', '["parking","restaurant","toilet"]'),
('STN012', 'SKA', N'สุราษฎร์ธานี', 'Surat Thani', N'สุราษฎร์ธานี', N'ใต้', '["wifi","parking","restaurant","toilet"]'),
('STN013', 'HYA', N'หาดใหญ่', 'Hat Yai', N'สงขลา', N'ใต้', '["wifi","parking","restaurant","atm","toilet"]');

-- Trains (เพิ่มให้ครบทุกเส้นทาง - 15 ขบวน)
INSERT INTO Trains (TrainId, TrainNumber, TrainName, TrainTypeId, OriginStationId, DestinationStationId, TotalDistanceKm, DepartureTime, ArrivalTime, DurationMinutes, OperatingDays, Amenities) VALUES
-- กรุงเทพ - เชียงใหม่ (3 ขบวน)
('TRN001', '1', N'ด่วนพิเศษ 1 กรุงเทพ-เชียงใหม่', 'TT001', 'STN001', 'STN006', 751, '18:00', '07:45', 825, 'MON,TUE,WED,THU,FRI,SAT,SUN', '["wifi","ac","food","sleeper"]'),
('TRN002', '3', N'ด่วนพิเศษ 3 กรุงเทพ-เชียงใหม่', 'TT001', 'STN001', 'STN006', 751, '15:10', '05:30', 860, 'MON,TUE,WED,THU,FRI,SAT,SUN', '["wifi","ac","food","sleeper"]'),
('TRN003', '13', N'ด่วน 13 กรุงเทพ-เชียงใหม่', 'TT002', 'STN001', 'STN006', 751, '08:30', '22:10', 820, 'MON,TUE,WED,THU,FRI,SAT,SUN', '["ac","food"]'),
-- กรุงเทพ - อุดรธานี (3 ขบวน)
('TRN004', '25', N'ด่วนพิเศษ 25 กรุงเทพ-อุดรธานี', 'TT001', 'STN001', 'STN008', 568, '20:30', '07:40', 670, 'MON,TUE,WED,THU,FRI,SAT,SUN', '["wifi","ac","food","sleeper"]'),
('TRN005', '69', N'ด่วน 69 กรุงเทพ-อุดรธานี', 'TT002', 'STN001', 'STN008', 568, '08:00', '17:25', 565, 'MON,TUE,WED,THU,FRI,SAT,SUN', '["ac","food"]'),
('TRN006', '77', N'เร็ว 77 กรุงเทพ-อุดรธานี', 'TT003', 'STN001', 'STN008', 568, '06:20', '19:45', 805, 'MON,TUE,WED,THU,FRI,SAT,SUN', '["ac"]'),
-- กรุงเทพ - หาดใหญ่ (3 ขบวน)
('TRN007', '31', N'ด่วนพิเศษ 31 กรุงเทพ-หาดใหญ่', 'TT001', 'STN001', 'STN013', 945, '14:45', '09:00', 1095, 'MON,TUE,WED,THU,FRI,SAT,SUN', '["wifi","ac","food","sleeper"]'),
('TRN008', '33', N'ด่วนพิเศษ 33 กรุงเทพ-หาดใหญ่', 'TT001', 'STN001', 'STN013', 945, '15:35', '10:05', 1050, 'MON,TUE,WED,THU,FRI,SAT,SUN', '["wifi","ac","food","sleeper"]'),
('TRN009', '83', N'ด่วน 83 กรุงเทพ-หาดใหญ่', 'TT002', 'STN001', 'STN013', 945, '17:35', '10:50', 1035, 'MON,TUE,WED,THU,FRI,SAT,SUN', '["ac","food"]'),
-- กรุงเทพ - นครราชสีมา (3 ขบวน)
('TRN010', '23', N'ด่วน 23 กรุงเทพ-นครราชสีมา', 'TT002', 'STN001', 'STN009', 264, '06:10', '10:35', 265, 'MON,TUE,WED,THU,FRI,SAT,SUN', '["ac","food"]'),
('TRN011', '137', N'เร็ว 137 กรุงเทพ-นครราชสีมา', 'TT003', 'STN001', 'STN009', 264, '12:00', '17:10', 310, 'MON,TUE,WED,THU,FRI,SAT,SUN', '["ac"]'),
('TRN012', '139', N'เร็ว 139 กรุงเทพ-นครราชสีมา', 'TT003', 'STN001', 'STN009', 264, '18:30', '23:50', 320, 'MON,TUE,WED,THU,FRI,SAT,SUN', '["ac"]'),
-- กรุงเทพ - ขอนแก่น (2 ขบวน)
('TRN013', '133', N'เร็ว 133 กรุงเทพ-ขอนแก่น', 'TT003', 'STN001', 'STN007', 445, '07:30', '14:00', 390, 'MON,TUE,WED,THU,FRI,SAT,SUN', '["ac","food"]'),
('TRN014', '135', N'เร็ว 135 กรุงเทพ-ขอนแก่น', 'TT003', 'STN001', 'STN007', 445, '20:00', '03:15', 435, 'MON,TUE,WED,THU,FRI,SAT,SUN', '["ac"]'),
-- กรุงเทพ - หัวหิน (1 ขบวน)
('TRN015', '41', N'ด่วน 41 กรุงเทพ-หัวหิน', 'TT002', 'STN001', 'STN010', 229, '08:05', '12:20', 255, 'MON,TUE,WED,THU,FRI,SAT,SUN', '["ac","food"]');

-- TrainSchedules (ตัวอย่าง 5 ขบวนแรก)
-- TRN001: กรุงเทพ-เชียงใหม่
INSERT INTO TrainSchedules (TrainId, StationId, SequenceNumber, ArrivalTime, DepartureTime, DistanceFromOriginKm) VALUES
('TRN001', 'STN001', 1, NULL, '18:00', 0),
('TRN001', 'STN002', 2, '19:15', '19:25', 71),
('TRN001', 'STN004', 3, '23:55', '00:05', 377),
('TRN001', 'STN005', 4, '03:20', '03:30', 598),
('TRN001', 'STN006', 5, '07:45', NULL, 751);

-- TRN002
INSERT INTO TrainSchedules (TrainId, StationId, SequenceNumber, ArrivalTime, DepartureTime, DistanceFromOriginKm) VALUES
('TRN002', 'STN001', 1, NULL, '15:10', 0),
('TRN002', 'STN002', 2, '16:30', '16:40', 71),
('TRN002', 'STN004', 3, '20:45', '21:00', 377),
('TRN002', 'STN005', 4, '00:15', '00:25', 598),
('TRN002', 'STN006', 5, '05:30', NULL, 751);

-- TRN003
INSERT INTO TrainSchedules (TrainId, StationId, SequenceNumber, ArrivalTime, DepartureTime, DistanceFromOriginKm) VALUES
('TRN003', 'STN001', 1, NULL, '08:30', 0),
('TRN003', 'STN002', 2, '09:45', '09:55', 71),
('TRN003', 'STN003', 3, '11:30', '11:40', 153),
('TRN003', 'STN004', 4, '14:25', '14:40', 377),
('TRN003', 'STN005', 5, '18:50', '19:00', 598),
('TRN003', 'STN006', 6, '22:10', NULL, 751);

-- TRN004: กรุงเทพ-อุดรธานี
INSERT INTO TrainSchedules (TrainId, StationId, SequenceNumber, ArrivalTime, DepartureTime, DistanceFromOriginKm) VALUES
('TRN004', 'STN001', 1, NULL, '20:30', 0),
('TRN004', 'STN002', 2, '21:45', '21:55', 71),
('TRN004', 'STN009', 3, '01:20', '01:35', 264),
('TRN004', 'STN007', 4, '04:50', '05:00', 445),
('TRN004', 'STN008', 5, '07:40', NULL, 568);

-- TRN005
INSERT INTO TrainSchedules (TrainId, StationId, SequenceNumber, ArrivalTime, DepartureTime, DistanceFromOriginKm) VALUES
('TRN005', 'STN001', 1, NULL, '08:00', 0),
('TRN005', 'STN002', 2, '09:15', '09:25', 71),
('TRN005', 'STN009', 3, '12:30', '12:45', 264),
('TRN005', 'STN007', 4, '15:10', '15:20', 445),
('TRN005', 'STN008', 5, '17:25', NULL, 568);

-- BogieTypes
INSERT INTO BogieTypes (BogieTypeId, TypeCode, NameTH, NameEN) VALUES
('BGT001', 'SLEEPER_1', N'ตู้นอนชั้น 1', 'First Class Sleeper'),
('BGT002', 'SLEEPER_2', N'ตู้นอนชั้น 2', 'Second Class Sleeper'),
('BGT003', 'SEAT_1', N'ตู้นั่งชั้น 1', 'First Class Seat'),
('BGT004', 'SEAT_2', N'ตู้นั่งชั้น 2', 'Second Class Seat'),
('BGT005', 'SEAT_3', N'ตู้นั่งชั้น 3', 'Third Class Seat');

-- Bogies
INSERT INTO Bogies (BogieId, BogieCode, BogieName, Abbreviation, BogieTypeId, ClassType, Capacity, Features) VALUES
('BOG001', 'SL1-001', N'ตู้นอนชั้น 1', N'นน.1', 'BGT001', 'FIRST', 10, '["ac","wifi","power","sleeper"]'),
('BOG002', 'SL2-001', N'ตู้นอนชั้น 2', N'นน.2', 'BGT002', 'BUSINESS', 36, '["ac","power","sleeper"]'),
('BOG003', 'ST1-001', N'ตู้นั่งชั้น 1', N'นง.1', 'BGT003', 'FIRST', 40, '["ac","wifi","power"]'),
('BOG004', 'ST2-001', N'ตู้นั่งชั้น 2 แอร์', N'นง.2', 'BGT004', 'BUSINESS', 64, '["ac","power"]'),
('BOG005', 'ST2-002', N'ตู้นั่งชั้น 2 พัดลม', N'นง.2', 'BGT004', 'BUSINESS', 72, '[]'),
('BOG006', 'ST3-001', N'ตู้นั่งชั้น 3', N'นง.3', 'BGT005', 'ECONOMY', 88, '[]');

-- TrainCompositions (ทุกขบวน)
INSERT INTO TrainCompositions (TrainId, BogieId, Position, ClassId, ClassName, TotalSeats, AvailableSeats) VALUES
-- TRN001 (ด่วนพิเศษ - มีตู้นอน)
('TRN001', 'BOG001', 1, 'first', N'ชั้น 1', 10, 10),
('TRN001', 'BOG002', 2, 'business', N'ชั้น 2', 36, 36),
('TRN001', 'BOG004', 3, 'business', N'ชั้น 2 นั่ง', 64, 64),
('TRN001', 'BOG006', 4, 'economy', N'ชั้น 3', 88, 88),
-- TRN002
('TRN002', 'BOG001', 1, 'first', N'ชั้น 1', 10, 8),
('TRN002', 'BOG002', 2, 'business', N'ชั้น 2', 36, 30),
('TRN002', 'BOG004', 3, 'business', N'ชั้น 2 นั่ง', 64, 50),
-- TRN003 (ด่วน - ไม่มีตู้นอน)
('TRN003', 'BOG003', 1, 'first', N'ชั้น 1', 40, 35),
('TRN003', 'BOG004', 2, 'business', N'ชั้น 2', 64, 55),
('TRN003', 'BOG006', 3, 'economy', N'ชั้น 3', 88, 70),
-- TRN004
('TRN004', 'BOG001', 1, 'first', N'ชั้น 1', 10, 10),
('TRN004', 'BOG002', 2, 'business', N'ชั้น 2', 36, 36),
('TRN004', 'BOG006', 3, 'economy', N'ชั้น 3', 88, 88),
-- TRN005
('TRN005', 'BOG004', 1, 'business', N'ชั้น 2', 64, 60),
('TRN005', 'BOG006', 2, 'economy', N'ชั้น 3', 88, 80),
-- TRN006
('TRN006', 'BOG004', 1, 'business', N'ชั้น 2', 64, 55),
('TRN006', 'BOG006', 2, 'economy', N'ชั้น 3', 88, 75),
-- TRN007
('TRN007', 'BOG001', 1, 'first', N'ชั้น 1', 10, 7),
('TRN007', 'BOG002', 2, 'business', N'ชั้น 2', 36, 28),
('TRN007', 'BOG004', 3, 'business', N'ชั้น 2 นั่ง', 64, 50),
-- TRN008
('TRN008', 'BOG001', 1, 'first', N'ชั้น 1', 10, 9),
('TRN008', 'BOG002', 2, 'business', N'ชั้น 2', 36, 32),
('TRN008', 'BOG006', 3, 'economy', N'ชั้น 3', 88, 80),
-- TRN009
('TRN009', 'BOG003', 1, 'first', N'ชั้น 1', 40, 30),
('TRN009', 'BOG004', 2, 'business', N'ชั้น 2', 64, 50),
('TRN009', 'BOG006', 3, 'economy', N'ชั้น 3', 88, 65),
-- TRN010-TRN015 (ระยะสั้น - ไม่มีตู้นอน)
('TRN010', 'BOG004', 1, 'business', N'ชั้น 2', 64, 55),
('TRN010', 'BOG006', 2, 'economy', N'ชั้น 3', 88, 75),
('TRN011', 'BOG005', 1, 'business', N'ชั้น 2', 72, 65),
('TRN011', 'BOG006', 2, 'economy', N'ชั้น 3', 88, 80),
('TRN012', 'BOG005', 1, 'business', N'ชั้น 2', 72, 68),
('TRN012', 'BOG006', 2, 'economy', N'ชั้น 3', 88, 82),
('TRN013', 'BOG004', 1, 'business', N'ชั้น 2', 64, 58),
('TRN013', 'BOG006', 2, 'economy', N'ชั้น 3', 88, 78),
('TRN014', 'BOG005', 1, 'business', N'ชั้น 2', 72, 70),
('TRN014', 'BOG006', 2, 'economy', N'ชั้น 3', 88, 85),
('TRN015', 'BOG003', 1, 'first', N'ชั้น 1', 40, 38),
('TRN015', 'BOG004', 2, 'business', N'ชั้น 2', 64, 60);

-- BaseFares (ละเอียด)
INSERT INTO BaseFares (Kilometer, Class1Rate, Class2Rate, Class3Rate) VALUES
(1, 25, 18, 12), (5, 100, 75, 50), (10, 180, 130, 90), (20, 320, 240, 160),
(50, 700, 550, 380), (75, 1000, 800, 550), (100, 1300, 1000, 700),
(150, 1850, 1450, 1000), (200, 2400, 1900, 1300), (250, 2900, 2300, 1600),
(300, 3400, 2700, 1900), (400, 4300, 3400, 2400), (500, 5200, 4100, 2900),
(600, 6000, 4800, 3400), (700, 6800, 5400, 3800), (800, 7500, 6000, 4200),
(900, 8200, 6500, 4600), (1000, 9000, 7000, 5000);

-- TrainFees
INSERT INTO TrainFees (TrainTypeId, DistanceFromKm, DistanceToKm, FeeAmount) VALUES
('TT001', 1, 100, 100), ('TT001', 101, 300, 150), ('TT001', 301, 500, 200), ('TT001', 501, 9999, 250),
('TT002', 1, 100, 60), ('TT002', 101, 300, 90), ('TT002', 301, 500, 120), ('TT002', 501, 9999, 150),
('TT003', 1, 100, 30), ('TT003', 101, 9999, 50);

-- SleeperFees
INSERT INTO SleeperFees (BogieTypeId, FeeAmount, Description) VALUES
('BGT001', 600, N'ตู้นอนชั้น 1 - ห้องส่วนตัว'),
('BGT002', 350, N'ตู้นอนชั้น 2 - เตียงนอน 2 ชั้น');

-- ACFees
INSERT INTO ACFees (DistanceFromKm, DistanceToKm, FeeAmount, Description) VALUES
(1, 100, 30, N'ค่าแอร์ 1-100 กม.'),
(101, 300, 60, N'ค่าแอร์ 101-300 กม.'),
(301, 500, 90, N'ค่าแอร์ 301-500 กม.'),
(501, 9999, 120, N'ค่าแอร์ 500+ กม.');

GO

PRINT '✅ เพิ่มข้อมูล 15 ขบวนรถไฟสำเร็จ!';
PRINT '   - กรุงเทพ → เชียงใหม่: 3 ขบวน';
PRINT '   - กรุงเทพ → อุดรธานี: 3 ขบวน';
PRINT '   - กรุงเทพ → หาดใหญ่: 3 ขบวน';
PRINT '   - กรุงเทพ → นครราชสีมา: 3 ขบวน';
PRINT '   - กรุงเทพ → ขอนแก่น: 2 ขบวน';
PRINT '   - กรุงเทพ → หัวหิน: 1 ขบวน';
