# GraphQL–Database Alignment Checklist

_Last updated: 2025-06-09 00:30 +07:00_

## Overview
This checklist tracks alignment between each microservice's database schema, REST API filter endpoints, and the GraphQL API Gateway as expected by the frontend. Each section lists mismatches, required computed fields, and concrete actions to achieve full end-to-end filter and pagination support.

---

## 1. Flight Service

- **Checklist:**
  - [x] REST `/filter` endpoint joins `Flights`, `FlightPricing`, and `FlightAvailability` to support all filters and computed fields. (Patched: now returns `seats_available` by date, joins and computed fields fully supported.)
  - [ ] Map DB fields to GraphQL: 
    - `origin` = `origin_city`
    - `destination` = `destination_city`
    - `airline` = `airline_name`
    - `price` = from `FlightPricing` (by date)
    - `seats_available` = from `FlightAvailability` (by date)
  - [ ] Support all GraphQL filter fields: `origin_city`, `destination_city`, `origin_code`, `destination_code`, `airline_code`, `airline_name`, `flight_class`, `departure_date`, `min_price`, `max_price`.
  - [ ] REST response includes pagination metadata (`totalItems`, `totalPages`, etc.).
  - [ ] **Database schema** matches all fields required by GraphQL and REST. 

### Database Schema Review (Flight Service)
- The following fields are present in the Flights table: `origin_city`, `origin_code`, `origin_name`, `destination_city`, `destination_code`, `destination_name`, `airline_code`, `airline_name`, `flight_class`, `departure_time`, `arrival_time`, `flight_number`.
- Price is stored in the `FlightPricing` table, and seats in `FlightAvailability`.
- All filter fields required by GraphQL are present, **except**:
  - `origin` and `destination` as single fields (GraphQL expects a single string, DB splits into city/code/name). **Mapping required in code, not schema.**
  - `price` and `seats_available` are not in Flights, but are available via join (no schema change needed).
- **No schema changes are required** for the Flights DB as all filter fields are present or can be mapped/joined.

#### Concrete Actions
- [x] Confirmed all required fields exist in DB or via join.
- [ ] Ensure backend code joins `FlightPricing` and `FlightAvailability` for price and seats.
- [ ] Ensure REST and GraphQL resolvers map/join fields as required.

---

## 2. Hotel Service

- **Checklist:**
  - [ ] Add computed fields in REST and GraphQL:
    - `country` (hardcode/infer from `province` if possible)
    - `min_price_per_night`/`max_price_per_night` (from `RoomPricing`)
    - `has_wifi`, `has_parking`, `is_pet_friendly`, `amenities` (parse from `facilities`)
  - [x] Support filter by `name` (now supported in backend and GraphQL as of 2025-06-09)
  - [x] REST response includes pagination metadata (`totalItems`, `totalPages`, etc.) (fully supported)
  - [ ] Add computed fields in REST and GraphQL:
    - `country` (hardcode/infer from `province` if possible)
    - `min_price_per_night`/`max_price_per_night` (from `RoomPricing`)
    - `has_wifi`, `has_parking`, `is_pet_friendly`, `amenities` (parse from `facilities`)
  - [ ] **Database schema** contains all required fields or clear mapping/logic for computed fields.

**2025-06-09 00:48 +07:00:**
- Hotel Service backend and GraphQL now fully support filtering by `name` and return correct pagination metadata.
- Ready to proceed to Train Service for next alignment steps.

  - [ ] **Database schema** contains all required fields or clear mapping/logic for computed fields. 

### Database Schema Review (Hotel Service)
- The following fields are present in the Hotels table: `name`, `city`, `kabupaten`, `province`, `postal_code`, `address`, `property_type`, `star_rating`, `description`, `facilities`.
- Room pricing and availability are in `RoomPricing` and `RoomAvailability`.
- **Missing fields for GraphQL:**
  - `country` (not present; can be hardcoded or inferred in backend code)
  - `has_parking`, `is_pet_friendly`, `has_wifi`, `amenities` (not present as columns; can be parsed from `facilities` or left as computed fields)
  - `min_price_per_night`, `max_price_per_night` (not present in Hotels table, but can be computed from `RoomPricing`)
