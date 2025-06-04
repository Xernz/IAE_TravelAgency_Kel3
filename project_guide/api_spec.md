# API Specification: Travel Agency System

This document defines the REST API specifications for the core services of the Travel Agency System: Booking Service, Flight Service, Hotel Service, and the Consumer Interface Backend.

---

## 1. Booking Service API

### Base URL
`/bookings`

### Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/bookings` | GET | List all bookings |
| `/bookings/{id}` | GET | Retrieve booking by ID |
| `/bookings` | POST | Create a new booking (decrements seat/room) |
| `/bookings/{id}` | PUT | Update a booking |
| `/bookings/{id}` | DELETE | Delete a booking (increments seat/room) |
| `/bookings/{id}/cancel` | POST | Cancel a booking (increments seat/room) |
| `/bookings/{id}/refund` | POST | Refund a booking |

#### Request & Response Examples
- **POST /bookings**
    - Flight Booking Request Body:
      ```json
      {
        "customerId": "string",
        "flightId": "string",
        "date": "YYYY-MM-DD"
      }
      ```
    - Hotel Booking Request Body:
      ```json
      {
        "customerId": "string",
        "hotelId": "string",
        "startDate": "YYYY-MM-DD",
        "endDate": "YYYY-MM-DD"
      }
      ```
    - Response (201):
      ```json
      {
        "bookingId": "string",
        "status": "confirmed",
        "details": { ... }
      }
      ```

- **GET /bookings/{id}**
    - Response (200):
      ```json
      {
        "bookingId": "string",
        "customerId": "string",
        "flightId": "string",
        "hotelId": "string",
        "date": "YYYY-MM-DD", // for flights
        "startDate": "YYYY-MM-DD", // for hotels
        "endDate": "YYYY-MM-DD", // for hotels
        "status": "confirmed"
      }
      ```

- **POST /bookings/{id}/cancel**
    - Response (200):
      ```json
      {
        "bookingId": "string",
        "status": "cancelled"
      }
      ```

- **POST /bookings/{id}/refund**
    - Response (200):
      ```json
      {
        "bookingId": "string",
        "refundAmount": 100.00
      }
      ```

#### Common Error Response
```json
{
  "error": "Not Found",
  "message": "Booking with ID {id} not found."
}
```

---

## 2. Flight Service API

### Base URL
`/flights`

### Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/flights` | GET | List all flights |
| `/flights/search` | GET | Search flights by criteria |
| `/flights/{id}` | GET | Retrieve flight by ID |
| `/flights/{id}/availability` | GET | Check flight seat availability |
| `/flights/decrement-seat` | POST | Decrement available seats (called by Booking Service) |
| `/flights/increment-seat` | POST | Increment available seats (called by Booking Service) |
| `/bookings/by-flight/{flightId}` | GET | Get bookings for a specific flight |
| `/flights/{id}/schedule` | GET | Get flight schedule |

#### Request & Response Examples
- **POST /flights/decrement-seat**
    - Request Body:
      ```json
      { "flightId": "string" }
      ```
    - Response:
      ```json
      { "flightId": "string", "availableSeats": 3 }
      ```

- **POST /flights/increment-seat**
    - Request Body:
      ```json
      { "flightId": "string" }
      ```
    - Response:
      ```json
      { "flightId": "string", "availableSeats": 4 }
      ```

- **GET /flights/{id}/schedule**
    - Response (200):
      ```json
      {
        "flightId": "string",
        "departureTime": "YYYY-MM-DDTHH:MM:SS",
        "arrivalTime": "YYYY-MM-DDTHH:MM:SS"
      }
      ```

---

## 3. Hotel Service API

### Base URL
`/hotels`

### Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/hotels` | GET | List all hotels |
| `/hotels/{id}` | GET | Retrieve hotel by ID |
| `/hotels/{id}/availability` | GET | Check hotel room availability |
| `/hotels/decrement-room` | POST | Decrement available rooms (called by Booking Service) |
| `/hotels/increment-room` | POST | Increment available rooms (called by Booking Service) |
| `/bookings/by-hotel/{hotelId}` | GET | Get bookings for a specific hotel |
| `/hotels/{id}/amenities` | GET | Get hotel amenities |

#### Request & Response Examples
- **POST /hotels/decrement-room**
    - Request Body:
      ```json
      { "hotelId": "string" }
      ```
    - Response:
      ```json
      { "hotelId": "string", "availableRooms": 4 }
      ```

- **POST /hotels/increment-room**
    - Request Body:
      ```json
      { "hotelId": "string" }
      ```
    - Response:
      ```json
      { "hotelId": "string", "availableRooms": 5 }
      ```

- **GET /hotels/{id}/amenities**
    - Response (200):
      ```json
      {
        "hotelId": "string",
        "amenities": ["pool", "gym", "restaurant"]
      }
      ```

---

## 4. Consumer Interface Backend API

### Base URL
`/`

### Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/bookings` | GET | List all bookings (optionally filter by type) |
| `/bookings` | POST | Create a booking (delegates to Booking Service) |
| `/bookings/{id}` | PUT | Update a booking (delegates to Booking Service) |
| `/bookings/{id}` | DELETE | Delete a booking (delegates to Booking Service) |
| `/flights` | GET | List all flights (from Flight Service) |
| `/hotels` | GET | List all hotels (from Hotel Service) |
| `/bookings/{id}/payment` | POST | Process payment for a booking |

#### Notes
- Booking creation and deletion will update seat/room inventory via the Booking Service.
- All services communicate via HTTP/JSON and run on separate ports.

#### Request & Response Examples
- **POST /bookings/{id}/payment**
    - Request Body:
      ```json
      {
        "paymentMethod": "string",
        "amount": 100.00
      }
      ```
    - Response (200):
      ```json
      {
        "bookingId": "string",
        "paymentStatus": "paid"
      }
      ```
