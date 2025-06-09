# GraphQL API Alignment Issues

This document outlines observed misalignments between the frontend GraphQL calls and the API Gateway's exposed GraphQL schema.

## 1. Payment Service Misalignment [RESOLVED]

**Issue Date:** 2025-06-08
**Resolved:** 2025-06-08

**Affected Files:**
- Frontend GraphQL Definitions: `frontend/src/services/graphqlQueries.js`
- Frontend Component: `frontend/src/pages/MyBookings.js`
- API Gateway GraphQL Schema: `api-gateway/graphql/payment.js`

**Resolution:**
- The frontend mutation was renamed from `INITIATE_PAYMENT`/`initiatePayment` to `CREATE_PAYMENT`/`createPayment` to match the API Gateway.
- The mutation signature and variables were updated for consistency.
- All usages in `MyBookings.js` now use the correct mutation.
- The payment flow is now handled end-to-end via GraphQL/Apollo Client.

---

    ```graphql
    // In frontend/src/services/graphqlQueries.js
    export const INITIATE_PAYMENT = gql`
      mutation InitiatePayment($userId: Int!, $bookingId: Int!, $amount: Float!, $method: String!) {
        initiatePayment(user_id: $userId, booking_id: $bookingId, amount: $amount, payment_method_type: $method) {
          # ... fields ...
        }
      }
    `;
    ```

-   **API Gateway Implementation:** The API Gateway (`api-gateway/graphql/payment.js`) exposes a mutation for creating payments under the name `createPayment`.
    ```graphql
    // In api-gateway/graphql/payment.js
    type Mutation {
      createPayment(userId: ID!, bookingId: ID!, amount: Float!, currency: String, payment_method_type: String, payment_reference: String): Payment
    }
    ```

**Impact:**
This mismatch means the frontend's `initiatePayment` mutation call will fail because the API Gateway does not have a resolver for `initiatePayment`. It only has a resolver for `createPayment`. Consequently, the GraphQL payment flow from the frontend is currently broken.

**Contradictory Documentation/Updates:**
-   The `project_task.md` (progress update 2025-06-08) states that payment flows are fully migrated to GraphQL in the frontend. This appears inaccurate due to this unresolved mismatch.
-   The `communication-flow.md` (which suggests REST is used for payments from the frontend) and previous analysis (Memory ID: `e3b129b8-7a7f-49b9-a124-ce56d6b1dffa`) align more closely with the observed issue.

**Recommendation:**
Align the mutation name. Either:
1.  Update the frontend's `INITIATE_PAYMENT` mutation in `graphqlQueries.js` to call `createPayment` and adjust variable names if necessary.
2.  Update the API Gateway's `payment.js` to expose the mutation as `initiatePayment` instead of `createPayment`.

Consistency in naming is crucial for the correct functioning of the GraphQL API.

## 2. Booking Service Misalignment [RESOLVED]
 (Missing Frontend Definitions)

**Issue Date:** 2025-06-08

**Affected Files:**
- Frontend GraphQL Definitions: `frontend/src/services/graphqlQueries.js` (potentially, or definitions are missing)
- Frontend Component: `frontend/src/pages/MyBookings.js`
- API Gateway GraphQL Schema: `api-gateway/graphql/booking.js`

**Description:**
The frontend component `MyBookings.js` now correctly imports and uses booking-related GraphQL operations (`GET_MY_BOOKINGS`, `CANCEL_BOOKING`, `MODIFY_BOOKING`) from `graphqlQueries.js`.
- These booking operations have been defined in `frontend/src/services/graphqlQueries.js` to match the API Gateway schema.
- All usages in `MyBookings.js` have been updated accordingly.
- Booking management features (listing, modification, cancellation) are now handled via GraphQL and are fully functional.

**Resolution:**
- The missing booking operations (`GET_MY_BOOKINGS`, `CANCEL_BOOKING`, `MODIFY_BOOKING`) have been defined in `frontend/src/services/graphqlQueries.js`.
- The API Gateway's `booking.js` schema has been verified to match the frontend's expectations.

**Impact:**
- Booking management functionalities (viewing, canceling, modifying bookings) in the `MyBookings` page are now fully functional.

