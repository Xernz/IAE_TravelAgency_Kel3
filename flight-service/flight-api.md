# Flight Service API Documentation

## Service Name
Flight Service

## Purpose
Provides flight data and availability. Consumes Booking Service for booking status by flight. Manages seat inventory via dedicated endpoints.

## Base URL and Port
Base URL: `/`
Port: (see `index.js` for actual port)

## Endpoints

### 1. `GET /`
- **Description:** Health check or welcome endpoint.
- **Response:** `{ message: "Flight Service running" }`

### 2. `GET /flights`
- **Description:** List all flights.
- **Response:** Array of flights.

### 3. `GET /flights/search`
- **Description:** Search for flights.
- **Query Params:** e.g., `from`, `to`, `date`
- **Response:** Array of flights.

### 4. `GET /flights/:id`
- **Description:** Get flight details by ID.
- **Response:** Flight object or error.

### 5. `GET /flights/:id/availability`
- **Description:** Check flight availability by ID.
- **Response:** `{ flightId, availableSeats }` or error.

### 6. `GET /bookings/by-flight/:flightId`
- **Description:** Get bookings for a specific flight (consumer call to Booking Service).
- **Response:** Array of bookings or error.

### 7. `POST /flights/decrement-seat`
- **Description:** Decrement available seats for a flight (called by Booking Service on booking creation).
- **Body:** `{ flightId }`
- **Response:** `{ flightId, availableSeats }` or error.

### 8. `POST /flights/increment-seat`
- **Description:** Increment available seats for a flight (called by Booking Service on booking deletion).
- **Body:** `{ flightId }`
- **Response:** `{ flightId, availableSeats }` or error.

## Error Response Example
```json
{
  "error": "Flight not found"
}
