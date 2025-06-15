# End-to-End Booking Flow Test Cases

This document outlines E2E test cases for the complete booking flow across different services, from searching for a service to completing payment.

## Pre-requisites for all tests:

*   The system supports user registration and login via GraphQL mutations.
*   Necessary seed data exists (e.g., cities, airports, hotels, flights, payment methods for testing).
*   The `{{AUTH_TOKEN}}` variable will be populated by a successful login step and used in subsequent requests requiring authentication.

## Common Variables & Placeholders:

*   `{{NEW_USER_EMAIL}}`: e.g., `"testuser" + Date.now() + "@example.com"` (to ensure uniqueness)
*   `{{NEW_USER_PASSWORD}}`: e.g., `"Password123!"`
*   `{{AUTH_TOKEN}}`: Placeholder for the user's authentication token (obtained after login).
*   `{{USER_ID}}`: Placeholder for the logged-in user's ID (obtained after login).
*   `{{SELECTED_DATE}}`: e.g., `"2025-09-15"`
*   `{{PASSENGER_DETAILS}}`: Array of passenger/guest objects.
*   `{{PAYMENT_METHOD_ID}}`: ID for a test payment method.

---

## Test Scenario 0: User Authentication

**Objective:** Test user registration and login functionality.

### 0.1. User Registration
   - **Action:** A new user registers for an account.
   - **Mutation:** `registerUser` (Assumed mutation)
   - **Example Variables:**
     ```json
     {
       "input": {
         "email": "{{NEW_USER_EMAIL}}",
         "password": "{{NEW_USER_PASSWORD}}",
         "fullName": "Test User"
         // Add other required registration fields like phoneNumber, etc.
       }
     }
     ```
   - **Expected:** A success response, possibly returning basic user info (excluding sensitive data like password) or just a success message. The user account is created in the database.
   - **Assertions:**
     *   User is created successfully.
     *   Appropriate error messages for duplicate email or invalid input.

### 0.2. User Login
   - **Action:** An existing user logs in.
   - **Mutation:** `loginUser` (Assumed mutation)
   - **Example Variables (using credentials from successful registration or a known test user):
     ```json
     {
       "input": {
         "email": "{{NEW_USER_EMAIL}}", // or a known test user's email
         "password": "{{NEW_USER_PASSWORD}}" // or a known test user's password
       }
     }
     ```
   - **Expected:** A response containing an `authToken` and user details (like `userId`, `email`, `fullName`).
     ```json
     {
       "data": {
         "loginUser": {
           "authToken": "a.jwt.token.string",
           "user": {
             "id": "user_123xyz",
             "email": "{{NEW_USER_EMAIL}}",
             "fullName": "Test User"
           }
         }
       }
     }
     ```
   - **Assertions:**
     *   Successful login returns a valid `authToken` and user information.
     *   The `{{AUTH_TOKEN}}` and `{{USER_ID}}` variables are populated from this response for subsequent tests.
     *   Appropriate error messages for invalid credentials or non-existent user.

---

## Test Scenario 1: Booking a Hotel Room

**Objective:** Test the complete flow of searching for a hotel, selecting a room for a specific date, booking it, and processing payment.

**Steps & GraphQL Operations:**

### 1. Search for Hotels
   - **Action:** User searches for hotels in a specific city.
   - **Query:** `filterHotels`
   - **Example Variables:**
     ```json
     {
       "filters": { "cityId": 1 },
       "pagination": { "page": 1, "limit": 5 }
     }
     ```
   - **Expected:** List of hotels. User selects one (e.g., `selectedHotelId = "hotel_abc"`).

### 2. Check Room Availability & Pricing for a Date
   - **Action:** User selects a hotel and checks room availability for a specific date.
   - **Query:** `hotelDailyStatus`
   - **Example Variables:**
     ```json
     {
       "hotelId": "{{selectedHotelId}}",
       "date": "{{SELECTED_DATE}}"
     }
     ```
   - **Expected:** List of available room types with prices. User selects one (e.g., `selectedRoomTypeName = "Deluxe Room"`, `selectedPrice = 150.00`, `selectedCurrency = "USD"`).

### 3. Initiate Hotel Booking
   - **Action:** User decides to book the selected room.
   - **Mutation:** `createHotelBooking` (Assumed mutation)
   - **Example Variables:**
     ```json
     {
       "input": {
         "hotelId": "{{selectedHotelId}}",
         "roomTypeName": "{{selectedRoomTypeName}}",
         "date": "{{SELECTED_DATE}}",
         "userId": "{{USER_ID}}",
         "guestDetails": [
           { "fullName": "John Doe", "email": "john.doe@example.com" }
         ],
         "numberOfAdults": 2,
         "numberOfChildren": 0,
         "expectedPrice": "{{selectedPrice}}", // To ensure price hasn't changed
         "currency": "{{selectedCurrency}}"
       }
     }
     ```
   - **Expected:** A booking object with a `bookingId` (e.g., `hotelBookingId = "hbook_123"`) and `status: "PENDING_PAYMENT"` or similar, and the `totalAmountDue`.

