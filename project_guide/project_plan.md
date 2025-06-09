# Project Plan: Travel Agency Microservices System

This document outlines the plan for developing a comprehensive travel agency system using a microservices architecture, **with a specific focus on providing travel services within the Indonesian context.** The system will consist of seven distinct services, a consumer-facing UI, and will utilize MySQL for data persistence. Service-to-service communication will primarily be direct HTTP/JSON, while the UI might benefit from an API Gateway pattern (to be evaluated).

## 1. Overall Vision & Goals

To create a modular, scalable, and maintainable travel agency platform by decomposing functionalities into independent microservices. This approach will allow for independent development, deployment, and scaling of each component.

**Key Goals:**
- Implement 7 core microservices.
- Develop a user-friendly consumer interface.
- Ensure robust data management with MySQL.
- Define clear business logic and data relationships across services.

## 2. Microservices Overview

Each service will manage its own database schema. Services will expose APIs, which can be RESTful or GraphQL, depending on the service's role and consumer needs. A hybrid approach is anticipated.

### 2.8. API Strategy: REST and GraphQL Hybrid Approach

While REST will be the default for many services, especially for straightforward CRUD operations and internal service-to-service communication, GraphQL will be considered for specific use cases to optimize data fetching and provide flexibility to consumers.

-   **Potential GraphQL Candidates:**
    -   **Booking Service:** Ideal for exposing a GraphQL API to allow clients (UI or API Gateway) to fetch complex, nested booking information (including details from Flight, Hotel, Local Travel, Train services) in a single request.
    -   **API Gateway:** Could provide a unified GraphQL schema to the UI, abstracting the underlying microservice APIs (which could be REST or GraphQL).
    -   **Users Service:** Could offer a GraphQL endpoint if flexible querying of user profiles and related data (e.g., booking history, preferences) is a significant requirement for the UI.
-   **Benefits:**
    -   **Efficient Data Fetching:** Clients request only the data they need.
    -   **Reduced Over/Under-fetching:** Avoids multiple round trips or overly large payloads.
    -   **Strongly Typed Schemas:** Provides a clear contract between client and server.
-   **Considerations:**
    -   **Complexity:** GraphQL can add complexity in terms of schema design, resolvers, and tooling.
    -   **Caching:** Caching strategies for GraphQL can differ from REST.
    -   **File Uploads:** Handling file uploads in GraphQL requires specific approaches.

Services not explicitly designated for GraphQL will primarily use RESTful APIs.

### 2.1. Users Service
-   **Responsibility:** Manages consumer user accounts and profiles, tailored for Indonesian users.
-   **Key Business Functions:** Consumer user registration, login, and profile management (personal details including `full_name`, `birth_date`, `no_nik` (Nomor Induk Kependudukan - National Identity Number), Indonesian phone number format (e.g., +62xxxx)). Password management will be simplified.
-   **Core Data Entities:** `Users` (id, email, password, `full_name`, `phone_number` (string, to accommodate +62), `birth_date`, `no_nik`). The `created_at` field will also be present as per recent schema updates. (Preferences field removed as per recent schema update).
-   **Potential Consumers:** Booking Service (for associating bookings with users), Payment Service (for user payment methods), UI.
-   **Sample Data:** Pre-loaded sample consumer user accounts with Indonesian-style names and valid `no_nik` examples will be created for immediate testing.

### 2.2. Payment Service
-   **Responsibility:** Handles all payment processing, transaction history, and refund management, supporting common Indonesian payment methods.
-   **Key Business Functions:** Process payments (credit/debit cards, **bank transfers via Virtual Accounts (VA)**, **e-wallets like GoPay, OVO, DANA, LinkAja**), manage payment gateways, record transactions, issue refunds, manage stored payment methods (securely). Currency will primarily be IDR (Indonesian Rupiah).
-   **Core Data Entities:** `Transaction` (transaction_id, booking_id, user_id, amount, currency (default IDR), status, `payment_method_type` (e.g., 'credit_card', 'virtual_account_bca', 'gopay'), payment_method_details, timestamp), `Refund`.
-   **Potential Consumers:** Booking Service (to initiate payments for bookings), UI.
-   **Potential Providers Consumed:** Users Service (for user details if needed for payment).
-   **Sample Data:** Sample transactions demonstrating various Indonesian payment methods will be included.

