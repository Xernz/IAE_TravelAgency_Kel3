# Travel Agency Project Tasks for Agentic AI

This document outlines the specific tasks required to complete the direct service-to-service communication project for the travel agency system. Each task is presented as an instructive prompt designed for an agentic AI.

## Task 1: API Design Definition

**Prompt:** Define the detailed REST API specifications for the three services: Booking Service, Flight Service, and Hotel Service. For each service, specify:

- Base URL (e.g., `/bookings`, `/flights`, `/hotels`)
    
- Specific endpoints (e.g., `/bookings/{id}`, `/flights/search`, `/hotels/{id}/availability`)
    
- HTTP methods for each endpoint (GET, POST, PUT, DELETE)
    
- Required request parameters (query parameters, request body structure - JSON) for each method.
    
- Expected JSON response structure for success and common error cases for each endpoint.
    
- Example request and response payloads for key endpoints.
    

**Output:** A structured document (e.g., Markdown or JSON) detailing the API specifications for all three services.

## Task 2: Booking Service Implementation (Provider & Consumer)

**Prompt:** Implement the Booking Service based on the defined API specifications (Task 1).

- Setup initial baseline Node.js/Express
    
- Implement the API endpoints to act as a data provider for bookings (Create, Read, Update, Delete operations).
    
- Implement the consumer logic within the Booking Service to make HTTP GET requests to the Flight Service (e.g., `/flights/{id}`, `/flights/search`) and Hotel Service (e.g., `/hotels/{id}`, `/hotels/{id}/availability`) to retrieve necessary information for booking creation or retrieval.
    
- Implement basic in-memory data storage for bookings (or integrate with a simple file/database if preferred).
    
- Ensure the service runs on a specified local port.
    

**Output:** Source code for the Booking Service, including API endpoint implementations and consumer logic.

## Task 3: Flight Service Implementation (Provider & Consumer)

**Prompt:** Implement the Flight Service based on the defined API specifications (Task 1).

- Choose a suitable technology (can be different from the Booking Service).
    
- Implement the API endpoints to act as a data provider for flights (e.g., search, get details, check availability).
    
- Implement the consumer logic within the Flight Service to make HTTP GET requests to the Booking Service (e.g., `/bookings/by-flight/{flightId}`) to check booking status related to a specific flight segment.
    
- Implement basic in-memory data storage for flight data (or integrate with a simple file/database if preferred).
    
- Ensure the service runs on a specified local port, different from the Booking Service.
    

**Output:** Source code for the Flight Service, including API endpoint implementations and consumer logic.

## Task 4: Hotel Service Implementation (Provider & Consumer)

**Prompt:** Implement the Hotel Service based on the defined API specifications (Task 1).

- Choose a suitable technology (can be different from the other services).
    
- Implement the API endpoints to act as a data provider for hotels (e.g., get details, check room availability, get pricing).
    
- Implement the consumer logic within the Hotel Service to make HTTP GET requests to the Booking Service (e.g., `/bookings/by-hotel/{hotelId}`) to check booking status related to a specific hotel room.
    
- Implement basic in-memory data storage for hotel data (or integrate with a simple file/database if preferred).
    
- Ensure the service runs on a specified local port, different from the other services.
    

**Output:** Source code for the Hotel Service, including API endpoint implementations and consumer logic.

## Task 5: API Documentation Generation

**Prompt:** Generate detailed API documentation for each implemented service (Booking, Flight, Hotel) based on the final implemented code and API specifications (Task 1).

- Use Markdown format (e.g., a README.md file per service).
    
- For each service's documentation, include:
    
    - Service name and purpose.
        
    - Base URL and port.
        
    - List of all available endpoints.
        
    - For each endpoint: HTTP method, path, description, required parameters (with data types and descriptions), example request payload, example success response payload, example error response payload.
        

**Output:** Markdown files (e.g., `booking-api.md`, `flight-api.md`, `hotel-api.md`) containing the API documentation for each service.

## Task 6: Inter-service Communication Documentation

**Prompt:** Create a separate documentation file explaining the inter-service communication flows within the system.

- Use Markdown format (e.g., `communication-flow.md`).
    
- Describe how each service acts as a consumer.
    
- For each consumer service (Booking, Flight, Hotel), detail:
    
    - Which other services it calls.
        
    - Which specific endpoints it calls on those services.
        
    - The purpose of each call (why the data is needed).
        
    - The expected data flow and how the consumer service uses the received data.
        
- Include a high-level diagram or description of the overall system architecture and communication paths.
    

**Output:** A Markdown file (`communication-flow.md`) documenting the inter-service communication.

## Task 7: System Testing and Verification

**Prompt:** Perform testing to verify the functionality of each service and the inter-service communication.

- Ensure each service's API endpoints function correctly when called directly.
    
- Test the consumer logic in each service by running the dependent services and making requests that trigger inter-service calls (e.g., creating a booking should trigger calls to Flight and Hotel services).
    
- Verify that data is correctly exchanged between services via HTTP and JSON.
    
- Document any issues found and suggest potential fixes.
    

**Output:** A test report or summary documenting the testing process, results, and any identified issues.

These tasks provide a structured approach for an agentic AI to develop the required system, moving from design to implementation and documentation.