# Microservices End-to-End Testing Plan

**TODO:**
- [ ] Add `trainAvailability` GraphQL query for Train Service (maps to `/api/trains/:id/availability?date=...`)
- [ ] Consider adding direct seat decrement/increment mutations for Train, Flight, Local Travel (if not only handled via Booking Service)

This document provides a checklist and testing plan for verifying each microservice and its integration in the Travel Agency System. Use the checkboxes to track your progress.

---

## Common Issues Checklist & Lessons Learned

> Use this as a reference to proactively check and prevent common bugs in all services.

- [x] **REST Endpoint and Route Mismatch**: Ensure all REST endpoints are consistent and match what API Gateway/frontend expects.
- [x] **Malformed or Incorrect Service URLs**: Double-check all service URLs and env variables for typos and correct values.
- [x] **Database Record Existence vs. Schema**: Always verify actual DB contents, not just schema or seed files.
- [x] **Join Logic Filtering Out Data**: Use LEFT JOINs where appropriate and test when related tables may be empty.
- [x] **Callback/Function Signature Mismatch**: Always match function signatures between controllers and models.
- [x] **Field Mapping and Null Values**: Map all fields explicitly and verify names/types match between DB, model, and API response.
- [x] **Debugging and Logging**: Add debug logs for SQL queries and parameters during debugging.
- [x] **Frontend/GraphQL and Backend Misalignment**: Align frontend queries/mutations with backend capabilities and update backend as needed.

---

## 1. Train Service
- [x] **Database**: Verified sample data exists for all required tables (`Trains`, `TrainPricing`, `TrainAvailability`).
- [x] **REST Endpoints**:
  - [x] `/api/trains/:id` returns correct train details (with and without `departure_date`)
  - [x] `/api/trains/filter` supports all filters and pagination
  - [ ] `/api/trains/:id/availability?date=YYYY-MM-DD` returns correct seat availability (**missing GraphQL query**)
  - [x] `/api/trains/:id/pricing?date=YYYY-MM-DD` returns correct pricing
- [x] **GraphQL**:
  - [x] `train(id: ID)` returns correct details (with/without date)
  - [x] `filterTrains` query supports all filters, pagination, and returns expected fields
  - [x] `trainPricing(id: ID!, date: String)` returns correct pricing
  - [ ] `trainAvailability(id: ID!, date: String!): Int` (**missing, should be added**)
- [x] **Booking**:
  - [x] Booking mutation (via Booking Service) decrements seat availability and updates DB
  - [ ] No direct GraphQL mutation for seat decrement/increment (optional, could be added)

## 2. Flight Service
- [x] **Database**: Verified sample data for flights, pricing, and availability
- [x] **REST Endpoints**:
  - [x] `/api/flights/:id` returns correct flight details
  - [x] `/api/flights/filter` supports all filters and pagination
  - [x] `/api/flights/:id/availability?date=YYYY-MM-DD` returns correct seat availability
  - [x] `/api/flights/:id/pricing?date=YYYY-MM-DD` returns correct pricing
- [x] **GraphQL**:
  - [x] `flight(id: ID)` returns correct details
  - [x] `filterFlights` supports all filters, pagination, returns expected fields
  - [x] `flightPricing(id: ID!, date: String)` returns correct pricing
  - [x] `flightAvailability(id: ID!, date: String!): Int` (**implemented**)
- [x] **Booking**:
  - [x] Booking mutation (via Booking Service) decrements seat availability and updates DB
  - [ ] No direct GraphQL mutation for seat decrement/increment (optional, could be added)

## 3. Hotel Service
- [x] **Database**: Verified sample data for hotels, rooms, pricing, and availability
- [x] **REST Endpoints**:
  - [x] `/api/hotels/:id` returns correct hotel details
  - [x] `/api/hotels/filter` supports all filters and pagination
  - [x] `/api/hotels/:id/availability?date=YYYY-MM-DD` returns correct room availability
  - [x] `/api/hotels/:id/pricing?date=YYYY-MM-DD` returns correct pricing
- [x] **GraphQL**:
  - [x] `hotel(id: ID)` returns correct details
  - [x] `filterHotels` supports all filters, pagination, returns expected fields
  - [x] `hotelPricing(id: ID!, check_in: String, check_out: String)` returns correct pricing
  - [x] `hotelAvailability(hotelId: ID!, checkInDate: String!, checkOutDate: String!): [RoomAvailability]` (**implemented**)
- [x] **Booking**:
  - [x] Booking mutation (via Booking Service) decrements room availability and updates DB
  - [x] Direct GraphQL mutations for availability decrement/increment (`decreaseRoomAvailability`, `increaseRoomAvailability`)

## 4. Local Travel Service
- [x] **Database**: Verified sample data for local travel options, pricing, and availability
- [x] **REST Endpoints**:
  - [x] `/api/localtravels/:id` returns correct details
  - [x] `/api/localtravels/filter` supports all filters and pagination
  - [x] `/api/localtravels/:id/availability?date=YYYY-MM-DD` returns correct unit availability
  - [x] `/api/localtravels/:id/pricing?date=YYYY-MM-DD` returns correct pricing
- [x] **GraphQL**:
  - [x] `localTravel(id: ID)` returns correct details
  - [x] `filterLocalTravels` supports all filters, pagination, returns expected fields
  - [x] `localTravelPricing(id: ID!, date: String)` returns correct pricing
  - [x] `localTravelAvailability(id: ID!, date: String!): Int` (**implemented**)
- [x] **Booking**:
  - [x] Booking mutation (via Booking Service) decrements availability and updates DB
  - [ ] No direct GraphQL mutation for unit decrement/increment (optional, could be added)

## 5. Payment Service
- [ ] **Database**: Verify payment records and references
- [ ] **REST Endpoints**:
  - [ ] `/api/payments/:id` returns correct payment info
  - [ ] `/api/payments/create` works as expected
- [ ] **GraphQL**:
  - [ ] `payment(id: ID)` returns correct payment info
  - [ ] `createPayment` mutation works as expected

## 6. Booking Service
- [ ] **Database**: Verify booking records for all services
- [ ] **REST Endpoints**:
  - [ ] `/api/bookings/:id` returns correct booking info
  - [ ] `/api/bookings/create` works as expected
- [ ] **GraphQL**:
  - [ ] `booking(id: ID)` returns correct booking info
  - [ ] `createBooking` mutation works as expected

## 7. Users Service
- [ ] **Database**: Verify user records
- [ ] **REST Endpoints**:
  - [ ] `/api/users/:id` returns correct user info
  - [ ] `/api/users/register` and `/api/users/login` work as expected
- [ ] **GraphQL**:
  - [ ] `user(id: ID)` returns correct user info
  - [ ] `registerUser` and `loginUser` mutations work as expected

---

## General Integration
- [ ] **API Gateway**: All routes/proxies work for REST and GraphQL
- [ ] **Frontend**: All list/detail/booking/payment UIs work and display correct data
- [ ] **E2E Booking Flow**: User can search, view details, book, and pay for each service

---

## How to Use
- Work through each section and check off items as you verify them.
- Add notes or issues as you go (e.g., `[x] ... - Issue: ...`).
- Update this document as new endpoints or features are added.

---

*Last updated: 2025-06-10*
