-- ลบและเพิ่มข้อมูล Mock ใหม่

USE RailwayManagement;
GO

-- ลบข้อมูลเก่า (ตามลำดับ Foreign Key)
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

-- เพิ่มข้อมูลใหม่
-- Users
INSERT INTO Users (UserId, Username, Email, PasswordHash, FirstName, LastName, Role) VALUES
('USR001', 'admin', 'admin@railway.th', '$2b$10$hash', N'Admin', N'System', 'SUPER_ADMIN');

-- TrainTypes
INSERT INTO TrainTypes (TrainTypeId, TypeCode, NameTH, NameEN, BaseMultiplier) VALUES
('TT001', 'SPECIAL_EXPRESS', N'ด่วนพิเศษ', 'Special Express', 1.5),
('TT002', 'EXPRESS', N'ด่วน', 'Express', 1.2),
('TT003', 'RAPID', N'เร็ว', 'Rapid', 1.0);

-- Stations
INSERT INTO Stations (StationId, StationCode, NameTH, NameEN, City, Region) VALUES
('STN001', 'BKK', N'กรุงเทพ', 'Bangkok', N'กรุงเทพมหานคร', N'กลาง'),
('STN002', 'AYA', N'อยุธยา', 'Ayutthaya', N'อยุธยา', N'กลาง'),
('STN003', 'LPI', N'ลพบุรี', 'Lopburi', N'ลพบุรี', N'กลาง'),
('STN004', 'PKN', N'พิษณุโลก', 'Phitsanulok', N'พิษณุโลก', N'เหนือ'),
('STN005', 'LPG', N'ลำปาง', 'Lampang', N'ลำปาง', N'เหนือ'),
('STN006', 'CNX', N'เชียงใหม่', 'Chiang Mai', N'เชียงใหม่', N'เหนือ'),
('STN007', 'KKN', N'ขอนแก่น', 'Khon Kaen', N'ขอนแก่น', N'อีสาน'),
('STN008', 'UDN', N'อุดรธานี', 'Udon Thani', N'อุดรธานี', N'อีสาน'),
('STN009', 'NMA', N'นครราชสีมา', 'Nakhon Ratchasima', N'นครราชสีมา', N'อีสาน'),
('STN010', 'HYI', N'หัวหิน', 'Hua Hin', N'ประจวบคีรีขันธ์', N'ใต้'),
('STN011', 'CPN', N'ชุมพร', 'Chumphon', N'ชุมพร', N'ใต้'),
('STN012', 'SKA', N'สุราษฎร์ธานี', 'Surat Thani', N'สุราษฎร์ธานี', N'ใต้'),
('STN013', 'HYA', N'หาดใหญ่', 'Hat Yai', N'สงขลา', N'ใต้');

-- Trains (เพิ่มตัวอย่าง)
INSERT INTO Trains (TrainId, TrainNumber, TrainName, TrainTypeId, OriginStationId, DestinationStationId, TotalDistanceKm, DepartureTime, ArrivalTime, DurationMinutes, OperatingDays, Amenities) VALUES
('TRN001', '1', N'ด่วนพิเศษ 1 กรุงเทพ-เชียงใหม่', 'TT001', 'STN001', 'STN006', 751, '18:00', '07:45', 825, 'MON,TUE,WED,THU,FRI,SAT,SUN', '["wifi","ac","food","sleeper"]'),
('TRN003', '13', N'ด่วน 13 กรุงเทพ-เชียงใหม่', 'TT002', 'STN001', 'STN006', 751, '08:30', '22:10', 820, 'MON,TUE,WED,THU,FRI,SAT,SUN', '["ac","food"]');

-- TrainSchedules
INSERT INTO TrainSchedules (TrainId, StationId, SequenceNumber, ArrivalTime, DepartureTime, DistanceFromOriginKm) VALUES
('TRN001', 'STN001', 1, NULL, '18:00', 0),
('TRN001', 'STN002', 2, '19:15', '19:25', 71),
('TRN001', 'STN004', 3, '23:55', '00:05', 377),
('TRN001', 'STN005', 4, '03:20', '03:30', 598),
('TRN001', 'STN006', 5, '07:45', NULL, 751);

-- BogieTypes
INSERT INTO BogieTypes (BogieTypeId, TypeCode, NameTH, NameEN) VALUES
('BGT001', 'SLEEPER_1', N'ตู้นอนชั้น 1', 'First Class Sleeper'),
('BGT002', 'SEAT_2', N'ตู้นั่งชั้น 2', 'Second Class Seat'),
('BGT003', 'SEAT_3', N'ตู้นั่งชั้น 3', 'Third Class Seat');

-- Bogies
INSERT INTO Bogies (BogieId, BogieCode, BogieName, Abbreviation, BogieTypeId, ClassType, Capacity) VALUES
('BOG001', 'SL1-001', N'ตู้นอนชั้น 1', N'นน.1', 'BGT001', 'FIRST', 10),
('BOG002', 'ST2-001', N'ตู้นั่งชั้น 2', N'นง.2', 'BGT002', 'BUSINESS', 64),
('BOG003', 'ST3-001', N'ตู้นั่งชั้น 3', N'นง.3', 'BGT003', 'ECONOMY', 88);

-- TrainCompositions
INSERT INTO TrainCompositions (TrainId, BogieId, Position, ClassId, ClassName, TotalSeats, AvailableSeats) VALUES
('TRN001', 'BOG001', 1, 'first', N'ชั้น 1', 10, 10),
('TRN001', 'BOG002', 2, 'business', N'ชั้น 2', 64, 64),
('TRN001', 'BOG003', 3, 'economy', N'ชั้น 3', 88, 88);

-- BaseFares
INSERT INTO BaseFares (Kilometer, Class1Rate, Class2Rate, Class3Rate) VALUES
(1, 25, 18, 12),
(50, 700, 550, 380),
(100, 1300, 1000, 700),
(200, 2400, 1900, 1300),
(500, 5200, 4100, 2900),
(1000, 9000, 7000, 5000);

-- TrainFees
INSERT INTO TrainFees (TrainTypeId, DistanceFromKm, DistanceToKm, FeeAmount) VALUES
('TT001', 1, 100, 100),
('TT001', 101, 999, 150),
('TT002', 1, 100, 60),
('TT002', 101, 999, 90);

-- SleeperFees
INSERT INTO SleeperFees (BogieTypeId, FeeAmount, Description) VALUES
('BGT001', 600, N'ตู้นอนชั้น 1');

-- ACFees
INSERT INTO ACFees (DistanceFromKm, DistanceToKm, FeeAmount, Description) VALUES
(1, 300, 60, N'ค่าแอร์ 1-300 กม.'),
(301, 9999, 120, N'ค่าแอร์ 300+ กม.');

GO
PRINT 'Done!';
