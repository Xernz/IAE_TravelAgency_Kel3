# Test Case Workflow: Travel Agency Microservices

This document provides a step-by-step workflow to manually test the Booking, Flight, Hotel Services, and the Consumer Interface Backend, including their interconnections and inventory logic.

---

## 1. Booking Service

### Health Check
- **GET** `http://localhost:3001/`
  - **Expected:** `{ "status": "Booking Service is running." }`

### List All Bookings
- **GET** `http://localhost:3001/bookings`
  - **Expected:** List of sample bookings

### Create a Flight Booking
- **POST** `http://localhost:3001/bookings`
  - **Body:**
    ```json
    {
      "customerId": "CUST003",
      "flightId": "FL001",
      "date": "2025-07-01"
    }
    ```
  - **Expected:** Booking created, status `confirmed`, and available seats for FL001 decremented by 1

### Create a Hotel Booking
- **POST** `http://localhost:3001/bookings`
  - **Body:**
    ```json
    {
      "customerId": "CUST004",
      "hotelId": "HT001",
      "startDate": "2025-07-01",
      "endDate": "2025-07-05"
    }
    ```
  - **Expected:** Booking created, status `confirmed`, and available rooms for HT001 decremented by 1

### Delete a Booking
- **DELETE** `http://localhost:3001/bookings/BKG1001`
  - **Expected:** Booking deleted, and corresponding seat/room incremented

### Retrieve Booking by ID
- **GET** `http://localhost:3001/bookings/BKG1001`
  - **Expected:** Details of booking with ID `BKG1001` or error if deleted

---

## 2. Flight Service

### Health Check
- **GET** `http://localhost:3002/`
  - **Expected:** `{ "message": "Flight Service running" }`

### List All Flights
- **GET** `http://localhost:3002/flights`
  - **Expected:** List of flights

### Check Flight Availability
- **GET** `http://localhost:3002/flights/FL001/availability`
  - **Expected:** `{ "flightId": "FL001", "availableSeats": <number> }`

### Decrement Seat (Simulate Booking)
- **POST** `http://localhost:3002/flights/decrement-seat`
  - **Body:** `{ "flightId": "FL001" }`
  - **Expected:** Available seats for FL001 decremented by 1

### Increment Seat (Simulate Cancel)
- **POST** `http://localhost:3002/flights/increment-seat`
  - **Body:** `{ "flightId": "FL001" }`
  - **Expected:** Available seats for FL001 incremented by 1

---

## 3. Hotel Service

### Health Check
- **GET** `http://localhost:3003/`
  - **Expected:** `{ "message": "Hotel Service running" }`

### List All Hotels
- **GET** `http://localhost:3003/hotels`
  - **Expected:** List of hotels

### Check Hotel Availability
- **GET** `http://localhost:3003/hotels/HT001/availability`
  - **Expected:** `{ "hotelId": "HT001", "availableRooms": <number> }`

### Decrement Room (Simulate Booking)
- **POST** `http://localhost:3003/hotels/decrement-room`
  - **Body:** `{ "hotelId": "HT001" }`
  - **Expected:** Available rooms for HT001 decremented by 1

### Increment Room (Simulate Cancel)
- **POST** `http://localhost:3003/hotels/increment-room`
  - **Body:** `{ "hotelId": "HT001" }`
  - **Expected:** Available rooms for HT001 incremented by 1

---

## 4. Consumer Interface Backend

### Health Check
- **GET** `http://localhost:4000/`
  - **Expected:** `{ "message": "Consumer Interface Backend running" }`

### List All Bookings (Unified)
- **GET** `http://localhost:4000/bookings`
  - **Expected:** List of all bookings

### Create Booking (Unified)
- **POST** `http://localhost:4000/bookings`
  - **Body:** (Flight or Hotel booking payload as above)
  - **Expected:** Booking created and inventory updated accordingly

### List All Flights (Unified)
- **GET** `http://localhost:4000/flights`
  - **Expected:** List of flights

### List All Hotels (Unified)
- **GET** `http://localhost:4000/hotels`
  - **Expected:** List of hotels

---

## Notes
- After each booking creation or deletion, verify that the available seats/rooms are updated in the respective service.
- All API calls use JSON over HTTP.
- Test both success and error cases (e.g., overbooking, invalid IDs).

_Use Postman, curl, or your browser to perform these requests. Update this file as you add new features or endpoints._
