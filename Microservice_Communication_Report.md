# Microservice Communication Report: API Gateway and Backend Services

## 1. Introduction

- Brief overview of the travel agency system's backend architecture.
- Purpose of the report: To document the communication flow between the API Gateway (GraphQL) and the microservices (REST).

## 2. High-Level Architecture Overview

- A simple diagram or description illustrating the API Gateway and the different microservices.

## 3. API Gateway (`api-gateway`)

### 3.1. Overview
   - Entry point: `index.js`
   - Utilizes Express.js, `http-proxy-middleware` for REST proxying, and Apollo Server for GraphQL.
   - GraphQL endpoint: `/graphql`

### 3.2. GraphQL Interface Setup (`api-gateway/graphql/index.js`)
   - Combines `typeDefs` and `resolvers` from individual domain files (e.g., `users.js`, `train.js`).
   - Instantiates `ApolloServer` with combined schemas and resolvers.

### 3.3. Communication with Microservices
   - Resolvers use `node-fetch` to make HTTP requests to downstream microservice REST APIs.
   - Microservice base URLs are typically defined within each domain's resolver file (e.g., `USERS_SERVICE_URL = 'http://localhost:3001/api/users'`).

## 4. Microservice Details (`services`)

### 4.1. Users Service (`users-service`)

#### 4.1.1. Purpose
   - Manages all aspects of user accounts, including registration, authentication, profile information, and querying user data.

#### 4.1.2. API Gateway GraphQL to Service REST Mapping (`api-gateway/graphql/users.js`)
   - **GraphQL Schema (`typeDefs`):**
     - Types: `User`, `AuthPayload`, `RegisterInput`, `UserFilterInput`, etc.
     - Queries: `users`, `user(id: ID!)`, `filterUsers(...)`
     - Mutations: `updateUser(...)`, `deleteUser(...)`, `login(...)`, `register(...)`
   - **Resolvers:**
     - `Query.users()` -> `GET http://localhost:3001/api/users`
     - `Query.user(id)` -> `GET http://localhost:3001/api/users/:id`
     - `Query.filterUsers(...)` -> `GET http://localhost:3001/api/users/filter` (with query params)
     - `Mutation.login(...)` -> `POST http://localhost:3001/api/users/login`
     - `Mutation.register(...)` -> `POST http://localhost:3001/api/users/register`
     - `Mutation.updateUser(...)` -> `PUT http://localhost:3001/api/users/:id`
     - `Mutation.deleteUser(...)` -> `DELETE http://localhost:3001/api/users/:id`

#### 4.1.3. Service REST API Endpoints (`services/users-service/src/routes/userRoutes.js`)
   - Base Path: `/api/users` (as configured in API Gateway proxy and service setup)
   - `GET /`: `userController.listAllUsers`
   - `GET /filter`: `userController.filterUsers`
   - `POST /register`: `userController.register`
   - `POST /login`: `userController.login`
   - `GET /:id`: `userController.getProfile`
   - `PUT /:id`: `userController.updateProfile`
   - `DELETE /:id`: `userController.deleteUser`

#### 4.1.4. Database Structure (`services/users-service/src/models/User.js`)
   - **Table:** `Users`
   - **Key Fields:**
     - `id` (PK)
     - `email` (VARCHAR, UNIQUE)
     - `password` (VARCHAR, Hashed)
     - `full_name` (VARCHAR)
     - `phone_number` (VARCHAR, Nullable)
     - `birth_date` (DATE)
     - `no_nik` (VARCHAR, UNIQUE)
     - `address` (TEXT/VARCHAR, Nullable)
     - `kelurahan` (VARCHAR, Nullable)
     - `kecamatan` (VARCHAR, Nullable)
     - `kabupaten_kota` (VARCHAR, Nullable)
     - `province` (VARCHAR, Nullable)
     - `postal_code` (VARCHAR, Nullable)
     - `created_at` (DATETIME/TIMESTAMP)

#### 4.1.5. Data Passed & Provided
   - **Request Data (GraphQL to Service):** User input for registration, login credentials, update details, filter parameters.
   - **Response Data (Service to GraphQL):** User profile information, authentication tokens, lists of users, success/error messages.

---

### 4.2. Train Service (`train-service`)

#### 4.2.1. Purpose
   - Manages train schedules, routes, static information, dynamic pricing, and seat availability.
   - Supports searching for trains based on various criteria and modifying seat availability (e.g., for bookings/cancellations).

#### 4.2.2. API Gateway GraphQL to Service REST Mapping (`api-gateway/graphql/train.js`)
   - **GraphQL Schema (`typeDefs`):**
     - Types: `Train`, `TrainFiltersInput`, `TrainSortInput`, `AvailabilityResponse`, `TrainsPage`, `Pricing`, etc.
     - Queries: `trains(...)`, `train(id: ID!)`, `trainPricing(...)`, `filterTrains(...)`
     - Mutations: `decreaseTrainAvailability(...)`, `increaseTrainAvailability(...)`, `createTrain(...)`
   - **Resolvers & Target REST Endpoints (`TRAIN_SERVICE_URL = 'http://localhost:3007/api/trains'`):
     - `Query.trains(...)` -> `GET /api/trains` (with pagination query params)
     - `Query.train(id)` -> `GET /api/trains/:id`
     - `Query.trainPricing(id, date)` -> `GET /api/trains/:id/pricing` (with `date` query param)
     - `Query.filterTrains(...)` -> `GET /api/trains/filter` or `GET /api/trains` (with extensive filter, sort, pagination query params)
     - `Mutation.createTrain(...)` -> `POST /api/trains`
     - `Mutation.decreaseTrainAvailability(trainId, ...)` -> `POST /api/trains/:trainId/availability/decrease`
     - `Mutation.increaseTrainAvailability(trainId, ...)` -> `POST /api/trains/:trainId/availability/increase`