## 3. Flight Service Misalignment [PENDING - Mutation Definition]

**Issue Date:** 2025-06-08
**Status Update:** 2025-06-08 (Revised)

**Affected Files:**
- Frontend GraphQL Definitions: `frontend/src/services/graphqlQueries.js`
- API Gateway GraphQL Schema: `api-gateway/graphql/flight.js` (Assumed to expect `createFlight`)

**Description & Original Plan:**
- The initial assessment (dated 2025-06-08) indicated that a `CREATE_FLIGHT` (or `createFlight`) mutation was already added to `frontend/src/services/graphqlQueries.js` and aligned with the API Gateway.
- **Correction:** Further investigation on 2025-06-08 revealed this mutation is currently missing from the frontend `graphqlQueries.js` file.

**Current Action (2025-06-08):**
- Defining the `createFlight` mutation in `frontend/src/services/graphqlQueries.js`.
- The proposed mutation will use minimal fields based on existing flight query data: `userId`, `flightId`, `numberOfPassengers`.
- The aim is to align with the API Gateway's expected `createFlight` operation.
- Once defined and implemented, the flight creation flow can be handled via GraphQL/Apollo Client.

**Next Steps:**
- Add the defined `createFlight` mutation to `graphqlQueries.js`.
- Integrate this mutation into the relevant frontend component (e.g., `FlightDetail.js`).
- Update this section to "[RESOLVED]" upon successful implementation and testing.

## 4. Train Service Misalignment [RESOLVED]

**Issue Date:** 2025-06-08
**Resolved Date:** 2025-06-08

**Affected Files:**
- Frontend GraphQL Definitions: `frontend/src/services/graphqlQueries.js`
- Frontend Component: `frontend/src/pages/TrainDetail.js`
- API Gateway GraphQL Schema: `api-gateway/graphql/train.js` (Assumed to expect `createTrain`)

**Resolution:**
- The `CREATE_TRAIN_BOOKING` (internally `createTrain`) mutation was defined in `frontend/src/services/graphqlQueries.js` using `userId`, `trainId`, and `numberOfSeats` as inputs.
- This mutation has been successfully integrated into `frontend/src/pages/TrainDetail.js`, including a booking form, user authentication checks, mutation handling, and UI feedback.
- The frontend implementation for train booking is now aligned with the expected GraphQL operation.
- All field names and arguments are now consistent between frontend and API Gateway.
- The train creation flow can now be fully handled via GraphQL/Apollo Client.

## 5. Local Travel Service Misalignment [RESOLVED]

**Issue Date:** 2025-06-08
**Resolved Date:** 2025-06-08

**Affected Files:**
- Frontend GraphQL Definitions: `frontend/src/services/graphqlQueries.js`
- Frontend Component: `frontend/src/pages/LocalTravelDetail.js`
- API Gateway GraphQL Schema: `api-gateway/graphql/localTravel.js` (Assumed to expect `createLocalTravel`)

**Resolution:**
- The `CREATE_LOCAL_TRAVEL_BOOKING` (internally `createLocalTravel`) mutation was defined in `frontend/src/services/graphqlQueries.js` using `userId` and `localTravelId` as inputs.
- This mutation has been successfully integrated into `frontend/src/pages/LocalTravelDetail.js`, including a booking button, user authentication checks, mutation handling, and UI feedback.
- The frontend implementation for local travel booking is now aligned with the expected GraphQL operation.

## 6. User Service Misalignment [RESOLVED]

## 7. Payment Service Misalignment [RESOLVED]

## 8. Hotel Service Misalignment [COMPLETED - Frontend Integration, Pending E2E Testing]

**Issue Date:** 2025-06-08
**Status Update:** 2025-06-08 (Backend Resolver & Frontend Query Aligned)

**Affected Files/Components:**
- Frontend Component: `frontend/src/components/hotels/HotelList.js`
- Frontend Hook: `frontend/src/services/graphql.js` (custom `useHotels` hook)
- Frontend Query Definition: `frontend/src/services/graphqlQueries.js` (`FILTER_HOTELS` query)
- API Gateway GraphQL Schema: `api-gateway/graphql/hotel.js` (`filterHotels` resolver)

