# Booking Service

## Overview
Provides endpoints for creating, reading, updating, and deleting bookings for flights and hotels. Stores data in-memory for demo purposes. Automatically manages seat and room inventory by communicating with the Flight and Hotel Services when bookings are created or deleted.

## How to Run
1. Install dependencies (if needed):
   ```bash
   npm install
   ```
2. Start the service:
   ```bash
   node index.js
   ```

## Endpoints
- `GET /` — Health check
- `GET /bookings` — List all bookings
- `POST /bookings` — Create a booking (requires customerId, and for flights: flightId and date; for hotels: hotelId, startDate, endDate)
- `PUT /bookings/:id` — Update a booking
- `DELETE /bookings/:id` — Delete a booking (automatically restores seat/room)

## Inventory Management
- When a booking is created, the service decrements the available seat (for flights) or room (for hotels) by calling the respective microservice.
- When a booking is deleted, the service increments the available seat/room by calling the respective microservice.

## Port
Default: 3001
