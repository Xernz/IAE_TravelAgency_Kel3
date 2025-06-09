### **Analysis and Action Plan for Microservice Alignment**

This document outlines a prioritized plan to address the issues from the June 10, 2025 audit, now fully integrated with the subsequent **Database Schema Verification** findings. This plan is a precise, step-by-step guide to stabilize the system, implement missing functionality based on accurate schema, and refactor for consistency and maintainability.

#### **Summary of Key Decisions Incorporated:**

- **Search Functionality:** All `search...` GraphQL queries and their underlying REST endpoints will be removed in favor of the more powerful `filter...` queries.
    
- **User Creation:** The `createUser` mutation is out of scope and will be removed. Only the `registerUser` flow is supported.
    
- **Admin Scope:** All admin-related functionality is deferred. The focus is on the core user experience.
    
- **Data Seeding vs. End-User `create`:** The `createFlight` and `createHotel` mutations will be implemented as developer tools for populating demo data. The `createTrain` and `createLocalTravel` mutations will be removed, as their underlying services are strictly "Consumer Only."
    

### **Phase 1: Critical Stability Fixes (Immediate Priority)**
This phase addresses all known system-breaking issues. The goal is to achieve a stable state where services can communicate correctly, making further development and testing possible.

Correct All Service URL and Port Misconfigurations in API Gateway (Verified on 2025-06-10):
Action: The following changes are required within the GraphQL resolver files in the API Gateway to ensure they call the correct microservice ports.

In api-gateway/graphql/booking.js:
    For inter-service calls to the Hotel service, change port from 3002 to 3003.
    For inter-service calls to the Flight service, change port from 3005 to 3002.
    For inter-service calls to the Local Travel service, change port from 3008 to 3006.

Note: All other service URL constants (FLIGHT_SERVICE_URL, USERS_SERVICE_URL, etc.) have been verified as correct and require no changes.

**2. Implement Core Authentication Flow:**

- **`api-gateway/graphql/users.js`:** Add `token: String!` to the `AuthPayload` GraphQL type.
    
- **`services/users-service/src/controllers/usersController.js`**: Modify `registerUser` and `loginUser` to generate and return a JWT upon success.
    

**3. Fix Critical Booking & Payment Endpoint Mismatches:**

- **Payment Service:**
    
    - **REST API:** In `paymentRoutes.js`, add `router.get('/booking/:bookingId', ...)` and implement the `getPaymentsByBookingId` controller function.
        
    - **API Gateway:** In `payment.js`, modify the `Query.payments` resolver to require `bookingId` and call the new endpoint. Rename `Query.payment(id)` to `getPaymentStatus(id: ID!)` and have it call the existing `/api/payments/:id/status` REST endpoint.
        
- **Booking Service:**
    
    - **REST API:** Implement the `POST /api/bookings/:id/cancel` endpoint and controller logic.
        

### **Phase 2: Data Model & Core Functionality Implementation**

This phase focuses on aligning the data models across the stack and implementing the core features required for the user-facing demo.

**1. Align GraphQL Types with Database Reality:**

- **Booking Service:**
    
    - Expand the GraphQL `Booking` type to include `booking_code`, `total_amount`, `currency`, `payment_status`, `special_requests`, `updated_at`.
        
    - Expand the GraphQL `BookingItem` type to include `quantity`, `unit_price`, `subtotal`, `origin_city`, `destination_city`, `service_class`, `provider`, and map GQL `date` to DB `travel_date`.
        
- **Users Service:** Decide on the `updated_at` field in the `User` GQL type. Either implement the logic to populate it in the service or remove it from the GQL type to avoid confusion.
    
- **Local Travel Service (CRITICAL DATA GAP):** Address the missing DB columns. The fields `departure_time`, `arrival_time`, and `vehicle_model` are in the GQL type but not the database. **Decision required:**
    
    - **Option A (Recommended for Demo):** Add these columns to the `LocalTravel` table in the database schema. Update the REST service to handle them.
        
    - **Option B:** Remove these critical fields from the `LocalTravel` GraphQL type.
        

**2. Implement Data Seeding & Service Logic:**

- **Implement `create` Operations (for Demo Data):**
    
    - **Flight & Hotel Services:** Implement the `POST /api/flights` and `POST /api/hotels` REST endpoints and corresponding controller logic. This will allow you to seed the demo with data.
        