### 2.3. Booking Service (Existing - to be enhanced)
-   **Responsibility:** Manages the creation, retrieval, update, and cancellation of travel bookings. Acts as an orchestrator for various travel components.
-   **Key Business Functions:** Create new bookings (flights, hotels, local travel, trains, packages), view booking history, modify existing bookings (if rules allow), cancel bookings, manage booking status.
-   **Core Data Entities:** `Booking` (booking_id, user_id, creation_date, total_price, status), `BookingItem` (item_id, booking_id, service_type (flight, hotel, etc.), service_specific_id, price).
-   **Potential Consumers:** UI, Payment Service (for payment details), potentially other services for status updates.
-   **Potential Providers Consumed:** Users Service (user details), Flight Service, Hotel Service, Local Travel Service, Train Service (to get availability, pricing, and confirm reservations), Payment Service (to process payment).

### 2.4. Flight Service (Existing - to be enhanced)
-   **Responsibility:** Manages flight information, schedules, availability, and pricing for consumer access, focusing on Indonesian domestic and popular international routes.
-   **Key Business Functions:** Search flights (origin, destination, dates, passengers), check flight availability, get flight pricing, provide flight details (airline, aircraft, duration, layovers).
-   **Core Data Entities:** `Flight` (flight_id, flight_number, airline (e.g., Garuda Indonesia, Lion Air, Citilink), `origin_airport_code` (IATA, e.g., CGK, DPS), `destination_airport_code` (IATA), departure_time, arrival_time, aircraft_type, total_seats), `FlightPricing` (pricing_id, flight_id, seat_class, price, currency (IDR)), `FlightAvailability` (flight_id, date, available_seats).
-   **Potential Consumers:** Booking Service, UI.
-   **Sample Data:** A comprehensive set of sample flight routes (e.g., Jakarta-Bali, Surabaya-Medan, Jakarta-Singapore), schedules, and pricing for major Indonesian airlines will be pre-loaded. Airport data will include major Indonesian hubs like Soekarno-Hatta (CGK), Ngurah Rai (DPS), Juanda (SUB), Kualanamu (KNO).

### 2.5. Local Travel Service (New)
-   **Responsibility:** Manages local and inter-city transportation options like **buses (e.g., DAMRI, Rosalia Indah), shuttle services (e.g., DayTrans, Cipaganti), and potentially door-to-door travel services** common in Indonesia.
-   **Key Business Functions:** Search local/inter-city travel (type, route, date), check availability, get pricing, view operator details.
-   **Core Data Entities:** `LocalTravelRoute` (route_id, `operator_name`, type (e.g., 'Inter-City Bus', 'Shuttle', 'Travel'), origin_terminal/city, destination_terminal/city, stops_details (JSON array of stop points)), `LocalTravelSchedule` (schedule_id, route_id, departure_time, arrival_time, vehicle_details (e.g., plate number, capacity), price (IDR), available_seats).
-   **Potential Consumers:** Booking Service, UI.
-   **Sample Data:** Sample routes and schedules for popular Indonesian inter-city bus and shuttle services (e.g., Jakarta-Bandung shuttle, Yogyakarta-Semarang bus, Bali shuttle services between tourist spots) will be pre-loaded, including example operators.

### 2.6. Hotel Service (Existing - to be enhanced)
-   **Responsibility:** Manages hotel information, room availability, pricing, and bookings for consumer access, covering various accommodation types found in Indonesia.
-   **Key Business Functions:** Search hotels (location, dates, guests), check room availability, get room pricing, provide hotel details (amenities, ratings, location). Locations will include popular Indonesian tourist destinations and cities.
-   **Core Data Entities:** `Hotel` (hotel_id, name, address (including city/regency like `Kabupaten Badung`, `Kota Yogyakarta`), star_rating, `accommodation_type` (e.g., 'Hotel', 'Villa', 'Guesthouse', 'Losmen', 'Wisma'), amenities, description), `RoomType` (room_type_id, hotel_id, name (e.g., 'Deluxe Room', 'Standard Fan Room'), description, capacity, price_per_night (IDR)), `RoomAvailability` (hotel_id, room_type_id, date, available_rooms).
-   **Potential Consumers:** Booking Service, UI.
-   **Sample Data:** A variety of sample accommodations in key Indonesian locations (e.g., Bali (Kuta, Ubud), Yogyakarta, Jakarta, Lombok, Bandung) will be pre-loaded, representing different types and price points.

