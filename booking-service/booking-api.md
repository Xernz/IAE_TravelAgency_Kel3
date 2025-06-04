# Booking Service API Documentation

## Service Name
Booking Service

## Purpose
Handles creation, retrieval, update, and deletion of bookings. Acts as a consumer of Flight and Hotel services for booking-related data.

## Base URL and Port
Base URL: `/`
Port: (see `index.js` for actual port)

## Endpoints

### 1. `GET /`
- **Description:** Health check or welcome endpoint.
- **Response:** `{ message: "Booking Service running" }`

### 2. `POST /bookings`
- **Description:** Create a new booking.
- **Request Body:**
  - `userId` (string)
  - `flightId` (string)
  - `hotelId` (string)
  - `dates` (object: `{ checkIn, checkOut }`)
- **Response:**
  - `201 Created` with booking object
- **Example Request:**
```json
{
  "userId": "123",
  "flightId": "F1001",
  "hotelId": "H2001",
  "dates": { "checkIn": "2025-05-01", "checkOut": "2025-05-07" }
}
```
- **Example Response:**
```json
{
  "id": "B3001",
  "userId": "123",
  "flightId": "F1001",
  "hotelId": "H2001",
  "dates": { "checkIn": "2025-05-01", "checkOut": "2025-05-07" }
}
```

### 3. `GET /bookings`
- **Description:** List all bookings.
- **Response:** Array of bookings.

### 4. `GET /bookings/:id`
- **Description:** Retrieve a booking by ID.
- **Response:** Booking object or error.

### 5. `PUT /bookings/:id`
- **Description:** Update a booking by ID.
- **Request Body:** Same as creation.
- **Response:** Updated booking object or error.

### 6. `DELETE /bookings/:id`
- **Description:** Delete a booking by ID.
- **Response:** Success message or error.

### 7. `GET /flights/:id`
- **Description:** Retrieve flight details (consumer call to Flight Service).
- **Response:** Flight object or error.

### 8. `GET /flights/search`
- **Description:** Search for flights (consumer call to Flight Service).
- **Query Params:** e.g., `origin`, `destination`, `date`
- **Response:** Array of flights.

### 9. `GET /hotels/:id`
- **Description:** Retrieve hotel details (consumer call to Hotel Service).
- **Response:** Hotel object or error.

### 10. `GET /hotels/:id/availability`
- **Description:** Check hotel availability (consumer call to Hotel Service).
- **Response:** Availability object or error.

### 11. `GET /flights/:id/availability`
- **Description:** Check flight availability (consumer call to Flight Service).
- **Response:** Availability object or error.

## Error Response Example
```json
{
  "error": "Booking not found"
}
```
