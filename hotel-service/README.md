# Hotel Service

## Overview
Provides endpoints to list and retrieve hotel data, and manages room inventory when bookings are created or deleted via the Booking Service.

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
- `GET /hotels` — List all hotels
- `GET /hotels/:id` — Get hotel details
- `GET /hotels/:id/availability` — Check hotel room availability
- `GET /bookings/by-hotel/:hotelId` — Get bookings for a specific hotel
- `POST /hotels/decrement-room` — Decrement available rooms (called by Booking Service on booking creation)
- `POST /hotels/increment-room` — Increment available rooms (called by Booking Service on booking deletion)

## Port
Default: 3003
