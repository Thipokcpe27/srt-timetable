-- ============================================
-- SRT Timetable - Complete Database Schema
-- Database: Microsoft SQL Server 2019+
-- Version: 1.0
-- Date: 2025-01-08
-- Total Tables: 22
-- ============================================

-- Enable case-insensitive collation for Thai language
-- Default collation: Thai_CI_AS (Case Insensitive, Accent Sensitive)

USE master;
GO

-- Create database (if not exists)
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'SRTTimetable')
BEGIN
    CREATE DATABASE SRTTimetable
    COLLATE Thai_CI_AS;
END
GO

USE SRTTimetable;
GO

-- ============================================
-- SECTION 1: CORE TABLES (8 tables)
-- ============================================

-- --------------------------------------------
-- 1. STATIONS TABLE (สถานี)
-- Multi-language support (TH/EN/CN)
-- --------------------------------------------
IF OBJECT_ID('stations', 'U') IS NOT NULL DROP TABLE stations;
GO

CREATE TABLE stations (
    id INT IDENTITY(1,1) PRIMARY KEY,
    station_code INT NOT NULL UNIQUE,
    
    -- Multi-language codes
    code_th NVARCHAR(10) NOT NULL,
    code_en NVARCHAR(10) NOT NULL,
    code_cn NVARCHAR(10),
    
    -- Multi-language names
    name_th NVARCHAR(255) NOT NULL,
    name_en NVARCHAR(255) NOT NULL,
    name_cn NVARCHAR(255),
    
    -- Full display names
    display_name_th NVARCHAR(255),
    display_name_en NVARCHAR(255),
    display_name_cn NVARCHAR(255),
    
    -- Distance calculations
    distance_for_pricing DECIMAL(10, 4) DEFAULT 0,
    distance_actual DECIMAL(10, 4) DEFAULT 0,
    
    -- Station classification
    station_class NVARCHAR(20), -- 'special', '1', '2', '3'
    
    -- Location
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    address NVARCHAR(MAX),
    phone NVARCHAR(20),
    
    -- Facilities (stored as JSON)
    facilities NVARCHAR(MAX), -- JSON array: ["ATM", "Wi-Fi"]
    
    -- Images
    image_url NVARCHAR(500),
    images NVARCHAR(MAX), -- JSON array
    
    -- Status
    is_active BIT DEFAULT 1,
    notes NVARCHAR(MAX),
    
    -- Metadata
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    created_by UNIQUEIDENTIFIER,
    updated_by UNIQUEIDENTIFIER
);
GO

-- Indexes for stations
CREATE INDEX idx_stations_code_th ON stations(code_th);
CREATE INDEX idx_stations_code_en ON stations(code_en);
CREATE INDEX idx_stations_station_code ON stations(station_code);
CREATE INDEX idx_stations_class ON stations(station_class);
CREATE INDEX idx_stations_active ON stations(is_active);
-- Full-text index for Thai search (optional)
-- CREATE FULLTEXT INDEX ON stations(name_th) KEY INDEX PK_stations;
GO

-- --------------------------------------------
-- 2. TRAIN_TYPES TABLE (ประเภทรถ)
-- --------------------------------------------
IF OBJECT_ID('train_types', 'U') IS NOT NULL DROP TABLE train_types;
GO