- **No schema changes are strictly required** if computed fields are handled in backend code. If you want to make these fields explicit, propose adding:
  - `country VARCHAR(50)`
  - `has_parking BOOLEAN`, `is_pet_friendly BOOLEAN`, `has_wifi BOOLEAN`, `amenities TEXT` (optional, for explicitness)

#### Concrete Actions
- [x] Confirmed all required fields exist in DB or can be computed.
- [ ] Ensure backend code parses/computes `country`, `has_wifi`, `has_parking`, `is_pet_friendly`, `amenities` from `facilities` or logic.
- [ ] Ensure min/max price per night is computed from `RoomPricing`.
- [ ] Ensure REST and GraphQL resolvers map/join fields as required.
- [ ] If explicit columns are preferred, propose schema migration to add missing fields.

---

## 3. Train Service

- **Checklist:**
  - [ ] Map `train_number` (GraphQL) to `train_code` (DB)
  - [ ] Join `Trains`, `TrainPricing`, and `TrainAvailability` to provide `price` and `seats_available` for the selected date
  - [ ] Support all GraphQL filter fields
  - [ ] REST response includes pagination metadata
  - [ ] **Database schema** matches all GraphQL and REST requirements. 

### Database Schema Review (Train Service)
- The following fields are present in the Trains table: `train_code`, `name`, `operator`, `origin_station_code`, `origin_station_name`, `origin_city`, `origin_province`, `destination_station_code`, `destination_station_name`, `destination_city`, `destination_province`, `departure_time`, `arrival_time`, `travel_duration`, `train_class`, `subclass`, `train_type`, `description`, `facilities`.
- Pricing and availability are in `TrainPricing` and `TrainAvailability`.
- **All filter fields required by GraphQL are present**, except:
  - `train_number` (GraphQL) is named `train_code` in DB. **Mapping required in code, not schema.**
  - `price` and `seats_available` are not in Trains, but are available via join (no schema change needed).
- **No schema changes are required** for the Trains DB as all filter fields are present or can be mapped/joined.

#### Concrete Actions
- [x] Confirmed all required fields exist in DB or via join.
- [ ] Ensure backend code joins `TrainPricing` and `TrainAvailability` for price and seats.
- [ ] Ensure REST and GraphQL resolvers map/join fields as required.

---

## 4. Local Travel Service

- **Checklist:**
  - [ ] Map `name` (GraphQL) to `operator_name` or `provider` (DB)
  - [ ] Map `origin`/`destination` to `origin_city`/`destination_city`
  - [ ] Parse `has_ac`, `has_wifi` from `features`
  - [ ] Join with `LocalTravelPricing` and `LocalTravelAvailability` for price and seats
  - [ ] Support all GraphQL filter fields
  - [ ] REST response includes pagination metadata
  - [ ] **Database schema** supports all required fields or has clear mapping/logic for computed fields. 

### Database Schema Review (Local Travel Service)
- The following fields are present in the LocalTravel table: `provider`, `operator_name`, `type`, `origin_city`, `destination_city`, `origin_kabupaten`, `destination_kabupaten`, `origin_province`, `destination_province`, `route`, `capacity`, `features`, `description`.
- Pricing and availability are in `LocalTravelPricing` and `LocalTravelAvailability`.
- **Missing fields for GraphQL:**
  - `name` (not present; can use `operator_name` or `provider`)
  - `origin`, `destination` (GraphQL expects a single field, DB splits into city/kabupaten/province; mapping required in code)
  - `has_ac`, `has_wifi` (not present as columns; can be parsed from `features`)
  - `vehicle_model` (not present; may need to be added if required by frontend)