### 4. Process Payment for Hotel Booking
   - **Action:** User proceeds to pay for the booking.
   - **Mutation:** `processPayment` (Assumed generic mutation)
   - **Example Variables:**
     ```json
     {
       "input": {
         "bookingId": "{{hotelBookingId}}",
         "bookingType": "HOTEL", // Or inferred from bookingId
         "paymentMethodId": "{{PAYMENT_METHOD_ID}}", // e.g., a test card ID
         "amount": "{{totalAmountDue}}",
         "currency": "{{selectedCurrency}}"
       }
     }
     ```
   - **Expected:** Payment success response, and the booking status updated to `CONFIRMED` or `PAID`.

### 5. Verify Hotel Booking Confirmation
   - **Action:** System verifies the booking status after payment.
   - **Query:** `getHotelBookingDetails` (Assumed query)
   - **Example Variables:**
     ```json
     {
       "bookingId": "{{hotelBookingId}}"
     }
     ```
   - **Expected:** Booking details with `status: "CONFIRMED"` and payment information.

---

## Test Scenario 2: Booking a Flight

**Objective:** Test the complete flow of searching for a flight, selecting a seat/class, booking it, and processing payment.

**Steps & GraphQL Operations:**

### 1. Search for Flights
   - **Action:** User searches for flights (e.g., one-way, specific origin/destination, date).
   - **Query:** `filterFlights`
   - **Example Variables (One-way):**
     ```json
     {
       "filters": {
         "originAirportCode": "JFK",
         "destinationAirportCode": "LAX",
         "departureDate": "{{SELECTED_DATE}}"
       },
       "pagination": { "page": 1, "limit": 5 }
     }
     ```
   - **Expected:** List of flights. User selects one (e.g., `selectedFlightId = "flight_xyz"`).

### 2. Check Flight Daily Status (Price/Availability for selected flight on date)
   - **Action:** User has selected a flight, now confirm details for that specific flight ID and date (as price/availability can be dynamic).
   - **Query:** `flight(id: "{{selectedFlightId}}") { dailyStatus(date: "{{SELECTED_DATE}}") { ... } }` or a dedicated `flightDailyStatus(flightId: ..., date: ...)` query.
   - **Example Variables (within `flight` query context):
     ```json
     // For query: query GetFlightWithDailyStatus($flightId: ID!, $date: String!) {
     //   flight(id: $flightId) {
     //     id
     //     // ... other static flight fields
     //     dailyStatus(date: $date) {
     //       date
     //       seatsAvailable
     //       price
     //       currency
     //     }
     //   }
     // }
     {
        "flightId": "{{selectedFlightId}}",
        "date": "{{SELECTED_DATE}}"
     }
     ```
   - **Expected:** Price and seat availability for the selected flight and date. User notes `selectedPrice` and `selectedCurrency`.

### 3. Initiate Flight Booking
   - **Action:** User decides to book the selected flight.
   - **Mutation:** `createFlightBooking` (Assumed mutation)
   - **Example Variables:**
     ```json
     {
       "input": {
         "flightId": "{{selectedFlightId}}",
         "date": "{{SELECTED_DATE}}",
         "userId": "{{USER_ID}}",
         "passengers": [
           { "fullName": "Jane Roe", "dob": "1990-01-01", "nationality": "US" }
         ],
         "seatClass": "ECONOMY", // Or selected by user
         "expectedPrice": "{{selectedPrice}}",
         "currency": "{{selectedCurrency}}"
       }
     }
     ```
   - **Expected:** A booking object with `flightBookingId` (e.g., `fbook_456`) and `status: "PENDING_PAYMENT"`, and `totalAmountDue`.

### 4. Process Payment for Flight Booking
   - **Action:** User proceeds to pay for the booking.
   - **Mutation:** `processPayment` (Assumed generic mutation)
   - **Example Variables:**
     ```json
     {
       "input": {
         "bookingId": "{{flightBookingId}}",
         "bookingType": "FLIGHT",
         "paymentMethodId": "{{PAYMENT_METHOD_ID}}",
         "amount": "{{totalAmountDue}}",
         "currency": "{{selectedCurrency}}"
       }
     }
     ```
   - **Expected:** Payment success, booking status updated to `CONFIRMED`.

### 5. Verify Flight Booking Confirmation
   - **Action:** System verifies the booking status.
   - **Query:** `getFlightBookingDetails` (Assumed query)
   - **Example Variables:**
     ```json
     {
       "bookingId": "{{flightBookingId}}"
     }
     ```
   - **Expected:** Booking details with `status: "CONFIRMED"`.

---

## Test Scenario 3: Booking a Train Ticket (Similar structure to Flight)

## Test Scenario 4: Booking a Local Travel Package (Similar structure)

**Note:** These test cases make assumptions about the existence and structure of booking and payment mutations (`createHotelBooking`, `createFlightBooking`, `processPayment`) and booking detail queries (`getHotelBookingDetails`, `getFlightBookingDetails`). These would need to be aligned with your actual GraphQL schema.

The `dailyStatus` sub-queries or dedicated queries are crucial for services where price and availability change daily, as highlighted in the memories (e.g., `MEMORY[c3c08614-3f1d-483a-a1ad-6bf4c9d493b9]` for hotels, `MEMORY[691730e3-019f-4922-8cbd-ddd1e2f2b62d]` for flights).