- **Implement Service-Specific Logic:**
    
    - **Local Travel Service:** Implement the logic in the REST controller to parse the `features` TEXT field to populate the `has_ac` and `has_wifi` boolean GQL fields.
        
    - **Train & Flight Services:** Clarify and implement the logic in the REST controllers for `GET /:id/pricing` to correctly map database fields (e.g., `price_category`, `flight_class`) to the `seatClass` field expected by the GraphQL `Pricing` type.
        
    - **Users Service:** Verify and, if necessary, fix the `updateProfile` controller to correctly map GQL arguments `name` and `phone` to DB columns `full_name` and `phone_number`.
        

**3. Implement Missing User-Facing Features:**

- **Implement Missing Availability Mutations:**
    
    - **Train, Flight, Local Travel:** Define the `decrease...Availability` and `increase...Availability` GraphQL mutations in the API Gateway to call the existing REST endpoints.
        
- **Implement Booking Modification:**
    
    - **Booking Service:** Implement a `PUT` or `PATCH` REST endpoint (e.g., `PUT /api/bookings/:id`) and controller logic.
        
    - **API Gateway:** Implement the `modifyBooking` GraphQL mutation resolver.
        

### **Phase 3: Refactoring & API Cleanup**

This phase cleans up the API surface, removes dead and duplicated code, and improves consistency based on the schema verification.

**1. Remove Unused & Misaligned Mutations:**

- **Train & Local Travel Services:** Remove the `createTrain` and `createLocalTravel` mutations from the GraphQL schema, as their services are "Consumer Only" and lack the necessary REST endpoints.
    
- **Users Service:** Remove the unused `createUser` mutation from the GraphQL schema.
    

**2. Refactor and Consolidate Queries:**

- **Train, Flight, Local Travel:**
    
    - Modify generic list queries (`Query.trains`, etc.) to only handle pagination (`page`, `limit`).
        
    - Delete the `search...` GraphQL queries and their corresponding REST endpoints and controller functions.
        
    - Establish the `filter...` queries as the single authoritative method for complex filtering.
        
- **Fix Return Types:** In the GraphQL schema, change the return type for `flightPricing`, `trainPricing`, and `localTravelPricing` queries from a singular `Pricing` object to an array: `[Pricing]`.
    
- **Remove Duplicate Resolvers:**
    
    - **Hotel Service:** Remove the duplicate `hotel(id: ID!)` resolver.
        
    - **Local Travel Service:** Remove the duplicate `localTravel(id: ID!)` resolver.
        

### **Phase 4 & 5: Testing, Documentation & Finalization**

These phases remain as previously defined, ensuring the now-corrected system works as expected and is prepared for future use.

- **Phase 4: Integration Testing & Validation:** Test core user flows (booking, cancellation, history) and error handling.
    
- **Phase 5: Documentation & Finalization:** Centralize configuration using environment variables and create API usage documentation.
    

### **Updated Progress Tracking Checklist**

|   |   |   |   |
|---|---|---|---|
|**Phase**|**Task**|**Service(s) Involved**|**Status**|
|1|Correct ALL Service URLs & Ports|All|`[ ]` To Do|
|1|Implement JWT Auth Flow (`AuthPayload.token`)|Users|`[ ]` To Do|
|1|Fix Payment REST API & GQL Query|Payment|`[ ]` To Do|
|1|Implement `cancelBooking` REST Endpoint|Booking|`[ ]` To Do|
|2|Expand `Booking` & `BookingItem` GQL Types|Booking|`[ ]` To Do|
|2|Resolve `LocalTravel` DB Schema Data Gap|Local Travel|`[ ]` To Do|
|2|Implement `createFlight`, `createHotel` REST endpoints|Flight, Hotel|`[ ]` To Do|
|2|Implement logic for `seatClass` mapping|Train, Flight|`[ ]` To Do|
|2|Implement logic for `features` parsing|Local Travel|`[ ]` To Do|
|2|Implement missing GQL Availability Mutations|Train, Flight, LT|`[ ]` To Do|
|2|Implement `modifyBooking` feature|Booking|`[ ]` To Do|
|3|Remove `createTrain`, `createLocalTravel` mutations|Train, Local Travel|`[ ]` To Do|
|3|Refactor/Consolidate List/Filter/Search Queries|Train, Flight, LT|`[ ]` To Do|
|3|Fix `[Pricing]` return types in GQL|Train, Flight, LT|`[ ]` To Do|
|3|Remove Duplicate GQL Resolvers|Hotel, Local Travel|`[ ]` To Do|
|4|Test End-to-End User Flows|All|`[ ]` To Do|
|4|Validate Error Handling|All|`[ ]` To Do|
|5|Centralize Configuration with Environment Variables|All|`[ ]` To Do|
|5|Create API Documentation|N/A|`[ ]` To Do|