#### 4.2.3. Service REST API Endpoints (`services/train-service/src/routes/trainRoutes.js`)
   - Base Path: `/api/trains`
   - `GET /`: `trainController.listAllTrains`
   - `POST /`: `trainController.createTrain`
   - `GET /filter`: `trainController.filterTrains`
   - `GET /search`: `trainController.searchTrains` (basic search)
   - `GET /:id`: `trainController.getTrainDetails`
   - `GET /:id/availability`: `trainController.getAvailability`
   - `GET /:id/pricing`: `trainController.getPricing`
   - `POST /:id/availability/decrease`: `trainController.decreaseAvailability`
   - `POST /:id/availability/increase`: `trainController.increaseAvailability`

#### 4.2.4. Database Structure (`services/train-service/src/models/Train.js`)
   - **Primary Tables Inferred:**
     - **`Trains` (Static Data):** `id` (PK), `train_number`, `name`, `operator`, `origin_station_code`, `origin_station_name`, `origin_city`, `origin_province`, `destination_station_code`, `destination_station_name`, `destination_city`, `destination_province`, `departure_time`, `arrival_time`, `duration`, `train_class`, `subclass`, `train_type`, `description`, `facilities`, `created_at`, `updated_at`.
     - **`TrainAvailability` (Dynamic Availability):** `id` (PK), `train_id` (FK), `date`, `available_seats`. (Possibly `seat_class`).
     - **`TrainPricing` (Dynamic Pricing):** `id` (PK), `train_id` (FK), `date`, `seat_class`, `price`, `currency`, `price_category`.
   - **Relationships:** `TrainPricing` and `TrainAvailability` are linked to `Trains` by `train_id` and are date-specific.

#### 4.2.5. Data Passed & Provided
   - **Request Data (GraphQL to Service):** Filters for searching trains (origin, destination, date, class, etc.), train ID for specific details/pricing/availability, new train data for creation, quantity for availability changes.
   - **Response Data (Service to GraphQL):** Lists of trains, specific train details, pricing information, availability status, success/error messages from mutations.

---

### 4.3. Booking Service (`booking-service`)

#### 4.3.1. Purpose
   - Manages the creation, retrieval, modification, and cancellation of bookings.
   - Orchestrates availability updates with other services (train, flight, hotel, local_travel) during booking creation and cancellation.
   - Stores booking header information and individual booking line items.

#### 4.3.2. API Gateway GraphQL to Service REST Mapping (`api-gateway/graphql/booking.js`)
   - **GraphQL Schema (`typeDefs`):
     - Types: `Booking`, `BookingItem`, `BookingItemInput`, `PaymentResponse`, `JSON` (scalar).
     - Queries: `getBookingById(id: ID!)`, `getUserBookings(userId: ID!)`.
     - Mutations: `createBooking(...)`, `cancelBooking(...)`, `modifyBooking(...)`.
   - **Resolvers & Target REST Endpoints (`BOOKING_SERVICE_URL = 'http://localhost:3004/api/bookings'`):
     - `Query.getBookingById(id)` -> `GET /api/bookings/:id`
     - `Query.getUserBookings(userId)` -> `GET /api/bookings/user/:userId`
     - `Mutation.createBooking(userId, items)`:
       1. `POST /api/bookings` (to `booking-service` to create booking record).
       2. Then, for each item, calls respective service's `/availability/decrease` endpoint (e.g., `POST http://localhost:3007/api/trains/:refId/availability/decrease`).
       3. Implements rollback/compensation logic by calling `/availability/increase` on other services and `POST /api/bookings/:bookingId/cancel` if any step fails.
     - `Mutation.cancelBooking(bookingId)`: Involves calls to `POST /api/bookings/:bookingId/cancel` and then increasing availability on respective services.
     - `Mutation.modifyBooking(bookingId, items)` -> `PUT /api/bookings/:bookingId` (and likely re-validates/updates availability with other services).

#### 4.3.3. Service REST API Endpoints (`services/booking-service/src/routes/bookingRoutes.js`)
   - Base Path: `/api/bookings`
   - `GET /`: `bookingController.listAllBookings`
   - `GET /filter`: `bookingController.filterBookings`
   - `GET /user/:userId`: `bookingController.getUserBookings`
   - `GET /:id`: `bookingController.getBookingById`
   - `POST /`: `bookingController.createBooking`
   - `POST /:id/cancel`: `bookingController.cancelBooking`
   - `PUT /:id`: `bookingController.modifyBooking`

#### 4.3.4. Database Structure (`services/booking-service/src/models/Booking.js` and `BookingItem.js`)
   - **`Bookings` Table:**
     - `id` (PK), `user_id` (FK), `booking_code`, `total_amount`, `currency`, `payment_status`, `special_requests`, `status`, `created_at`, `updated_at`.
   - **`BookingItems` Table:**
     - `id` (PK), `booking_id` (FK to `Bookings.id`), `type` (e.g., 'hotel', 'train'), `ref_id` (to service item ID), `travel_date`, `quantity`, `unit_price`, `subtotal`, `origin_city`, `destination_city`, `origin_province`, `destination_province`, `service_class`, `provider`, `details` (JSON).
   - **Relationships:** `BookingItems` has a many-to-one relationship with `Bookings` via `booking_id`.

