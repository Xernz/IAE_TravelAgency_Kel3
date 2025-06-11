# Plan: Action Plan Simplification Verification and Execution

## Notes
- User wants to verify the action plan by mapping its observations to the current project state before proceeding.
- Notify the user if any crucial clarification or verification is needed before starting the plan.
- The plan to be verified is in `Action Plan to simplification.md`.
- Verified: Model files for hotel, flight, train, and local travel services exist as specified in the plan.
- Verified: Schema files for all four services found as `docs/database-schema.sql` in each service directory.
- Verified: Hotel service schema matches the old structure described in the plan; ready for simplification.
- Verified: Schema structure for flight, train, and local travel services matches the old structure described in the plan; ready for simplification.
- Verified: REST API route and controller directories found for all services (`src/routes/`, `src/controllers/`).
- Verified: GraphQL schema and resolvers are organized per domain in `api-gateway/graphql/*.js`.
- Verified: GraphQL schema (`typeDefs`) and resolver logic in `hotel.js` and `flight.js` match the "before" state described in the action plan; planned changes are appropriate.
- Verified: `createBooking` mutation logic in `booking.js` has been reviewed for booking flow refinement.
- Verified: Hotel service REST API routes for availability map to `hotelController.decreaseAvailability` and `increaseAvailability`; controller requires `room_type_id`, `date`, and `quantity` as in the plan's "before" state.
- Verified: Flight service REST API routes for availability map to `flightController.decreaseAvailability` and `increaseAvailability`; controller requires only `date` and `quantity` as in the plan's "before" state.
- Verified: Train service REST API routes for availability map to `trainController.decreaseAvailability` and `increaseAvailability`; controller requires only `date` and `quantity` as in the plan's "before" state.
- Verified: Local travel service REST API routes for availability map to `localTravelController.decreaseAvailability` and `increaseAvailability`; controller requires only `date` and `quantity` as in the plan's "before" state.
- Discrepancy: REST APIs for flight, train, and local travel already do not use class/type parameters for availability endpoints; only their GraphQL layers need updating to remove these arguments.
- No major blockers: Action plan is accurate and ready for execution phase.
- Flight service DB schema changes completed as per Part 1B.
- Train service DB schema changes completed as per Part 1C.
- Local travel service DB schema changes completed as per Part 1D.
- Hotel service model updated for new schema (Part 2B); controller/model parameter sync issue noted for future reconciliation.
- Hotel service controller updated to expect and pass room_type_name (reconciliation with model complete).
- Hotel service REST availability/pricing endpoints updated for new schema (Part 2C).
- Flight service GraphQL typeDefs and resolvers updated for simplification (Part 3A).
- Train service GraphQL typeDefs and resolvers updated for simplification (Part 3B).
- Local Travel service GraphQL typeDefs and resolvers updated for simplification (Part 3C).
- Hotel service GraphQL typeDefs and resolvers updated for simplification (Part 2C).
- Hotel service GraphQL: hotelAvailability/hotelPricing replaced by hotelDailyStatus; filterHotels now throws error if called.
- Hotel service model: getRoomTypes removed, filter method commented out due to schema changes; filter endpoint now returns 501 Not Implemented.
- Hotel controller: new /daily-status endpoint/controller implemented for combined availability and pricing.
- Hotel.filter method and filterHotels controller have been refactored and re-enabled to match the new schema and filtering logic.
- Next focus: Verify and test all updated availability and pricing endpoints before proceeding to booking flow refinement.
- Debugging phase: User reported missing/null data in GraphQL responses despite correct DB schema; investigating possible issues in data mapping between microservice and GraphQL layer.
- Root cause found: Train, flight, and local travel filter/detail endpoints still use obsolete tables/fields (e.g., TrainPricing, TrainAvailability), causing SQL errors or missing/null data after schema simplification. These endpoints need to be refactored to use the new *DailyStatus tables and updated data mapping.
- Train service model filter and getById methods refactored to use TrainDailyStatus; obsolete fields/tables removed from queries. Next: verify/fix for flight and local travel.
- Flight service model filter and getById methods refactored to use FlightDailyStatus; obsolete fields/tables removed from queries. Obsolete getAvailability/getPricing methods commented out. Next: verify/fix for local travel.
- Local travel service model filter and getById methods refactored to use LocalTravelDailyStatus; obsolete fields/tables removed from queries. Obsolete getAvailability/getPricing methods commented out. Model now fully aligned with new schema.
- Verified: GraphQL null/NaN bug for Train queries is resolved; queries without a date now correctly return null for price/availability.
- API Gateway's trainDailyStatus query currently fails with a 404 because the Train service lacks a /:id/daily-status endpoint.
- Train service /:id/daily-status endpoint implemented (route, controller, model); ready for test via API Gateway.
- Work completed: Train service /:id/daily-status endpoint tested successfully.
- Train GraphQL schema and resolvers refactored: price and seats_available removed from main Train type; new dailyStatus(date: String!) field added for date-specific status. This resolves the data-model misalignment and null field issue in train queries.
- Debugged and fixed null values for description, facilities, created_at, and updated_at in Train GraphQL queries: added these fields to Train service model's getById SQL.
- New bug: Train.filter SQL does not select all required columns, causing nulls in filterTrains GraphQL results. Needs SQL and mapping fix.
- Root cause: API Gateway filterTrains resolver did not map all static fields (name, codes, description, etc.) from service response, and GraphQL type still included train_class/subclass.
- Fix: Updated filterTrains resolver to map all fields and removed train_class/subclass from GraphQL type and filters input.
- Recap (Train Service):
    1. Null price/availability: moved to dailyStatus(date) sub-query and endpoint.
    2. Null static fields in train(id): fixed getById SQL to select all needed fields.
    3. Null static fields in filterTrains: fixed filter SQL to explicit columns and API Gateway resolver mapping.
    4. Non-existent DB fields: removed train_class/subclass from schema and filters.
