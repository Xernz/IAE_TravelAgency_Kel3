# Action Plan: Simplifying Your Microservices Architecture (Version 2.0)

This document provides a clear, instructive plan to simplify your project's architecture, **re-ordered to follow the recommended implementation path.** It has been updated with specific file, function, and variable names based on the `Microservice_Communication_Report.md`.

**It is divided into three parts, following the logical implementation order:**

1. **Simplifying Database Schemas:** Reducing table complexity and defining the new SQL schemas.
    
2. **Implementing API and GraphQL Changes:** A detailed guide on how to adapt your code to the new schemas.
    
3. **Refining the Booking Flow:** Implementing a more robust, "all-or-nothing" booking process.
    

## Part 1: Simplify the Database Schemas

**First step:** The strategy is to **remove class/type distinctions** and **merge `Availability` and `Pricing` tables** into a single, daily status table for each service. This is the foundational change.

### A. Hotel Service Simplification

- **Affected Model File:** `services/hotel-service/src/models/Hotel.js`
    
- **Goal:** A single hotel has one standard room type with a daily price and availability.
    
- **Action:** update the following SQL schema file.
    

```
-- Remove old tables if they exist
DROP TABLE IF EXISTS RoomPricing;
DROP TABLE IF EXISTS RoomAvailability;
DROP TABLE IF EXISTS RoomTypes;
DROP TABLE IF EXISTS HotelDailyStatus;
DROP TABLE IF EXISTS Hotels;

-- Create the main Hotels table for static information
CREATE TABLE Hotels (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    province VARCHAR(255) NOT NULL,
    address TEXT,
    stars INT CHECK (stars >= 1 AND stars <= 5),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the new unified table for daily price and availability
CREATE TABLE HotelDailyStatus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    available_rooms INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hotel_id) REFERENCES Hotels(id),
    UNIQUE(hotel_id, date)
);

-- Sample Data Insertion
INSERT INTO Hotels (id, name, city, province, stars, description) VALUES

INSERT INTO HotelDailyStatus (hotel_id, date, price, available_rooms) VALUES
```

### B. Flight Service Simplification

- **Affected Model File:** `services/flight-service/src/models/Flight.js`
    
- **Goal:** Each flight has a single class of seat with a daily price and availability.
    
- **Action:** update the following SQL schema file.
    

```
-- Remove old tables if they exist
DROP TABLE IF EXISTS FlightPricing;
DROP TABLE IF EXISTS FlightAvailability;
DROP TABLE IF EXISTS FlightDailyStatus;
DROP TABLE IF EXISTS Flights;

-- Create the main Flights table for static information
CREATE TABLE Flights (
    id VARCHAR(255) PRIMARY KEY,
    flight_number VARCHAR(50) NOT NULL,
    airline VARCHAR(100),
    origin_city VARCHAR(100),
    destination_city VARCHAR(100),
    departure_time TIME,
    arrival_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the new unified table for daily price and availability
CREATE TABLE FlightDailyStatus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    flight_id VARCHAR(255) NOT NULL,
    travel_date DATE NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    available_seats INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (flight_id) REFERENCES Flights(id),
    UNIQUE(flight_id, travel_date)
);

-- Sample Data Insertion
INSERT INTO Flights (id, flight_number, airline, origin_city, destination_city, departure_time, arrival_time) VALUES

INSERT INTO FlightDailyStatus (flight_id, travel_date, price, available_seats) VALUES
```

### C. Train Service Simplification

- **Affected Model File:** `services/train-service/src/models/Train.js`
    
- **Goal:** Each train route has a single class of seat with a daily price and availability.
    
- **Action:** update the following SQL schema file.
    

```
-- Remove old tables if they exist
DROP TABLE IF EXISTS TrainPricing;
DROP TABLE IF EXISTS TrainAvailability;
DROP TABLE IF EXISTS TrainDailyStatus;
DROP TABLE IF EXISTS Trains;

-- Create the main Trains table for static information
CREATE TABLE Trains (
    id VARCHAR(255) PRIMARY KEY,
    train_number VARCHAR(50) NOT NULL,
    name VARCHAR(100),
    operator VARCHAR(100),
    origin_station_name VARCHAR(100),
    destination_station_name VARCHAR(100),
    departure_time TIME,
    arrival_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the new unified table for daily price and availability
CREATE TABLE TrainDailyStatus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    train_id VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    available_seats INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (train_id) REFERENCES Trains(id),
    UNIQUE(train_id, date)
);

-- Sample Data Insertion
INSERT INTO Trains (id, train_number, name, operator, origin_station_name, destination_station_name, departure_time, arrival_time) VALUES

INSERT INTO TrainDailyStatus (train_id, date, price, available_seats) VALUES
```

### D. Local Travel Service Simplification

- **Affected Model File:** `services/local-travel-service/src/models/LocalTravel.js`
    
- **Goal:** Each local travel option has a single class with a daily price and availability.
    
- **Action:** update the following SQL schema file.
    

