-- Booking Service Database Schema (Consumer Only)
USE travel_booking_db;

CREATE TABLE IF NOT EXISTS Bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_code VARCHAR(20) NOT NULL, -- Unique booking reference code
    user_id INT NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    total_amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'IDR',
    payment_status ENUM('unpaid', 'partial', 'paid') DEFAULT 'unpaid',
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS BookingItems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    type ENUM('flight','hotel','train','local_travel') NOT NULL,
    ref_id INT NOT NULL,
    travel_date DATE,
    quantity INT DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    origin_city VARCHAR(64),
    destination_city VARCHAR(64),
    origin_province VARCHAR(64),
    destination_province VARCHAR(64),
    service_class VARCHAR(50),  -- For train: 'Ekonomi', 'Bisnis', 'Eksekutif'; For flight: 'Economy', 'Business', 'First'
    provider VARCHAR(100),      -- Airline, hotel chain, train operator, or local travel provider
    details JSON,
    FOREIGN KEY (booking_id) REFERENCES Bookings(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sample Data
INSERT INTO Bookings (booking_code, user_id, status, total_amount, currency, payment_status) VALUES 
('BOOK-ID-001', 1, 'confirmed', 2500000.00, 'IDR', 'paid'),
('BOOK-ID-002', 2, 'pending', 3750000.00, 'IDR', 'unpaid'),
('BOOK-ID-003', 3, 'confirmed', 1250000.00, 'IDR', 'paid');
INSERT INTO BookingItems (booking_id, type, ref_id, travel_date, quantity, unit_price, subtotal, origin_city, destination_city, origin_province, destination_province, service_class, provider, details) VALUES
(1, 'flight', 1, '2025-06-10', 1, 1850000.00, 1850000.00, 'Jakarta', 'Denpasar', 'DKI Jakarta', 'Bali', 'Economy', 'Garuda Indonesia', '{"flight_number": "GA100", "seat": "12A", "passenger": "Budi Santoso", "departure_time": "07:30:00", "arrival_time": "10:15:00", "terminal": "3"}'),
(1, 'hotel', 1, '2025-06-10', 2, 325000.00, 650000.00, 'Denpasar', null, 'Bali', null, 'Deluxe', 'Hotel Mulia Senayan', '{"room": "Deluxe Garden View", "nights": 2, "guests": 2, "check_in": "14:00:00", "check_out": "12:00:00", "address": "Jl. Pantai Kuta No. 88, Kuta, Bali", "facilities": ["WiFi", "Swimming Pool", "Breakfast"]}'),
(2, 'flight', 2, '2025-06-11', 2, 950000.00, 1900000.00, 'Jakarta', 'Surabaya', 'DKI Jakarta', 'Jawa Timur', 'Economy', 'Batik Air', '{"flight_number": "ID6870", "seats": ["14C", "14D"], "passengers": ["Siti Rahayu", "Ahmad Wijaya"], "departure_time": "09:15:00", "arrival_time": "10:45:00", "terminal": "2F"}'),
(2, 'hotel', 3, '2025-06-11', 3, 350000.00, 1050000.00, 'Bandung', null, 'Jawa Barat', null, 'Superior', 'Aston Pasteur', '{"room": "Superior Twin", "nights": 3, "guests": 2, "check_in": "14:00:00", "check_out": "12:00:00", "address": "Jl. Dr. Djunjunan No. 162, Pasteur, Bandung", "facilities": ["WiFi", "Breakfast", "Parking"]}'),
(2, 'train', 5, '2025-06-15', 2, 375000.00, 750000.00, 'Jakarta', 'Yogyakarta', 'DKI Jakarta', 'DI Yogyakarta', 'Eksekutif', 'PT Kereta Api Indonesia (Persero)', '{"train": "Taksaka", "train_code": "KA-5", "seats": ["5A", "5B"], "passengers": ["Siti Rahayu", "Ahmad Wijaya"], "departure_time": "08:00:00", "arrival_time": "15:30:00", "origin_station": "Gambir", "destination_station": "Yogyakarta"}'),
(3, 'local_travel', 3, '2025-06-12', 1, 120000.00, 120000.00, 'Jakarta', 'Bandung', 'DKI Jakarta', 'Jawa Barat', 'Eksekutif', 'PT. Sinar Jaya Megah Langgeng', '{"type": "Inter-City Bus", "seat": "15B", "passenger": "Dewi Lestari", "departure_time": "07:00:00", "arrival_time": "10:30:00", "origin_terminal": "Terminal Kampung Rambutan", "destination_terminal": "Terminal Leuwi Panjang"}'),
(3, 'train', 8, '2025-06-13', 2, 10000.00, 20000.00, 'Yogyakarta', 'Solo', 'DI Yogyakarta', 'Jawa Tengah', 'Ekonomi AC', 'PT Kereta Api Indonesia (Persero)', '{"train": "Prambanan Express", "train_code": "KA-8", "seats": ["8C", "8D"], "passengers": ["Dewi Lestari", "Budi Santoso"], "departure_time": "06:00:00", "arrival_time": "07:15:00", "origin_station": "Yogyakarta", "destination_station": "Solo Balapan"}'),
(3, 'hotel', 4, '2025-06-13', 2, 125000.00, 250000.00, 'Solo', null, 'Jawa Tengah', null, 'Standard', 'Losmen Setia Kawan', '{"room": "Standard Twin", "nights": 2, "guests": 2, "check_in": "14:00:00", "check_out": "12:00:00", "address": "Jl. Slamet Riyadi No. 366, Solo, Jawa Tengah", "facilities": ["WiFi", "Fan"]}');