#### 4.3.5. Data Passed & Provided
   - **Request Data (GraphQL to Service):
     - For `createBooking`: `userId`, list of `items` (each with `type`, `refId`, `date`, `details`).
     - For queries: `bookingId` or `userId`.
   - **Response Data (Service to GraphQL):
     - `Booking` object (including its `items`).
     - Success/failure status for mutations.
   - **Inter-service Communication (Booking Service to Others during `createBooking`/`cancelBooking`):
     - To decrease/increase availability: `refId` (of train/hotel etc.), `date`, `quantity`, `seatClass` (or similar details specific to the service type, extracted from `BookingItem.details`).

---

### 4.4. Flight Service (`flight-service`)

#### 4.4.1. Purpose
   - Manages flight schedules, pricing, and seat availability.
   - Provides endpoints for searching flights, retrieving details, and updating availability upon booking or cancellation.

#### 4.4.2. API Gateway GraphQL to Service REST Mapping (`api-gateway/graphql/flight.js`)
   - **GraphQL Schema (`typeDefs`):
     - Types: `Flight`, `FlightFiltersInput`, `FlightSortInput`, `PaginationInput`, `PaginationInfo`, `AvailabilityResponse`, `FlightsPage`, `Pricing`.
     - Queries: `flights(...)`, `flight(id: ID!)`, `flightPricing(id: ID!, date: String)`, `filterFlights(...)`.
     - Mutations: `decreaseFlightAvailability(...)`, `increaseFlightAvailability(...)`, `createFlight(...)`.
   - **Resolvers & Target REST Endpoints (`FLIGHT_SERVICE_URL = 'http://localhost:3002/api/flights'`):
     - `Query.flights(pagination)` -> `GET /api/flights` (with pagination query params).
     - `Query.flight(id)` -> `GET /api/flights/:id`.
     - `Query.flightPricing(id, date)` -> `GET /api/flights/:id/pricing?date=:date`.
     - `Query.filterFlights(filters, sort, pagination)` -> `POST /api/flights/filter` (sends filter/sort/pagination data in request body).
     - `Mutation.decreaseFlightAvailability(flightId, date, quantity, seatClass)` -> `POST /api/flights/:flightId/availability/decrease` (with data in body).
     - `Mutation.increaseFlightAvailability(flightId, date, quantity, seatClass)` -> `POST /api/flights/:flightId/availability/increase` (with data in body).
     - `Mutation.createFlight(...)` -> `POST /api/flights` (with flight data in body).

#### 4.4.3. Service REST API Endpoints (`services/flight-service/src/routes/flightRoutes.js`)
   - Base Path: `/api/flights`
   - `GET /`: `flightController.listAllFlights`
   - `POST /`: `flightController.createFlight`
   - `PUT /:id`: `flightController.updateFlight`
   - `GET /filter`: `flightController.filterFlights` (API Gateway uses POST to this for complex filters)
   - `GET /search`: `flightController.searchFlights`
   - `GET /:id`: `flightController.getFlightDetails`
   - `GET /:id/availability`: `flightController.getAvailability`
   - `GET /:id/pricing`: `flightController.getPricing`
   - `POST /:id/availability/decrease`: `flightController.decreaseAvailability`
   - `POST /:id/availability/increase`: `flightController.increaseAvailability`

#### 4.4.4. Database Structure (`services/flight-service/src/models/Flight.js`)
   - **`Flights` Table (Static Info):
     - `id` (PK), `airline`, `flight_number`, `origin_city`, `destination_city`, `departure_time`, `arrival_time`, `aircraft_model`, `seat_capacity`, `description`.
     - (Implied fields: `airline_code`, `flight_class` based on filter usage).
   - **`FlightAvailability` Table (Dynamic Availability):
     - `flight_id` (FK to `Flights.id`), `travel_date` (DATE), `available_seats` (INT).
     - (Potentially `seat_class` if availability is per class).
   - **`FlightPricing` Table (Dynamic Pricing):
     - `flight_id` (FK to `Flights.id`), `travel_date` (DATE), `price` (DECIMAL), `currency` (VARCHAR), `seat_class` (VARCHAR, Nullable).
   - **Relationships:** `FlightAvailability` and `FlightPricing` have many-to-one relationships with `Flights` (keyed on `flight_id` and `travel_date`).

#### 4.4.5. Data Passed & Provided
   - **Request Data (GraphQL to Service):
     - For `filterFlights`: Complex filter object, sort parameters, pagination info.
     - For `decrease/increaseAvailability`: `flightId`, `date`, `quantity`, `seatClass`.
     - For queries: `flightId`, `date`, pagination info.
   - **Response Data (Service to GraphQL):
     - `Flight` objects, `FlightsPage` (including `flights` list and `pagination` info), `Pricing` info, `AvailabilityResponse`.

---

### 4.5. Hotel Service (`hotel-service`)

#### 4.5.1. Purpose
   - Manages hotel information, room types, pricing, and availability.
   - Provides endpoints for searching hotels, retrieving details, and updating room availability upon booking or cancellation.