- Flight service GraphQL type and resolvers being refactored to move price/availability to dailyStatus, matching Train pattern.
- Flight.dailyStatus resolver added in API Gateway.
- Flight GraphQL type expanded to include additional static fields (flight_status, origin_airport_iata, destination_airport_iata, airline_code, aircraft_model, seat_capacity, description); resolvers updated to map these fields.
- Flight service /flights/:id/daily-status endpoint implemented (route, controller, model); ready for retest via API Gateway.
- Flight service listAll model method refactored to use JOINs for all static fields; null static fields issue in flights query fixed.
- API Gateway Query.flights resolver updated to map new aliased fields from service response.
- New bug: After JOIN refactor, Flight service flights query now returns empty array (no data). Debugging required.
- Root cause: Flight service DB is denormalized; all JOINs were invalid. Model rewritten to select directly from Flights table. All data access now matches schema. Similar audit required for Local Travel and Hotel services.
- Verified: GraphQL null/NaN bug for Flight queries is resolved; queries without a date now correctly return null for price/availability.
- Flight service /:id/daily-status endpoint implemented (route, controller, model); ready for retest via API Gateway.
- Flight GraphQL schema and resolvers refactored: price and seats_available removed from main Flight type; new dailyStatus(date: String!) field added for date-specific status. This resolves the data-model misalignment and null field issue in flight queries.
- Debugged and fixed null values for description, facilities, created_at, and updated_at in Flight GraphQL queries: added these fields to Flight service model's getById SQL.
- Debugged and fixed 'callback is not a function' crash in Flight service: root cause was async/await usage in controller with callback-based model. Model refactored to use Promises throughout, resolving async mismatch and crash.
- Flight service model/controller async mismatch is now fully resolved; 404 errors indicate missing data for the requested date in FlightDailyStatus, not a code issue.
- Some static fields in flight results (e.g., flight_status, aircraft_model, seat_capacity, description) are still null; model and query code are now correct, but these columns do not exist in the Flights table in the current DB schema. This is the root cause of persistent nulls for these fields in GraphQL results.
- IATA code fields in the Flights table are named origin_code and destination_code; mapping in the API Gateway has been fixed to match.
- Decision point: To resolve nulls for flight_status, aircraft_model, seat_capacity, and description, either (1) add these columns to the Flights table and update the data, or (2) remove these fields from the GraphQL Flight type if not needed.
- User chose to adjust the GraphQL API: remove flight_status, aircraft_model, seat_capacity, and description from the Flight type and mapping in the API Gateway to match the current DB schema. Proceeding with this adjustment for Flight service.
- Flight service model's getById method updated to select only existing columns and use correct IATA code field names, resolving SQL error for unknown columns.
- Query.flightDailyStatus resolver was missing in API Gateway; implemented resolver and updated schema to return a single FlightDailyStatus object. Standalone flightDailyStatus query now works as expected.
- Flight service model's filter method (Flight.filter) still selects non-existent columns (flight_status, aircraft_model, etc.), causing SQL errors in filter queries. Next step: update filter method to select only existing columns, matching getById.
- Located and reviewed the correct pagination utility file (services/utils/pagination.js); next step is to debug the logic within paginatedResponse and its usage in the Flight model.
- Recap (Flight Service):
    1. SQL 'Unknown column' errors (getById, filter): Caused by selecting non-existent/misnamed columns. Fixed by aligning SELECT clauses with DB schema (e.g., flight_status removed, origin_airport_iata -> origin_code).
    2. GraphQL: Non-existent static fields (flight_status, aircraft_model): Fields were in GraphQL type but not DB. Fixed by removing fields from GraphQL type and API Gateway mapping.
    3. GraphQL: flightDailyStatus query null: Top-level Query.flightDailyStatus resolver was missing. Fixed by implementing the resolver in API Gateway and adjusting schema to return single object.
    4. GraphQL: filterFlights pagination null: Mismatch between service's snake_case pagination keys (total_items) and GraphQL's camelCase keys (totalItems). Fixed by adding explicit key mapping in API Gateway's filterFlights resolver.
    5. Robustness: Ensured totalItems in Flight.filter used a specific alias (items_count) and checked for its existence.
    6. Async/Await Mismatch: Controller used async/await, model used callbacks. Fixed by refactoring model to use Promises.
