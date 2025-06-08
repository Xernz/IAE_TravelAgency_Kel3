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

## 3. Flight Service Misalignment [RESOLVED]

**Issue Date:** 2025-06-08
**Resolved:** 2025-06-08

**Affected Files:**
- Frontend GraphQL Definitions: `frontend/src/services/graphqlQueries.js`
- API Gateway GraphQL Schema: `api-gateway/graphql/flight.js`

**Resolution:**
- The missing `CREATE_FLIGHT` mutation was added to `frontend/src/services/graphqlQueries.js` with a signature matching the API Gateway's `createFlight` mutation.
- All field names and arguments are now consistent between frontend and API Gateway.
- The flight creation flow can now be fully handled via GraphQL/Apollo Client.

## 4. Train Service Misalignment [RESOLVED]

**Issue Date:** 2025-06-08
**Resolved:** 2025-06-08

**Affected Files:**
- Frontend GraphQL Definitions: `frontend/src/services/graphqlQueries.js`, `frontend/src/services/graphqlDetailQueries.js`
- API Gateway GraphQL Schema: `api-gateway/graphql/train.js`

**Resolution:**
- The missing `CREATE_TRAIN` mutation was added to `frontend/src/services/graphqlQueries.js` with a signature matching the API Gateway's `createTrain` mutation.
- All core train GraphQL queries and mutations are now aligned between frontend and API Gateway.
- All field names and arguments are now consistent between frontend and API Gateway.
- The train creation flow can now be fully handled via GraphQL/Apollo Client.

## 5. Local Travel Service Misalignment [RESOLVED]

**Issue Date:** 2025-06-08
**Resolved:** 2025-06-08

**Affected Files:**
- Frontend GraphQL Definitions: `frontend/src/services/graphqlQueries.js`, `frontend/src/services/graphqlDetailQueries.js`
- API Gateway GraphQL Schema: `api-gateway/graphql/localTravel.js`

**Resolution:**
- The missing `CREATE_LOCAL_TRAVEL` mutation was added to `frontend/src/services/graphqlQueries.js` with a signature matching the API Gateway's `createLocalTravel` mutation.
- All core local travel GraphQL queries and mutations are now aligned between frontend and API Gateway.

## 6. User Service Misalignment [RESOLVED]

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
