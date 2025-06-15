# Hotel Service End-to-End GraphQL Test Cases

This document outlines E2E test cases for the Hotel GraphQL API.

## Variables

Commonly used variables for testing:

*   `testHotelId`: An existing hotel ID (e.g., `"clxyz12340000abcdefghij"`)
*   `testCityId`: An existing city ID (e.g., `1`)
*   `testDate`: A valid date string for querying daily status (e.g., `"2025-07-15"`)
*   `testRoomTypeName`: An existing room type name for a hotel (e.g., `"Deluxe Room"`)

---

## 1. Filter Hotels

**Objective:** Test the `filterHotels` query with various filters, pagination, and sorting.

**GraphQL Query:**

```graphql
query FilterHotels(
  $filters: HotelFiltersInput,
  $pagination: PaginationInput,
  $sort: SortInput
) {
  filterHotels(filters: $filters, pagination: $pagination, sort: $sort) {
    hotels {
      id
      name
      address
      cityId
      latitude
      longitude
      stars
      description
      checkInTime
      checkOutTime
      contactEmail
      contactPhone
      website
      createdAt
      updatedAt
      # Note: Dynamic data like price/availability per room type is fetched via hotelDailyStatus
    }
    totalItems
    totalPages
    page
    limit
  }
}
```

**Example Variables:**

*   **Scenario 1.1: Basic filter by city and stars, with pagination**

    ```json
    {
      "filters": {
        "cityId": 1, // Replace with a valid city ID
        "stars": 4
      },
      "pagination": {
        "page": 1,
        "limit": 10
      },
      "sort": {
        "sortBy": "name",
        "sortDirection": "ASC"
      }
    }
    ```

*   **Scenario 1.2: Filter by name (partial match)**

    ```json
    {
      "filters": {
        "name": "Grand"
      },
      "pagination": {
        "page": 1,
        "limit": 5
      }
    }
    ```

**Expected Response Structure (Partial):**

```json
{
  "data": {
    "filterHotels": {
      "hotels": [
        {
          "id": "cl...",
          "name": "Example Hotel Name",
          "address": "123 Main St",
          "cityId": 1,
          "stars": 4,
          // ... other static fields
        }
        // ... more hotels
      ],
      "totalItems": 25,
      "totalPages": 3,
      "page": 1,
      "limit": 10
    }
  }
}
```

**Assertions:**

*   Response matches the expected structure.
*   `totalItems`, `totalPages`, `page`, `limit` are correct based on the input and data.
*   Returned hotels match the filter criteria.
*   Sorting is applied correctly.

---

## 2. Get Hotel Details

**Objective:** Test fetching details for a specific hotel.

**GraphQL Query:**

```graphql
query GetHotelDetail($hotelId: ID!) {
  hotel(id: $hotelId) {
    id
    name
    address
    cityId
    latitude
    longitude
    stars
    description
    checkInTime
    checkOutTime
    contactEmail
    contactPhone
    website
    createdAt
    updatedAt
    # To get room types and their availability/pricing for a specific date,
    # use the hotelDailyStatus query (see Test Case 3).
  }
}
```

**Example Variables:**

```json
{
  "hotelId": "clxyz12340000abcdefghij" // Replace with a valid hotel ID
}
```

**Expected Response Structure (Partial):**

```json
{
  "data": {
    "hotel": {
      "id": "clxyz12340000abcdefghij",
      "name": "Specific Hotel Name",
      "address": "456 Oak Ave",
      "stars": 5,
      // ... other static fields
    }
  }
}
```

**Assertions:**

*   Response matches the expected structure.
*   The correct hotel details are returned for the given `hotelId`.
*   If `hotelId` is invalid or not found, an appropriate error or null response is returned.

---

## 3. Get Hotel Daily Status (Room Availability & Pricing)

**Objective:** Test fetching room-specific availability and pricing for a hotel on a given date.

**GraphQL Query:**

```graphql
query GetHotelDailyStatus($hotelId: ID!, $date: String!, $roomTypeName: String) {
  hotelDailyStatus(hotelId: $hotelId, date: $date, roomTypeName: $roomTypeName) {
    hotelId
    date
    roomTypeName
    roomsAvailable
    price
    currency
    # Potentially other fields like restrictions, lastUpdated, etc.
  }
}
```

**Example Variables:**

*   **Scenario 3.1: Get status for all room types for a hotel on a specific date**

    ```json
    {
      "hotelId": "clxyz12340000abcdefghij", // Replace with a valid hotel ID
      "date": "2025-08-01" // Replace with a valid date
    }
    ```
    *Expected: An array of `HotelDailyStatus` objects, one for each room type available on that date.*

*   **Scenario 3.2: Get status for a specific room type for a hotel on a specific date**

    ```json
    {
      "hotelId": "clxyz12340000abcdefghij", // Replace with a valid hotel ID
      "date": "2025-08-01", // Replace with a valid date
      "roomTypeName": "Deluxe Room" // Replace with a valid room type name for the hotel
    }
    ```
    *Expected: A single `HotelDailyStatus` object or an array with one item.*


**Expected Response Structure (Partial, for Scenario 3.2):**

```json
{
  "data": {
    "hotelDailyStatus": [
      {
        "hotelId": "clxyz12340000abcdefghij",
        "date": "2025-08-01",
        "roomTypeName": "Deluxe Room",
        "roomsAvailable": 10,
        "price": 150.00,
        "currency": "USD"
      }
    ]
  }
}
```

**Note:** The `hotelDailyStatus` query might return a single object or an array of objects depending on whether `roomTypeName` is provided and how the resolver is implemented. The example above assumes it returns an array even for a specific room type for consistency if `roomTypeName` was optional and could return multiple if not specified.

**Assertions:**

*   Response matches the expected structure.
*   Correct availability, price, and currency are returned for the given `hotelId`, `date`, and (if provided) `roomTypeName`.
*   If no data is available for the given criteria, an empty array or appropriate null/error response is returned.
*   Data reflects the actual status in the `HotelDailyStatus` table.

---

## 4. Create Hotel (Illustrative - Requires Mutation)

**Objective:** Test creating a new hotel (this is a mutation, not a query).

**GraphQL Mutation:**

```graphql
mutation CreateHotel($input: CreateHotelInput!) {
  createHotel(input: $input) {
    id
    name
    address
    cityId
    stars
    # ... other fields returned upon creation
  }
}
```

**Example Variables:**

```json
{
  "input": {
    "name": "New Test Hotel",
    "address": "789 Pine St",
    "cityId": 2, // Replace with a valid city ID
    "latitude": 34.0522,
    "longitude": -118.2437,
    "stars": 3,
    "description": "A brand new hotel for testing purposes.",
    "checkInTime": "15:00",
    "checkOutTime": "11:00",
    "contactEmail": "contact@newtesthotel.com",
    "contactPhone": "555-0102",
    "website": "http://newtesthotel.com"
  }
}
```

**Expected Response Structure (Partial):**

```json
{
  "data": {
    "createHotel": {
      "id": "clnewhotelid0000zzzyyyxxx",
      "name": "New Test Hotel",
      "address": "789 Pine St",
      "cityId": 2,
      "stars": 3
    }
  }
}
```

**Assertions:**

*   Hotel is successfully created in the database.
*   The response contains the details of the newly created hotel, including its ID.
*   Appropriate error messages are returned for invalid input (e.g., missing required fields, incorrect data types).

---

This document should be expanded with more specific scenarios, edge cases, and error condition testing for each query/mutation. Remember to replace placeholder values with actual valid (and invalid, for error testing) data from your test environment.
