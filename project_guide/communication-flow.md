# Inter-Service and Consumer Interface Communication Flow Documentation

## Overview
The Travel Agency System consists of the following components:
- **API Gateway** (central entry point for all frontend and cross-service calls)
- **Frontend:** React + Material-UI (consumer-facing UI)
- **Microservices:**
  - Users Service
  - Booking Service
  - Payment Service
  - Flight Service
  - Hotel Service
  - Train Service
  - Local Travel Service

All services are decoupled and communicate via REST or GraphQL APIs, with the API Gateway acting as the primary orchestrator for both frontend and most inter-service flows.

## Communication Patterns

### 1. Frontend ↔ API Gateway
- **GraphQL:** Used for booking workflows (create, modify, cancel, query bookings)
- **REST:** Used for payments, user profile, and search endpoints
- **Authentication:** Managed via API Gateway (passes JWT/session to downstream services)

### 2. API Gateway ↔ Microservices
- **Routes requests** to the appropriate backend service (REST or GraphQL)
- **Aggregates data** for complex UI queries (e.g., user dashboard, booking history)
- **Handles service discovery and error translation**

### 3. Inter-Service Communication
- **Booking Service**:
  - Calls Flight, Hotel, Train, Local Travel Services to check availability and reserve/release inventory (via REST endpoints)
  - Calls Payment Service to initiate or verify payments (REST)
  - Calls Users Service to verify user existence and fetch user details (REST)
- **Payment Service**:
  - Notifies Booking Service of payment status (callback or polling via REST)
- **Search Services (Flight, Hotel, Train, Local Travel):**
  - Expose REST endpoints for search and availability
  - No direct calls to other services (stateless)
- **Users Service:**
  - Handles registration, authentication, and profile management
  - Exposes REST endpoints for user CRUD

## Example Flows

### Booking Creation (Frontend → API Gateway → Services)
1. User initiates booking via frontend (GraphQL mutation to API Gateway)
2. API Gateway calls Booking Service (GraphQL)
3. Booking Service checks inventory with Flight/Hotel/Train/Local Travel Services (REST)
4. If available, Booking Service creates booking and returns booking ID
5. User proceeds to payment (REST call via API Gateway to Payment Service)

### Payment Flow
1. User selects "Pay Now" (frontend → API Gateway → Payment Service)
2. Payment Service processes payment and updates status
3. Payment Service notifies Booking Service of payment result

### Search Flow
- Frontend calls API Gateway (REST)
- API Gateway forwards to relevant service (Flight/Hotel/Train/Local Travel)
- Results are returned to the frontend

## Diagram (Textual)

Frontend (React) ⇄ API Gateway ⇄ [Users | Booking | Payment | Flight | Hotel | Train | Local Travel]

- All cross-service and frontend-service communication is routed through the API Gateway for security, aggregation, and monitoring.

## Notes
- All services expose OpenAPI/Swagger (REST) or SDL (GraphQL) documentation.
- Logging, monitoring, and error handling are standardized across all services.
- For detailed API specs, see `project_guide/api_docs/README.md`.
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
