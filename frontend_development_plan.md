# Frontend Development and Alignment Plan

This document outlines the plan to align the existing frontend application with the refactored backend API Gateway and proposes further UI/UX development.

## 1. Current Frontend GraphQL Service Layer Overview

The frontend utilizes a GraphQL service layer (primarily in `src/services/`) with dedicated files for queries (e.g., `graphqlFlightQueries.js`) and potentially custom hooks (e.g., `graphqlFlightHooks.js`) for each major service domain (Flights, Trains, Hotels, Local Travel, etc.). This is a good modular approach.

However, due to significant backend refactoring (detailed in `backend_analysis_report.md`), many of the existing GraphQL queries and the data they expect are now misaligned with the current backend API capabilities.

## 2. Identified Misalignments & Refactoring Plan

The primary theme of misalignment is the backend's shift to providing dynamic data (price, availability) via a nested `dailyStatus` field (queryable by date, and `roomTypeName` for hotels), whereas the frontend often expects this data at the top level of the main entity or through now-obsolete dedicated pricing/availability queries.

### 2.1. Flight Service (`graphqlFlightQueries.js`)

**Misalignments:**
- `GET_FLIGHT_DETAIL`: Directly requests `price`, `details` (obsolete). Missing `dailyStatus` call for price/availability. Missing current static fields like `origin_airport_iata`.
- `FLIGHT_PRICING`: Obsolete query. Backend uses `Flight.dailyStatus` or `Query.flightDailyStatus`.
- `GET_FLIGHTS`: Outdated parameters (uses `origin`, `destination`, `date` instead of just `pagination`). Directly requests `price`, `seats_available`. Missing `dailyStatus`.
- `FILTER_FLIGHTS`:
    - Input `sort` structure differs (frontend: `by`, `order`; backend: `sortBy`, `sortOrder`).
    - Directly requests `price`, `seats_available` in response; should use `dailyStatus` for each flight.
    - Requests several fields not on backend `Flight` type (e.g., `duration`, `flight_class`, `stops`, `status`). `currency` is in `FlightDailyStatus`.
    - Pagination response keys (e.g., `total_items`) need to be camelCase (`totalItems`).
- `CREATE_FLIGHT`: Appears mostly aligned but needs verification of all arguments against the API Gateway's mutation definition.

**Refactoring Actions:**
- Update all queries fetching flight details or lists to use `Flight.dailyStatus(date: String!)` for price, `availableSeats`, and `currency` when a specific date context is available.
- For list views from `filterFlights`, if price/availability per item is needed, each `Flight` object in the response should include its `dailyStatus(date: $departure_date_filter_if_any)`. This might require adjusting how dates are handled in filters vs. display.
- Remove `FLIGHT_PRICING` query. Implement logic to use `Query.flightDailyStatus(flightId: ID!, date: String!)` when a specific flight and date are selected.
- Correct `FILTER_FLIGHTS` input arguments (especially `sort`) and requested fields to match the backend GraphQL schema. Ensure pagination keys are camelCase.
- Update `GET_FLIGHT_DETAIL` to request all available static fields and use `dailyStatus`.
- Standardize field names requested (e.g., `airline` not `airline_name` in GQL response from gateway).

### 2.2. Train Service (`graphqlTrainQueries.js`)

**Misalignments:**
- `GET_TRAIN_DETAIL`: Requests incorrect/obsolete fields (`train_name`, `subclass`, `price_category`, `details`). Missing many static fields. Missing `dailyStatus` for price/availability.
- `TRAIN_PRICING`: Obsolete query.
- `GET_TRAINS`: Outdated parameters. Requests incorrect/obsolete fields. Missing `dailyStatus`.
- `FILTER_TRAINS`:
    - Directly requests `price`, `seats_available`. Should use `dailyStatus` for each train.
    - Requests obsolete fields (`train_class`, `subclass`).
- `CREATE_TRAIN`: Appears mostly aligned, needs argument verification.

**Refactoring Actions:**
- Similar to Flights: Update queries to use `Train.dailyStatus(date: String!)` for dynamic data.
- Remove `TRAIN_PRICING` query. Implement logic for `Query.trainDailyStatus`.
- Correct field names in `GET_TRAIN_DETAIL` (e.g., `name` not `train_name`), add missing static fields, remove obsolete ones.
- Update `FILTER_TRAINS` to use `dailyStatus` for list items and remove obsolete fields.

### 2.3. Local Travel Service (`graphqlLocalTravelQueries.js`)

**Misalignments:**
- `GET_LOCAL_TRAVEL_DETAIL`: Directly requests `price`. Requests `details` (obsolete). Missing many static fields. Missing `dailyStatus`.
- `LOCAL_TRAVEL_PRICING`: Obsolete query.
- `GET_LOCAL_TRAVEL`: Outdated parameters (if meant for listing). Directly requests `price`. Missing `dailyStatus`.
- `FILTER_LOCAL_TRAVELS`:
    - `sort` input structure differs.
    - `amenities_include_any/all` filter variables defined but not used/supported by backend.
    - Response expected at `filterLocalTravels.localTravels` but backend provides `filterLocalTravels.data`.
    - Requests incorrect/obsolete fields (`provider` instead of `operator_name`, `origin_city` instead of `origin`, `duration`, `amenities`, `images`).
    - Directly requests `price`, `currency`, `seats_available`. Should use `dailyStatus`.
    - Pagination response keys need to be camelCase.
