# Frontend GraphQL Alignment Review

Date: 2025-06-08

## 1. Introduction

This document provides a comprehensive review of the alignment between the frontend UI components and the defined GraphQL queries and mutations for all major services in the travel agency system: Payment, Flight, Hotel, Local Travel, Train, and MyBookings. It includes technical observations, misalignments, improvement recommendations, and a prioritized action plan.

---

## 2. Payment Feature (`MyBookings.js`)

### 2.1. GraphQL Mutation Definition

The `CREATE_PAYMENT` mutation is correctly defined and supports key payment details:

```graphql
mutation CreatePayment(
  $userId: ID!,
  $bookingId: ID!,
  $amount: Float!,
  $currency: String, 
  $payment_method_type: String, 
  $payment_reference: String
) {
  createPayment(
    userId: $userId, 
    bookingId: $bookingId, 
    amount: $amount, 
    currency: $currency, 
    payment_method_type: $payment_method_type, 
    payment_reference: $payment_reference
  ) {
    id
    user_id
    booking_id
    amount
    currency
    payment_method_type
    payment_reference
    status
    created_at
    updated_at
  }
}
```

### 2.2. Frontend Implementation Analysis

- `MyBookings.js` uses the `CREATE_PAYMENT` mutation via Apollo `useMutation`.
- There are two conflicting sets of payment logic; only the GraphQL-aligned version should remain.
- The mutation call does not fully utilize `currency` and `payment_reference` fields.
- The payment method input is a free-text field; should use a dropdown/select.

### 2.3. Recommendations
- Remove legacy/conflicting payment code.
- Use a dropdown for payment method selection.
- Pass valid values for `currency` (default or from booking) and `payment_reference` (optional field for user input).
- Clarify if payment amount should be editable or fixed.
- Improve error handling and loading states.

---

## 3. Flight Service

### 3.1. Observations
- `FlightList.js` provides UI filters for airline, min/max price, and date, but the `GET_FLIGHTS` query only accepts origin, destination, and date.
- No booking workflow or use of the `BOOK_FLIGHT` mutation in the UI.
- Date filtering could be improved with a date picker.

### 3.2. Recommendations
- Extend backend and frontend to support additional filters in `GET_FLIGHTS`.
- Implement the `BOOK_FLIGHT` mutation and booking workflow in the UI.
- Enhance date input controls.

---

## 4. Hotel Service

### 4.1. Observations & Status
- 🚧 `HotelList.js` now uses the `FILTER_HOTELS` query, improving filter alignment (city, property_type). (Backend support for hotel `name` filter and pagination data in `FILTER_HOTELS` response is still pending).
- ✅ The `useHotels` hook has been refactored to use `FILTER_HOTELS`.
- ✅ **Booking Workflow:** A `CREATE_HOTEL_BOOKING` mutation has been defined and integrated into `HotelDetail.js`, enabling users to select rooms, dates, guests, and complete bookings.
- ✅ Room availability and pricing are displayed in `HotelDetail.js` from `GET_HOTEL_DETAIL` query.

### 4.2. Recommendations
- Switch to using the `FILTER_HOTELS` query for hotel listing and filtering.
- Implement date selection, availability, and pricing display in the hotel detail view.
- Define and integrate a `BOOK_HOTEL` mutation and booking workflow.
- Refactor the `useHotels` hook to use `FILTER_HOTELS` and accept filter parameters.

---

## 5. Local Travel Service

### 5.1. Observations
- `LocalTravelList.js` includes filters and sorting, but the `GET_LOCAL_TRAVEL` query only supports origin, destination, and date.
- Pagination and sorting variables are attempted in the frontend but not supported by the backend query.
- The booking button is present but not functional; no `BOOK_LOCAL_TRAVEL` mutation exists.

### 5.2. Recommendations
- Enhance `GET_LOCAL_TRAVEL` to support pagination and sorting.
- Implement `BOOK_LOCAL_TRAVEL` mutation and frontend workflow.

---

## 6. Train Service

### 6.1. Observations & Status
- 🚧 `TrainList.js` has been refactored to use the `FILTER_TRAINS` query, significantly improving filter alignment. Pagination (MUI) has been integrated. (Backend support for all UI filters, sorting, and comprehensive data like price/schedule in `FILTER_TRAINS` is still a dependency).
- ❌ The booking button is present but not functional; no `BOOK_TRAIN` mutation exists.

### 6.2. Recommendations
- Major backend and frontend update to support all UI filters in `GET_TRAINS`.
- Add pagination, sorting, and all necessary data fields (price, schedule) to the query.
- Implement `BOOK_TRAIN` mutation and frontend workflow.

