-- Hotel Service Database Schema (Consumer Only)
USE travel_hotel_db;

-- Drop old tables if they exist
DROP TABLE IF EXISTS RoomPricing;
DROP TABLE IF EXISTS RoomAvailability;
DROP TABLE IF EXISTS RoomTypes;
DROP TABLE IF EXISTS HotelDailyStatus; -- Drop in case of partial old version
DROP TABLE IF EXISTS Hotels;

CREATE TABLE IF NOT EXISTS Hotels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    kabupaten VARCHAR(50), -- Kabupaten or regency for Indonesian address granularity
    province VARCHAR(50) NOT NULL,
    postal_code VARCHAR(10), -- Postal code for Indonesian context
    address TEXT NOT NULL,
    property_type ENUM('hotel', 'villa', 'losmen', 'guest_house', 'resort') DEFAULT 'hotel', -- Maps to 'accommodation_type' in API
    star_rating DECIMAL(2,1),
    description TEXT,
    facilities TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS HotelDailyStatus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    date DATE NOT NULL,
    room_type_name VARCHAR(255) NOT NULL, -- e.g., 'Deluxe', 'Executive Suite'
    available_rooms INT NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'IDR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hotel_id) REFERENCES Hotels(id) ON DELETE CASCADE,
    UNIQUE KEY uq_hotel_date_room_type (hotel_id, date, room_type_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sample Data for Hotels (remains the same)
INSERT INTO Hotels (name, city, kabupaten, province, postal_code, address, property_type, star_rating, description, facilities) VALUES
('Hotel Mulia Senayan', 'Jakarta', 'Jakarta Pusat', 'DKI Jakarta', '10270', 'Jl. Asia Afrika No.8, Senayan, Jakarta 10270', 'hotel', 5.0, 'Luxury hotel in the heart of Jakarta', 'Swimming pool, spa, gym, restaurant, conference rooms'),
('The Trans Resort', 'Bali', 'Badung', 'Bali', '80361', 'Jl. Sunset Road, Kerobokan, Seminyak, Bali 80361', 'resort', 5.0, 'Luxury resort in Seminyak', 'Private pool villas, spa, kids club, restaurants'),
('Aston Pasteur', 'Bandung', 'Bandung', 'Jawa Barat', '40162', 'Jl. Dr. Djunjunan No.162, Sukabungah, Bandung 40162', 'hotel', 4.0, 'Modern hotel in Bandung', 'Swimming pool, meeting rooms, restaurant'),
('Losmen Setia Kawan', 'Yogyakarta', 'Yogyakarta', 'DI Yogyakarta', '55271', 'Jl. Sosrowijayan No.24, Sosromenduran, Yogyakarta 55271', 'losmen', 2.0, 'Budget accommodation in Yogyakarta', 'Free wifi, shared bathroom'),
('Villa Borobudur', 'Magelang', 'Magelang', 'Jawa Tengah', '56553', 'Dusun Tingal Kulon, Wanurejo, Borobudur, Magelang 56553', 'villa', 4.5, 'Luxury villa with Borobudur view', 'Private pool, butler service, restaurant');

-- Sample Data for HotelDailyStatus
-- Derived from previous RoomTypes, RoomAvailability, and RoomPricing sample data
-- Assuming hotel_id mapping: Hotel Mulia (1), Trans Resort (2), Aston Pasteur (3), Losmen Setia Kawan (4), Villa Borobudur (5)
-- Assuming room_type_id to room_type_name mapping based on old RoomTypes sample:
-- 1: Deluxe (Hotel Mulia)
-- 2: Executive Suite (Hotel Mulia)
-- 3: Garden Villa (Trans Resort)
-- 4: Family Suite (Trans Resort)
-- 5: Superior (Aston Pasteur)
-- 6: Deluxe (Aston Pasteur)
-- 7: Standard (Losmen Setia Kawan)
-- 8: Private Villa (Villa Borobudur)

INSERT INTO HotelDailyStatus (hotel_id, date, room_type_name, available_rooms, price, currency) VALUES
-- Hotel Mulia Senayan (ID: 1)
(1, '2025-06-10', 'Deluxe', 8, 1850000.00, 'IDR'),
(1, '2025-06-10', 'Executive Suite', 3, 3500000.00, 'IDR'),
-- The Trans Resort (ID: 2)
(2, '2025-06-10', 'Garden Villa', 5, 4200000.00, 'IDR'), -- Original RoomAvailability had room_type_id 3 with 5 rooms, and another entry with 8 rooms. Taking the first one.
(2, '2025-06-10', 'Family Suite', 2, 3800000.00, 'IDR'),
-- Aston Pasteur (ID: 3)
(3, '2025-06-10', 'Superior', 12, 950000.00, 'IDR'),
(3, '2025-06-10', 'Deluxe', 15, 1100000.00, 'IDR'),
-- Losmen Setia Kawan (ID: 4)
(4, '2025-06-10', 'Standard', 6, 250000.00, 'IDR'),
-- Villa Borobudur (ID: 5)
(5, '2025-06-10', 'Private Villa', 1, 5500000.00, 'IDR');

-- Note: The duplicate entry in old RoomAvailability (room_type_id 3, date 2025-06-10, available_rooms 8) is ignored to maintain UNIQUE KEY constraint.
-- In a real migration, such conflicts would need a defined resolution strategy.