- Key Lessons for Other Services:
    - Prioritize schema alignment (DB, Service Model SQL, GraphQL API).
    - Only expose available data in GraphQL.
    - Ensure all GraphQL schema items have resolvers.
    - Map naming conventions (snake_case vs. camelCase) between services and API Gateway.
    - Verify pagination logic (totalItems calculation, parameter handling, field naming).
    - Maintain consistent async patterns (Promises/async/await).
- Next step is to verify static data in the Flights table for these fields, then proceed to Local Travel and Hotel services.
- Began proactive Local Travel service debugging: reviewing GraphQL schema/resolvers, model, and DB schema for alignment, resolver completeness, and pagination mapping using lessons learned from Flight/Train.
- Discovered Local Travel service is missing the consolidated /:id/daily-status endpoint; will implement it (route, controller, model) to match the new GraphQL pattern.
- Local Travel model and controller review: Identified potential mismatches between model SQL and actual DB schema (complex joins, non-existent columns). Must review docs/database-schema.sql before refactoring model methods (filter, getById, etc.) and implementing getDailyStatus.
- Local travel service model and controller fully refactored: /:id/daily-status endpoint implemented, all model methods now align with DB schema, obsolete code removed. Ready for GraphQL API testing.
- User's GraphQL query for Local Travel revealed multiple schema/type mismatches (e.g., wrong field names, missing/incorrect arguments, camelCase vs snake_case issues). Next step is to audit and fix API Gateway's localTravel GraphQL typeDefs, resolvers, and field mappings to match the new REST/model structure.
- API Gateway's localTravel GraphQL typeDefs, resolvers, and field mappings have been audited and fixed to match the new REST/model structure. Remaining task: verify filterLocalTravels integration with Local Travel service (500 error indicates SQL syntax issue in service model).
- Root cause: Local travel filter SQL error is due to mismatch between filter parameter values and pagination values in paginateQuery. Pagination utility now supports passing filter values; filter method in LocalTravel.js must be updated to use this.
- Local Travel filter method refactored to explicitly combine filter and pagination values, fixing SQL parameter mismatch. Debug logs removed. Service restart pending to apply fix.
- Root cause of Local Travel pagination bug: API Gateway expected snake_case, but service returned camelCase keys. Resolver updated to use camelCase keys, debug logs removed. Awaiting final confirmation of correct pagination fields in GraphQL response.
- Confirmed: Pagination fields in filterLocalTravels GraphQL response are now correct.
- Outstanding: `class_type` field in LocalTravel GraphQL typeDefs and mapping should be removed to match the simplification plan and DB schema, as done for other services.
- Confirmed: All references to `class_type` have been removed from the Local Travel service controller, completing schema/model/controller cleanup for this domain.
- Confirmed: All references to `class_type` have been removed from the API Gateway resolver mapping, completing the cleanup across all layers for Local Travel.