---

## 7. MyBookings Page

### 7.1. Observations & Status
- ✅ **Status: Resolved.**
  - `MyBookings.js` now correctly passes `userId` (from `AuthContext`) to the `GET_MY_BOOKINGS` query.
  - The UI now displays booking item details (type, ref_id, date, details), booking status, and creation date.
  - Conflicting/duplicate code has been removed.
  - `CANCEL_BOOKING` and `MODIFY_BOOKING` mutations are called with correct variable names.
  - The necessary GraphQL operations (`GET_MY_BOOKINGS`, `CANCEL_BOOKING`, `MODIFY_BOOKING`, `CREATE_PAYMENT`) have been verified as correctly defined in `graphqlQueries.js`.

### 7.2. Recommendations
- Pass `userId` to `GET_MY_BOOKINGS`.
- Display booking item details (type, ref_id, details) for each booking.
- Remove duplicate/conflicting code and use correct variable names in mutations.

---

## 8. Custom Hooks (`useHotels`)

### 8.1. Observations & Progress
- ✅ **Status: Resolved.**
  - The `useHotels` hook in `services/graphql.js` has been refactored to use the `FILTER_HOTELS` query and accepts filter parameters, aligning it with the needs of `HotelList.js`.

### 8.2. Recommendations
- Refactor `useHotels` to use `FILTER_HOTELS` and accept filter parameters.

---

## 9. Overall Summary & Prioritized Action Plan

### 9.1. Key Issues
- Missing booking mutations and workflows for all services except payment.
- Query/filter mismatches in all listing components.
- Pagination, sorting, and essential data fields missing from several queries.
- Legacy/conflicting code, especially in `MyBookings.js`.
- `MyBookings.js` missing `userId` and not displaying booking item details.

### 9.2. Next Steps (Prioritized)

1. **Implement Core Booking Functionality (CRITICAL):**
   - ✅ **`BOOK_HOTEL`:** (Mutation `CREATE_HOTEL_BOOKING` defined and integrated into `HotelDetail.js`).
   - ✅ **`BOOK_FLIGHT` (as `createFlight`):** Mutation defined in `graphqlQueries.js` and integrated into `FlightDetail.js`.
   - ✅ **`BOOK_LOCAL_TRAVEL` (as `createLocalTravel`):** Mutation defined in `graphqlQueries.js` and integrated into `LocalTravelDetail.js`.
   - ✅ **`BOOK_TRAIN` (as `createTrain`):** Mutation defined in `graphqlQueries.js` and integrated into `TrainDetail.js`.
2. **Address Query-Filter Mismatches (HIGH PRIORITY):**
   - 🚧 **`HotelList.js`:** (Uses `FILTER_HOTELS`; some backend filter enhancements still needed).
   - 🚧 **`TrainList.js`:** (Uses `FILTER_TRAINS`; backend filter/data enhancements still needed).
   - Enhance other queries and resolvers to accept all UI filters; update frontend components to pass them.
3. **Fix MyBookings Page (HIGH PRIORITY):**
   - ✅ **Status: DONE.** (Passed `userId`, displays item details, conflicts resolved).