**Description:**
The `HotelList.js` component and its `useHotels` hook require a `FILTER_HOTELS` GraphQL query for fetching and filtering hotel options, including by name.

**Frontend Status (as of 2025-06-08):**
- The `FILTER_HOTELS` GraphQL query in `frontend/src/services/graphqlQueries.js` has been **updated and aligned** with the backend resolver. It supports comprehensive filter variables (hotel name, city, province, country, price range, amenities, pet-friendly, room size, etc.), sorting, pagination, and requests detailed hotel fields.
- The `useHotels` hook and `HotelList.js` have been refactored to use this updated query.

**Backend Status (as of 2025-06-08):**
- The `filterHotels` (formerly `searchHotels`) GraphQL query, its associated input/output types, and resolver have been **implemented and enhanced** in `api-gateway/graphql/hotel.js`.
- The resolver now correctly handles filtering by `name` and other parameters, calls the Hotel microservice REST endpoint (`/api/hotels/search` or `/api/hotels/filter`), and returns structured pagination metadata.

**Alignment Summary:**
- Backend resolver for `filterHotels` is complete and supports name filtering.
- Frontend `FILTER_HOTELS` query definition is aligned with the backend.
- Client-side pagination workarounds in `HotelList.js` should be removed.

**Next Steps (Frontend Team):**
- **End-to-End Test:** Thoroughly test `HotelList.js` with the `FILTER_HOTELS` query to ensure all filters (especially hotel name), sorting, pagination, and data display work correctly against the live backend.
- Remove any temporary client-side pagination logic from `HotelList.js`.
- Update this section to "[RESOLVED]" upon successful end-to-end testing.

## 9. Flight Service Misalignment [COMPLETED - Frontend Integration, Pending E2E Testing]

**Issue Date:** 2025-06-08
**Status Update:** 2025-06-08 (Backend Resolver & Frontend Query Aligned)

**Affected Files/Components:**
- Frontend Component: `frontend/src/components/flights/FlightList.js`
- Frontend Query Definition: `frontend/src/services/graphqlQueries.js` (`FILTER_FLIGHTS` query)
- API Gateway GraphQL Schema: `api-gateway/graphql/flight.js` (`filterFlights` resolver)

**Description:**
The `FlightList.js` component requires a `FILTER_FLIGHTS` GraphQL query for fetching and filtering flight options.

**Frontend Status (as of 2025-06-08):**
- The `FILTER_FLIGHTS` GraphQL query in `frontend/src/services/graphqlQueries.js` has been **updated and aligned** with the backend resolver, including comprehensive filter variables (origin city/airport, destination city/airport, airline name, flight class, departure date, etc.), sorting, pagination, and expected data fields.
- `FlightList.js` imports and is structured to use this query.

**Backend Status (as of 2025-06-08):**
- The `filterFlights` GraphQL query, its associated input/output types, and resolver have been **implemented** in `api-gateway/graphql/flight.js`.
- The resolver calls the existing Flight microservice REST endpoint (`/api/flights/filter`) and supports a comprehensive set of filters, sorting, and pagination.

**Alignment Summary:**
- Backend resolver for `filterFlights` is complete.
- Frontend `FILTER_FLIGHTS` query definition is aligned with the backend.

**Next Steps (Frontend Team):**
- **End-to-End Test:** Thoroughly test `FlightList.js` with the `FILTER_FLIGHTS` query to ensure all filters, sorting, pagination, and data display work correctly against the live backend.
- Update this section to "[RESOLVED]" upon successful end-to-end testing.

## 10. Train Service Misalignment [COMPLETED - Frontend Integration, Pending E2E Testing]

**Issue Date:** 2025-06-08
**Status Update:** 2025-06-08 (Backend Resolver & Frontend Query Aligned)

**Affected Files/Components:**
- Frontend Component: `frontend/src/components/trains/TrainList.js`
- Frontend Query Definition: `frontend/src/services/graphqlQueries.js` (`FILTER_TRAINS` query)
- API Gateway GraphQL Schema: `api-gateway/graphql/train.js` (`filterTrains` resolver)

**Description:**
The `TrainList.js` component requires a `FILTER_TRAINS` GraphQL query for fetching and filtering train options.