```
-- Remove old tables if they exist
DROP TABLE IF EXISTS LocalTravelPricing;
DROP TABLE IF EXISTS LocalTravelAvailability;
DROP TABLE IF EXISTS LocalTravelDailyStatus;
DROP TABLE IF EXISTS LocalTravel;

-- Create the main LocalTravel table for static information
CREATE TABLE LocalTravel (
    id VARCHAR(255) PRIMARY KEY,
    provider VARCHAR(100) NOT NULL,
    type VARCHAR(50), -- e.g., 'Shuttle', 'Car Rental'
    route VARCHAR(255),
    capacity INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the new unified table for daily price and availability
CREATE TABLE LocalTravelDailyStatus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    local_travel_id VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    available_units INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (local_travel_id) REFERENCES LocalTravel(id),
    UNIQUE(local_travel_id, date)
);

-- Sample Data Insertion
INSERT INTO LocalTravel (id, provider, type, route, capacity) VALUES

INSERT INTO LocalTravelDailyStatus (local_travel_id, date, price, available_units) VALUES
```

## Part 2: Implement API & GraphQL Changes

**Second step:** With the database schemas simplified, you must now update the code that interacts with them.

### A. Microservice REST API Changes

Your REST endpoints must be updated to reflect the simpler database schemas.

#### **Hotel Service**

- **Endpoint:** `POST /api/hotels/:id/availability/decrease` (and `.../increase`)
    
- **Change:** The URL no longer needs a `/rooms/:roomTypeId` segment. The `hotelId` from the URL is now sufficient.
    
- **Request Body:** The request body no longer needs a `roomTypeId`. It only needs the `date` and `quantity`.
    

#### **Flight, Train, & Local Travel Services**

- **Endpoint:** `POST /api/[service]/:id/availability/decrease` (and `.../increase`)
    
- **Request Body:** The request body for these endpoints **no longer needs a `seatClass` or `classType` parameter**. It only requires `date` and `quantity`.
    

#### **All Services - Get Availability/Pricing**

- **Endpoint:** Any endpoint like `GET /:id/availability` or `GET /:id/pricing`.
    
- **Change:** These should be consolidated. You can create a single new endpoint like `GET /:id/status?date=YYYY-MM-DD` that returns both the price and availability for that day from the new `...DailyStatus` table.
    

### B. API Gateway GraphQL Changes

The GraphQL layer must be updated to match the simplified backend.

#### **GraphQL Schema (`typeDefs`)**

1. **Remove Types:** The `RoomType` GraphQL type should be deleted entirely.
    
2. **Update Parent Types:**
    
    - The `Hotel` type should no longer have a field for `roomTypes: [RoomType]`. Instead, you might have a field like `dailyStatus(date: String): HotelDailyStatus`.
        
3. **Update Mutations:** All `decrease/increase` availability mutations must be simplified.
    
    - **Example (`decreaseFlightAvailability`):**
        
        - **Before:** `decreaseFlightAvailability(flightId: ID!, date: String!, quantity: Int!, seatClass: String!)`
            
        - **After:** `decreaseFlightAvailability(flightId: ID!, date: String!, quantity: Int!)`
            
    - Apply this change to all similar mutations for hotels, trains, etc. The `roomTypeId` and `classType` arguments should be removed.
        

#### **GraphQL Resolvers**

- Your resolvers are the core of the new booking flow as described in Part 3.
    
- They will call the new, simplified REST API endpoints described in section 2A.
    
- They will no longer pass `roomTypeId` or `seatClass` in the request body.
    
- The data they receive back will be simpler, and they must format it for the updated GraphQL types.
    

### C. Booking Service Data Changes

The simplification has a positive effect on the `booking-service` as well.

- **`BookingItems` Table:**
    
    - You no longer need a `sub_ref_id` or to store `roomTypeId`/`seat_class` in the `details` JSON blob.
        
    - The single `ref_id` (pointing to the `hotel_id`, `flight_id`, etc.) is now sufficient to uniquely identify what was booked. This makes your booking data much cleaner and easier to manage.
        

## Part 3: Refine the Booking Flow

**Final step:** Once the database and APIs are updated, implement the new booking logic. This logic will be orchestrated from your **API Gateway's `createBooking` GraphQL resolver**.

### The "All-or-Nothing" Booking Process (Orchestrated by API Gateway)

1. **Receive Request:** The flow starts when the `createBooking` resolver in the API Gateway receives a mutation with a list of items to book.
    
2. **Immediately Decrease Availability:** From the resolver, sequentially call the _newly updated_ `decreaseAvailability` REST endpoint for **every item** in the request.
    
    - `POST /api/flights/:flightId/availability/decrease`
        
    - `POST /api/hotels/:hotelId/availability/decrease`
        
    - _(and so on for train, local travel...)_
        
3. **Handle Failure (The "Nothing" Path):** If **any** availability decrease call fails, the entire booking must be aborted within the resolver.
    
    - **Action:** The resolver must immediately trigger **compensation logic**. For any service that _succeeded_ before the failure, the resolver must call its corresponding `increaseAvailability` endpoint to roll back the change.
        
    - Throw a GraphQL error to the user (e.g., "Item no longer available"). The process stops.
        
4. **Process Payment:** Only if all items were successfully secured, the resolver proceeds to call the `payment-service`.
    
    - **Action:** From the resolver, call the `payment-service` to process the payment.
        
    - **If Payment Fails:** The resolver must trigger the same compensation logic as in Step 3 to release all the inventory held.
        
5. **Finalize and Persist Booking (The "All" Path):** If payment succeeds, the booking is now confirmed and ready to be saved.
    
    - **Action:** The resolver makes a _final call_ to the **`booking-service`** (e.g., `POST /api/bookings`) with all the confirmed details. The `booking-service`'s only job in this flow is to create the `Bookings` and `BookingItems` records with a `CONFIRMED` status.
        
    - Return a success response to the user via GraphQL.