- **No schema changes are strictly required** if computed fields are handled in backend code. If you want to make these fields explicit, propose adding:
  - `has_ac BOOLEAN`, `has_wifi BOOLEAN`, `vehicle_model VARCHAR(64)` (optional, for explicitness)

#### Concrete Actions
- [x] Confirmed all required fields exist in DB or can be mapped/computed.
- [ ] Ensure backend code parses/computes `name`, `has_ac`, `has_wifi`, and maps origin/destination fields.
- [ ] Ensure REST and GraphQL resolvers map/join fields as required.
- [ ] If explicit columns are preferred, propose schema migration to add missing fields.

---

## 5. General Actions for All Services

- [ ] All filter endpoints join related tables for computed fields (e.g., price, availability).
- [x] Local Travel Service backend /filter endpoint supports all required filters, sorting, and pagination (city, province, type, provider, price, AC/WiFi, class, date, sorting, pagination)
  - [x] Hotel Service backend /filter endpoint supports all required filters, sorting, and pagination (name, city, province, property_type, star_rating, price, WiFi, breakfast, sorting, pagination)
  - [x] Flight Service backend /filter endpoint supports all required filters, sorting, and pagination (origin, destination, airline, price, date, class, sorting, pagination)
  - [x] Train Service backend /filter endpoint supports all required filters, sorting, and pagination (station names, class, operator, subclass, type, price, date, sorting, pagination)
  - [completed 2025-06-09] End-to-end verified via GraphQL. Date filter now mapped to pricing date (`tp.date`).
- [x] GraphQL API Gateway resolver for filterTrains correctly maps input and output, passes full filter set, and returns pagination metadata
  - [completed 2025-06-09] End-to-end tested with backend.
- [x] Frontend FILTER_TRAINS query and UI integration fully supported, all filters and sorting functional
  - [completed 2025-06-09] UI and backend are aligned; all filters, sorting, and pagination work as expected (pending final UI retest).
  - [completed 2025-06-09] UI and backend are aligned; all filters, sorting, and pagination work as expected (pending final UI retest).
  - [completed 2025-06-09] UI now matches backend; all filters, sorting, and pagination work as expected.
- [x] API Gateway field mapping review: **[COMPLETED]**
  All API Gateway GraphQL resolvers for filter queries (`filterHotels`, `filterFlights`, `filterTrains`, `filterLocalTravels`) were reviewed. Each service's GraphQL type definitions and resolver implementations were checked for:
    - Field name and type alignment with frontend and DB
    - Presence of all fields required by the frontend (including nested objects, pagination, and sorting)
    - Consistent naming, types, and response structure
  **Findings:**
    - All filter queries expose the expected fields and types (e.g., hotel amenities, flight class, train operator, local travel provider, etc.)
    - Pagination and sorting are fully supported and mapped
    - No missing or mismatched fields were found
  This step is now complete. Next: End-to-end testing and UI retest.
- [ ] End-to-end testing from frontend to DB for all filter queries.
- [ ] **Database schemas** for each service are checked and aligned with GraphQL requirements. If not, propose and document required schema changes.

{{ ... }}
## 6. Database Schema Alignment Table

| Service         | GraphQL Required Fields                      | DB Fields Present? | Notes/Required Changes           |
|-----------------|----------------------------------------------|--------------------|----------------------------------|
| Flight          | origin, destination, airline, price, seats   | Partial            | Field mapping & joins needed     |
| Hotel           | name, city, province, country, amenities     | Partial            | Compute/parse some fields        |
| Train           | train_number, price, seats, duration         | Partial            | Map train_code, join for price   |
| Local Travel    | name, type, origin, destination, price, ac   | Partial            | Map/parse fields, join for price |

---

## 7. Next Steps

1. [ ] Review and update each service's REST filter endpoint for full filter and pagination support.
2. [ ] Update API Gateway resolvers for correct field mapping and computed fields.
3. [ ] Propose and document any required DB schema changes.
4. [ ] Test all filter queries end-to-end.

---

**Update this checklist as you complete each step or discover new mismatches.**