#### 4.5.2. API Gateway GraphQL to Service REST Mapping (`api-gateway/graphql/hotel.js`)
   - **GraphQL Schema (`typeDefs`):
     - Types: `Hotel`, `RoomType`, `HotelFiltersInput`, `HotelSortInput`, `PaginationInput`, `PaginationInfo`, `HotelsPage`, `RoomAvailability`, `Pricing`, `AvailabilityResponse`.
     - Queries: `hotels(...)`, `hotel(id: ID!)`, `filterHotels(...)`, `hotelAvailability(...)`, `hotelPricing(...)`.
     - Mutations: `decreaseRoomAvailability(...)`, `increaseRoomAvailability(...)`.
   - **Resolvers & Target REST Endpoints (`HOTEL_SERVICE_URL = 'http://localhost:3003/api/hotels'`):
     - `Query.hotels(limit, page)` -> `GET /api/hotels` (with pagination query params).
     - `Query.hotel(id)` -> `GET /api/hotels/:id`.
     - `Query.filterHotels(filters, sort, pagination)` -> `POST /api/hotels/filter` (sends filter/sort/pagination data in request body).
     - `Query.hotelAvailability(hotelId, checkInDate, checkOutDate)` -> `GET /api/hotels/:hotelId/availability?checkInDate=:checkInDate&checkOutDate=:checkOutDate`.
     - `Query.hotelPricing(id, check_in, check_out)` -> `GET /api/hotels/:id/pricing?check_in=:check_in&check_out=:check_out`.
     - `Mutation.decreaseRoomAvailability(hotelId, roomTypeId, date, quantity)` -> `POST /api/hotels/:hotelId/rooms/:roomTypeId/availability/decrease` (with date & quantity in body).
     - `Mutation.increaseRoomAvailability(hotelId, roomTypeId, date, quantity)` -> `POST /api/hotels/:hotelId/rooms/:roomTypeId/availability/increase` (with date & quantity in body).

#### 4.5.3. Service REST API Endpoints (`services/hotel-service/src/routes/hotelRoutes.js`)
   - Base Path: `/api/hotels`
   - `GET /`: `hotelController.listAllHotels`
   - `POST /`: `hotelController.createHotel` (Admin/Dev)
   - `PUT /:id`: `hotelController.updateHotel` (Admin/Dev)
   - `GET /filter`: `hotelController.filterHotels` (API Gateway uses POST to this for complex filters)
   - `GET /:id`: `hotelController.getHotelDetails`
   - `GET /:id/availability`: `hotelController.getAvailability` (GraphQL resolver passes `hotelId`, `checkInDate`, `checkOutDate`)
   - `GET /:id/pricing`: `hotelController.getPricing` (GraphQL resolver passes `hotelId`, `check_in`, `check_out`)
   - `POST /:id/availability/decrease`: `hotelController.decreaseAvailability` (GraphQL resolver uses a path with `/rooms/:roomTypeId/` and passes `hotelId` as part of path, `roomTypeId` also in path, `date` and `quantity` in body. The service endpoint expects `roomTypeId`, `date`, `quantity` in body for the hotel specified by `:id` path param).
   - `POST /:id/availability/increase`: `hotelController.increaseAvailability` (Similar to decrease).

#### 4.5.4. Database Structure (`services/hotel-service/src/models/Hotel.js`)
   - **`Hotels` Table (Core Info):
     - `id` (PK), `name`, `city`, `province`, `address`, `description`, `stars` (or `star_rating`), `phone`, `email`.
     - (Implied: `kabupaten`, `postal_code`, `property_type`, `facilities` like amenities list).
   - **`RoomTypes` Table (Room Details):
     - `id` (PK), `hotel_id` (FK to `Hotels.id`), `type` (name), `bed_type`, `has_breakfast`, `has_wifi`, `room_size`.
     - (Implied: `description`, `type_code`, `max_occupancy`, `amenities_list`, `image_urls`).
   - **`RoomAvailability` Table (Dynamic Availability):
     - `room_type_id` (FK to `RoomTypes.id`), `date` (DATE), `available_rooms` (INT).
   - **`RoomPricing` Table (Dynamic Pricing):
     - `room_type_id` (FK to `RoomTypes.id`), `date` (DATE), `price` (DECIMAL), `currency` (VARCHAR).
   - **Relationships:** `RoomTypes` has a many-to-one with `Hotels`. `RoomAvailability` and `RoomPricing` have many-to-one relationships with `RoomTypes` (keyed on `room_type_id` and `date`).

#### 4.5.5. Data Passed & Provided
   - **Request Data (GraphQL to Service):
     - For `filterHotels`: Complex filter object, sort parameters, pagination info.
     - For `decrease/increaseRoomAvailability`: `hotelId`, `roomTypeId`, `date`, `quantity`.
     - For queries: `hotelId`, date ranges, pagination info.
   - **Response Data (Service to GraphQL):
     - `Hotel` objects (potentially including `RoomType` lists), `HotelsPage`, `RoomAvailability` info, `Pricing` info, `AvailabilityResponse`.

---

### 4.6. Local Travel Service (`local-travel-service`)

#### 4.6.1. Purpose
   - Manages local transportation options such as shuttles, car rentals, or local buses.
   - Handles information regarding providers, routes, schedules, pricing, and availability.

#### 4.6.2. API Gateway GraphQL to Service REST Mapping (`api-gateway/graphql/localTravel.js`)
   - **GraphQL Schema (`typeDefs`):
     - Types: `LocalTravel`, `LocalTravelFiltersInput`, `LocalTravelSortInput`, `PaginationInput`, `PaginationInfo`, `LocalTravelsPage`, `AvailabilityResponse`, `Pricing`.
     - Queries: `localTravels(...)`, `localTravel(id: ID!)`, `localTravelPricing(...)`, `filterLocalTravels(...)`.
     - Mutations: `decreaseLocalTravelAvailability(...)`, `increaseLocalTravelAvailability(...)`, `createLocalTravel(...)`.
   - **Resolvers & Target REST Endpoints (`LOCAL_TRAVEL_SERVICE_URL = 'http://localhost:3006/api/local-travel'`):
     - `Query.localTravels(pagination)` -> `GET /api/local-travel` (with pagination query params).
     - `Query.localTravel(id)` -> `GET /api/local-travel/:id`.
     - `Query.localTravelPricing(id, date)` -> `GET /api/local-travel/:id/pricing?date=:date`.
     - `Query.filterLocalTravels(filters, sort, pagination)` -> `POST /api/local-travel/filter` (sends filter/sort/pagination data in request body).
     - `Mutation.decreaseLocalTravelAvailability(localTravelId, date, quantity, classType)` -> `POST /api/local-travel/:localTravelId/availability/decrease` (with date, quantity, classType in body).
     - `Mutation.increaseLocalTravelAvailability(localTravelId, date, quantity, classType)` -> `POST /api/local-travel/:localTravelId/availability/increase` (with date, quantity, classType in body).
     - `Mutation.createLocalTravel(...)` -> `POST /api/local-travel` (with local travel details in body).