### 2.7. Train Service (New)
-   **Responsibility:** Manages train schedules, routes, seat availability, and pricing for consumer access, focusing on services provided by **PT Kereta Api Indonesia (KAI)**.
-   **Key Business Functions:** Search trains (origin station, destination station, dates), check seat availability, get train ticket pricing, provide train details (train name/number, route, classes, duration).
-   **Core Data Entities:** `TrainRoute` (route_id, train_name (e.g., 'Argo Bromo Anggrek', 'Taksaka'), train_number, origin_station_name (e.g., 'Gambir', 'Surabaya Pasar Turi'), destination_station_name, stops_details (JSON array of stop stations)), `TrainSchedule` (schedule_id, route_id, departure_time, arrival_time, `class_type` (e.g., 'Eksekutif', 'Bisnis', 'Ekonomi', 'Luxury'), price (IDR), available_seats).
-   **Potential Consumers:** Booking Service, UI.
-   **Sample Data:** Sample train routes (e.g., Jakarta-Surabaya, Jakarta-Yogyakarta, Bandung-Surabaya), schedules, classes, and pricing for PT KAI services will be pre-loaded. Station data will include major Indonesian train stations.

## 3. Data Structure and Relations (High-Level)

-   **Decentralized Data:** Each microservice will own its data and database schema. There will be no direct database-level joins between services.
-   **Data Consistency:** Eventual consistency will be a key consideration, especially for distributed transactions (e.g., booking involving multiple services).
-   **Foreign Keys (Conceptual):** Services will refer to entities in other services by their IDs. For example, a `BookingItem` in the Booking Service will store `flight_id` which refers to an entity in the Flight Service.
-   **Data Duplication:** Minimal, strategic data duplication might occur for performance or resilience (e.g., caching user names in the Booking Service if frequently displayed), but this should be carefully managed.
-   **Sample Data Focus (Indonesian Context):** A primary goal is to pre-load each service's database with comprehensive sample data **reflecting Indonesian travel scenarios, destinations, transportation, and user profiles.** This will enable immediate end-to-end testing and usage of the consumer-facing application with relevant, localized content without requiring manual data setup or admin intervention.

## 4. Consumer Interface (UI)

-   **Purpose:** Provide a web-based interface for end-users to search for travel options, make bookings, manage their accounts, and view their travel history.
-   **Key Features:**
    -   User authentication (login/registration).
    -   Unified search for flights, hotels, local travel, trains.
    -   Shopping cart / itinerary builder.
    -   Booking and payment workflow.
    -   User dashboard (my bookings, profile).
-   **Interaction with Backend:**
    -   The UI will communicate with backend services via their APIs (REST or GraphQL).
    -   **API Gateway:** Consider implementing an API Gateway. This would provide a single entry point for the UI. The Gateway could expose a unified GraphQL API to the UI, even if downstream services use a mix of REST and GraphQL. This simplifies UI development and handles request routing, aggregation, authentication, and SSL termination. If an API Gateway is not used, the UI will need to manage calls to multiple service endpoints directly (REST and/or GraphQL).

## 5. MySQL Database Integration & Setup

-   **Database per Service:** Each microservice will have its own dedicated MySQL database (or schema within a shared MySQL instance, carefully namespaced) to ensure loose coupling.
-   **Schema Design:** For each service, a detailed E-R diagram and SQL schema (CREATE TABLE statements) will be designed based on its core data entities and business functions.
-   **Connection Management:** Each service will manage its own database connections (e.g., using connection pools).
-   **Migrations:** A strategy for database schema migrations (e.g., using tools like Flyway or Liquibase, or simple SQL scripts managed with version control) will be needed for each service's database.
-   **Setup:**
    1.  Install MySQL server.
    2.  Create a database user with appropriate permissions for the services.
    3.  For each service, create its dedicated database/schema.
    4.  Run initial DDL scripts to create tables and other necessary database objects for each service.
    5.  Populate databases with pre-defined **Indonesian-centric sample data** (e.g., Indonesian user profiles, flight routes, hotel locations, train schedules, local travel options, payment methods) to support immediate consumer use cases.