- `CREATE_LOCAL_TRAVEL`: Appears mostly aligned, needs argument verification.

**Refactoring Actions:**
- Similar to Flights/Trains: Update queries to use `LocalTravel.dailyStatus(date: String!)`.
- Remove `LOCAL_TRAVEL_PRICING`. Implement logic for `Query.localTravelDailyStatus`.
- Correct `GET_LOCAL_TRAVEL_DETAIL` fields.
- Adjust `FILTER_LOCAL_TRAVELS`: fix `sort` input, use `filterLocalTravels.data`, correct field names, remove obsolete fields, use `dailyStatus`, ensure camelCase pagination keys.

### 2.4. Hotel Service (`graphqlHotelQueries.js`)

**Misalignments (Significant):**
- `GET_HOTEL_DETAIL`: Requests `kabupaten`, `postal_code` (not on backend `Hotel`). Critically, it queries a `rooms` sub-field with price/availability, which is entirely obsolete. Backend requires `Query.hotelDailyStatus(hotelId: ID!, date: String!)` for room-specific dynamic data.
- `GET_HOTELS`: Requests `star_rating` (backend: `stars`), `has_wifi`, `has_breakfast` (not discrete fields).
- `SEARCH_HOTELS`: Obsolete query. Functionality covered by `filterHotels`.
- `FILTER_HOTELS`: Requests many fields not on backend `Hotel` type (`country`, `amenities`, `images`, boolean flags like `has_wifi`, `min_price_per_night`). `star_rating` should be `stars`. Does not fetch dynamic room data (price/availability per room type).
- `HOTEL_AVAILABILITY`, `HOTEL_PRICING`: Obsolete queries.

**Refactoring Actions (Major):**
- **Core Logic Change**: Frontend must adapt to fetching hotel room availability and pricing using `Query.hotelDailyStatus(hotelId: ID!, date: String!, roomTypeName: String!)`. This query returns an array of `HotelRoomDailyStatus` objects, one for each available room type on that date.
- Remove `SEARCH_HOTELS`, `HOTEL_AVAILABILITY`, `HOTEL_PRICING`.
- Update `GET_HOTEL_DETAIL`: Remove `rooms` sub-query. Correct static field names. The page displaying hotel details will need to make a separate call to `hotelDailyStatus` based on user-selected dates to show room options.
- Update `GET_HOTELS` & `FILTER_HOTELS`: Correct static field names. Remove requests for non-existent fields. These queries list hotels; displaying room options for a selected hotel will require a subsequent `hotelDailyStatus` call.
- **UI/UX for Hotel Flow**: The user flow for hotel search and booking will likely be:
    1. Search hotels (`filterHotels` based on city, date, etc.).
    2. Select a hotel.
    3. Frontend calls `hotelDailyStatus` for the selected hotel and date.
    4. Display available room types (from `HotelRoomDailyStatus.roomTypeName`) with their prices and availability.
    5. User selects a room type for booking.

## 3. UI/UX Review and Enhancement Phase

Once the technical alignment of GraphQL queries and data handling is complete, a thorough UI/UX review is recommended:

- **Leverage New Capabilities**: The backend's `filter` queries are powerful. Ensure search interfaces allow users to effectively use these filters (e.g., price ranges, specific dates for availability, sorting options).
- **Daily Status Display**: Determine the best way to present date-specific pricing and availability. This might involve:
    - Date pickers prominently displayed in search forms.
    - Clear indication of price/availability for selected dates on detail pages.
    - For lists (e.g., flight search results), decide if an initial price/availability for a default date should be shown (requiring `dailyStatus` calls for each item) or if it's better to show it only after a specific item and date are drilled into.
- **Hotel Room Type Selection**: The new flow for hotels (fetching daily status per room type) needs a clear UI. Users should easily see available room types for their chosen dates and select one.
- **Error Handling & Loading States**: Improve feedback to the user during API calls and if data isn't found (e.g., no flights for selected criteria, no hotel rooms available for a date).
- **Consistency**: Ensure a consistent look and feel across all travel product types.

## 4. Testing Plan

- **Unit Tests**: For updated GraphQL service functions/hooks to ensure they correctly formulate queries and parse responses.
- **Integration Tests**: Test components that use these services to ensure data flows correctly to the UI.
- **End-to-End (E2E) Tests**: For critical user flows:
    - Searching for flights, trains, local travel, hotels with various filters.
    - Viewing details and date-specific pricing/availability.
    - (If applicable) Making bookings/mutations.
- **Manual QA**: Thoroughly test all affected sections of the application across different scenarios and browsers.

## 5. Phased Approach (Optional)

Consider a phased approach for development and rollout:
1.  **Phase 1: Core Service Alignment**: Focus on refactoring the GraphQL queries and basic data display for one service at a time (e.g., Flights first, then Trains, etc.). Prioritize fixing broken functionality.
2.  **Phase 2: UI/UX Enhancements**: After technical alignment, implement UI/UX improvements identified in the review.
3.  **Phase 3: New Features**: If the backend offers new capabilities not yet used, plan for their integration.

This plan provides a roadmap for aligning the frontend with the backend and improving the overall user experience. Collaboration between frontend and backend understanding will be key to a successful implementation.