#### 4.6.3. Service REST API Endpoints (`services/local-travel-service/src/routes/localTravelRoutes.js`)
   - Base Path: `/api/local-travel`
   - `GET /`: `localTravelController.listAllLocalTravel`
   - `POST /`: `localTravelController.createLocalTravel`
   - `PUT /:id`: `localTravelController.updateLocalTravel` (Admin/Dev)
   - `GET /filter`: `localTravelController.filterLocalTravel` (API Gateway uses POST for complex filters)
   - `GET /search`: `localTravelController.searchLocalTravel`
   - `GET /:id`: `localTravelController.getLocalTravelDetails`
   - `GET /:id/availability`: `localTravelController.getAvailability`
   - `GET /:id/pricing`: `localTravelController.getPricing`
   - `POST /:id/availability/decrease`: `localTravelController.decreaseAvailability`
   - `POST /:id/availability/increase`: `localTravelController.increaseAvailability`

#### 4.6.4. Database Structure (`services/local-travel-service/src/models/LocalTravel.js`)
   - **`LocalTravel` Table (Core Info):
     - `id` (PK), `provider`, `operator_name`, `type`, `origin_city`, `destination_city`, `origin_kabupaten`, `destination_kabupaten`, `origin_province`, `destination_province`, `route`, `capacity`, `features` (VARCHAR, e.g., "AC, WiFi"), `departure_time`, `arrival_time`, `vehicle_model`, `description`.
   - **`LocalTravelAvailability` Table (Dynamic Availability):
     - `local_travel_id` (FK to `LocalTravel.id`), `date` (DATE), `available_units` (INT).
   - **`LocalTravelPricing` Table (Dynamic Pricing):
     - `local_travel_id` (FK to `LocalTravel.id`), `date` (DATE), `price` (DECIMAL), `currency` (VARCHAR), `class_type` (VARCHAR, Nullable).
   - **Relationships:** `LocalTravelAvailability` and `LocalTravelPricing` have many-to-one relationships with `LocalTravel` (keyed on `local_travel_id` and `date`).
   - **Note:** The `features` field in `LocalTravel` table is a string; boolean flags like `has_ac` and `has_wifi` are derived in the model logic for filtering and responses.

#### 4.6.5. Data Passed & Provided
   - **Request Data (GraphQL to Service):
     - For `filterLocalTravels`: Complex filter object, sort parameters, pagination info.
     - For `decrease/increaseLocalTravelAvailability`: `localTravelId`, `date`, `quantity`, `classType`.
     - For queries: `localTravelId`, date, pagination info.
   - **Response Data (Service to GraphQL):
     - `LocalTravel` objects (with derived boolean features), `LocalTravelsPage`, `AvailabilityResponse`, `Pricing` info.

---

### 4.7. Payment Service (`payment-service`)

#### 4.7.1. Purpose
   - Manages payment transactions related to bookings.
   - Handles payment initiation, status tracking, and retrieval of payment history.

#### 4.7.2. API Gateway GraphQL to Service REST Mapping (`api-gateway/graphql/payment.js`)
   - **GraphQL Schema (`typeDefs`):
     - Types: `Payment`.
     - Queries: `payments(bookingId: ID!)`, `getPaymentStatus(id: ID!)`.
     - Mutations: `createPayment(userId: ID!, bookingId: ID!, amount: Float!, currency: String, payment_method_type: String, payment_reference: String)`.
   - **Resolvers & Target REST Endpoints (`PAYMENT_SERVICE_URL = 'http://localhost:3005/api/payments'`):
     - `Query.payments(bookingId)` -> `GET /api/payments/booking/:bookingId`.
     - `Query.getPaymentStatus(id)` -> `GET /api/payments/:id/status`.
     - `Mutation.createPayment(...)` -> `POST /api/payments` (with `userId`, `bookingId`, `amount`, `currency`, `payment_method_type`, `payment_reference` in body).

#### 4.7.3. Service REST API Endpoints (`services/payment-service/src/routes/paymentRoutes.js`)
   - Base Path: `/api/payments`
   - `POST /`: `paymentController.initiatePayment`
   - `GET /:id/status`: `paymentController.getPaymentStatus`
   - `GET /user/:userId`: `paymentController.getUserPayments`
   - `GET /booking/:bookingId`: `paymentController.getPaymentsByBookingId`

#### 4.7.4. Database Structure (`services/payment-service/src/models/Payment.js`)
   - **`Payments` Table:
     - `id` (PK)
     - `user_id` (FK, to Users service/table)
     - `booking_id` (FK, to Bookings service/table)
     - `amount` (DECIMAL/FLOAT)
     - `method` (VARCHAR) - Corresponds to `payment_method_type` in GraphQL.
     - `status` (VARCHAR) - e.g., 'pending', 'completed', 'failed'.
     - (Implied by GraphQL and common practice: `currency` (VARCHAR), `payment_reference` (VARCHAR), `created_at` (TIMESTAMP), `updated_at` (TIMESTAMP)).

