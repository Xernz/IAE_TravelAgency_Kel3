# Inter-Service and Consumer Interface Communication Flow Documentation

## Overview
The Travel Agency System consists of four main services:
- Booking Service
- Flight Service
- Hotel Service
- Consumer Interface Backend

Each service acts as both a provider (exposing its own data via REST APIs) and a consumer (fetching data from other services). This document describes how these services communicate with each other.

## Service Roles and Communication

### 1. Booking Service (Consumer)
- **Calls:**
  - **Flight Service**
    - `POST /flights/decrement-seat` — Decrement seat when booking created
    - `POST /flights/increment-seat` — Increment seat when booking deleted
    - `GET /flights/:id` — Retrieves flight details
    - `GET /flights/search` — Searches for available flights
    - `GET /flights/:id/availability` — Checks flight availability
  - **Hotel Service**
    - `POST /hotels/decrement-room` — Decrement room when booking created
    - `POST /hotels/increment-room` — Increment room when booking deleted
    - `GET /hotels/:id` — Retrieves hotel details
    - `GET /hotels/:id/availability` — Checks hotel room availability
- **Purpose:**
  - To manage seat/room inventory and collect up-to-date information when creating or deleting bookings.

### 2. Flight Service (Consumer)
- **Calls:**
  - **Booking Service**
    - `GET /bookings/by-flight/:flightId` — Retrieves all bookings associated with a given flight.
- **Purpose:**
  - To determine booking status and availability for flights.

### 3. Hotel Service (Consumer)
- **Calls:**
  - **Booking Service**
    - `GET /bookings/by-hotel/:hotelId` — Retrieves all bookings associated with a given hotel room.
- **Purpose:**
  - To determine booking status and availability for hotel rooms.

### 4. Consumer Interface Backend (Consumer/API Gateway)
- **Calls:**
  - **Booking Service**
    - `GET /bookings`, `POST /bookings`, `PUT /bookings/:id`, `DELETE /bookings/:id`
  - **Flight Service**
    - `GET /flights`
  - **Hotel Service**
    - `GET /hotels`
- **Purpose:**
  - To provide a unified API for the front-end UI and aggregate data from the underlying microservices.

## Data Flow Example
- When a user creates a booking via the Consumer Interface Backend, the backend calls the Booking Service, which then updates seat/room inventory in the Flight/Hotel Service as needed.
- When a booking is deleted, the Booking Service ensures inventory is restored.
- The UI always gets the latest data by querying the Consumer Interface Backend, which aggregates from all services.

## System Architecture Diagram (Textual)

```
[Client]
   |
   v
[Consumer Interface Backend]
   |
   v
[Booking Service] <------> [Flight Service]
      |                        |
      v                        v
[Hotel Service] <------------>
```
- Arrows indicate bidirectional HTTP communication for data retrieval and inventory management.

## Summary Table
| Service         | Consumes From      | Endpoints Called                         |
|-----------------|-------------------|------------------------------------------|
| Booking         | Flight, Hotel     | /flights/:id, /flights/search, /flights/:id/availability, /flights/decrement-seat, /flights/increment-seat, /hotels/:id, /hotels/:id/availability, /hotels/decrement-room, /hotels/increment-room |
| Flight          | Booking           | /bookings/by-flight/:flightId            |
| Hotel           | Booking           | /bookings/by-hotel/:hotelId              |
| Consumer Backend| Booking, Flight, Hotel | /bookings, /flights, /hotels        |

## Notes
- All inter-service calls use HTTP and JSON.
- Each service runs on its own port.
- Services are designed to be independently deployable.
- Inventory management is now handled via dedicated increment/decrement endpoints.