## 6. Technical Specifications (Updated)

-   **Programming Language (Services):** Node.js (as per existing services)
-   **Framework (Services):** Express.js (commonly used with Node.js for REST APIs)
-   **Communication Protocol:** HTTP/HTTPS
-   **Data Format:** JSON
-   **Architecture Style:** RESTful APIs, GraphQL (for specific services/API Gateway)
-   **Database:** MySQL
-   **UI Technology Stack:** React with Material-UI (MUI). The existing `consumer-interface/ui` already uses this stack. For the demo, the focus will be on simplicity and showcasing backend functionality rather than a highly polished UI.
-   **GraphQL Libraries:** GraphQL for Node.js.

## 7. Development Roadmap / Phases

### Phase 1: Foundational Services & Core Enhancements
-   **Users Service:** Develop and test. Define REST API. (Consider GraphQL endpoint later if UI needs become complex).
-   **Flight Service:** Enhance existing service with full CRUD, advanced search, robust data model. Define REST API.
-   **Hotel Service:** Enhance existing service similarly. Define REST API.
-   **Booking Service:** Enhance existing service to integrate with Users, improved Flight & Hotel integration logic. Design and implement its core logic with REST endpoints for internal use. **Begin designing its GraphQL schema and resolvers for client-facing queries.**
-   **Database:** Setup MySQL, design and implement initial schemas for these services.

### Phase 2: Transactional & New Travel Services
-   **Payment Service:** Develop and test. Integrate with Booking Service.
-   **Local Travel Service:** Develop and test. Integrate with Booking Service.
-   **Train Service:** Develop and test. Integrate with Booking Service.
-   **Database:** Design and implement schemas for new services.

### Phase 3: Consumer Interface Development
-   Confirm React + Material-UI stack; set up basic theme.
-   Implement user authentication, search & browse interfaces (list all & filters), and initial booking flow UI.
-   Ensure logical navigation flow between screens.
-   Support basic keyboard navigation and readable text.
-   Apply Indonesian labels and IDR formatting.

### Phase 4: UI Refinement & Advanced Features
-   Refine UI based on early feedback; polish error/loading states and performance.
-   Complete multi-item booking, modification, and cancellation workflows in the UI.
-   Integrate Indonesian payment methods UI (GoPay, OVO, Virtual Accounts).
-   Build user dashboard and profile management UI (including `no_nik` and phone number formats).

### Phase 5: Testing, Deployment & Documentation
-   **Integration Testing:** Thoroughly test inter-service communication and end-to-end flows.
-   **Deployment Strategy:** Define deployment process for each service and the UI (e.g., Docker, CI/CD pipelines).
-   **API Documentation:** Finalize API documentation for all services (e.g., Swagger/OpenAPI).
-   **User Documentation:** Create guides for end-users.

## 8. Deliverables (Expanded)

1.  **Source Code:** Complete, version-controlled source code for all 7 microservices and the consumer interface.
2.  **Database Schemas:** SQL DDL scripts for each microservice's database.
3.  **API Documentation:** Comprehensive API documentation for each service (e.g., OpenAPI/Swagger specifications for REST, GraphQL schema documentation for GraphQL endpoints).
4.  **GraphQL Schemas:** For services implementing GraphQL APIs.
5.  **Inter-service Communication Documentation:** Updated document detailing data flows and API calls between services.
6.  **Deployment Scripts/Configuration:** As applicable for the chosen deployment strategy.
7.  **Test Plans & Reports:** For unit, integration, and system testing.

## 9. Next Steps

1.  **Prioritize Phase 1:** Begin development of the Users service and enhancements for existing services.
2.  **Detailed API Design:** For each service in the current phase, define specific REST endpoints, request/response payloads.
3.  **Database Schema Design:** Create detailed E-R diagrams and DDL for services in the current phase.
4.  **Set up Development Environment:** Ensure Node.js, MySQL, and any chosen tools are installed and configured.