#### 4.7.5. Data Passed & Provided
   - **Request Data (GraphQL to Service):
     - For `createPayment`: `userId`, `bookingId`, `amount`, `currency`, `payment_method_type`, `payment_reference`.
     - For queries: `bookingId`, `paymentId`.
   - **Response Data (Service to GraphQL):
     - `Payment` objects, payment status string.

---

This concludes the service-by-service analysis of the API Gateway to microservice communication flow, REST API endpoints, and database structures.

## 5. Detailed Communication Flow Examples

This section illustrates end-to-end communication for key user scenarios, showing how different microservices collaborate.

### 5.1. Scenario: Successful Booking Creation (e.g., Flight + Hotel)

This scenario describes the sequence of events when a user successfully books a flight and a hotel room.

1.  **User Action (Conceptual via Frontend/Client):**
    *   The user, having selected a flight and a hotel, initiates the booking process.
    *   The client application gathers necessary details: user ID, selected flight ID, flight date, number of passengers, selected hotel ID, room type ID, check-in/check-out dates, number of rooms/guests.

2.  **API Gateway - GraphQL Mutation (`createBooking`):
    *   The client sends a GraphQL `createBooking` mutation to the API Gateway.
    *   **Payload Example (Conceptual for GraphQL variables):**
        ```json
        {
          "userId": "user-123",
          "items": [
            {
              "type": "FLIGHT",
              "itemId": "flight-abc",
              "date": "2024-12-01",
              "quantity": 2, // e.g., 2 passengers
              "pricePerUnit": 500.00,
              "details": { "class": "Economy" }
            },
            {
              "type": "HOTEL",
              "itemId": "hotel-xyz", // hotelId
              "subItemId": "roomtype-std", // roomTypeId
              "date": "2024-12-01", // checkInDate
              "endDate": "2024-12-03", // checkOutDate
              "quantity": 1, // e.g., 1 room
              "pricePerUnit": 150.00, // price per night
              "details": { "guests": 2 }
            }
          ],
          "paymentDetails": {
            "paymentMethodType": "CREDIT_CARD",
            "paymentReference": "tok_xxxxxxxxxxxx"
          }
        }
        ```

