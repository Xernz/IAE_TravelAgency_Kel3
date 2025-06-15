# Backend API Gateway Analysis Report

This document outlines the structure, capabilities, and data offerings of the backend API Gateway, focusing on the services relevant to the travel agency system: Flights, Trains, Local Travel, and Hotels. This analysis is based on the GraphQL schemas and resolvers found in the `api-gateway/graphql` directory.

## Overall Architecture

The API Gateway utilizes Apollo Server to expose a unified GraphQL API. It aggregates schemas and resolvers from individual JavaScript files, each dedicated to a specific microservice domain (e.g., `flight.js`, `hotel.js`). This modular approach allows for clear separation of concerns.

All services follow a similar pattern for handling dynamic data like price and availability: this information is typically nested under a `dailyStatus` field queryable by date (and `roomTypeName` for hotels).

## Service-Specific API Details

### 1. Flight Service (`flight.js`)

- **Microservice URL**: `http://localhost:3002/api`
- **Key GraphQL Types**:
    - `Flight`: Contains static flight details (airline, flight number, origin/destination names and IATA codes, departure/arrival times, airline code).
    - `FlightDailyStatus`: Provides `availableSeats`, `price`, `currency` for a specific flight on a given `date`. Accessed via `Flight.dailyStatus(date: String!)` or the top-level `query flightDailyStatus`.
    - `FlightsPage`: Wrapper for paginated flight results, includes `flights: [Flight!]!` and `pagination: PaginationInfo`.
    - `PaginationInfo`: Standard pagination details (`totalItems`, `totalPages`, `currentPage`, etc.).
    - `AvailabilityResponse`: Standard response for availability mutations.
- **Key Queries**:
    - `flights(pagination: PaginationInput)`: Lists all flights.
    - `flight(id: ID!)`: Fetches a single flight.
    - `flightDailyStatus(flightId: ID!, date: String!)`: Gets daily status for a specific flight.
    - `filterFlights(filters: FlightFiltersInput, sort: FlightSortInput, pagination: PaginationInput)`: Powerful search with filters for origin/destination (city/code), airline (code/name), flight class, departure date, and price range.
- **Key Mutations**:
    - `decreaseFlightAvailability(flightId: ID!, date: String!, quantity: Int!)`
    - `increaseFlightAvailability(flightId: ID!, date: String!, quantity: Int!)`
    - `createFlight(...)`
- **Notes**: Aligns with refactoring efforts (price/availability in `dailyStatus`, robust filtering).

### 2. Train Service (`train.js`)

- **Microservice URL**: `http://localhost:3007/api/trains`
- **Key GraphQL Types**:
    - `Train`: Comprehensive static train details (train number, name, operator, origin/destination station codes/names/cities/provinces, times, duration, type, description, facilities).
    - `TrainDailyStatus`: Provides `availableSeats`, `price`, `currency` for a specific train on a given `date`. Accessed via `Train.dailyStatus(date: String!)` or `query trainDailyStatus`.
    - `TrainsPage`: Wrapper for paginated train results.
- **Key Queries**:
    - `trains(pagination: PaginationInput)`: Lists all trains.
    - `train(id: ID!)`: Fetches a single train.
    - `trainDailyStatus(trainId: ID!, date: String!)`: Gets daily status for a specific train.
    - `filterTrains(filters: TrainFiltersInput, sort: TrainSortInput, pagination: PaginationInput)`: Search with filters for origin/destination (station code/city/province), train type, operator, duration, price category/range, departure date.
- **Key Mutations**:
    - `decreaseTrainAvailability(trainId: ID!, date: String!, quantity: Int!)`
    - `increaseTrainAvailability(trainId: ID!, date: String!, quantity: Int!)`
    - `createTrain(...)`
- **Notes**: Reflects refactoring (price/availability in `dailyStatus`, removal of `train_class`/`subclass` from filters).

### 3. Local Travel Service (`localTravel.js`)

