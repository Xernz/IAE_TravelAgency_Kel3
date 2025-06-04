# Flight Service

## Overview
Provides endpoints to list, search, and retrieve flight data, as well as check seat availability. Also manages seat inventory when bookings are created or deleted via the Booking Service.

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
- `GET /flights` — List all flights
- `GET /flights/search` — Search for flights
- `GET /flights/:id` — Get flight details
- `GET /flights/:id/availability` — Check flight seat availability
- `GET /bookings/by-flight/:flightId` — Get bookings for a specific flight
- `POST /flights/decrement-seat` — Decrement available seats (called by Booking Service on booking creation)
- `POST /flights/increment-seat` — Increment available seats (called by Booking Service on booking deletion)

## Port
Default: 3002