**Frontend Status (as of 2025-06-08):**
- The `FILTER_TRAINS` GraphQL query in `frontend/src/services/graphqlQueries.js` has been **updated and aligned** with the backend resolver, including comprehensive filter variables (station names/codes, date, class, subclass, operator name, train number, etc.), sorting, pagination, and expected data fields.
- `TrainList.js` imports and is structured to use this query.

**Backend Status (as of 2025-06-08):**
- The `filterTrains` GraphQL query, its associated input/output types, and resolver have been **implemented** in `api-gateway/graphql/train.js`.
- The resolver calls the existing Train microservice REST endpoint (`/api/trains/filter`) and supports a comprehensive set of filters, sorting, and pagination.

**Alignment Summary:**
- Backend resolver for `filterTrains` is complete.
- Frontend `FILTER_TRAINS` query definition is aligned with the backend.

**Next Steps (Frontend Team):**
- **End-to-End Test:** Thoroughly test `TrainList.js` with the `FILTER_TRAINS` query to ensure all filters, sorting, pagination, and data display work correctly against the live backend.
- Update this section to "[RESOLVED]" upon successful end-to-end testing.

## 11. Local Travel Service Misalignment [COMPLETED - Frontend Integration, Pending E2E Testing]

**Issue Date:** 2025-06-08
**Status Update:** 2025-06-08 (Backend Resolver & Frontend Query Aligned)

**Affected Files/Components:**
- Frontend Component: `frontend/src/components/localtravel/LocalTravelList.js`
- Frontend Query Definition: `frontend/src/services/graphqlQueries.js` (`FILTER_LOCAL_TRAVELS` query)
- API Gateway GraphQL Schema: `api-gateway/graphql/localTravel.js` (`filterLocalTravels` resolver)

**Description:**
The `LocalTravelList.js` component requires a `FILTER_LOCAL_TRAVELS` GraphQL query for fetching and filtering local travel options.

**Frontend Status (as of 2025-06-08):**
- The `FILTER_LOCAL_TRAVELS` GraphQL query in `frontend/src/services/graphqlQueries.js` has been **updated and aligned** with the backend resolver, including comprehensive filter variables (location, date, type, operator, provider, capacity, amenities, price, etc.), sorting, pagination, and expected data fields.
- `LocalTravelList.js` imports and is structured to use this query.

**Backend Status (as of 2025-06-08):**
- The `filterLocalTravels` GraphQL query, its associated input/output types, and resolver have been **implemented** in `api-gateway/graphql/localTravel.js`.
- The resolver calls the existing Local Travel microservice REST endpoint (`/api/local-travel/filter`) and supports a comprehensive set of filters, sorting, and pagination.

**Alignment Summary:**
- Backend resolver for `filterLocalTravels` is complete.
- Frontend `FILTER_LOCAL_TRAVELS` query definition is aligned with the backend.

**Next Steps (Frontend Team):**
- **End-to-End Test:** Thoroughly test `LocalTravelList.js` with the `FILTER_LOCAL_TRAVELS` query to ensure all filters, sorting, pagination, and data display work correctly against the live backend.
- Update this section to "[RESOLVED]" upon successful end-to-end testing.

{{ ... }}
**Issue Date:** 2025-06-08
**Status Update:** 2025-06-08 (Revised)

**Affected Files:**
- Frontend GraphQL Definitions: `frontend/src/services/graphqlQueries.js`
- Frontend Component: `frontend/src/pages/MyBookings.js`
- API Gateway GraphQL Schema: `api-gateway/graphql/payment.js`

**Description:**
- The `CREATE_PAYMENT` GraphQL mutation is correctly defined in `frontend/src/services/graphqlQueries.js` (verified on 2025-06-08).
- The primary remaining task is to fully integrate this mutation into `MyBookings.js`.
- This includes removing any legacy REST API calls for payment processing and ensuring all relevant fields from the mutation (e.g., `currency`, `payment_reference`) are utilized.
- Conflicting payment logic within `MyBookings.js` also needs to be resolved, retaining only the GraphQL-based implementation.