- **Microservice URL**: `http://localhost:3006/api/local-travel`
- **Key GraphQL Types**:
    - `LocalTravel`: Details like name, type, operator name, description, features, origin/destination (city/kabupaten/province), times, vehicle model, capacity, AC/WiFi.
    - `LocalTravelDailyStatus`: Provides `availableSeats` (from service's `available_units`), `price`, `currency`. Accessed via `LocalTravel.dailyStatus(date: String!)` or `query localTravelDailyStatus`.
    - `LocalTravelsPage`: Wrapper for paginated results (contains `data: [LocalTravel!]!`).
- **Key Queries**:
    - `localTravels(pagination: PaginationInput)`: Lists all local travel options.
    - `localTravel(id: ID!)`: Fetches a single option.
    - `localTravelDailyStatus(localTravelId: ID!, date: String!)`: Gets daily status.
    - `filterLocalTravels(filters: LocalTravelFiltersInput, sort: LocalTravelSortInput, pagination: PaginationInput)`: Search with filters for origin/destination (city/kabupaten/province), type, operator, route, capacity, AC/WiFi, price, date.
- **Key Mutations**:
    - `decreaseLocalTravelAvailability(localTravelId: ID!, date: String!, quantity: Int!)`
    - `increaseLocalTravelAvailability(localTravelId: ID!, date: String!, quantity: Int!)`
    - `createLocalTravel(...)`
- **Notes**: Reflects refactoring (removal of `class_type`, correct pagination key mapping).

### 4. Hotel Service (`hotel.js`)

- **Microservice URL**: `http://localhost:3003/api/hotels`
- **Key GraphQL Types**:
    - `Hotel`: Static hotel details (name, city, province, address, description, stars, property type, facilities).
    - `RoomType`: Defined with fields like name, description, bed type, occupancy. However, there's no direct query to list all room types for a hotel (e.g., `hotel.roomTypes`).
    - `HotelRoomDailyStatus`: Provides `availableRooms`, `price`, `currency` for a specific `roomTypeName` at a `hotelId` on a `date`. This is the primary way to get dynamic room info.
    - `HotelsPage`: Wrapper for paginated hotel results.
- **Key Queries**:
    - `hotels(pagination: PaginationInput)`: Lists all hotels.
    - `hotel(id: ID!)`: Fetches a single hotel's static details.
    - `hotelDailyStatus(hotelId: ID!, date: String!)`: Returns an array of `HotelRoomDailyStatus` for all room types with status on that date for the hotel. This is how available room types and their statuses are discovered for a given day.
    - `filterHotels(filters: HotelFiltersInput, sort: HotelSortInput, pagination: PaginationInput)`: Search with filters for static hotel properties and dynamic daily status aspects (date, `room_type_name`, price range).
- **Key Mutations**:
    - `decreaseRoomAvailability(hotelId: ID!, roomTypeName: String!, date: String!, quantity: Int!)`
    - `increaseRoomAvailability(hotelId: ID!, roomTypeName: String!, date: String!, quantity: Int!)`
- **Notes**:
    - Pricing and availability are per `roomTypeName` per `date`.
    - The frontend will need to use `hotelDailyStatus` to discover which `roomTypeName`s have offerings for a hotel on a specific date.
    - Mutations correctly use `roomTypeName`.
    - Aligns with refactoring regarding daily status and removal of `Hotel.getRoomTypes` from the service layer.

## General Observations & Implications for Frontend

1.  **Unified Daily Status Pattern**: All services use a `dailyStatus` sub-query (or a top-level query) to fetch date-specific dynamic data (price, availability). The frontend will need to make these secondary calls after fetching primary entity data if it needs the latest status.
2.  **Comprehensive Filtering**: Each service provides a robust `filter<Entity>s` query, allowing for complex searches. The frontend can leverage these for rich search UIs.
3.  **Pagination**: Standardized pagination is available across services.
4.  **Naming Conventions**: API Gateway uses camelCase for its GraphQL schema, and resolvers handle mapping from potentially snake_case fields from microservices.
5.  **Hotel Room Types**: For hotels, discovering available room types and their static details (beyond what's in `HotelRoomDailyStatus`) might require a strategy. The `hotelDailyStatus` query is key to seeing what's bookable on a given day. If more static details about room types are needed upfront, the API might need an enhancement, or the frontend will have to work with the information derivable from `HotelRoomDailyStatus` and potentially assume `roomTypeName` is sufficient for display and booking actions.

This analysis should serve as a solid foundation for planning the frontend development and alignment.
