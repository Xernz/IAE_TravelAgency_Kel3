# Consumer Interface Backend

## Overview
This service acts as an API gateway/consumer for the Booking, Flight, and Hotel microservices. It provides unified endpoints for the front-end UI and aggregates data from the underlying services.

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
- `GET /bookings` — List all bookings (optionally filter by type: flight or hotel)
- `POST /bookings` — Create a booking (delegates to Booking Service)
- `PUT /bookings/:id` — Update a booking (delegates to Booking Service)
- `DELETE /bookings/:id` — Delete a booking (delegates to Booking Service)
- `GET /flights` — List all flights (from Flight Service)
- `GET /hotels` — List all hotels (from Hotel Service)

## Booking Logic
- For flight bookings, requires `customerId`, `flightId`, and `date`.
- For hotel bookings, requires `customerId`, `hotelId`, `startDate`, and `endDate`.
- Passes booking requests to the Booking Service, which manages seat/room inventory.

## Environment Variables
- `BOOKING_SERVICE_URL` (default: http://localhost:3001)
- `FLIGHT_SERVICE_URL` (default: http://localhost:3002)
- `HOTEL_SERVICE_URL` (default: http://localhost:3003)
- `PORT` (default: 4000)

## Port
Default: 4000
