-- Train Service Database Schema (Consumer Only)
USE travel_train_db;

DROP TABLE IF EXISTS TrainPricing;
DROP TABLE IF EXISTS TrainAvailability;
DROP TABLE IF EXISTS TrainDailyStatus;
DROP TABLE IF EXISTS Trains;

CREATE TABLE IF NOT EXISTS Trains (
    id INT AUTO_INCREMENT PRIMARY KEY,
    train_code VARCHAR(20) NOT NULL, -- KAI train code (e.g., KA-123)
    name VARCHAR(64) NOT NULL, -- Train name (e.g., Argo Bromo Anggrek)
    operator VARCHAR(64) DEFAULT 'PT Kereta Api Indonesia (Persero)',
    origin_station_code VARCHAR(10) NOT NULL, -- Station code (e.g., GMR)
    origin_station_name VARCHAR(100) NOT NULL, -- Station name (e.g., Gambir)
    origin_city VARCHAR(64) NOT NULL, -- City name (e.g., Jakarta)
    origin_province VARCHAR(64) NOT NULL, -- Province name (e.g., DKI Jakarta)
    destination_station_code VARCHAR(10) NOT NULL, -- Station code (e.g., SBI)
    destination_station_name VARCHAR(100) NOT NULL, -- Station name (e.g., Surabaya Gubeng)
    destination_city VARCHAR(64) NOT NULL, -- City name (e.g., Surabaya)
    destination_province VARCHAR(64) NOT NULL, -- Province name (e.g., Jawa Timur)
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    travel_duration INT NOT NULL, -- in minutes
    train_type VARCHAR(50), -- Type of train (e.g., Kereta Api Jarak Jauh, Kereta Api Lokal, Kereta Api Komuter)
    description TEXT,
    facilities TEXT, -- Facilities in Bahasa Indonesia
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS TrainDailyStatus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    train_id INT NOT NULL,
    date DATE NOT NULL,
    available_seats INT NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'IDR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (train_id) REFERENCES Trains(id) ON DELETE CASCADE,
    UNIQUE KEY uq_train_date (train_id, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sample Data
INSERT INTO Trains (train_code, name, operator, origin_station_code, origin_station_name, origin_city, origin_province, destination_station_code, destination_station_name, destination_city, destination_province, departure_time, arrival_time, travel_duration, train_type, description, facilities) VALUES
('KA-1', 'Argo Bromo Anggrek', 'PT Kereta Api Indonesia (Persero)', 'GMR', 'Gambir', 'Jakarta', 'DKI Jakarta', 'SBI', 'Surabaya Pasar Turi', 'Surabaya', 'Jawa Timur', '08:00:00', '16:30:00', 510, 'Kereta Api Jarak Jauh', 'Kereta api ekspres premium Jakarta-Surabaya', 'AC, Kursi Bisa Direbahkan, Stop Kontak, Restorasi, WiFi'),
('KA-2', 'Gajayana', 'PT Kereta Api Indonesia (Persero)', 'GMR', 'Gambir', 'Jakarta', 'DKI Jakarta', 'ML', 'Malang', 'Malang', 'Jawa Timur', '18:30:00', '07:15:00', 765, 'Kereta Api Jarak Jauh', 'Kereta api malam Jakarta-Malang', 'AC, Kursi Bisa Direbahkan, Stop Kontak, Restorasi, Selimut, Bantal'),
('KA-3', 'Argo Dwipangga', 'PT Kereta Api Indonesia (Persero)', 'GMR', 'Gambir', 'Jakarta', 'DKI Jakarta', 'SLO', 'Solo Balapan', 'Solo', 'Jawa Tengah', '08:30:00', '16:00:00', 450, 'Kereta Api Jarak Jauh', 'Kereta api ekspres Jakarta-Solo', 'AC, Kursi Bisa Direbahkan, Stop Kontak, WiFi'),
('KA-4', 'Lodaya', 'PT Kereta Api Indonesia (Persero)', 'BD', 'Bandung', 'Bandung', 'Jawa Barat', 'SLO', 'Solo Balapan', 'Solo', 'Jawa Tengah', '07:00:00', '15:30:00', 510, 'Kereta Api Jarak Jauh', 'Kereta api ekspres Bandung-Solo', 'AC, Kursi Bisa Direbahkan, Stop Kontak'),
('KA-5', 'Taksaka', 'PT Kereta Api Indonesia (Persero)', 'GMR', 'Gambir', 'Jakarta', 'DKI Jakarta', 'YK', 'Yogyakarta', 'Yogyakarta', 'DI Yogyakarta', '08:00:00', '15:30:00', 450, 'Kereta Api Jarak Jauh', 'Kereta api ekspres Jakarta-Yogyakarta', 'AC, Kursi Bisa Direbahkan, Stop Kontak, WiFi'),
('KA-6', 'Sancaka', 'PT Kereta Api Indonesia (Persero)', 'YK', 'Yogyakarta', 'Yogyakarta', 'DI Yogyakarta', 'SBI', 'Surabaya Gubeng', 'Surabaya', 'Jawa Timur', '06:15:00', '11:45:00', 330, 'Kereta Api Jarak Jauh', 'Kereta api ekspres Yogyakarta-Surabaya', 'AC, Kursi Bisa Direbahkan, Stop Kontak'),
('KA-7', 'Serayu', 'PT Kereta Api Indonesia (Persero)', 'GMR', 'Gambir', 'Jakarta', 'DKI Jakarta', 'KY', 'Kroya', 'Cilacap', 'Jawa Tengah', '07:30:00', '15:00:00', 450, 'Kereta Api Jarak Menengah', 'Kereta api regional Jakarta-Kroya', 'AC, Kursi Standar'),
('KA-8', 'Prambanan Express', 'PT Kereta Api Indonesia (Persero)', 'YK', 'Yogyakarta', 'Yogyakarta', 'DI Yogyakarta', 'SLO', 'Solo Balapan', 'Solo', 'Jawa Tengah', '06:00:00', '07:15:00', 75, 'Kereta Api Komuter', 'Kereta api komuter Yogyakarta-Solo', 'AC, Kursi Standar'),
('KA-9', 'Malioboro Express', 'PT Kereta Api Indonesia (Persero)', 'TG', 'Tugu', 'Yogyakarta', 'DI Yogyakarta', 'GMR', 'Gambir', 'Jakarta', 'DKI Jakarta', '20:00:00', '04:15:00', 495, 'Kereta Api Jarak Jauh', 'Kereta api malam Yogyakarta-Jakarta', 'AC, Kursi Bisa Direbahkan, Stop Kontak, Selimut, Bantal, WiFi'),
('KA-10', 'Bima', 'PT Kereta Api Indonesia (Persero)', 'GMR', 'Gambir', 'Jakarta', 'DKI Jakarta', 'SBI', 'Surabaya Gubeng', 'Surabaya', 'Jawa Timur', '17:00:00', '04:30:00', 690, 'Kereta Api Jarak Jauh', 'Kereta api malam Jakarta-Surabaya', 'AC, Kursi Bisa Direbahkan, Stop Kontak, Restorasi, Selimut, Bantal, WiFi');

-- Sample Data for TrainDailyStatus
-- Combining data from former TrainAvailability and TrainPricing (using 'Regular' price where multiple categories existed)
INSERT INTO TrainDailyStatus (train_id, date, available_seats, price, currency) VALUES
(1, '2025-06-10', 350, 450000.00, 'IDR'), -- Argo Bromo Anggrek (was Eksekutif A)
(2, '2025-06-10', 280, 500000.00, 'IDR'), -- Gajayana (was Eksekutif A)
(3, '2025-06-10', 300, 350000.00, 'IDR'), -- Argo Dwipangga (was Eksekutif A)
(4, '2025-06-10', 320, 300000.00, 'IDR'), -- Lodaya (was Eksekutif B)
(5, '2025-06-10', 350, 375000.00, 'IDR'), -- Taksaka (was Eksekutif A, Regular price)
(6, '2025-06-10', 300, 250000.00, 'IDR'), -- Sancaka (was Eksekutif B)
(7, '2025-06-10', 400, 180000.00, 'IDR'), -- Serayu (was Bisnis H)
(8, '2025-06-10', 250, 10000.00, 'IDR'),  -- Prambanan Express (was Ekonomi AC C)
(9, '2025-06-10', 320, 450000.00, 'IDR'), -- Malioboro Express (was Eksekutif A)
(10, '2025-06-10', 380, 480000.00, 'IDR'); -- Bima (was Eksekutif A)

-- Note: Data migration from old tables to TrainDailyStatus would be required in a real scenario.
-- The sample data above is illustrative and replaces the old sample data for TrainAvailability and TrainPricing.
