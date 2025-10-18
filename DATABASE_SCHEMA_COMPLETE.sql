-- ============================================
-- SRT Timetable - Complete Database Schema
-- Version: 1.0
-- Date: 2025-01-08
-- Database: PostgreSQL 14+
-- Total Tables: 22
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- SECTION 1: CORE TABLES (8 tables)
-- ============================================

-- --------------------------------------------
-- 1. STATIONS TABLE (สถานี)
-- Multi-language support (TH/EN/CN)
-- --------------------------------------------
CREATE TABLE stations (
    id SERIAL PRIMARY KEY,
    station_code INTEGER UNIQUE NOT NULL,
    
    -- Multi-language codes
    code_th VARCHAR(10) NOT NULL,
    code_en VARCHAR(10) NOT NULL,
    code_cn VARCHAR(10),
    
    -- Multi-language names
    name_th VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_cn VARCHAR(255),
    
    -- Full display names (e.g., "[ กท. ] - กรุงเทพ (หัวลำโพง)")
    display_name_th VARCHAR(255),
    display_name_en VARCHAR(255),
    display_name_cn VARCHAR(255),
    
    -- Distance calculations
    distance_for_pricing DECIMAL(10, 4) DEFAULT 0,
    distance_actual DECIMAL(10, 4) DEFAULT 0,
    
    -- Station classification
    station_class VARCHAR(20), -- 'special', '1', '2', '3'
    
    -- Location
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    address TEXT,
    phone VARCHAR(20),
    
    -- Facilities (stored as JSON array)
    facilities JSONB DEFAULT '[]',
    
    -- Images
    image_url TEXT,
    images JSONB DEFAULT '[]',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Indexes for stations
CREATE INDEX idx_stations_code_th ON stations(code_th);
CREATE INDEX idx_stations_code_en ON stations(code_en);
CREATE INDEX idx_stations_station_code ON stations(station_code);
CREATE INDEX idx_stations_class ON stations(station_class);
CREATE INDEX idx_stations_active ON stations(is_active);
CREATE INDEX idx_stations_name_th ON stations USING gin(to_tsvector('thai', name_th));

-- --------------------------------------------
-- 2. TRAIN_TYPES TABLE (ประเภทรถ)
-- --------------------------------------------
CREATE TABLE train_types (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    
    -- Multi-language
    name_th VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    name_cn VARCHAR(100),
    
    -- Pricing
    base_fare DECIMAL(10, 2) DEFAULT 0,
    
    -- Display
    sort_order INTEGER DEFAULT 0,
    color VARCHAR(7), -- HEX color for UI
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_train_types_code ON train_types(code);
CREATE INDEX idx_train_types_sort ON train_types(sort_order);

-- Seed data
INSERT INTO train_types (code, name_th, name_en, name_cn, base_fare, sort_order, color) VALUES
('express_special', 'ด่วนพิเศษ', 'Special Express', '特快', 170, 1, '#FF6B6B'),
('express_special_cnr', 'ด่วนพิเศษ (CNR)', 'Special Express (CNR)', '特快 (CNR)', 190, 2, '#FF5252'),
('express', 'ด่วน', 'Express', '快车', 150, 3, '#4ECDC4'),
('rapid', 'เร็ว', 'Rapid', '快速', 20, 4, '#95E1D3'),
('ordinary', 'ธรรมดา', 'Ordinary', '普通', 0, 5, '#A8E6CF'),
('local', 'ท้องถิ่น', 'Local', '本地', 0, 6, '#C7CEEA'),
('commuter', 'ชานเมือง', 'Commuter', '市郊', 0, 7, '#B8B8FF'),
('special_commuter', 'พิเศษชานเมือง', 'Special Commuter', '特殊市郊', 0, 8, '#9B9BFF');

-- --------------------------------------------
-- 3. TRAINS TABLE (ขบวนรถ)
-- --------------------------------------------
CREATE TABLE trains (
    id SERIAL PRIMARY KEY,
    train_number VARCHAR(20) UNIQUE NOT NULL,
    
    -- Multi-language
    train_name_th VARCHAR(255),
    train_name_en VARCHAR(255),
    train_name_cn VARCHAR(255),
    
    -- Type
    train_type_id INTEGER REFERENCES train_types(id),
    
    -- Route
    origin_station_id INTEGER REFERENCES stations(id),
    destination_station_id INTEGER REFERENCES stations(id),
    
    -- Schedule
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    duration INTERVAL,
    
    -- Operating days (array: ['daily'] or ['monday', 'tuesday', ...])
    operating_days VARCHAR(50)[] DEFAULT ARRAY['daily'],
    
    -- Additional info
    running_order INTEGER,
    service_zone VARCHAR(100),
    total_distance_km DECIMAL(10, 2),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Indexes
CREATE INDEX idx_trains_number ON trains(train_number);
CREATE INDEX idx_trains_type ON trains(train_type_id);
CREATE INDEX idx_trains_origin ON trains(origin_station_id);
CREATE INDEX idx_trains_destination ON trains(destination_station_id);
CREATE INDEX idx_trains_active ON trains(is_active);
CREATE INDEX idx_trains_departure ON trains(departure_time);

-- --------------------------------------------
-- 4. TRAIN_STOPS TABLE (สถานีจอด)
-- Stores stop sequence with times
-- --------------------------------------------
CREATE TABLE train_stops (
    id SERIAL PRIMARY KEY,
    train_id INTEGER REFERENCES trains(id) ON DELETE CASCADE,
    station_id INTEGER REFERENCES stations(id),
    
    -- Sequence
    stop_order INTEGER NOT NULL,
    
    -- Times (null for origin/destination)
    arrival_time TIME,
    departure_time TIME,
    
    -- Stop type
    stop_type VARCHAR(10) DEFAULT 'stop', -- 'stop' or 'pass'
    
    -- Platform
    platform VARCHAR(10),
    
    -- Distance from origin
    distance_from_origin_km DECIMAL(10, 4) DEFAULT 0,
    duration_from_origin INTERVAL,
    
    -- Notes
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(train_id, stop_order),
    UNIQUE(train_id, station_id)
);

-- Indexes
CREATE INDEX idx_train_stops_train ON train_stops(train_id);
CREATE INDEX idx_train_stops_station ON train_stops(station_id);
CREATE INDEX idx_train_stops_order ON train_stops(train_id, stop_order);

-- --------------------------------------------
-- 5. BOGIES TABLE (โบกี้/ตู้โดยสาร)
-- --------------------------------------------
CREATE TABLE bogies (
    id SERIAL PRIMARY KEY,
    bogie_code VARCHAR(10) UNIQUE NOT NULL,
    
    -- Multi-language
    bogie_name_th VARCHAR(255) NOT NULL,
    bogie_name_en VARCHAR(255),
    bogie_name_cn VARCHAR(255),
    
    -- Short name
    bogie_short_name_th VARCHAR(50),
    bogie_short_name_en VARCHAR(50),
    
    -- Class
    class INTEGER NOT NULL, -- 1, 2, 3
    
    -- Seating
    seat_count INTEGER NOT NULL,
    seat_type VARCHAR(50), -- 'sitting', 'sleeper', 'mixed'
    
    -- Features
    description TEXT,
    has_aircon BOOLEAN DEFAULT false,
    is_sleeper BOOLEAN DEFAULT false,
    
    -- Amenities (will link via bogie_amenities)
    amenities JSONB DEFAULT '[]',
    
    -- Images
    image_url TEXT,
    images JSONB DEFAULT '[]',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_bogies_code ON bogies(bogie_code);
CREATE INDEX idx_bogies_class ON bogies(class);
CREATE INDEX idx_bogies_active ON bogies(is_active);

-- Seed data (example)
INSERT INTO bogies (bogie_code, bogie_name_th, bogie_name_en, bogie_short_name_th, class, seat_count, has_aircon, is_sleeper) VALUES
('01', 'รถปรับอากาศนั่งและนอนชั้นที่ 1', 'First Class AC Sleeper', 'บนอ.ป.', 1, 20, true, true),
('02', 'รถปรับอากาศนั่งและนอนชั้นที่ 2 (40 N)', 'Second Class AC Sleeper (40N)', 'บนท.ป.', 2, 40, true, true),
('03', 'รถนั่งชั้น 3', 'Third Class Seat', 'น.3', 3, 80, false, false),
('04', 'รถนั่งชั้น 2 ปรับอากาศ', 'Second Class AC Seat', 'น.2 ป.', 2, 60, true, false),
('05', 'รถนั่งชั้น 1 ปรับอากาศ', 'First Class AC Seat', 'น.1 ป.', 1, 40, true, false);

-- --------------------------------------------
-- 6. TRAIN_COMPOSITIONS TABLE (รถพ่วง)
-- Links trains to bogies
-- --------------------------------------------
CREATE TABLE train_compositions (
    id SERIAL PRIMARY KEY,
    train_id INTEGER REFERENCES trains(id) ON DELETE CASCADE,
    bogie_id INTEGER REFERENCES bogies(id),
    
    -- Position in train
    position INTEGER NOT NULL,
    
    -- Quantity of this bogie type
    quantity INTEGER DEFAULT 1,
    
    -- Notes
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(train_id, position)
);

-- Indexes
CREATE INDEX idx_train_compositions_train ON train_compositions(train_id);
CREATE INDEX idx_train_compositions_bogie ON train_compositions(bogie_id);

-- --------------------------------------------
-- 7. ROUTE_DISTANCES TABLE (ระยะทาง pre-calculated)
-- Pre-calculated distances between stations on each train
-- --------------------------------------------
CREATE TABLE route_distances (
    id SERIAL PRIMARY KEY,
    train_id INTEGER REFERENCES trains(id) ON DELETE CASCADE,
    from_station_id INTEGER REFERENCES stations(id),
    to_station_id INTEGER REFERENCES stations(id),
    
    -- Distance
    distance_km DECIMAL(10, 4) NOT NULL,
    
    -- Duration
    duration INTERVAL,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(train_id, from_station_id, to_station_id)
);

-- Indexes
CREATE INDEX idx_route_distances_train ON route_distances(train_id);
CREATE INDEX idx_route_distances_stations ON route_distances(train_id, from_station_id, to_station_id);
CREATE INDEX idx_route_distances_from ON route_distances(from_station_id);
CREATE INDEX idx_route_distances_to ON route_distances(to_station_id);

-- --------------------------------------------
-- 8. ANNOUNCEMENTS TABLE (ประกาศ)
-- --------------------------------------------
CREATE TABLE announcements (
    id SERIAL PRIMARY KEY,
    
    -- Optional: specific to a train (null = global)
    train_id INTEGER REFERENCES trains(id) ON DELETE CASCADE,
    
    -- Multi-language
    title_th VARCHAR(255) NOT NULL,
    title_en VARCHAR(255),
    title_cn VARCHAR(255),
    
    message_th TEXT NOT NULL,
    message_en TEXT,
    message_cn TEXT,
    
    -- Priority
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high'
    
    -- Schedule
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- Display settings
    show_on_homepage BOOLEAN DEFAULT false,
    show_in_search BOOLEAN DEFAULT true,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID
);

-- Indexes
CREATE INDEX idx_announcements_train ON announcements(train_id);
CREATE INDEX idx_announcements_dates ON announcements(start_date, end_date);
CREATE INDEX idx_announcements_priority ON announcements(priority);
CREATE INDEX idx_announcements_active ON announcements(is_active);

-- ============================================
-- SECTION 2: PRICING TABLES (9 tables)
-- ============================================

-- --------------------------------------------
-- 9. TRAIN_FARES TABLE (ค่าธรรมเนียมขบวนรถ)
-- Based on train type and distance range
-- --------------------------------------------
CREATE TABLE train_fares (
    id SERIAL PRIMARY KEY,
    train_type_id INTEGER REFERENCES train_types(id),
    
    -- Distance range
    distance_from INTEGER NOT NULL,
    distance_to INTEGER NOT NULL,
    
    -- Fare
    fare DECIMAL(10, 2) NOT NULL,
    
    -- Effective date
    effective_date DATE DEFAULT CURRENT_DATE,
    expiry_date DATE,
    
    -- Notes
    notes TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT valid_distance_range CHECK (distance_to >= distance_from)
);

-- Indexes
CREATE INDEX idx_train_fares_type ON train_fares(train_type_id);
CREATE INDEX idx_train_fares_distance ON train_fares(train_type_id, distance_from, distance_to);
CREATE INDEX idx_train_fares_active ON train_fares(is_active);

-- Seed data (example)
INSERT INTO train_fares (train_type_id, distance_from, distance_to, fare) VALUES
-- ธรรมดา
((SELECT id FROM train_types WHERE code = 'ordinary'), 0, 9999, 0),
-- ชานเมือง
((SELECT id FROM train_types WHERE code = 'commuter'), 0, 9999, 0),
-- เร็ว
((SELECT id FROM train_types WHERE code = 'rapid'), 1, 50, 20),
((SELECT id FROM train_types WHERE code = 'rapid'), 51, 150, 30),
((SELECT id FROM train_types WHERE code = 'rapid'), 151, 300, 50),
((SELECT id FROM train_types WHERE code = 'rapid'), 301, 9999, 110),
-- ด่วน
((SELECT id FROM train_types WHERE code = 'express'), 0, 9999, 150),
-- ด่วนพิเศษ
((SELECT id FROM train_types WHERE code = 'express_special'), 0, 9999, 170),
-- ด่วนพิเศษ (CNR)
((SELECT id FROM train_types WHERE code = 'express_special_cnr'), 0, 9999, 190);

-- --------------------------------------------
-- 10. DISTANCE_FARES TABLE (ราคาตามระยะทาง - Per KM)
-- Option 1: Store every kilometer (not recommended for large distances)
-- --------------------------------------------
CREATE TABLE distance_fares (
    id SERIAL PRIMARY KEY,
    distance_km INTEGER NOT NULL,
    class INTEGER NOT NULL, -- 1, 2, 3
    
    -- Fare per km at this distance
    fare DECIMAL(10, 2) NOT NULL,
    
    -- Effective date
    effective_date DATE DEFAULT CURRENT_DATE,
    expiry_date DATE,
    
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(distance_km, class, effective_date)
);

-- Indexes
CREATE INDEX idx_distance_fares_km ON distance_fares(distance_km);
CREATE INDEX idx_distance_fares_class ON distance_fares(class);
CREATE INDEX idx_distance_fares_active ON distance_fares(is_active);

-- --------------------------------------------
-- 11. DISTANCE_FARE_RANGES TABLE (ช่วงราคาระยะทาง)
-- Option 2: Store distance ranges (RECOMMENDED)
-- --------------------------------------------
CREATE TABLE distance_fare_ranges (
    id SERIAL PRIMARY KEY,
    class INTEGER NOT NULL, -- 1, 2, 3
    
    -- Distance range
    distance_from INTEGER NOT NULL,
    distance_to INTEGER NOT NULL,
    
    -- Pricing method
    fare_per_km DECIMAL(10, 4) NOT NULL,
    minimum_fare DECIMAL(10, 2) DEFAULT 0,
    
    -- Or flat rate for range
    flat_rate DECIMAL(10, 2),
    
    -- Effective date
    effective_date DATE DEFAULT CURRENT_DATE,
    expiry_date DATE,
    
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT valid_range CHECK (distance_to >= distance_from)
);

-- Indexes
CREATE INDEX idx_distance_fare_ranges_class ON distance_fare_ranges(class);
CREATE INDEX idx_distance_fare_ranges_distance ON distance_fare_ranges(class, distance_from, distance_to);
CREATE INDEX idx_distance_fare_ranges_active ON distance_fare_ranges(is_active);

-- Seed data (example - adjust based on real SRT pricing)
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

-- --------------------------------------------
-- 12. FARE_FORMULAS TABLE (สูตรคำนวณราคา)
-- Option 3: Formula-based calculation (most flexible)
-- --------------------------------------------
CREATE TABLE fare_formulas (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    class INTEGER NOT NULL,
    
    -- Distance range
    distance_from INTEGER NOT NULL,
    distance_to INTEGER NOT NULL,
    
    -- Formula components
    base_fare DECIMAL(10, 2) DEFAULT 0,
    rate_per_km DECIMAL(10, 4) DEFAULT 0,
    
    -- Progressive rate
    progressive_rate BOOLEAN DEFAULT false,
    rate_change_at INTEGER,
    rate_after_change DECIMAL(10, 4),
    
    -- Multiplier
    rate_multiplier DECIMAL(10, 4) DEFAULT 1.0,
    
    -- Rounding
    round_to DECIMAL(10, 2) DEFAULT 1.00, -- round to nearest 1, 5, 10, etc.
    
    -- Effective date
    effective_date DATE DEFAULT CURRENT_DATE,
    expiry_date DATE,
    
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_fare_formulas_class ON fare_formulas(class);
CREATE INDEX idx_fare_formulas_distance ON fare_formulas(distance_from, distance_to);

-- --------------------------------------------
-- 13. AC_FARE_CATEGORIES TABLE (หมวดค่าแอร์)
-- Categories for AC surcharges
-- --------------------------------------------
CREATE TABLE ac_fare_categories (
    id SERIAL PRIMARY KEY,
    category_code VARCHAR(20) UNIQUE NOT NULL,
    
    -- Multi-language
    name_th VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    name_cn VARCHAR(255),
    
    -- Classification
    class INTEGER, -- 1, 2, 3
    has_meal BOOLEAN DEFAULT false,
    is_sleeper BOOLEAN DEFAULT false,
    
    -- Description
    description TEXT,
    
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ac_fare_categories_code ON ac_fare_categories(category_code);
CREATE INDEX idx_ac_fare_categories_class ON ac_fare_categories(class);

-- Seed data
INSERT INTO ac_fare_categories (category_code, name_th, name_en, class, has_meal, is_sleeper) VALUES
('AC_3', 'รถนั่งชั้น 3', 'Third Class AC', 3, false, false),
('AC_2', 'รถนั่งชั้น 2', 'Second Class AC', 2, false, false),
('AC_2_MEAL', 'รถนั่งชั้น 2 มีบริการอาหาร', 'Second Class AC with Meal', 2, true, false),
('AC_1_2_SLEEP', 'ชั้น 1 & 2 รถนั่งและนอน', 'First & Second Class Sleeper', 1, false, true),
('AC_1_2_SLEEP_V2', 'ชั้น 1 & 2 รถนั่งและนอน (รุ่นใหม่)', 'First & Second Class Sleeper (New)', 1, false, true);

-- --------------------------------------------
-- 14. AC_FARES TABLE (ค่าแอร์ตามระยะทาง)
-- --------------------------------------------
CREATE TABLE ac_fares (
    id SERIAL PRIMARY KEY,
    ac_category_id INTEGER REFERENCES ac_fare_categories(id),
    
    -- Distance range
    distance_from INTEGER NOT NULL,
    distance_to INTEGER NOT NULL,
    
    -- Fare
    fare DECIMAL(10, 2) NOT NULL,
    
    -- Effective date
    effective_date DATE DEFAULT CURRENT_DATE,
    expiry_date DATE,
    
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT valid_ac_distance CHECK (distance_to >= distance_from)
);

-- Indexes
CREATE INDEX idx_ac_fares_category ON ac_fares(ac_category_id);
CREATE INDEX idx_ac_fares_distance ON ac_fares(ac_category_id, distance_from, distance_to);
CREATE INDEX idx_ac_fares_active ON ac_fares(is_active);

-- Seed data (based on document)
INSERT INTO ac_fares (ac_category_id, distance_from, distance_to, fare) VALUES
-- AC_3
((SELECT id FROM ac_fare_categories WHERE category_code = 'AC_3'), 1, 300, 60),
((SELECT id FROM ac_fare_categories WHERE category_code = 'AC_3'), 301, 500, 70),
((SELECT id FROM ac_fare_categories WHERE category_code = 'AC_3'), 501, 9999, 100),
-- AC_2
((SELECT id FROM ac_fare_categories WHERE category_code = 'AC_2'), 1, 300, 60),
((SELECT id FROM ac_fare_categories WHERE category_code = 'AC_2'), 301, 500, 70),
((SELECT id FROM ac_fare_categories WHERE category_code = 'AC_2'), 501, 9999, 110),
-- AC_2_MEAL
((SELECT id FROM ac_fare_categories WHERE category_code = 'AC_2_MEAL'), 1, 300, 140),
((SELECT id FROM ac_fare_categories WHERE category_code = 'AC_2_MEAL'), 301, 500, 150),
((SELECT id FROM ac_fare_categories WHERE category_code = 'AC_2_MEAL'), 501, 9999, 190),
-- AC_1_2_SLEEP
((SELECT id FROM ac_fare_categories WHERE category_code = 'AC_1_2_SLEEP'), 1, 300, 130),
((SELECT id FROM ac_fare_categories WHERE category_code = 'AC_1_2_SLEEP'), 301, 500, 150),
((SELECT id FROM ac_fare_categories WHERE category_code = 'AC_1_2_SLEEP'), 501, 9999, 170),
-- AC_1_2_SLEEP_V2
((SELECT id FROM ac_fare_categories WHERE category_code = 'AC_1_2_SLEEP_V2'), 1, 300, 150),
((SELECT id FROM ac_fare_categories WHERE category_code = 'AC_1_2_SLEEP_V2'), 301, 500, 180),
((SELECT id FROM ac_fare_categories WHERE category_code = 'AC_1_2_SLEEP_V2'), 501, 9999, 210);

-- --------------------------------------------
-- 15. BOGIE_AC_FARES TABLE (เชื่อมโยง Bogie กับ AC Fare)
-- Links bogies to their AC fare category
-- --------------------------------------------
CREATE TABLE bogie_ac_fares (
    bogie_id INTEGER REFERENCES bogies(id) ON DELETE CASCADE,
    ac_category_id INTEGER REFERENCES ac_fare_categories(id),
    
    PRIMARY KEY (bogie_id, ac_category_id)
);

-- Indexes
CREATE INDEX idx_bogie_ac_fares_bogie ON bogie_ac_fares(bogie_id);
CREATE INDEX idx_bogie_ac_fares_category ON bogie_ac_fares(ac_category_id);

-- --------------------------------------------
-- 16. BERTH_FARES TABLE (ค่าเตียงนอน)
-- --------------------------------------------
CREATE TABLE berth_fares (
    id SERIAL PRIMARY KEY,
    bogie_id INTEGER REFERENCES bogies(id) ON DELETE CASCADE,
    
    -- Berth type
    berth_type VARCHAR(20) NOT NULL, -- 'upper', 'lower', 'room'
    
    -- Multi-language
    berth_name_th VARCHAR(100),
    berth_name_en VARCHAR(100),
    berth_name_cn VARCHAR(100),
    
    -- Fare
    fare DECIMAL(10, 2) NOT NULL,
    
    -- Effective date
    effective_date DATE DEFAULT CURRENT_DATE,
    expiry_date DATE,
    
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_berth_fares_bogie ON berth_fares(bogie_id);
CREATE INDEX idx_berth_fares_type ON berth_fares(berth_type);
CREATE INDEX idx_berth_fares_active ON berth_fares(is_active);

-- Seed data (example)
INSERT INTO berth_fares (bogie_id, berth_type, berth_name_th, berth_name_en, fare) VALUES
((SELECT id FROM bogies WHERE bogie_code = '01'), 'upper', 'เตียงบน', 'Upper Berth', 300),
((SELECT id FROM bogies WHERE bogie_code = '01'), 'lower', 'เตียงล่าง', 'Lower Berth', 500),
((SELECT id FROM bogies WHERE bogie_code = '01'), 'room', 'เหมาห้อง', 'Private Room', 1000),
((SELECT id FROM bogies WHERE bogie_code = '02'), 'upper', 'เตียงบน', 'Upper Berth', 250),
((SELECT id FROM bogies WHERE bogie_code = '02'), 'lower', 'เตียงล่าง', 'Lower Berth', 400);

-- --------------------------------------------
-- 17. PRICE_ADJUSTMENTS TABLE (ปรับราคาพิเศษ)
-- For special pricing adjustments (promotions, surcharges)
-- --------------------------------------------
CREATE TABLE price_adjustments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    
    -- Apply to specific train or all
    train_id INTEGER REFERENCES trains(id) ON DELETE CASCADE,
    train_type_id INTEGER REFERENCES train_types(id),
    
    -- Adjustment type
    adjustment_type VARCHAR(20) NOT NULL, -- 'percentage', 'fixed'
    adjustment_value DECIMAL(10, 2) NOT NULL,
    
    -- Schedule
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- Apply to
    apply_to VARCHAR(50)[], -- ['base_fare', 'ac_fare', 'berth_fare', 'total']
    
    -- Priority (higher = applied first)
    priority INTEGER DEFAULT 0,
    
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_price_adjustments_train ON price_adjustments(train_id);
CREATE INDEX idx_price_adjustments_dates ON price_adjustments(start_date, end_date);
CREATE INDEX idx_price_adjustments_active ON price_adjustments(is_active);

-- ============================================
-- SECTION 3: SUPPORT TABLES (5 tables)
-- ============================================

-- --------------------------------------------
-- 18. AMENITIES TABLE (สิ่งอำนวยความสะดวก)
-- --------------------------------------------
CREATE TABLE amenities (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    
    -- Multi-language
    name_th VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    name_cn VARCHAR(100),
    
    -- Display
    icon VARCHAR(10), -- emoji or icon name
    category VARCHAR(50), -- 'connectivity', 'comfort', 'accessibility', 'dining'
    
    -- Sorting
    sort_order INTEGER DEFAULT 0,
    
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_amenities_code ON amenities(code);
CREATE INDEX idx_amenities_category ON amenities(category);
CREATE INDEX idx_amenities_sort ON amenities(sort_order);

-- Seed data
INSERT INTO amenities (code, name_th, name_en, name_cn, icon, category, sort_order) VALUES
('wifi', 'Wi-Fi ฟรี', 'Free Wi-Fi', '免费WiFi', '📶', 'connectivity', 1),
('power', 'ปลั๊กไฟ', 'Power Outlet', '电源插座', '🔌', 'connectivity', 2),
('ac', 'เครื่องปรับอากาศ', 'Air Conditioning', '空调', '❄️', 'comfort', 3),
('dining', 'รถเสบียง', 'Dining Car', '餐车', '🍽️', 'dining', 4),
('accessible', 'เข้าถึงได้สำหรับผู้พิการ', 'Wheelchair Accessible', '无障碍设施', '♿', 'accessibility', 5),
('luggage', 'ที่เก็บกระเป๋า', 'Luggage Storage', '行李存放', '🧳', 'comfort', 6),
('toilet', 'ห้องน้ำ', 'Restroom', '洗手间', '🚻', 'comfort', 7),
('sleeper', 'ที่นอน', 'Sleeper Berth', '卧铺', '🛏️', 'comfort', 8),
('vending', 'ตู้ขายของอัตโนมัติ', 'Vending Machine', '自动售货机', '🏪', 'dining', 9),
('reading_light', 'ไฟอ่านหนังสือ', 'Reading Light', '阅读灯', '💡', 'comfort', 10);

-- --------------------------------------------
-- 19. BOGIE_AMENITIES TABLE (สิ่งอำนวยความสะดวกของโบกี้)
-- --------------------------------------------
CREATE TABLE bogie_amenities (
    bogie_id INTEGER REFERENCES bogies(id) ON DELETE CASCADE,
    amenity_id INTEGER REFERENCES amenities(id),
    
    -- Availability
    is_available BOOLEAN DEFAULT true,
    notes TEXT,
    
    PRIMARY KEY (bogie_id, amenity_id)
);

-- Indexes
CREATE INDEX idx_bogie_amenities_bogie ON bogie_amenities(bogie_id);
CREATE INDEX idx_bogie_amenities_amenity ON bogie_amenities(amenity_id);

-- --------------------------------------------
-- 20. ADMIN_USERS TABLE (ผู้ดูแลระบบ)
-- --------------------------------------------
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Profile
    full_name VARCHAR(255),
    phone VARCHAR(20),
    
    -- Role
    role VARCHAR(20) DEFAULT 'admin', -- 'super_admin', 'admin', 'viewer'
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    
    -- Last login
    last_login TIMESTAMP,
    last_login_ip VARCHAR(45),
    
    -- Password reset
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_role ON admin_users(role);
CREATE INDEX idx_admin_users_active ON admin_users(is_active);

-- --------------------------------------------
-- 21. ADMIN_ROLES TABLE (บทบาทและสิทธิ์)
-- --------------------------------------------
CREATE TABLE admin_roles (
    id SERIAL PRIMARY KEY,
    role_code VARCHAR(20) UNIQUE NOT NULL,
    role_name VARCHAR(100) NOT NULL,
    
    -- Permissions (JSON array)
    permissions JSONB DEFAULT '[]',
    
    description TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Seed data
INSERT INTO admin_roles (role_code, role_name, permissions, description) VALUES
('super_admin', 'Super Administrator', 
 '["*"]', 
 'Full system access'),
 
('admin', 'Administrator', 
 '["trains.*", "stations.*", "bogies.*", "pricing.*", "announcements.*", "analytics.read"]', 
 'Manage trains, stations, and pricing'),
 
('viewer', 'Viewer', 
 '["trains.read", "stations.read", "bogies.read", "pricing.read", "analytics.read"]', 
 'Read-only access');

-- --------------------------------------------
-- 22. ADMIN_LOGS TABLE (ประวัติการแก้ไข)
-- --------------------------------------------
CREATE TABLE admin_logs (
    id SERIAL PRIMARY KEY,
    admin_id UUID REFERENCES admin_users(id),
    
    -- Action details
    action VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete', 'login', 'logout'
    resource VARCHAR(50), -- 'trains', 'stations', 'pricing', etc.
    resource_id VARCHAR(100),
    
    -- Changes (store before/after)
    changes JSONB DEFAULT '{}',
    
    -- Request info
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_action ON admin_logs(action);
CREATE INDEX idx_admin_logs_resource ON admin_logs(resource);
CREATE INDEX idx_admin_logs_date ON admin_logs(created_at);
CREATE INDEX idx_admin_logs_admin_date ON admin_logs(admin_id, created_at);

-- ============================================
-- SECTION 4: FUNCTIONS & TRIGGERS
-- ============================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_stations_updated_at BEFORE UPDATE ON stations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trains_updated_at BEFORE UPDATE ON trains
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_train_types_updated_at BEFORE UPDATE ON train_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_train_stops_updated_at BEFORE UPDATE ON train_stops
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bogies_updated_at BEFORE UPDATE ON bogies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_route_distances_updated_at BEFORE UPDATE ON route_distances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Calculate route distances when train stops change
CREATE OR REPLACE FUNCTION calculate_route_distances()
RETURNS TRIGGER AS $$
DECLARE
    train_rec RECORD;
BEGIN
    -- Delete existing distances for this train
    DELETE FROM route_distances WHERE train_id = NEW.train_id;
    
    -- Recalculate distances
    -- This is a simplified version - actual implementation should be more sophisticated
    INSERT INTO route_distances (train_id, from_station_id, to_station_id, distance_km)
    SELECT 
        ts1.train_id,
        ts1.station_id as from_station_id,
        ts2.station_id as to_station_id,
        ts2.distance_from_origin_km - ts1.distance_from_origin_km as distance_km
    FROM train_stops ts1
    CROSS JOIN train_stops ts2
    WHERE ts1.train_id = NEW.train_id
      AND ts2.train_id = NEW.train_id
      AND ts1.stop_order < ts2.stop_order;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_route_distances 
AFTER INSERT OR UPDATE ON train_stops
FOR EACH ROW EXECUTE FUNCTION calculate_route_distances();

-- ============================================
-- SECTION 5: VIEWS (for common queries)
-- ============================================

-- View: Complete train information
CREATE OR REPLACE VIEW v_trains_complete AS
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
GROUP BY t.id, tt.id, os.id, ds.id;

-- View: Active announcements
CREATE OR REPLACE VIEW v_active_announcements AS
SELECT *
FROM announcements
WHERE is_active = true
  AND start_date <= CURRENT_DATE
  AND end_date >= CURRENT_DATE;

-- ============================================
-- SECTION 6: GRANTS (adjust as needed)
-- ============================================

-- Grant permissions to application user (adjust username as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- ============================================
-- END OF SCHEMA
-- ============================================

-- Summary
SELECT 'Schema created successfully!' as message;
SELECT 'Total tables: 22' as tables;
SELECT 'Total functions: 2' as functions;
SELECT 'Total triggers: 10' as triggers;
SELECT 'Total views: 2' as views;
