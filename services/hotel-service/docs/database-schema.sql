-- Hotel Service Database Schema (Consumer Only)
USE travel_hotel_db;

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

CREATE TABLE IF NOT EXISTS RoomTypes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    max_guests INT NOT NULL,
    bed_type VARCHAR(50) NOT NULL, -- 'Twin', 'Queen', 'King', etc.
    room_size INT, -- in square meters
    has_breakfast BOOLEAN DEFAULT FALSE,
    has_wifi BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (hotel_id) REFERENCES Hotels(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS RoomAvailability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_type_id INT NOT NULL,
    date DATE NOT NULL,
    available_rooms INT NOT NULL,
    FOREIGN KEY (room_type_id) REFERENCES RoomTypes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- Note: available_rooms is updated via /availability/decrease and /availability/increase endpoints for booking/cancellation.

CREATE TABLE IF NOT EXISTS RoomPricing (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_type_id INT NOT NULL,
    date DATE NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'IDR',
    FOREIGN KEY (room_type_id) REFERENCES RoomTypes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sample Data
INSERT INTO Hotels (name, city, kabupaten, province, postal_code, address, property_type, star_rating, description, facilities) VALUES
('Hotel Mulia Senayan', 'Jakarta', 'Jakarta Pusat', 'DKI Jakarta', '10270', 'Jl. Asia Afrika No.8, Senayan, Jakarta 10270', 'hotel', 5.0, 'Luxury hotel in the heart of Jakarta', 'Swimming pool, spa, gym, restaurant, conference rooms'),
('The Trans Resort', 'Bali', 'Badung', 'Bali', '80361', 'Jl. Sunset Road, Kerobokan, Seminyak, Bali 80361', 'resort', 5.0, 'Luxury resort in Seminyak', 'Private pool villas, spa, kids club, restaurants'),
('Aston Pasteur', 'Bandung', 'Bandung', 'Jawa Barat', '40162', 'Jl. Dr. Djunjunan No.162, Sukabungah, Bandung 40162', 'hotel', 4.0, 'Modern hotel in Bandung', 'Swimming pool, meeting rooms, restaurant'),
('Losmen Setia Kawan', 'Yogyakarta', 'Yogyakarta', 'DI Yogyakarta', '55271', 'Jl. Sosrowijayan No.24, Sosromenduran, Yogyakarta 55271', 'losmen', 2.0, 'Budget accommodation in Yogyakarta', 'Free wifi, shared bathroom'),
('Villa Borobudur', 'Magelang', 'Magelang', 'Jawa Tengah', '56553', 'Dusun Tingal Kulon, Wanurejo, Borobudur, Magelang 56553', 'villa', 4.5, 'Luxury villa with Borobudur view', 'Private pool, butler service, restaurant');

INSERT INTO RoomTypes (hotel_id, type, description, max_guests, bed_type, room_size, has_breakfast) VALUES
(1, 'Deluxe', 'Deluxe Room with City View', 2, 'King', 32, TRUE),
(1, 'Executive Suite', 'Spacious Suite with City View', 2, 'King', 48, TRUE),
(2, 'Garden Villa', 'Villa with Private Pool', 2, 'King', 120, TRUE),
(2, 'Family Suite', 'Two Bedroom Suite', 4, 'Twin', 80, TRUE),
(3, 'Superior', 'Superior Room with Mountain View', 2, 'Queen', 28, TRUE),
(3, 'Deluxe', 'Deluxe Room with City View', 2, 'Twin', 30, TRUE),
(4, 'Standard', 'Basic Room with Fan', 2, 'Twin', 16, FALSE),
(5, 'Private Villa', 'Luxury Villa with Borobudur View', 2, 'King', 150, TRUE);

INSERT INTO RoomAvailability (room_type_id, date, available_rooms) VALUES
(1, '2025-06-10', 8),
(2, '2025-06-10', 3),
(3, '2025-06-10', 5),
(4, '2025-06-10', 2),
(5, '2025-06-10', 12),
(6, '2025-06-10', 15),
(7, '2025-06-10', 6),
(8, '2025-06-10', 1),
(3, '2025-06-10', 8);

INSERT INTO RoomPricing (room_type_id, date, price, currency) VALUES
(1, '2025-06-10', 1850000.00, 'IDR'),
(2, '2025-06-10', 3500000.00, 'IDR'),
(3, '2025-06-10', 4200000.00, 'IDR'),
(4, '2025-06-10', 3800000.00, 'IDR'),
(5, '2025-06-10', 950000.00, 'IDR'),
(6, '2025-06-10', 1100000.00, 'IDR'),
(7, '2025-06-10', 250000.00, 'IDR'),
(8, '2025-06-10', 5500000.00, 'IDR');
