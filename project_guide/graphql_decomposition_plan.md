# GraphQL Queries Decomposition Plan

This document outlines the plan to decompose the `frontend/src/services/graphqlQueries.js` file into smaller, feature-specific modules for better maintainability, readability, and organization.

## 1. Strategy: Group by Feature/Domain

We will create separate JavaScript files for queries and mutations related to each major feature or data domain in the application.

## 2. Proposed Directory Structure

A new subdirectory `graphql/` will be created within `frontend/src/services/`:

```
frontend/
└── src/
    └── services/
        ├── graphql/                 <-- New directory
        │   ├── auth.gql.js          // For LOGIN, REGISTER
        │   ├── user.gql.js          // For USERS, CREATE_USER, DELETE_USER
        │   ├── profile.gql.js       // For GET_PROFILE, UPDATE_PROFILE
        │   ├── payment.gql.js       // For CREATE_PAYMENT
        │   ├── booking.gql.js       // For GET_MY_BOOKINGS, CANCEL_BOOKING, MODIFY_BOOKING
        │   ├── flight.gql.js        // For all flight-related queries & mutations
        │   ├── hotel.gql.js         // For all hotel-related queries & mutations
        │   ├── train.gql.js         // For all train-related queries & mutations
        │   ├── localTravel.gql.js   // For all local travel-related queries & mutations
        │   └── index.js             // Optional & Recommended: to re-export all queries/mutations
        ├── graphql.js               // (Existing file with hooks like useHotels)
        └── graphqlQueries.js        // (The file to be decomposed)
```

## 3. Content Breakdown for New Files

Each constant from the current `graphqlQueries.js` will be moved to its respective new file:

*   **`auth.gql.js`**:
    *   `LOGIN`
    *   `REGISTER`
*   **`user.gql.js`**:
    *   `USERS`
    *   `CREATE_USER`
    *   `DELETE_USER`
*   **`profile.gql.js`**:
    *   `GET_PROFILE`
    *   `UPDATE_PROFILE`
*   **`payment.gql.js`**:
    *   `CREATE_PAYMENT`
*   **`booking.gql.js`**:
    *   `GET_MY_BOOKINGS`
    *   `CANCEL_BOOKING`
    *   `MODIFY_BOOKING`
*   **`flight.gql.js`**:
    *   `CREATE_FLIGHT`
    *   `GET_FLIGHTS`
    *   `FILTER_FLIGHTS`
    *   `CREATE_FLIGHT_BOOKING`
*   **`hotel.gql.js`**:
    *   `SEARCH_HOTELS`
    *   `GET_HOTELS`
    *   `FILTER_HOTELS`
    *   `HOTEL_AVAILABILITY`
    *   `HOTEL_PRICING`
    *   `DECREASE_ROOM_AVAILABILITY`
    *   `INCREASE_ROOM_AVAILABILITY`
    *   `CREATE_HOTEL_BOOKING`
*   **`train.gql.js`**:
    *   `FILTER_TRAINS`
    *   `CREATE_TRAIN_BOOKING`
    *   `CREATE_TRAIN`
    *   `GET_TRAINS`
*   **`localTravel.gql.js`**:
    *   `CREATE_LOCAL_TRAVEL_BOOKING`
    *   `FILTER_LOCAL_TRAVELS`
    *   `CREATE_LOCAL_TRAVEL`
    *   `GET_LOCAL_TRAVEL`

## 4. Refactoring Steps

1.  **Create the Directory:**
    Manually create the `frontend/src/services/graphql/` directory.

2.  **Create New Files:**
    Inside `frontend/src/services/graphql/`, create each of the `*.gql.js` files listed above (e.g., `auth.gql.js`, `hotel.gql.js`).

3.  **Move Definitions:**
    *   Add `import { gql } from '@apollo/client';` to the top of each new `*.gql.js` file.
    *   Cut the relevant GraphQL constant definitions from `graphqlQueries.js` and paste them into their corresponding new feature file.

4.  **Create an `index.js` Re-exporter (Recommended):**
    Create `frontend/src/services/graphql/index.js` with the following content to re-export all constants:
    ```javascript
    export * from './auth.gql.js';
    export * from './user.gql.js';
    export * from './profile.gql.js';
    export * from './payment.gql.js';
    export * from './booking.gql.js';
    export * from './flight.gql.js';
    export * from './hotel.gql.js';
    export * from './train.gql.js';
    export * from './localTravel.gql.js';
    ```

5.  **Update Import Paths:**
    Go through all project files (components, hooks, etc.) that import from `graphqlQueries.js` and update their import paths.
    *   **Before:** `import { LOGIN } from '../services/graphqlQueries';`
    *   **After (using `index.js`):** `import { LOGIN } from '../services/graphql';`

6.  **Test Thoroughly:**
    After refactoring, run the application and test all functionalities relying on these GraphQL operations.

7.  **Delete Old File:**
    Once confident that everything works correctly, delete the original `frontend/src/services/graphqlQueries.js` file.