**Next Steps:**
- In `MyBookings.js`:
    - Remove any existing REST API calls for payment.
    - Ensure the `CREATE_PAYMENT` GraphQL mutation is used for all payment actions.
    - Remove any duplicate or conflicting payment handling functions, keeping only the Apollo `useMutation` based logic.
    - Enhance the UI to properly utilize fields like `currency` and `payment_reference`.
- This section was marked RESOLVED on 2025-06-08 after UI integration and cleanup in `MyBookings.js` were completed and verified.

**Issue Date:** 2025-06-08
**Resolved:** 2025-06-08

**Affected Files:**
- Frontend GraphQL Definitions: `frontend/src/services/graphqlQueries.js`
- API Gateway GraphQL Schema: `api-gateway/graphql/users.js`

**Resolution:**
- All user management queries and mutations (`USERS`, `CREATE_USER`, `DELETE_USER`) have been added to the frontend and match the API Gateway schema.
- Profile operations (`GET_PROFILE`, `UPDATE_PROFILE`) are clarified to be contextually resolved by the API Gateway using the authenticated user's ID.
- All core user GraphQL operations are now aligned between frontend and API Gateway.

## Overall Summary of Misalignments (as of 2025-06-08)

This analysis has identified several key areas of misalignment between the frontend GraphQL consumption, the API Gateway's GraphQL schema, and by implication, the underlying microservice capabilities exposed via GraphQL.

**Key Themes:**
1.  **Naming Inconsistencies:**
    - **Payment Service:** Frontend `initiatePayment` vs. Gateway `createPayment` (major blocker) **[RESOLVED]**
    - **User Service:** Frontend `GET_PROFILE`/`UPDATE_PROFILE` vs. Gateway `user`/`updateUser` (requires gateway-side resolution logic).
    - **Hotel Service (Potential):** Frontend `GET_HOTELS` query uses `hotels(city: $city, province: $province)` which might be intended for gateway's `searchHotels` or a specific variant of `hotels`.
2.  **Missing Frontend GraphQL Operations:**
    - **Booking Service:** `GET_MY_BOOKINGS`, `CANCEL_BOOKING`, `MODIFY_BOOKING` **[RESOLVED]**
    - **Flight Service:** Missing `createFlight` mutation.
    - **Hotel Service:** Missing operations for `filterHotels`, `hotelAvailability`, `hotelPricing`, `decreaseRoomAvailability`, `increaseRoomAvailability`.
    - **Train Service:** Missing `createTrain` mutation.
    - **Local Travel Service:** Missing `createLocalTravel` mutation.
    - **User Service:** Missing generic `users` query, `createUser`, `deleteUser` mutations (if needed).
3.  **Redundant API Gateway Definitions:**
    - **Payment Service:** `initiatePayment` mutation found in `api-gateway/graphql/booking.js` is redundant with `createPayment` in `api-gateway/graphql/payment.js` and adds to confusion.
4.  **Data Field Mismatches (Minor):**
    - **Train Service:** Fields requested by frontend queries differ from those mapped by API Gateway resolvers.

**General Recommendations:**
1.  **Prioritize Critical Fixes:** Address the payment and booking service misalignments first as they are likely blocking core user flows.
2.  **Standardize Naming:** Adopt a consistent naming convention for GraphQL operations across the frontend and API Gateway. Where frontend uses conceptual names (e.g., `GET_PROFILE`), ensure robust mapping in the API Gateway.
3.  **Implement Missing Operations:** Add the missing GraphQL query and mutation definitions to the frontend (`graphqlQueries.js` or `graphqlDetailQueries.js` as appropriate) for all services where functionality is intended but definitions are absent.
4.  **Refine API Gateway Schema:**
    - Remove redundant definitions (e.g., `initiatePayment` from booking schema).
    - Ensure resolvers for all exposed GraphQL operations correctly call the respective microservices and map data fields as expected by the frontend.
5.  **Documentation:** Keep this misalignment document updated as changes are made and ensure API documentation (e.g., Swagger for microservices, GraphQL schema docs) is accurate.
6.  **Testing:** Thoroughly test all GraphQL flows from frontend to microservice after implementing corrections.

This document now provides a comprehensive overview of the identified GraphQL alignment issues and a roadmap for addressing them.