3.  **API Gateway to Booking Service:
    *   The `createBooking` resolver in the API Gateway receives the mutation.
    *   It first calls the `booking-service` to create an initial booking record.
    *   **REST Call:** `POST http://localhost:3004/api/bookings`
    *   **Request Body (to Booking Service):** Contains user ID, item details (similar to above, but structured for the booking service's REST API), initial total amount, and an initial status like 'PENDING_AVAILABILITY_CHECK'.

4.  **Booking Service - Initial Booking Creation & Availability Orchestration:
    *   The `booking-service` creates a `Booking` record (e.g., `booking_id: booking-789`, status: 'PENDING_AVAILABILITY_CHECK') and associated `BookingItem` records.
    *   It then iterates through the booking items to decrease availability (simulating a distributed transaction attempt):
        *   **For the Flight Item:**
            *   **REST Call:** `POST http://localhost:3002/api/flights/:flightId/availability/decrease` (e.g., `POST /api/flights/flight-abc/availability/decrease`)
            *   **Request Body:** `{ "date": "2024-12-01", "quantity": 2, "classType": "Economy" }`
            *   The `flight-service` attempts to decrease seat availability. If successful, it returns a success response.
        *   **For the Hotel Item:**
            *   **REST Call:** `POST http://localhost:3003/api/hotels/:hotelId/rooms/:roomTypeId/availability/decrease` (e.g., `POST /api/hotels/hotel-xyz/rooms/roomtype-std/availability/decrease` - Note: The actual REST endpoint in hotel-service is `POST /api/hotels/:id/availability/decrease`, with `roomTypeId` in the body).
            *   **Request Body (to Hotel Service):** `{ "date": "2024-12-01", "endDate": "2024-12-03", "quantity": 1, "roomTypeId": "roomtype-std" }` (endDate might be used by hotel service to decrease for multiple nights)
            *   The `hotel-service` attempts to decrease room availability. If successful, it returns a success response.

5.  **Booking Service to Payment Service (Assuming Availability Success):
    *   If all availability checks and decreases succeed, the `booking-service` proceeds to payment.
    *   It calculates the final total amount.
    *   **REST Call:** `POST http://localhost:3005/api/payments`
    *   **Request Body:** `{ "userId": "user-123", "bookingId": "booking-789", "amount": 800.00, "currency": "USD", "payment_method_type": "CREDIT_CARD", "payment_reference": "tok_xxxxxxxxxxxx" }`

6.  **Payment Service - Process Payment:
    *   The `payment-service` receives the request.
    *   It creates a `Payment` record with status 'pending'.
    *   It would typically interact with an external payment gateway here (e.g., Stripe, PayPal). This interaction is abstracted within the `payment-service`.
    *   Upon confirmation from the gateway, the `payment-service` updates its `Payment` record status to 'completed' (or 'failed').
    *   It returns a success response to the `booking-service`, including the payment status.

7.  **Booking Service - Finalize Booking:
    *   Receives confirmation from the `payment-service`.
    *   If payment is 'completed', it updates the `Booking` record status to 'CONFIRMED' (or 'COMPLETED').
    *   It updates the `payment_status` field in its `Bookings` table.
    *   It returns the updated booking details (including the final status and booking ID) to the API Gateway.

8.  **API Gateway to Client:
    *   The API Gateway's `createBooking` resolver receives the final booking details from the `booking-service`.
    *   It formats this into the GraphQL `Booking` type and sends the response back to the client.

9.  **User Notification (Conceptual):
    *   The client application displays a success message to the user.
    *   Optionally, the `booking-service` or a notification service could send a confirmation email/SMS.


### 5.2. Scenario: Booking Item Cancellation (e.g., Flight Cancellation with Refund)

This scenario describes the process when a user cancels a specific item (e.g., a flight) from an existing confirmed booking, and a refund is applicable.

1.  **User Action (Conceptual via Frontend/Client):**
    *   The user navigates to their bookings and requests to cancel a specific flight item from `booking-789`.
    *   The client application identifies the `bookingId` and the `bookingItemId` for the flight to be cancelled.

2.  **API Gateway - GraphQL Mutation (`cancelBooking` or a more specific `cancelBookingItem`):
    *   The client sends a GraphQL mutation (e.g., `cancelBooking` with an item ID, or a dedicated `cancelBookingItem`) to the API Gateway.
    *   **Payload Example (Conceptual for `cancelBooking` if it supports partial cancellation, or a new `cancelBookingItem` mutation):**
        ```json
        {
          "bookingId": "booking-789",
          "itemIdToCancel": "flight-booking-item-001", // ID of the BookingItem for the flight
          "reason": "Change of plans"
        }
        ```

3.  **API Gateway to Booking Service:
    *   The resolver for the cancellation mutation in the API Gateway receives the request.
    *   It calls the `booking-service` to process the cancellation.
    *   **REST Call:** `POST http://localhost:3004/api/bookings/:bookingId/cancel` (if cancelling the whole booking) or a more specific endpoint like `POST http://localhost:3004/api/bookings/:bookingId/items/:itemId/cancel`.
        *   Let's assume the existing `POST /:id/cancel` in `bookingRoutes.js` can handle partial cancellation if an `itemId` is provided in the body, or that a new route for item cancellation exists.
    *   **Request Body (to Booking Service):** `{ "itemIdToCancel": "flight-booking-item-001", "reason": "Change of plans" }`.

4.  **Booking Service - Process Item Cancellation & Availability Orchestration:
    *   The `booking-service` retrieves the `Booking` and the specific `BookingItem` to be cancelled.
    *   It verifies if the item is eligible for cancellation (e.g., based on cancellation policies, time before departure).
    *   **Increase Availability for the Cancelled Flight Item:**
        *   It identifies the original flight details (flight ID, date, quantity, class) from the `BookingItem`.
        *   **REST Call:** `POST http://localhost:3002/api/flights/:flightId/availability/increase`
        *   **Request Body:** `{ "date": "2024-12-01", "quantity": 2, "classType": "Economy" }` (data from the original booking item).
        *   The `flight-service` increases seat availability. If successful, it returns a success response.
    *   The `booking-service` updates the status of the specific `BookingItem` to 'CANCELLED'.
    *   It recalculates the total booking amount if other items remain.

5.  **Booking Service to Payment Service (for Refund Processing):
    *   If the cancellation policy allows for a refund, the `booking-service` determines the refund amount.
    *   It then communicates with the `payment-service` to process this refund.
    *   This might involve a new endpoint in `payment-service` like `POST /api/payments/refund` or using the existing payment ID to trigger a refund if supported by the payment gateway.
    *   **REST Call (Conceptual to Payment Service for refund):** `POST http://localhost:3005/api/payments/refund` (or similar)
    *   **Request Body:** `{ "originalPaymentId": "payment-xyz", "bookingItemId": "flight-booking-item-001", "amountToRefund": 480.00, "currency": "USD", "reason": "User cancellation" }`.

6.  **Payment Service - Process Refund:
    *   The `payment-service` receives the refund request.
    *   It records the refund transaction (e.g., creates a new payment record with a negative amount or a specific 'refund' type, linked to the original payment).
    *   It interacts with the external payment gateway to issue the refund to the user's original payment method.
    *   Upon confirmation from the gateway, the `payment-service` updates its refund transaction status to 'completed'.
    *   It returns a success response to the `booking-service`.

7.  **Booking Service - Finalize Cancellation & Update Booking:
    *   Receives confirmation of the refund from the `payment-service`.
    *   Updates the `Booking` record: adjusts total amount, notes the cancellation and refund.
    *   If all items in the booking are cancelled, the overall `Booking` status might change to 'CANCELLED'. Otherwise, it remains 'CONFIRMED' or 'PARTIALLY_CANCELLED'.
    *   Returns the updated booking details to the API Gateway.

8.  **API Gateway to Client:
    *   The API Gateway's resolver receives the updated booking details.
    *   It formats this and sends the response back to the client, indicating successful cancellation and refund processing.

9.  **User Notification (Conceptual):
    *   The client application displays a confirmation message for the cancellation and refund.
    *   The `booking-service` or a notification service could send an email/SMS confirming the cancellation and refund.


## 6. Common Identifiers and Data Passed Between Services

This section summarizes key identifiers and common data patterns exchanged across the microservices, facilitating data tracking and understanding inter-service dependencies.

### 6.1. Key Identifiers

*   **`userId` (or `user_id`):**
    *   Universally used to identify a user across services.
    *   Originates from the `users-service` upon registration/login.
    *   Passed to `booking-service` during booking creation.
    *   Passed to `payment-service` during payment creation.
    *   Used by `booking-service` to retrieve user-specific bookings.

*   **`bookingId` (or `booking_id`):
    *   Uniquely identifies a booking transaction.
    *   Generated by the `booking-service` upon `createBooking`.
    *   Passed to `payment-service` to link payments to a specific booking.
    *   Used in API Gateway and client to retrieve or manage a specific booking.

*   **`bookingItemId` (or `booking_item_id`):
    *   Uniquely identifies an individual item within a booking (e.g., a specific flight, a hotel stay).
    *   Generated by the `booking-service` when a `BookingItem` record is created.
    *   Used for item-specific operations like cancellation (as seen in the `cancelBookingItem` conceptual flow).

*   **Service-Specific Item IDs (e.g., `flightId`, `hotelId`, `trainId`, `localTravelId`):
    *   Identify specific inventory items within their respective services (e.g., `flight-abc`, `hotel-xyz`).
    *   These are used by the API Gateway when querying for details, availability, or pricing from a specific service.
    *   Stored within `BookingItem` records (as `item_id` or `ref_id`) in the `booking-service` to link back to the original service item.

*   **`paymentId` (or `payment_id`):
    *   Uniquely identifies a payment transaction.
    *   Generated by the `payment-service`.
    *   Used to track payment status or process refunds.

*   **`roomTypeId`, `classType` (or `seat_class`):
    *   Identify specific sub-categories within a service item, like a particular room type in a hotel or a seat class on a flight/train.
    *   Used in availability and pricing queries/mutations.

### 6.2. Common Data Structures & Patterns

*   **Filtering Objects (`FiltersInput`):
    *   Many services (`flight`, `hotel`, `train`, `local-travel`) support complex filtering capabilities.
    *   The API Gateway defines GraphQL `FiltersInput` types for each, which are then translated into JSON objects and sent (often via `POST` to a `/filter` REST endpoint) to the respective microservices.
    *   These objects contain various criteria like location, dates, price ranges, amenities, types, etc.

*   **Pagination Objects (`PaginationInput`, `PaginationInfo`):
    *   Consistently used for queries that can return large datasets (e.g., `listAllX`, `filterX`).
    *   `PaginationInput` (page, limit) is sent from the client/API Gateway.
    *   Services return data along with `PaginationInfo` (total items, total pages, current page, etc.).

*   **Availability & Pricing Structures:
    *   Services like `flight`, `hotel`, `train`, and `local-travel` often have dedicated tables and endpoints for managing dynamic availability (e.g., `FlightAvailability`, `RoomAvailability`) and pricing (e.g., `FlightPricing`, `RoomPricing`).
    *   These are typically keyed by the service item ID and date (and sometimes `classType` or `roomTypeId`).
    *   `decreaseAvailability` and `increaseAvailability` mutations/endpoints are common for managing inventory during bookings and cancellations.

*   **Standardized Response Wrappers:
    *   Many microservice REST endpoints wrap their responses in a common structure, e.g.:
        ```json
        {
          "status": "success"|"error",
          "message": "Optional message for errors or info",
          "data": { /* actual payload */ },
          "pagination": { /* pagination info if applicable */ }
        }
        ```
    *   The API Gateway resolvers parse this structure to extract the `data` payload.

*   **Date Handling:
    *   Dates (e.g., travel dates, check-in/out dates, booking dates) are crucial and passed frequently.
    *   Consistency in date format (e.g., `YYYY-MM-DD`) is important, though not explicitly detailed in all model files, it's implied by usage in queries.

*   **Error Handling:
    *   API Gateway resolvers often check the `status` field from service responses and throw errors if not 'success', propagating issues back to the GraphQL client.
    *   Services themselves handle database errors and business logic validation, returning appropriate error messages.

This summary provides a high-level view of how data flows and connects across the distributed system.

## 7. Conclusion

This report provides a comprehensive analysis of the microservice communication within the travel agency system, focusing on the interactions between the API Gateway and the backend services.

### 7.1. Key Architectural Observations

*   **API Gateway as a Facade:** The API Gateway effectively serves as a unified GraphQL interface, abstracting the underlying REST-based microservices. This simplifies client-side development and provides a single point of entry for all backend operations.
*   **Service Specialization:** Each microservice has a clearly defined domain and responsibility (e.g., user management, flight inventory, booking orchestration, payment processing). This promotes modularity and independent scalability.
*   **RESTful Microservices:** Individual services expose standard REST APIs, making them independently testable and potentially consumable by other internal systems if needed.
*   **Data-Driven Services:** Most services manage their own databases, tailored to their specific data models. This includes relational schemas with tables for core entities, availability, and pricing.
*   **Distributed Transactions & Orchestration:** The `booking-service` plays a crucial role in orchestrating complex operations like booking creation and cancellation. It handles multi-step processes that involve calls to other services (e.g., decreasing availability in flight/hotel services, processing payments). While not explicitly using a formal distributed transaction manager, it employs a saga-like pattern with sequential calls and implied compensation logic (e.g., increasing availability on cancellation).
*   **Dynamic Data Management:** Services like `flight-service`, `hotel-service`, `train-service`, and `local-travel-service` manage dynamic data such as availability and pricing through dedicated database tables, often keyed by date and item ID.

### 7.2. Communication Patterns

*   **GraphQL to REST Translation:** The API Gateway resolvers are responsible for translating incoming GraphQL queries and mutations into appropriate REST calls to the downstream microservices. This includes mapping arguments, constructing request bodies, and transforming responses.
*   **Synchronous Communication:** The primary mode of communication observed is synchronous request-response, both from the client to the API Gateway (GraphQL) and from the API Gateway to the microservices (REST).
*   **Centralized Booking Logic:** The `booking-service` acts as a central coordinator for booking-related workflows, interacting with multiple other services to fulfill a booking request.

### 7.3.Summary

The travel agency system demonstrates a well-structured microservice architecture. The clear separation of concerns, the use of an API Gateway, and the defined communication protocols allow for a scalable and maintainable backend. This documentation provides a foundational understanding of these interactions, which can be valuable for onboarding new developers, planning future enhancements, and troubleshooting.

---