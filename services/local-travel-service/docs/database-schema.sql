-- Local Travel Service Database Schema (Consumer Only)
USE travel_local_travel_db;

CREATE TABLE IF NOT EXISTS LocalTravel (
    id INT AUTO_INCREMENT PRIMARY KEY,
    provider VARCHAR(64) NOT NULL,
    operator_name VARCHAR(100) NOT NULL, -- Full company name (e.g., PT. Sinar Jaya)
    type VARCHAR(32) NOT NULL, -- e.g., 'Inter-City Bus', 'Shuttle', 'Travel', 'Ojek', 'Taksi', 'Angkot'
    origin_city VARCHAR(64) NOT NULL,
    destination_city VARCHAR(64) NOT NULL,
    origin_kabupaten VARCHAR(64), -- Indonesian administrative division
    destination_kabupaten VARCHAR(64), -- Indonesian administrative division
    origin_province VARCHAR(64) NOT NULL,
    destination_province VARCHAR(64) NOT NULL,
    route VARCHAR(128), -- Detailed route information
    capacity INT, -- Number of passengers
    features TEXT, -- e.g., AC, WiFi, etc.
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS LocalTravelAvailability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    local_travel_id INT NOT NULL,
    date DATE NOT NULL,
    available_units INT NOT NULL,
    FOREIGN KEY (local_travel_id) REFERENCES LocalTravel(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- Note: available_units is updated via /availability/decrease and /availability/increase endpoints for booking/cancellation.

CREATE TABLE IF NOT EXISTS LocalTravelPricing (
    id INT AUTO_INCREMENT PRIMARY KEY,
    local_travel_id INT NOT NULL,
    date DATE NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'IDR', -- Indonesian Rupiah as default
    class_type VARCHAR(32), -- e.g., 'Ekonomi', 'Eksekutif', 'VIP'
    FOREIGN KEY (local_travel_id) REFERENCES LocalTravel(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sample Data
INSERT INTO LocalTravel (provider, operator_name, type, origin_city, destination_city, origin_kabupaten, destination_kabupaten, origin_province, destination_province, route, capacity, features, description) VALUES
('Blue Bird', 'PT. Blue Bird Tbk', 'Taksi', 'Jakarta', 'Jakarta', 'Jakarta Pusat', 'Jakarta Selatan', 'DKI Jakarta', 'DKI Jakarta', NULL, 4, 'AC, Mobile App Booking, Argo Meter', 'Layanan taksi premium di Jakarta'),
('TransJakarta', 'PT. Transportasi Jakarta', 'Bus Kota', 'Jakarta', 'Jakarta', 'Jakarta Pusat', 'Jakarta Barat', 'DKI Jakarta', 'DKI Jakarta', 'Koridor 1: Blok M - Kota', 85, 'AC, Jalur Khusus, Halte Permanen', 'Sistem bus rapid transit di Jakarta'),
('Sinar Jaya', 'PT. Sinar Jaya Megah Langgeng', 'Inter-City Bus', 'Jakarta', 'Bandung', 'Jakarta Barat', 'Bandung', 'DKI Jakarta', 'Jawa Barat', 'Jakarta - Bandung via Puncak', 40, 'AC, Kursi Reclining, Toilet, WiFi', 'Layanan bus antar kota'),
('Damri', 'Perum DAMRI', 'Shuttle', 'Tangerang', 'Jakarta', 'Tangerang', 'Jakarta Pusat', 'Banten', 'DKI Jakarta', 'Bandara Soekarno-Hatta - Gambir', 20, 'AC, Ruang Bagasi, WiFi', 'Layanan shuttle resmi bandara'),
('Gojek', 'PT. Aplikasi Karya Anak Bangsa', 'Ojek', 'Jakarta', 'Jakarta', 'Jakarta Selatan', 'Jakarta Selatan', 'DKI Jakarta', 'DKI Jakarta', NULL, 1, 'Aplikasi Mobile, Helm Disediakan, Masker', 'Layanan ojek online via aplikasi'),
('Grab', 'PT. Grab Indonesia', 'Travel', 'Yogyakarta', 'Semarang', 'Yogyakarta', 'Semarang', 'DI Yogyakarta', 'Jawa Tengah', 'Yogyakarta - Semarang via Magelang', 4, 'Aplikasi Mobile, Pilihan Mobil Beragam', 'Layanan travel antar kota'),
('Kopaja', 'Koperasi Angkutan Jakarta', 'Angkot', 'Jakarta', 'Jakarta', 'Jakarta Selatan', 'Jakarta Timur', 'DKI Jakarta', 'DKI Jakarta', 'Blok M - Kampung Melayu', 12, 'Tarif Terjangkau', 'Angkutan kota tradisional'),
('Trac', 'PT. Serasi Autoraya', 'Rental Mobil', 'Bali', 'Bali', 'Badung', 'Badung', 'Bali', 'Bali', NULL, 5, 'AC, Pilihan Mobil Beragam, Sopir/Lepas Kunci', 'Layanan sewa mobil dengan/tanpa sopir'),
('Xtrans', 'PT. Batavia Prosperindo Trans', 'Travel', 'Jakarta', 'Bandung', 'Jakarta Selatan', 'Bandung', 'DKI Jakarta', 'Jawa Barat', 'Jakarta (Pondok Indah) - Bandung (Pasteur)', 8, 'AC, Kursi Nyaman, WiFi, USB Charging', 'Layanan travel premium Jakarta-Bandung'),
('Pahala Kencana', 'PT. Pahala Kencana', 'Inter-City Bus', 'Jakarta', 'Surabaya', 'Jakarta Timur', 'Surabaya', 'DKI Jakarta', 'Jawa Timur', 'Jakarta - Surabaya via Pantura', 40, 'AC, Toilet, Selimut, Bantal, Makan', 'Bus AKAP kelas eksekutif');

INSERT INTO LocalTravelAvailability (local_travel_id, date, available_units) VALUES
(1, '2025-06-10', 25),
(2, '2025-06-10', 10),
(3, '2025-06-10', 5),
(4, '2025-06-10', 8),
(5, '2025-06-10', 50),
(6, '2025-06-10', 30),
(7, '2025-06-10', 15),
(8, '2025-06-10', 12),
(9, '2025-06-10', 6),
(10, '2025-06-10', 3);

INSERT INTO LocalTravelPricing (local_travel_id, date, price, currency, class_type) VALUES
(1, '2025-06-10', 100000.00, 'IDR', NULL), -- Blue Bird base fare + few km
(2, '2025-06-10', 3500.00, 'IDR', 'Reguler'),   -- TransJakarta single trip
(3, '2025-06-10', 120000.00, 'IDR', 'Ekonomi'), -- Sinar Jaya Jakarta-Bandung Ekonomi
(3, '2025-06-10', 150000.00, 'IDR', 'Eksekutif'), -- Sinar Jaya Jakarta-Bandung Eksekutif
(4, '2025-06-10', 75000.00, 'IDR', 'Reguler'),  -- Damri airport shuttle
(5, '2025-06-10', 15000.00, 'IDR', 'Reguler'),  -- Gojek short trip
(6, '2025-06-10', 180000.00, 'IDR', 'Reguler'),  -- Grab travel Yogya-Semarang
(7, '2025-06-10', 5000.00, 'IDR', 'Reguler'),   -- Kopaja single trip
(8, '2025-06-10', 500000.00, 'IDR', 'Ekonomi'), -- Trac car rental economy class
(8, '2025-06-10', 800000.00, 'IDR', 'Eksekutif'), -- Trac car rental executive class
(9, '2025-06-10', 135000.00, 'IDR', 'Reguler'), -- Xtrans Jakarta-Bandung
(10, '2025-06-10', 350000.00, 'IDR', 'Eksekutif'), -- Pahala Kencana Jakarta-Surabaya
(10, '2025-06-10', 250000.00, 'IDR', 'Ekonomi'); -- Pahala Kencana Jakarta-Surabaya