- Recap (Local Travel Service):
    1. SQL Syntax Error in `filterLocalTravels` (500 Internal Server Error):
        - Cause: `paginateQuery` utility initially discarded filter values. Even after fixing, the `LocalTravel.js` model's `filter` method mishandled parameter passing in async flow.
        - Fix: Refactored `LocalTravel.js` model's `filter` to explicitly combine filter values with pagination values (limit, offset) *after* the `paginateQuery` call.
    2. Null Pagination Data in GraphQL `filterLocalTravels` Response:
        - Cause: API Gateway resolver expected `snake_case` pagination keys, but the service returned `camelCase` keys.
        - Fix: Updated API Gateway resolver mapping to use `camelCase` keys (`totalItems`, `totalPages`, `page`, `limit`).
    3. Obsolete `class_type` Field Lingering:
        - Cause: `class_type` was not fully removed from all layers as per the simplification plan.
        - Fix: Systematically removed `class_type` from:
            a. GraphQL schema (`LocalTravel` type, `LocalTravelFiltersInput`) in API Gateway.
            b. Service controller parameter handling (`filterLocalTravel` function) in `local-travel-service`.
            c. Resolver data mapping logic (`localTravels`, `localTravel`, `filterLocalTravels` resolvers) in API Gateway.

- Key Lessons Reinforced (Local Travel Service):
    - Handle async parameter passing and SQL values explicitly.
    - Always verify naming conventions (snake_case vs camelCase) at every layer.
    - When removing fields or changing schemas, apply changes across all layers: DB, model, controller, GraphQL schema, and resolvers.
    - Use targeted logging to debug complex data flow issues.

## Task List
- [x] Read and understand the Action Plan to simplification.md
- [x] Map each observation and proposed change in the plan to the current project state (files, endpoints, schemas, etc.)
  - [x] Verify existence of model files for hotel, flight, train, local travel services
  - [x] Locate and verify schema files for hotel, flight, train, local travel services
  - [x] Review and map schema structure for flight, train, and local travel services
  - [x] Locate and verify REST API route/controller files for each service
  - [x] Locate and verify GraphQL schema (`typeDefs`) and resolver files in API Gateway
  - [x] Review and map GraphQL schema and resolvers to plan requirements
  - [x] Review and map REST endpoints for hotel service to plan requirements
  - [x] Review and map REST endpoints for flight service to plan requirements
  - [x] Review and map REST endpoints for train service to plan requirements
  - [x] Review and map REST endpoints for local travel service to plan requirements
- [x] Identify any discrepancies or areas needing clarification
- [x] Notify the user of any crucial verification or clarification required
- [x] After verification and clarifications, proceed with executing the simplification plan step-by-step
  - [x] Implement Hotel Service DB schema changes (Part 1A)
  - [x] Implement Flight Service DB schema changes (Part 1B)
  - [x] Implement Train Service DB schema changes (Part 1C)
  - [x] Implement Local Travel Service DB schema changes (Part 1D)
  - [x] Update Hotel Service controller for new schema (Part 2A)
  - [x] Update Hotel Service model for new schema (Part 2B)
  - [x] Reconcile Hotel Service controller/model parameter usage (room_type_name vs. room_type_id)
  - [x] Update Hotel Service REST and GraphQL availability/pricing endpoints for new structure (Part 2C)
  - [x] Update Hotel Service GraphQL typeDefs for new structure (Part 2C)
  - [x] Update Hotel Service GraphQL resolvers for new structure (Part 2C)
  - [x] Update Flight Service GraphQL typeDefs for new structure (Part 3A)
  - [x] Update Flight Service GraphQL resolvers for new structure (Part 3A)
  - [x] Update Train Service GraphQL typeDefs for new structure (Part 3B)
  - [x] Update Train Service GraphQL resolvers for new structure (Part 3B)
  - [x] Update Local Travel Service GraphQL typeDefs for new structure (Part 3C)
  - [x] Update Local Travel Service GraphQL resolvers for new structure (Part 3C)
  - [x] Disable Hotel Service /filter endpoint (return 501 Not Implemented)
  - [x] Implement Hotel Service /daily-status endpoint/controller for combined availability and pricing
  - [x] Debug and verify data mapping for all availability/pricing endpoints (investigate missing/null fields in GraphQL responses)
  - [x] Audit and refactor train, flight, and local travel filter/detail endpoints to use new *DailyStatus tables and update data mapping
  - [x] Audit and refactor flight filter/detail endpoints to use new *DailyStatus tables and update data mapping
  - [x] Audit and refactor local travel filter/detail endpoints to use new *DailyStatus tables and update data mapping
  - [x] Implement and test /:id/daily-status endpoint in Train service for combined availability/pricing
  - [x] Refactor Train GraphQL schema/resolvers: remove price/seats_available from Train type, add dailyStatus(date) field
  - [x] Debug/fix missing fields (description, facilities, created_at, updated_at) in Train GraphQL responses
  - [x] Fix Train.filter SQL to select and alias all required fields for filterTrains GraphQL
  - [x] Update API Gateway filterTrains resolver and GraphQL type to match available fields
  - [x] Retest train GraphQL queries after API Gateway mapping/type fix
  - [x] Recap and document Train service issues/solutions for reference
  - [x] Refactor Flight GraphQL type/resolvers: move price/availability to dailyStatus, add dailyStatus resolver, expand static fields
  - [x] Verify/implement Flight service /flights/:id/daily-status endpoint
  - [x] Retest Flight GraphQL queries after refactor
  - [x] Debug and fix empty flights query result after JOIN refactor
  - [x] Debug and fix Flight service model/controller async mismatch (callback vs. Promise)
  - [x] Check for and resolve similar issues in Local Travel and Hotel services
  - [x] Review and fix null static fields in flight results (e.g., flight_status, aircraft_model, seat_capacity, description)
  - [x] Update Flight service model getById method to select only existing columns and correct field names
  - [x] Retest GraphQL queries for all other services after endpoint/model refactor
  - [x] Remove non-existent static fields from GraphQL Flight type and mapping
  - [x] Implement Query.flightDailyStatus resolver in API Gateway and fix schema to return a single object
  - [x] Update Flight service model filter method to select only existing columns
  - [x] Resolve Flight service pagination issue in filterFlights
  - [x] Proactively review Local Travel service for schema alignment (DB, model, GraphQL), resolver completeness, and pagination mapping
  - [x] Refactor Local Travel GraphQL schema and resolvers for dailyStatus pattern and pagination mapping
  - [x] Implement and test /:id/daily-status endpoint in Local Travel service (route, controller, model)
  - [x] Audit and fix API Gateway localTravel GraphQL typeDefs, resolvers, and field mappings to match new REST/model (field names, argument names, camelCase/snake_case, etc.)
  - [x] Review and fix Local Travel filter method to pass filter values to paginateQuery
  - [x] Retest Local Travel GraphQL queries for correct data and error-free results
  - [x] Confirm correct pagination fields in filterLocalTravels GraphQL response
  - [x] Remove `class_type` from LocalTravel microservice controller/params
  - [x] Remove `class_type` from LocalTravel API Gateway resolver mapping