CREATE TABLE train_types (
    id INT IDENTITY(1,1) PRIMARY KEY,
    code NVARCHAR(50) NOT NULL UNIQUE,
    
    -- Multi-language
    name_th NVARCHAR(100) NOT NULL,
    name_en NVARCHAR(100),
    name_cn NVARCHAR(100),
    
    -- Pricing
    base_fare DECIMAL(10, 2) DEFAULT 0,
    
    -- Display
    sort_order INT DEFAULT 0,
    color NVARCHAR(7), -- HEX color
    
    -- Status
    is_active BIT DEFAULT 1,
    
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

CREATE INDEX idx_train_types_code ON train_types(code);
CREATE INDEX idx_train_types_sort ON train_types(sort_order);
GO

-- Seed data
INSERT INTO train_types (code, name_th, name_en, name_cn, base_fare, sort_order, color) VALUES
(N'express_special', N'ด่วนพิเศษ', N'Special Express', N'特快', 170, 1, N'#FF6B6B'),
(N'express_special_cnr', N'ด่วนพิเศษ (CNR)', N'Special Express (CNR)', N'特快 (CNR)', 190, 2, N'#FF5252'),
(N'express', N'ด่วน', N'Express', N'快车', 150, 3, N'#4ECDC4'),
(N'rapid', N'เร็ว', N'Rapid', N'快速', 20, 4, N'#95E1D3'),
(N'ordinary', N'ธรรมดา', N'Ordinary', N'普通', 0, 5, N'#A8E6CF'),
(N'local', N'ท้องถิ่น', N'Local', N'本地', 0, 6, N'#C7CEEA'),
(N'commuter', N'ชานเมือง', N'Commuter', N'市郊', 0, 7, N'#B8B8FF'),
(N'special_commuter', N'พิเศษชานเมือง', N'Special Commuter', N'特殊市郊', 0, 8, N'#9B9BFF');
GO

-- --------------------------------------------
-- 3. TRAINS TABLE (ขบวนรถ)
-- --------------------------------------------
IF OBJECT_ID('trains', 'U') IS NOT NULL DROP TABLE trains;
GO

CREATE TABLE trains (
    id INT IDENTITY(1,1) PRIMARY KEY,
    train_number NVARCHAR(20) NOT NULL UNIQUE,
    
    -- Multi-language
    train_name_th NVARCHAR(255),
    train_name_en NVARCHAR(255),
    train_name_cn NVARCHAR(255),
    
    -- Type
    train_type_id INT,
    FOREIGN KEY (train_type_id) REFERENCES train_types(id),
    
    -- Route
    origin_station_id INT,
    destination_station_id INT,
    FOREIGN KEY (origin_station_id) REFERENCES stations(id),
    FOREIGN KEY (destination_station_id) REFERENCES stations(id),
    
    -- Schedule (TIME type in SQL Server)
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    
    -- Duration (stored as minutes)
    duration_minutes INT,
    
    -- Operating days (stored as comma-separated: 'daily' or 'monday,tuesday')
    operating_days NVARCHAR(200) DEFAULT N'daily',
    
    -- Additional info
    running_order INT,
    service_zone NVARCHAR(100),
    total_distance_km DECIMAL(10, 2),
    
    -- Status
    is_active BIT DEFAULT 1,
    notes NVARCHAR(MAX),
    
    -- Metadata
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    created_by UNIQUEIDENTIFIER,
    updated_by UNIQUEIDENTIFIER
);
GO

-- Indexes
CREATE INDEX idx_trains_number ON trains(train_number);
CREATE INDEX idx_trains_type ON trains(train_type_id);
CREATE INDEX idx_trains_origin ON trains(origin_station_id);
CREATE INDEX idx_trains_destination ON trains(destination_station_id);
CREATE INDEX idx_trains_active ON trains(is_active);
CREATE INDEX idx_trains_departure ON trains(departure_time);
GO

-- --------------------------------------------
-- 4. TRAIN_STOPS TABLE (สถานีจอด)
-- --------------------------------------------
IF OBJECT_ID('train_stops', 'U') IS NOT NULL DROP TABLE train_stops;
GO

CREATE TABLE train_stops (
    id INT IDENTITY(1,1) PRIMARY KEY,
    train_id INT NOT NULL,
    station_id INT NOT NULL,
    FOREIGN KEY (train_id) REFERENCES trains(id) ON DELETE CASCADE,
    FOREIGN KEY (station_id) REFERENCES stations(id),
    
    -- Sequence
    stop_order INT NOT NULL,
    
    -- Times
    arrival_time TIME,
    departure_time TIME,
    
    -- Stop type
    stop_type NVARCHAR(10) DEFAULT N'stop', -- 'stop' or 'pass'
    
    -- Platform
    platform NVARCHAR(10),
    
    -- Distance from origin
    distance_from_origin_km DECIMAL(10, 4) DEFAULT 0,
    duration_from_origin_minutes INT,
    
    -- Notes
    notes NVARCHAR(MAX),
    
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    
    CONSTRAINT UQ_train_stops_order UNIQUE(train_id, stop_order),
    CONSTRAINT UQ_train_stops_station UNIQUE(train_id, station_id)
);
GO

-- Indexes
CREATE INDEX idx_train_stops_train ON train_stops(train_id);
CREATE INDEX idx_train_stops_station ON train_stops(station_id);
CREATE INDEX idx_train_stops_order ON train_stops(train_id, stop_order);
GO

-- --------------------------------------------
-- 5. BOGIES TABLE (โบกี้/ตู้โดยสาร)
-- --------------------------------------------
IF OBJECT_ID('bogies', 'U') IS NOT NULL DROP TABLE bogies;
GO

CREATE TABLE bogies (
    id INT IDENTITY(1,1) PRIMARY KEY,
    bogie_code NVARCHAR(10) NOT NULL UNIQUE,
    
    -- Multi-language
    bogie_name_th NVARCHAR(255) NOT NULL,
    bogie_name_en NVARCHAR(255),
    bogie_name_cn NVARCHAR(255),
    
    -- Short name
    bogie_short_name_th NVARCHAR(50),
    bogie_short_name_en NVARCHAR(50),
    
    -- Class
    class INT NOT NULL, -- 1, 2, 3
    
    -- Seating
    seat_count INT NOT NULL,
    seat_type NVARCHAR(50), -- 'sitting', 'sleeper', 'mixed'
    
    -- Features
    description NVARCHAR(MAX),
    has_aircon BIT DEFAULT 0,
    is_sleeper BIT DEFAULT 0,
    
    -- Amenities (JSON)
    amenities NVARCHAR(MAX),
    
    -- Images
    image_url NVARCHAR(500),
    images NVARCHAR(MAX),
    
    -- Status
    is_active BIT DEFAULT 1,
    
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

-- Indexes
CREATE INDEX idx_bogies_code ON bogies(bogie_code);
CREATE INDEX idx_bogies_class ON bogies(class);
CREATE INDEX idx_bogies_active ON bogies(is_active);
GO

-- Seed data
INSERT INTO bogies (bogie_code, bogie_name_th, bogie_name_en, bogie_short_name_th, class, seat_count, has_aircon, is_sleeper) VALUES
(N'01', N'รถปรับอากาศนั่งและนอนชั้นที่ 1', N'First Class AC Sleeper', N'บนอ.ป.', 1, 20, 1, 1),
(N'02', N'รถปรับอากาศนั่งและนอนชั้นที่ 2 (40 N)', N'Second Class AC Sleeper (40N)', N'บนท.ป.', 2, 40, 1, 1),
(N'03', N'รถนั่งชั้น 3', N'Third Class Seat', N'น.3', 3, 80, 0, 0),
(N'04', N'รถนั่งชั้น 2 ปรับอากาศ', N'Second Class AC Seat', N'น.2 ป.', 2, 60, 1, 0),
(N'05', N'รถนั่งชั้น 1 ปรับอากาศ', N'First Class AC Seat', N'น.1 ป.', 1, 40, 1, 0);
GO

-- --------------------------------------------
-- 6. TRAIN_COMPOSITIONS TABLE (รถพ่วง)
-- --------------------------------------------
IF OBJECT_ID('train_compositions', 'U') IS NOT NULL DROP TABLE train_compositions;
GO

CREATE TABLE train_compositions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    train_id INT NOT NULL,
    bogie_id INT NOT NULL,
    FOREIGN KEY (train_id) REFERENCES trains(id) ON DELETE CASCADE,
    FOREIGN KEY (bogie_id) REFERENCES bogies(id),
    
    -- Position in train
    position INT NOT NULL,
    
    -- Quantity
    quantity INT DEFAULT 1,
    
    -- Notes
    notes NVARCHAR(MAX),
    
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    
    CONSTRAINT UQ_train_compositions_position UNIQUE(train_id, position)
);
GO

-- Indexes
CREATE INDEX idx_train_compositions_train ON train_compositions(train_id);
CREATE INDEX idx_train_compositions_bogie ON train_compositions(bogie_id);
GO

-- --------------------------------------------
-- 7. ROUTE_DISTANCES TABLE (ระยะทาง pre-calculated)
-- --------------------------------------------
IF OBJECT_ID('route_distances', 'U') IS NOT NULL DROP TABLE route_distances;
GO

CREATE TABLE route_distances (
    id INT IDENTITY(1,1) PRIMARY KEY,
    train_id INT NOT NULL,
    from_station_id INT NOT NULL,
    to_station_id INT NOT NULL,
    FOREIGN KEY (train_id) REFERENCES trains(id) ON DELETE CASCADE,
    FOREIGN KEY (from_station_id) REFERENCES stations(id),
    FOREIGN KEY (to_station_id) REFERENCES stations(id),
    
    -- Distance
    distance_km DECIMAL(10, 4) NOT NULL,
    
    -- Duration (minutes)
    duration_minutes INT,
    
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    
    CONSTRAINT UQ_route_distances UNIQUE(train_id, from_station_id, to_station_id)
);
GO

-- Indexes
CREATE INDEX idx_route_distances_train ON route_distances(train_id);
CREATE INDEX idx_route_distances_stations ON route_distances(train_id, from_station_id, to_station_id);
CREATE INDEX idx_route_distances_from ON route_distances(from_station_id);
CREATE INDEX idx_route_distances_to ON route_distances(to_station_id);
GO

-- --------------------------------------------
-- 8. ANNOUNCEMENTS TABLE (ประกาศ)
-- --------------------------------------------
IF OBJECT_ID('announcements', 'U') IS NOT NULL DROP TABLE announcements;
GO

CREATE TABLE announcements (
    id INT IDENTITY(1,1) PRIMARY KEY,
    
    -- Optional: specific train
    train_id INT,
    FOREIGN KEY (train_id) REFERENCES trains(id) ON DELETE CASCADE,
    
    -- Multi-language
    title_th NVARCHAR(255) NOT NULL,
    title_en NVARCHAR(255),
    title_cn NVARCHAR(255),
    
    message_th NVARCHAR(MAX) NOT NULL,
    message_en NVARCHAR(MAX),
    message_cn NVARCHAR(MAX),
    
    -- Priority
    priority NVARCHAR(20) DEFAULT N'medium',
    
    -- Schedule
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- Display settings
    show_on_homepage BIT DEFAULT 0,
    show_in_search BIT DEFAULT 1,
    
    -- Status
    is_active BIT DEFAULT 1,
    
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    created_by UNIQUEIDENTIFIER
);
GO

-- Indexes
CREATE INDEX idx_announcements_train ON announcements(train_id);
CREATE INDEX idx_announcements_dates ON announcements(start_date, end_date);
CREATE INDEX idx_announcements_priority ON announcements(priority);
CREATE INDEX idx_announcements_active ON announcements(is_active);
GO

-- ============================================
-- SECTION 2: PRICING TABLES (9 tables)
-- ============================================

-- --------------------------------------------
-- 9. TRAIN_FARES TABLE (ค่าธรรมเนียมขบวนรถ)
-- --------------------------------------------
IF OBJECT_ID('train_fares', 'U') IS NOT NULL DROP TABLE train_fares;
GO

CREATE TABLE train_fares (
    id INT IDENTITY(1,1) PRIMARY KEY,
    train_type_id INT,
    FOREIGN KEY (train_type_id) REFERENCES train_types(id),
    
    -- Distance range
    distance_from INT NOT NULL,
    distance_to INT NOT NULL,
    
    -- Fare
    fare DECIMAL(10, 2) NOT NULL,
    
    -- Effective date
    effective_date DATE DEFAULT CAST(GETDATE() AS DATE),
    expiry_date DATE,
    
    -- Notes
    notes NVARCHAR(MAX),
    
    -- Status
    is_active BIT DEFAULT 1,
    
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    
    CONSTRAINT CHK_train_fares_distance CHECK (distance_to >= distance_from)
);
GO

-- Indexes
CREATE INDEX idx_train_fares_type ON train_fares(train_type_id);
CREATE INDEX idx_train_fares_distance ON train_fares(train_type_id, distance_from, distance_to);
CREATE INDEX idx_train_fares_active ON train_fares(is_active);
GO

-- Seed data
INSERT INTO train_fares (train_type_id, distance_from, distance_to, fare) VALUES
-- ธรรมดา
((SELECT id FROM train_types WHERE code = N'ordinary'), 0, 9999, 0),
-- ชานเมือง
((SELECT id FROM train_types WHERE code = N'commuter'), 0, 9999, 0),
-- เร็ว
((SELECT id FROM train_types WHERE code = N'rapid'), 1, 50, 20),
((SELECT id FROM train_types WHERE code = N'rapid'), 51, 150, 30),
((SELECT id FROM train_types WHERE code = N'rapid'), 151, 300, 50),
((SELECT id FROM train_types WHERE code = N'rapid'), 301, 9999, 110),
-- ด่วน
((SELECT id FROM train_types WHERE code = N'express'), 0, 9999, 150),
-- ด่วนพิเศษ
((SELECT id FROM train_types WHERE code = N'express_special'), 0, 9999, 170),
-- ด่วนพิเศษ (CNR)
((SELECT id FROM train_types WHERE code = N'express_special_cnr'), 0, 9999, 190);
GO

-- --------------------------------------------
-- 10. DISTANCE_FARES TABLE (ราคาตามระยะทาง - Per KM)
-- --------------------------------------------
IF OBJECT_ID('distance_fares', 'U') IS NOT NULL DROP TABLE distance_fares;
GO

CREATE TABLE distance_fares (
    id INT IDENTITY(1,1) PRIMARY KEY,
    distance_km INT NOT NULL,
    class INT NOT NULL,
    
    -- Fare
    fare DECIMAL(10, 2) NOT NULL,
    
    -- Effective date
    effective_date DATE DEFAULT CAST(GETDATE() AS DATE),
    expiry_date DATE,
    
    is_active BIT DEFAULT 1,
    
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    
    CONSTRAINT UQ_distance_fares UNIQUE(distance_km, class, effective_date)
);
GO

-- Indexes
CREATE INDEX idx_distance_fares_km ON distance_fares(distance_km);
CREATE INDEX idx_distance_fares_class ON distance_fares(class);
CREATE INDEX idx_distance_fares_active ON distance_fares(is_active);
GO

-- --------------------------------------------
-- 11. DISTANCE_FARE_RANGES TABLE (ช่วงราคา - RECOMMENDED)
-- --------------------------------------------
IF OBJECT_ID('distance_fare_ranges', 'U') IS NOT NULL DROP TABLE distance_fare_ranges;
GO

CREATE TABLE distance_fare_ranges (
    id INT IDENTITY(1,1) PRIMARY KEY,
    class INT NOT NULL,
    
    -- Distance range
    distance_from INT NOT NULL,
    distance_to INT NOT NULL,
    
    -- Pricing
    fare_per_km DECIMAL(10, 4) NOT NULL,
    minimum_fare DECIMAL(10, 2) DEFAULT 0,
    
    -- Or flat rate
    flat_rate DECIMAL(10, 2),
    
    -- Effective date
    effective_date DATE DEFAULT CAST(GETDATE() AS DATE),
    expiry_date DATE,
    
    is_active BIT DEFAULT 1,
    
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    
    CONSTRAINT CHK_distance_fare_ranges CHECK (distance_to >= distance_from)
);
GO

-- Indexes
CREATE INDEX idx_distance_fare_ranges_class ON distance_fare_ranges(class);
CREATE INDEX idx_distance_fare_ranges_distance ON distance_fare_ranges(class, distance_from, distance_to);
CREATE INDEX idx_distance_fare_ranges_active ON distance_fare_ranges(is_active);
GO

-- Seed data
INSERT INTO distance_fare_ranges (class, distance_from, distance_to, fare_per_km, minimum_fare) VALUES
-- Class 1
(1, 1, 10, 6.00, 6),
(1, 11, 50, 6.50, 60),
(1, 51, 100, 7.00, 300),
(1, 101, 200, 7.50, 700),
(1, 201, 9999, 8.00, 1500),
-- Class 2
(2, 1, 10, 4.00, 4),
(2, 11, 50, 4.50, 40),
(2, 51, 100, 5.00, 200),
(2, 101, 200, 5.50, 500),
(2, 201, 9999, 6.00, 1000),
-- Class 3
(3, 1, 10, 2.00, 2),
(3, 11, 50, 2.50, 20),
(3, 51, 100, 3.00, 100),
(3, 101, 200, 3.50, 300),
(3, 201, 9999, 4.00, 600);
GO

-- --------------------------------------------
-- 12. FARE_FORMULAS TABLE (สูตรคำนวณ)
-- --------------------------------------------
IF OBJECT_ID('fare_formulas', 'U') IS NOT NULL DROP TABLE fare_formulas;
GO

CREATE TABLE fare_formulas (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    class INT NOT NULL,
    
    -- Distance range
    distance_from INT NOT NULL,
    distance_to INT NOT NULL,
    
    -- Formula components
    base_fare DECIMAL(10, 2) DEFAULT 0,
    rate_per_km DECIMAL(10, 4) DEFAULT 0,
    
    -- Progressive rate
    progressive_rate BIT DEFAULT 0,
    rate_change_at INT,
    rate_after_change DECIMAL(10, 4),
    
    -- Multiplier
    rate_multiplier DECIMAL(10, 4) DEFAULT 1.0,
    
    -- Rounding
    round_to DECIMAL(10, 2) DEFAULT 1.00,
    
    -- Effective date
    effective_date DATE DEFAULT CAST(GETDATE() AS DATE),
    expiry_date DATE,
    
    is_active BIT DEFAULT 1,
    
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

-- Indexes
CREATE INDEX idx_fare_formulas_class ON fare_formulas(class);
CREATE INDEX idx_fare_formulas_distance ON fare_formulas(distance_from, distance_to);
GO

-- --------------------------------------------
-- 13. AC_FARE_CATEGORIES TABLE (หมวดค่าแอร์)
-- --------------------------------------------
IF OBJECT_ID('ac_fare_categories', 'U') IS NOT NULL DROP TABLE ac_fare_categories;
GO

CREATE TABLE ac_fare_categories (
    id INT IDENTITY(1,1) PRIMARY KEY,
    category_code NVARCHAR(20) NOT NULL UNIQUE,
    
    -- Multi-language
    name_th NVARCHAR(255) NOT NULL,
    name_en NVARCHAR(255),
    name_cn NVARCHAR(255),
    
    -- Classification
    class INT,
    has_meal BIT DEFAULT 0,
    is_sleeper BIT DEFAULT 0,
    
    -- Description
    description NVARCHAR(MAX),
    
    is_active BIT DEFAULT 1,
    
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

-- Indexes
CREATE INDEX idx_ac_fare_categories_code ON ac_fare_categories(category_code);
CREATE INDEX idx_ac_fare_categories_class ON ac_fare_categories(class);
GO

-- Seed data
INSERT INTO ac_fare_categories (category_code, name_th, name_en, class, has_meal, is_sleeper) VALUES
(N'AC_3', N'รถนั่งชั้น 3', N'Third Class AC', 3, 0, 0),
(N'AC_2', N'รถนั่งชั้น 2', N'Second Class AC', 2, 0, 0),
(N'AC_2_MEAL', N'รถนั่งชั้น 2 มีบริการอาหาร', N'Second Class AC with Meal', 2, 1, 0),
(N'AC_1_2_SLEEP', N'ชั้น 1 & 2 รถนั่งและนอน', N'First & Second Class Sleeper', 1, 0, 1),
(N'AC_1_2_SLEEP_V2', N'ชั้น 1 & 2 รถนั่งและนอน (รุ่นใหม่)', N'First & Second Class Sleeper (New)', 1, 0, 1);
GO

-- --------------------------------------------
-- 14. AC_FARES TABLE (ค่าแอร์)
-- --------------------------------------------
IF OBJECT_ID('ac_fares', 'U') IS NOT NULL DROP TABLE ac_fares;
GO

CREATE TABLE ac_fares (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ac_category_id INT,
    FOREIGN KEY (ac_category_id) REFERENCES ac_fare_categories(id),
    
    -- Distance range
    distance_from INT NOT NULL,
    distance_to INT NOT NULL,
    
    -- Fare
    fare DECIMAL(10, 2) NOT NULL,
    
    -- Effective date
    effective_date DATE DEFAULT CAST(GETDATE() AS DATE),
    expiry_date DATE,
    
    is_active BIT DEFAULT 1,
    
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    
    CONSTRAINT CHK_ac_fares_distance CHECK (distance_to >= distance_from)
);
GO

-- Indexes
CREATE INDEX idx_ac_fares_category ON ac_fares(ac_category_id);
CREATE INDEX idx_ac_fares_distance ON ac_fares(ac_category_id, distance_from, distance_to);
CREATE INDEX idx_ac_fares_active ON ac_fares(is_active);
GO

-- Seed data
INSERT INTO ac_fares (ac_category_id, distance_from, distance_to, fare) VALUES
-- AC_3
((SELECT id FROM ac_fare_categories WHERE category_code = N'AC_3'), 1, 300, 60),
((SELECT id FROM ac_fare_categories WHERE category_code = N'AC_3'), 301, 500, 70),
((SELECT id FROM ac_fare_categories WHERE category_code = N'AC_3'), 501, 9999, 100),
-- AC_2
((SELECT id FROM ac_fare_categories WHERE category_code = N'AC_2'), 1, 300, 60),
((SELECT id FROM ac_fare_categories WHERE category_code = N'AC_2'), 301, 500, 70),
((SELECT id FROM ac_fare_categories WHERE category_code = N'AC_2'), 501, 9999, 110),
-- AC_2_MEAL
((SELECT id FROM ac_fare_categories WHERE category_code = N'AC_2_MEAL'), 1, 300, 140),
((SELECT id FROM ac_fare_categories WHERE category_code = N'AC_2_MEAL'), 301, 500, 150),
((SELECT id FROM ac_fare_categories WHERE category_code = N'AC_2_MEAL'), 501, 9999, 190),
-- AC_1_2_SLEEP
((SELECT id FROM ac_fare_categories WHERE category_code = N'AC_1_2_SLEEP'), 1, 300, 130),
((SELECT id FROM ac_fare_categories WHERE category_code = N'AC_1_2_SLEEP'), 301, 500, 150),
((SELECT id FROM ac_fare_categories WHERE category_code = N'AC_1_2_SLEEP'), 501, 9999, 170),
-- AC_1_2_SLEEP_V2
((SELECT id FROM ac_fare_categories WHERE category_code = N'AC_1_2_SLEEP_V2'), 1, 300, 150),
((SELECT id FROM ac_fare_categories WHERE category_code = N'AC_1_2_SLEEP_V2'), 301, 500, 180),
((SELECT id FROM ac_fare_categories WHERE category_code = N'AC_1_2_SLEEP_V2'), 501, 9999, 210);
GO

-- --------------------------------------------
-- 15. BOGIE_AC_FARES TABLE (เชื่อมโยง)
-- --------------------------------------------
IF OBJECT_ID('bogie_ac_fares', 'U') IS NOT NULL DROP TABLE bogie_ac_fares;
GO

CREATE TABLE bogie_ac_fares (
    bogie_id INT NOT NULL,
    ac_category_id INT NOT NULL,
    FOREIGN KEY (bogie_id) REFERENCES bogies(id) ON DELETE CASCADE,
    FOREIGN KEY (ac_category_id) REFERENCES ac_fare_categories(id),
    
    PRIMARY KEY (bogie_id, ac_category_id)
);
GO

-- Indexes
CREATE INDEX idx_bogie_ac_fares_bogie ON bogie_ac_fares(bogie_id);
CREATE INDEX idx_bogie_ac_fares_category ON bogie_ac_fares(ac_category_id);
GO

-- --------------------------------------------
-- 16. BERTH_FARES TABLE (ค่าเตียงนอน)
-- --------------------------------------------
IF OBJECT_ID('berth_fares', 'U') IS NOT NULL DROP TABLE berth_fares;
GO

CREATE TABLE berth_fares (
    id INT IDENTITY(1,1) PRIMARY KEY,
    bogie_id INT,
    FOREIGN KEY (bogie_id) REFERENCES bogies(id) ON DELETE CASCADE,
    
    -- Berth type
    berth_type NVARCHAR(20) NOT NULL,
    
    -- Multi-language
    berth_name_th NVARCHAR(100),
    berth_name_en NVARCHAR(100),
    berth_name_cn NVARCHAR(100),
    
    -- Fare
    fare DECIMAL(10, 2) NOT NULL,
    
    -- Effective date
    effective_date DATE DEFAULT CAST(GETDATE() AS DATE),
    expiry_date DATE,
    
    is_active BIT DEFAULT 1,
    
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

-- Indexes
CREATE INDEX idx_berth_fares_bogie ON berth_fares(bogie_id);
CREATE INDEX idx_berth_fares_type ON berth_fares(berth_type);
CREATE INDEX idx_berth_fares_active ON berth_fares(is_active);
GO

-- Seed data
INSERT INTO berth_fares (bogie_id, berth_type, berth_name_th, berth_name_en, fare) VALUES
((SELECT id FROM bogies WHERE bogie_code = N'01'), N'upper', N'เตียงบน', N'Upper Berth', 300),
((SELECT id FROM bogies WHERE bogie_code = N'01'), N'lower', N'เตียงล่าง', N'Lower Berth', 500),
((SELECT id FROM bogies WHERE bogie_code = N'01'), N'room', N'เหมาห้อง', N'Private Room', 1000),
((SELECT id FROM bogies WHERE bogie_code = N'02'), N'upper', N'เตียงบน', N'Upper Berth', 250),
((SELECT id FROM bogies WHERE bogie_code = N'02'), N'lower', N'เตียงล่าง', N'Lower Berth', 400);
GO

-- --------------------------------------------
-- 17. PRICE_ADJUSTMENTS TABLE (ปรับราคาพิเศษ)
-- --------------------------------------------
IF OBJECT_ID('price_adjustments', 'U') IS NOT NULL DROP TABLE price_adjustments;
GO

CREATE TABLE price_adjustments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    
    -- Apply to
    train_id INT,
    train_type_id INT,
    FOREIGN KEY (train_id) REFERENCES trains(id) ON DELETE CASCADE,
    FOREIGN KEY (train_type_id) REFERENCES train_types(id),
    
    -- Adjustment
    adjustment_type NVARCHAR(20) NOT NULL,
    adjustment_value DECIMAL(10, 2) NOT NULL,
    
    -- Schedule
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- Apply to (CSV)
    apply_to NVARCHAR(200),
    
    -- Priority
    priority INT DEFAULT 0,
    
    is_active BIT DEFAULT 1,
    
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

-- Indexes
CREATE INDEX idx_price_adjustments_train ON price_adjustments(train_id);
CREATE INDEX idx_price_adjustments_dates ON price_adjustments(start_date, end_date);
CREATE INDEX idx_price_adjustments_active ON price_adjustments(is_active);
GO

-- ============================================
-- SECTION 3: SUPPORT TABLES (5 tables)
-- ============================================

-- --------------------------------------------
-- 18. AMENITIES TABLE (สิ่งอำนวยความสะดวก)
-- --------------------------------------------
IF OBJECT_ID('amenities', 'U') IS NOT NULL DROP TABLE amenities;
GO

CREATE TABLE amenities (
    id INT IDENTITY(1,1) PRIMARY KEY,
    code NVARCHAR(20) NOT NULL UNIQUE,
    
    -- Multi-language
    name_th NVARCHAR(100) NOT NULL,
    name_en NVARCHAR(100),
    name_cn NVARCHAR(100),
    
    -- Display
    icon NVARCHAR(10),
    category NVARCHAR(50),
    
    -- Sorting
    sort_order INT DEFAULT 0,
    
    is_active BIT DEFAULT 1,
    
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

-- Indexes
CREATE INDEX idx_amenities_code ON amenities(code);
CREATE INDEX idx_amenities_category ON amenities(category);
CREATE INDEX idx_amenities_sort ON amenities(sort_order);
GO

-- Seed data
INSERT INTO amenities (code, name_th, name_en, name_cn, icon, category, sort_order) VALUES
(N'wifi', N'Wi-Fi ฟรี', N'Free Wi-Fi', N'免费WiFi', N'📶', N'connectivity', 1),
(N'power', N'ปลั๊กไฟ', N'Power Outlet', N'电源插座', N'🔌', N'connectivity', 2),
(N'ac', N'เครื่องปรับอากาศ', N'Air Conditioning', N'空调', N'❄️', N'comfort', 3),
(N'dining', N'รถเสบียง', N'Dining Car', N'餐车', N'🍽️', N'dining', 4),
(N'accessible', N'เข้าถึงได้สำหรับผู้พิการ', N'Wheelchair Accessible', N'无障碍设施', N'♿', N'accessibility', 5),
(N'luggage', N'ที่เก็บกระเป๋า', N'Luggage Storage', N'行李存放', N'🧳', N'comfort', 6),
(N'toilet', N'ห้องน้ำ', N'Restroom', N'洗手间', N'🚻', N'comfort', 7),
(N'sleeper', N'ที่นอน', N'Sleeper Berth', N'卧铺', N'🛏️', N'comfort', 8);
GO

-- --------------------------------------------
-- 19. BOGIE_AMENITIES TABLE
-- --------------------------------------------
IF OBJECT_ID('bogie_amenities', 'U') IS NOT NULL DROP TABLE bogie_amenities;
GO

CREATE TABLE bogie_amenities (
    bogie_id INT NOT NULL,
    amenity_id INT NOT NULL,
    FOREIGN KEY (bogie_id) REFERENCES bogies(id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES amenities(id),
    
    is_available BIT DEFAULT 1,
    notes NVARCHAR(MAX),
    
    PRIMARY KEY (bogie_id, amenity_id)
);
GO

-- Indexes
CREATE INDEX idx_bogie_amenities_bogie ON bogie_amenities(bogie_id);
CREATE INDEX idx_bogie_amenities_amenity ON bogie_amenities(amenity_id);
GO

-- --------------------------------------------
-- 20. ADMIN_USERS TABLE (ผู้ดูแลระบบ)
-- --------------------------------------------
IF OBJECT_ID('admin_users', 'U') IS NOT NULL DROP TABLE admin_users;
GO

CREATE TABLE admin_users (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    email NVARCHAR(255) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    
    -- Profile
    full_name NVARCHAR(255),
    phone NVARCHAR(20),
    
    -- Role
    role NVARCHAR(20) DEFAULT N'admin',
    
    -- Status
    is_active BIT DEFAULT 1,
    is_verified BIT DEFAULT 0,
    
    -- Last login
    last_login DATETIME2,
    last_login_ip NVARCHAR(45),
    
    -- Password reset
    reset_token NVARCHAR(255),
    reset_token_expiry DATETIME2,
    
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

-- Indexes
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_role ON admin_users(role);
CREATE INDEX idx_admin_users_active ON admin_users(is_active);
GO

-- --------------------------------------------
-- 21. ADMIN_ROLES TABLE
-- --------------------------------------------
IF OBJECT_ID('admin_roles', 'U') IS NOT NULL DROP TABLE admin_roles;
GO

CREATE TABLE admin_roles (
    id INT IDENTITY(1,1) PRIMARY KEY,
    role_code NVARCHAR(20) NOT NULL UNIQUE,
    role_name NVARCHAR(100) NOT NULL,
    
    -- Permissions (JSON)
    permissions NVARCHAR(MAX),
    
    description NVARCHAR(MAX),
    
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

-- Seed data
INSERT INTO admin_roles (role_code, role_name, permissions, description) VALUES
(N'super_admin', N'Super Administrator', N'["*"]', N'Full system access'),
(N'admin', N'Administrator', N'["trains.*", "stations.*", "bogies.*", "pricing.*", "announcements.*", "analytics.read"]', N'Manage trains, stations, and pricing'),
(N'viewer', N'Viewer', N'["trains.read", "stations.read", "bogies.read", "pricing.read", "analytics.read"]', N'Read-only access');
GO

-- --------------------------------------------
-- 22. ADMIN_LOGS TABLE
-- --------------------------------------------
IF OBJECT_ID('admin_logs', 'U') IS NOT NULL DROP TABLE admin_logs;
GO

CREATE TABLE admin_logs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    admin_id UNIQUEIDENTIFIER,
    FOREIGN KEY (admin_id) REFERENCES admin_users(id),
    
    -- Action details
    action NVARCHAR(100) NOT NULL,
    resource NVARCHAR(50),
    resource_id NVARCHAR(100),
    
    -- Changes (JSON)
    changes NVARCHAR(MAX),
    
    -- Request info
    ip_address NVARCHAR(45),
    user_agent NVARCHAR(MAX),
    
    created_at DATETIME2 DEFAULT GETDATE()
);
GO

-- Indexes
CREATE INDEX idx_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_action ON admin_logs(action);
CREATE INDEX idx_admin_logs_resource ON admin_logs(resource);
CREATE INDEX idx_admin_logs_date ON admin_logs(created_at);
CREATE INDEX idx_admin_logs_admin_date ON admin_logs(admin_id, created_at);
GO

-- ============================================
-- SECTION 4: TRIGGERS
-- ============================================

-- Trigger: Update updated_at timestamp
GO
CREATE OR ALTER TRIGGER trg_stations_updated_at
ON stations
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE stations
    SET updated_at = GETDATE()
    FROM stations s
    INNER JOIN inserted i ON s.id = i.id;
END;
GO

CREATE OR ALTER TRIGGER trg_trains_updated_at
ON trains
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE trains
    SET updated_at = GETDATE()
    FROM trains t
    INNER JOIN inserted i ON t.id = i.id;
END;
GO

-- Add similar triggers for other tables...

-- ============================================
-- SECTION 5: VIEWS
-- ============================================

-- View: Complete train information
GO
CREATE OR ALTER VIEW v_trains_complete AS
SELECT 
    t.*,
    tt.name_th as train_type_name_th,
    tt.name_en as train_type_name_en,
    tt.base_fare as train_type_base_fare,
    os.name_th as origin_name_th,
    os.name_en as origin_name_en,
    os.code_th as origin_code,
    ds.name_th as destination_name_th,
    ds.name_en as destination_name_en,
    ds.code_th as destination_code,
    COUNT(DISTINCT tc.id) as bogie_count,
    COUNT(DISTINCT ts.id) as stop_count
FROM trains t
LEFT JOIN train_types tt ON t.train_type_id = tt.id
LEFT JOIN stations os ON t.origin_station_id = os.id
LEFT JOIN stations ds ON t.destination_station_id = ds.id
LEFT JOIN train_compositions tc ON t.id = tc.train_id
LEFT JOIN train_stops ts ON t.id = ts.train_id
GROUP BY t.id, t.train_number, t.train_name_th, t.train_name_en, t.train_name_cn,
         t.train_type_id, t.origin_station_id, t.destination_station_id,
         t.departure_time, t.arrival_time, t.duration_minutes, t.operating_days,
         t.running_order, t.service_zone, t.total_distance_km, t.is_active,
         t.notes, t.created_at, t.updated_at, t.created_by, t.updated_by,
         tt.name_th, tt.name_en, tt.base_fare,
         os.name_th, os.name_en, os.code_th,
         ds.name_th, ds.name_en, ds.code_th;
GO

-- View: Active announcements
CREATE OR ALTER VIEW v_active_announcements AS
SELECT *
FROM announcements
WHERE is_active = 1
  AND start_date <= CAST(GETDATE() AS DATE)
  AND end_date >= CAST(GETDATE() AS DATE);
GO

-- ============================================
-- SECTION 6: STORED PROCEDURES
-- ============================================

-- Stored Procedure: Calculate route distances
GO
CREATE OR ALTER PROCEDURE sp_calculate_route_distances
    @train_id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Delete existing distances
    DELETE FROM route_distances WHERE train_id = @train_id;
    
    -- Calculate and insert new distances
    INSERT INTO route_distances (train_id, from_station_id, to_station_id, distance_km, duration_minutes)
    SELECT 
        ts1.train_id,
        ts1.station_id as from_station_id,
        ts2.station_id as to_station_id,
        ts2.distance_from_origin_km - ts1.distance_from_origin_km as distance_km,
        ts2.duration_from_origin_minutes - ts1.duration_from_origin_minutes as duration_minutes
    FROM train_stops ts1
    CROSS JOIN train_stops ts2
    WHERE ts1.train_id = @train_id
      AND ts2.train_id = @train_id
      AND ts1.stop_order < ts2.stop_order;
END;
GO

-- ============================================
-- END OF SCHEMA
-- ============================================

PRINT 'Schema created successfully!';
PRINT 'Total tables: 22';
PRINT 'Total triggers: 2';
PRINT 'Total views: 2';
PRINT 'Total stored procedures: 1';
GO
