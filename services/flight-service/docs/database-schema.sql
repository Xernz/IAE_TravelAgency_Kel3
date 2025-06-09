-- Flight Service Database Schema (Consumer Only)
USE travel_flight_db;

DROP TABLE IF EXISTS FlightPricing;
DROP TABLE IF EXISTS FlightAvailability;
DROP TABLE IF EXISTS Flights;

CREATE TABLE IF NOT EXISTS Flights (
    id INT AUTO_INCREMENT PRIMARY KEY,
    flight_number VARCHAR(20) NOT NULL,
    origin_code VARCHAR(10) NOT NULL, -- Airport IATA code
    origin_name VARCHAR(100) NOT NULL, -- Airport name
    origin_city VARCHAR(100) NOT NULL, -- City name
    destination_code VARCHAR(10) NOT NULL, -- Airport IATA code
    destination_name VARCHAR(100) NOT NULL, -- Airport name
    destination_city VARCHAR(100) NOT NULL, -- City name
    departure_time DATETIME NOT NULL,
    arrival_time DATETIME NOT NULL,
    airline_code VARCHAR(5) NOT NULL, -- Airline IATA code
    airline_name VARCHAR(100) NOT NULL, -- Airline full name
    flight_class VARCHAR(20) NOT NULL, -- Economy, Business, First
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS FlightAvailability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    flight_id INT NOT NULL,
    travel_date DATE NOT NULL,
    available_seats INT NOT NULL,
    FOREIGN KEY (flight_id) REFERENCES Flights(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- Note: available_seats is updated via /availability/decrease and /availability/increase endpoints for booking/cancellation.

CREATE TABLE IF NOT EXISTS FlightPricing (
    id INT AUTO_INCREMENT PRIMARY KEY,
    flight_id INT NOT NULL,
    travel_date DATE NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'IDR',
    FOREIGN KEY (flight_id) REFERENCES Flights(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sample Data
INSERT INTO Flights (flight_number, origin_code, origin_name, origin_city, destination_code, destination_name, destination_city, departure_time, arrival_time, airline_code, airline_name, flight_class) VALUES
('GA100', 'CGK', 'Soekarno-Hatta International Airport', 'Jakarta', 'DPS', 'Ngurah Rai International Airport', 'Denpasar', '2025-06-10 08:00:00', '2025-06-10 11:00:00', 'GA', 'Garuda Indonesia', 'Economy'),
('ID6870', 'CGK', 'Soekarno-Hatta International Airport', 'Jakarta', 'SUB', 'Juanda International Airport', 'Surabaya', '2025-06-10 09:30:00', '2025-06-10 11:15:00', 'ID', 'Batik Air', 'Economy'),
('JT707', 'CGK', 'Soekarno-Hatta International Airport', 'Jakarta', 'YIA', 'Yogyakarta International Airport', 'Yogyakarta', '2025-06-10 10:45:00', '2025-06-10 12:00:00', 'JT', 'Lion Air', 'Economy'),
('QG720', 'DPS', 'Ngurah Rai International Airport', 'Denpasar', 'CGK', 'Soekarno-Hatta International Airport', 'Jakarta', '2025-06-11 14:30:00', '2025-06-11 17:15:00', 'QG', 'Citilink', 'Economy'),
('IW1880', 'SUB', 'Juanda International Airport', 'Surabaya', 'UPG', 'Sultan Hasanuddin International Airport', 'Makassar', '2025-06-12 07:15:00', '2025-06-12 09:45:00', 'IW', 'Wings Air', 'Economy'),
('GA412', 'CGK', 'Soekarno-Hatta International Airport', 'Jakarta', 'DPS', 'Ngurah Rai International Airport', 'Denpasar', '2025-06-12 16:00:00', '2025-06-12 19:00:00', 'GA', 'Garuda Indonesia', 'Business');

INSERT INTO FlightAvailability (flight_id, travel_date, available_seats) VALUES
(1, '2025-06-10', 120),
(2, '2025-06-10', 180),
(3, '2025-06-10', 200),
(4, '2025-06-11', 150),
(5, '2025-06-12', 70),
(6, '2025-06-12', 30);

INSERT INTO FlightPricing (flight_id, travel_date, price, currency) VALUES
(1, '2025-06-10', 1850000.00, 'IDR'),
(2, '2025-06-10', 950000.00, 'IDR'),
(3, '2025-06-10', 750000.00, 'IDR'),
(4, '2025-06-11', 1650000.00, 'IDR'),
(5, '2025-06-12', 850000.00, 'IDR'),
(6, '2025-06-12', 3500000.00, 'IDR');
