# Hotel Service API Documentation

## Service Name
Hotel Service

## Purpose
Provides hotel data and room availability. Consumes Booking Service for booking status by hotel. Manages room inventory via dedicated endpoints.

## Base URL and Port
Base URL: `/`
Port: (see `index.js` for actual port)

## Endpoints

### 1. `GET /`
- **Description:** Health check or welcome endpoint.
- **Response:** `{ message: "Hotel Service running" }`

### 2. `GET /hotels`
- **Description:** List all hotels.
- **Response:** Array of hotels.

### 3. `GET /hotels/:id`
- **Description:** Get hotel details by ID.
- **Response:** Hotel object or error.

### 4. `GET /hotels/:id/availability`
- **Description:** Check hotel room availability by ID.
- **Response:** `{ hotelId, availableRooms }` or error.

### 5. `GET /bookings/by-hotel/:hotelId`
- **Description:** Get bookings for a specific hotel (consumer call to Booking Service).
- **Response:** Array of bookings or error.

### 6. `POST /hotels/decrement-room`
- **Description:** Decrement available rooms for a hotel (called by Booking Service on booking creation).
- **Body:** `{ hotelId }`
- **Response:** `{ hotelId, availableRooms }` or error.

### 7. `POST /hotels/increment-room`
- **Description:** Increment available rooms for a hotel (called by Booking Service on booking deletion).
- **Body:** `{ hotelId }`
- **Response:** `{ hotelId, availableRooms }` or error.

## Error Response Example
```json
{
  "error": "Hotel not found"
}
```