4. **Enhance Queries (MEDIUM PRIORITY):**
   - 🚧 **Hotels (`FILTER_HOTELS`):**
     - **Frontend Status:** `HotelList.js` and `useHotels` hook correctly use `FILTER_HOTELS`. UI for name, city, property type filters exists. Client-side pagination is a temporary workaround.
     - **Backend Dependencies (Blocking full frontend functionality):**
       - `FILTER_HOTELS` query needs to support filtering by hotel `name`.
       - `FILTER_HOTELS` query response must include pagination metadata (e.g., `total_items`, `total_pages`).
       - `FILTER_HOTELS` query response should include `image_url`, `description`, and `facilities` for richer display.
     - See `graphql_misalignment.md` (Section 8) for detailed requirements for the backend team.
   - 🚧 **Flights (`FILTER_FLIGHTS`):**
     - **Frontend Status:** `FILTER_FLIGHTS` is now defined in `frontend/src/services/graphqlQueries.js`. `FlightList.js` is built to use this query. UI for filters (origin, destination, airline, price, date) and pagination exists.
     - **Backend Dependencies (Blocking full frontend functionality):**
       - The `filterFlights` resolver and schema need to be implemented on the backend.
       - This query must support filters: `origin`, `destination`, `airline`, `min_price`, `max_price`, `date`.
       - It must support pagination: `page`, `limit`.
       - It must return a `filterFlights` field containing `flights` (array) and `pagination` (object with `total_pages`, `current_page`, `limit`, `total_items`).
     - **Frontend Dependencies (Post-Backend Implementation & Verification):**
       - Verify seamless integration and functionality in `FlightList.js` with the backend resolver.
       - Ensure all UI filter controls correctly interact with the query variables.
     - See `graphql_misalignment.md` (Section 9) for detailed backend requirements.
   - 🚧 **Trains (`FILTER_TRAINS`):**
     - **Frontend Status:** `FILTER_TRAINS` is now defined in `frontend/src/services/graphqlQueries.js`. `TrainList.js` is built to use this query. UI for many filters (station names, date, class, price, operator, sorting, province/city, etc.) and pagination exists. A comment in `TrainList.js` notes several UI filters that will require backend support.
     - **Backend Dependencies (Blocking full frontend functionality):**
       - The `filterTrains` resolver and schema need to be implemented on the backend.
       - This query must support filters for: `origin_station_name`, `destination_station_name`, `departure_date`, `train_class`, `min_price`, `max_price`, `operator`, `sort_by`, `sort_order`. Support for `origin_province`, `destination_province`, `origin_city`, `destination_city`, `subclass`, `train_type`, `price_category` would be ideal enhancements.
       - It must support pagination: `page`, `limit`.
       - It must return a `filterTrains` field containing `trains` (array) and `pagination` (object with `total_pages`, `current_page`, `limit`, `total_items`).
     - **Frontend Dependencies (Post-Backend Implementation & Verification):**
       - Align active filters in `TrainList.js` with actual backend support.
       - Verify seamless integration and functionality in `TrainList.js`.
     - See `graphql_misalignment.md` (Section 10) for detailed backend requirements.
   - 🚧 **Local Travel (`FILTER_LOCAL_TRAVELS`):**
     - **Frontend Status:** `FILTER_LOCAL_TRAVELS` is now defined in `frontend/src/services/graphqlQueries.js`. `LocalTravelList.js` is built to use this query. UI for filters (origin, destination, date, type, price range) and pagination exists.
     - **Backend Dependencies (Blocking full frontend functionality):**
       - The `filterLocalTravels` resolver and schema need to be implemented on the backend.
       - This new query must support filters: `origin`, `destination`, `date`, `type`, `min_price`, `max_price`.
       - It must support pagination: `page`, `limit`, and ideally sorting options.
       - It must return a `filterLocalTravels` field containing `localTravels` (array) and `pagination` (object with `total_pages`, `current_page`, `limit`, `total_items`).
     - **Frontend Dependencies (Post-Backend Implementation & Verification):**
       - Verify seamless integration and functionality in `LocalTravelList.js`.
       - Align UI filters with actual backend support.
     - See `graphql_misalignment.md` (Section 11) for detailed backend requirements.
   - **Summary of Query Enhancement Needs:** All primary listing components (`HotelList`, `FlightList`, `TrainList`, `LocalTravelList`) now have their respective filter queries (`FILTER_HOTELS`, `FILTER_FLIGHTS`, `FILTER_TRAINS`, `FILTER_LOCAL_TRAVELS`) defined on the frontend. The critical next step is for the backend team to implement or enhance the corresponding resolvers to support all specified filters, pagination, sorting, and return all necessary data fields as detailed in `graphql_misalignment.md`. This backend work is the primary blocker for achieving full frontend functionality in these list pages.
5. **Refine Payment Integration in `MyBookings.js` (HIGH PRIORITY):**
   - ✅ **`CREATE_PAYMENT` Mutation:** Verified as correctly defined in `frontend/src/services/graphqlQueries.js`.
   - ✅ **Integrate Mutation:** `CREATE_PAYMENT` is exclusively used in `MyBookings.js`. Legacy REST API calls and conflicting payment logic have been verified as removed.
   - ✅ **Utilize Fields:** Payment mutation fields (`currency`, `payment_reference`) are utilized.
   - ✅ **Improve UI:** Payment UI has been enhanced (dropdown for payment method, reference field).
   - ✅ **Status: DONE.** (Completed 2025-06-08)
6. **Code Cleanup (MEDIUM PRIORITY):**
   - Remove legacy code and ensure consistency across all components.

### 9.3. Documentation
- **Recommendation:** Rename this file to `frontend_graphql_alignment_review.md` or similar to reflect its comprehensive scope.

---

## 10. Conclusion

This audit provides a clear roadmap for achieving robust alignment between the frontend and GraphQL backend. By systematically addressing the outlined issues and following the prioritized plan, the frontend will become fully integrated, user-friendly, and maintainable.

## 2. GraphQL Query Definition (`services/graphqlQueries.js`)

The `CREATE_PAYMENT` mutation is correctly defined and supports key payment details:

```graphql
mutation CreatePayment(
  $userId: ID!,
  $bookingId: ID!,
  $amount: Float!,
  $currency: String, 
  $payment_method_type: String, 
  $payment_reference: String
) {
  createPayment(
    userId: $userId, 
    bookingId: $bookingId, 
    amount: $amount, 
    currency: $currency, 
    payment_method_type: $payment_method_type, 
    payment_reference: $payment_reference
  ) {
    id
    user_id
    booking_id
    amount
    currency
    payment_method_type
    payment_reference
    status
    created_at
    updated_at
  }
}
```

This definition allows for specifying currency, payment method type, and a payment reference.

## 3. Frontend Implementation Analysis (`src/pages/MyBookings.js`)

`MyBookings.js` imports and utilizes the `CREATE_PAYMENT` mutation via the `useMutation` hook. The primary payment logic appears in a `handlePay` function.

## 4. Misalignments, Issues, and Recommendations

### 4.1. Duplicate/Conflicting Payment Logic

*   **Issue:** `MyBookings.js` contains two distinct sets of `handleOpenPay` and `handlePay` functions. 
    *   The first set (around lines 35-60 in the viewed snippet) correctly uses the `createPayment` GraphQL mutation.
    *   The second set (around lines 168-198) appears to use different logic (e.g., mentioning `initiatePayment`, which is not defined in `graphqlQueries.js`) and might be outdated code from before or during the GraphQL migration.
*   **Recommendation:** 
    *   **CRITICAL:** Remove the second, conflicting set of payment functions (the one referencing `initiatePayment`). 
    *   Ensure only the GraphQL-aligned `handlePay` function (using `createPayment` mutation) is active.

### 4.2. GraphQL Mutation Field Utilization

*   **`currency` Field:**
    *   **Issue:** The `currency` argument in the `createPayment` mutation call is hardcoded to `undefined`.
    *   **Recommendation:**
        *   If the application supports multiple currencies, add a UI element (e.g., a read-only field displaying currency from booking, or a `Select` if changeable) to manage this. The value should be sourced from booking data or user selection.
        *   If only a single currency is supported (e.g., IDR), pass this as the default value instead of `undefined`.

*   **`payment_reference` Field:**
    *   **Issue:** The `payment_reference` argument is hardcoded to `undefined`.
    *   **Recommendation:** If providing a payment reference is a useful feature (e.g., for manual bank transfers, order notes), add an optional `TextField` in the payment dialog to capture this information.

*   **`payment_method_type` Input:**
    *   **Issue:** The `payment_method_type` (`payMethod` state) is captured using a `TextField`. This allows free-form input, which is error-prone.
    *   **Recommendation:** Replace the `TextField` with an MUI `Select` component. Populate this dropdown with a list of valid, backend-supported payment methods (e.g., 'Credit Card', 'Bank Transfer', 'E-Wallet'). This ensures data integrity.

*   **`payAmount` Editability:**
    *   **Issue:** The payment amount (`payAmount` state) is initialized from `booking.amount_due` but is editable in a `TextField`.
    *   **Recommendation:** Determine if users should be able to modify the payment amount. 
        *   If the amount should be fixed (based on `booking.amount_due`), display it as read-only text or disable the `TextField`.
        *   If partial payments are allowed, the current editable field is acceptable, but this functionality should be clearly intended.

*   **`userId` Dependency:**
    *   **Observation:** The `userId` is correctly sourced from `payBooking.user_id`. This depends on the `GET_MY_BOOKINGS` query consistently returning `user_id` within each booking object. This appears to be the case based on `graphqlQueries.js`.
    *   **Recommendation:** Ensure robust error handling in case `payBooking` or `payBooking.user_id` is unexpectedly `null` or `undefined` when the payment dialog is opened.

## 5. General UI/UX Enhancements for Payment

*   **Specific Error Messages:** Enhance error feedback by displaying more specific messages from the GraphQL mutation's response, rather than just a generic 'Failed to make payment'.
*   **Confirmation Step:** Consider adding a payment summary and confirmation dialog before executing the `createPayment` mutation to allow users to review details.
*   **Loading States:** The `payLoading` state is used to disable the button, which is good. Ensure all interactive elements related to payment are appropriately managed during loading.

## 6. Conclusion

The frontend has made significant progress in migrating the payment functionality to GraphQL. The core `CREATE_PAYMENT` mutation is defined and used. The most critical issue is the presence of duplicate/conflicting payment logic in `MyBookings.js` which must be resolved. Further enhancements in utilizing all available mutation fields and improving the UI/UX for payment method selection and data display will lead to a more robust and user-friendly feature.
