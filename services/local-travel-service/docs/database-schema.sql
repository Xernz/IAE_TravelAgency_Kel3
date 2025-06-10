-- Local Travel Service Database Schema (Consumer Only)
USE travel_local_travel_db;

DROP TABLE IF EXISTS LocalTravel;
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
    departure_time VARCHAR(32),
    arrival_time VARCHAR(32),
    vehicle_model VARCHAR(64),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS LocalTravelAvailability;
CREATE TABLE IF NOT EXISTS LocalTravelAvailability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    local_travel_id INT NOT NULL,
    date DATE NOT NULL,
    available_units INT NOT NULL,
    FOREIGN KEY (local_travel_id) REFERENCES LocalTravel(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- Note: available_units is updated via /availability/decrease and /availability/increase endpoints for booking/cancellation.

DROP TABLE IF EXISTS LocalTravelPricing;
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
INSERT INTO LocalTravel (provider, operator_name, type, origin_city, destination_city, origin_kabupaten, destination_kabupaten, origin_province, destination_province, route, capacity, features, departure_time, arrival_time, vehicle_model, description) VALUES
('Blue Bird', 'PT. Blue Bird Tbk', 'Taksi', 'Jakarta', 'Jakarta', 'Jakarta Pusat', 'Jakarta Selatan', 'DKI Jakarta', 'DKI Jakarta', NULL, 4, 'AC, Mobile App Booking, Argo Meter', '08:00', '08:30', 'Toyota Alphard', 'Layanan taksi premium di Jakarta'),
('TransJakarta', 'PT. Transportasi Jakarta', 'Bus Kota', 'Jakarta', 'Jakarta', 'Jakarta Pusat', 'Jakarta Barat', 'DKI Jakarta', 'DKI Jakarta', 'Koridor 1: Blok M - Kota', 85, 'AC, Jalur Khusus, Halte Permanen', '06:00', '23:00', 'Mercedes-Benz OH 1626', 'Sistem bus rapid transit di Jakarta'),
('Sinar Jaya', 'PT. Sinar Jaya Megah Langgeng', 'Inter-City Bus', 'Jakarta', 'Bandung', 'Jakarta Barat', 'Bandung', 'DKI Jakarta', 'Jawa Barat', 'Jakarta - Bandung via Puncak', 40, 'AC, Kursi Reclining, Toilet, WiFi', '07:00', '11:00', 'Hino RK8', 'Layanan bus antar kota'),
('Damri', 'Perum DAMRI', 'Shuttle', 'Tangerang', 'Jakarta', 'Tangerang', 'Jakarta Pusat', 'Banten', 'DKI Jakarta', 'Bandara Soekarno-Hatta - Gambir', 20, 'AC, Ruang Bagasi, WiFi', '05:00', '06:00', 'Isuzu ELF', 'Layanan shuttle resmi bandara'),
('Gojek', 'PT. Aplikasi Karya Anak Bangsa', 'Ojek', 'Jakarta', 'Jakarta', 'Jakarta Selatan', 'Jakarta Selatan', 'DKI Jakarta', 'DKI Jakarta', NULL, 1, 'Aplikasi Mobile, Helm Disediakan, Masker', 'Anytime', 'Anytime', 'Honda Vario', 'Layanan ojek online via aplikasi'),
('Grab', 'PT. Grab Indonesia', 'Travel', 'Yogyakarta', 'Semarang', 'Yogyakarta', 'Semarang', 'DI Yogyakarta', 'Jawa Tengah', 'Yogyakarta - Semarang via Magelang', 4, 'Aplikasi Mobile, Pilihan Mobil Beragam', '09:00', '12:00', 'Toyota Innova', 'Layanan travel antar kota'),
('Kopaja', 'Koperasi Angkutan Jakarta', 'Angkot', 'Jakarta', 'Jakarta', 'Jakarta Selatan', 'Jakarta Timur', 'DKI Jakarta', 'DKI Jakarta', 'Blok M - Kampung Melayu', 12, 'Tarif Terjangkau', '05:30', '22:00', 'Mitsubishi Colt Diesel', 'Angkutan kota tradisional'),
('Trac', 'PT. Serasi Autoraya', 'Rental Mobil', 'Bali', 'Bali', 'Badung', 'Badung', 'Bali', 'Bali', NULL, 5, 'AC, Pilihan Mobil Beragam, Sopir/Lepas Kunci', '08:00', '12:00', 'Toyota Innova', 'Layanan sewa mobil dengan/tanpa sopir'),
('Xtrans', 'PT. Batavia Prosperindo Trans', 'Travel', 'Jakarta', 'Bandung', 'Jakarta Selatan', 'Bandung', 'DKI Jakarta', 'Jawa Barat', 'Jakarta (Pondok Indah) - Bandung (Pasteur)', 8, 'AC, Kursi Nyaman, WiFi, USB Charging', '07:00', '11:00', 'Toyota Innova', 'Layanan travel premium Jakarta-Bandung'),
('Pahala Kencana', 'PT. Pahala Kencana', 'Inter-City Bus', 'Jakarta', 'Surabaya', 'Jakarta Timur', 'Surabaya', 'DKI Jakarta', 'Jawa Timur', 'Jakarta - Surabaya via Pantura', 40, 'AC, Toilet, Selimut, Bantal, Makan', '06:00', '10:00', 'Toyota Innova', 'Bus AKAP kelas eksekutif');

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