- [x] Re-implement Hotel.filter method in hotel-service/src/models/Hotel.js
- [x] Update Hotel filterHotels controller in hotel-service/src/controllers/hotelController.js
- [x] Update filterHotels GraphQL resolver in api-gateway/graphql/hotel.js
- [x] Verify Hotel GraphQL type and HotelFiltersInput reflect new schema
- [x] Hotel service model and controller refactored: now use a single getDailyStatus method for availability and pricing; obsolete getAvailability/getPricing removed.
- [x] Hotel service /daily-status endpoint and API Gateway hotelDailyStatus resolver updated for new response structure; all layers now aligned.
- [x] All four services (Train, Flight, Local Travel, Hotel) have completed DB, model, controller, and GraphQL refactors for the new daily status pattern.
- [x] Next step: Verify and test all updated endpoints (availability, pricing, daily status, filters) across all services before proceeding to booking flow refinement.
- New issue: Hotel service filter SQL in Hotel.js still references obsolete columns (h.stars, h.phone, h.email), causing 500 errors in filterHotels GraphQL query; needs audit and fix to use only valid columns (e.g., h.star_rating).
- New issue: hotelDailyStatus GraphQL query fails with "Cannot return null for non-nullable field HotelRoomDailyStatus.date"; root cause is missing/incorrect date field in hotel-service model/controller SQL or mapping. Needs audit and fix to ensure date is always present in results.
- [x] Audit and fix hotel-service filter SQL in Hotel.js to use only valid columns (replace h.stars with h.star_rating, remove h.phone and h.email) for filterHotels endpoint.
- [x] Audit and fix hotelDailyStatus endpoint/model in hotel-service to ensure date field is always present in the response for each room type (fix SQL SELECT and mapping as needed).
- Fix applied: hotelDailyStatus controller now includes the date field in the response, resolving the null-for-non-nullable error in GraphQL.
- Proactive fix: hotel-service model's create and update methods now use only valid columns (star_rating, property_type, facilities), removing obsolete ones (stars, phone, email).
- FilterHotels endpoint works, but filtering by stars may still fail due to possible mismatches in filter logic or column names (e.g., stars vs. star_rating); needs targeted audit/fix.
- [x] Audit and fix filter-by-stars logic in hotel-service filter method to ensure correct column (star_rating) is used for filtering.

## Current Goal
Verify and test all updated endpoints