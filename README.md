# Travel Agency Microservices Demo

## 1. Overview

This project is a demonstration of a microservices-based system for a travel agency. It features a set of interconnected services that handle bookings, flights, and hotel reservations. The system is designed with direct service-to-service communication using HTTP and JSON, without a central API Gateway for internal calls, though a `Consumer Interface Backend` serves as an entry point for client applications.

## 2. System Architecture

The system comprises the following core microservices:

*   **Booking Service:** Manages the creation, retrieval, update, and deletion of travel bookings.
*   **Flight Service:** Manages flight information, availability, and pricing.
*   **Hotel Service:** Manages hotel information, room availability, and pricing.
*   **Consumer Interface Backend:** Provides a unified API for client applications (e.g., a frontend UI) to interact with the system. It aggregates data from the underlying microservices.

### 2.1. Service Communication

Services communicate directly with each other via RESTful APIs over HTTP, exchanging data in JSON format.

*   **Booking Service** calls:
    *   `Flight Service`: To get flight details, check availability, get pricing, and manage seat inventory (decrement/increment seats upon booking creation/deletion).
    *   `Hotel Service`: To get hotel details, check room availability, get pricing, and manage room inventory (decrement/increment rooms upon booking creation/deletion).
*   **Flight Service** calls:
    *   `Booking Service`: To retrieve bookings associated with a specific flight (e.g., to check booking status for a flight segment).
*   **Hotel Service** calls:
    *   `Booking Service`: To retrieve bookings associated with a specific hotel room (e.g., to check booking status for a room).
*   **Consumer Interface Backend** calls:
    *   `Booking Service`: For all booking-related operations (CRUD).
    *   `Flight Service`: To list and search flights.
    *   `Hotel Service`: To list and search hotels.

A textual representation of the communication flow:

```
[Client Application]
   |
   v
[Consumer Interface Backend]
   |  \
   |   [Booking Service] <------> [Flight Service]
   |      |
   |      v
   +----->[Hotel Service] <------+
```

## 3. Services and API Overview

Detailed API specifications can be found in `project_guide/api_spec.md`.

### 3.1. Booking Service

*   **Base URL:** `/bookings`
*   **Description:** Manages all aspects of travel bookings.
*   **Key Endpoints:**
    *   `GET /bookings`: List all bookings.
    *   `POST /bookings`: Create a new booking (handles inventory updates with Flight/Hotel services).
    *   `GET /bookings/{id}`: Retrieve a specific booking.
    *   `PUT /bookings/{id}`: Update a booking.
    *   `DELETE /bookings/{id}`: Delete a booking (handles inventory updates).
    *   `POST /bookings/{id}/cancel`: Cancel a booking.

### 3.2. Flight Service

*   **Base URL:** `/flights`
*   **Description:** Manages flight data, availability, and inventory.
*   **Key Endpoints:**
    *   `GET /flights`: List all flights.
    *   `GET /flights/search`: Search for flights.
    *   `GET /flights/{id}`: Retrieve a specific flight.
    *   `GET /flights/{id}/availability`: Check seat availability.
    *   `POST /flights/decrement-seat`: Internal endpoint called by Booking Service.
    *   `POST /flights/increment-seat`: Internal endpoint called by Booking Service.
    *   `GET /bookings/by-flight/{flightId}`: Get bookings for a specific flight.

### 3.3. Hotel Service

*   **Base URL:** `/hotels`
*   **Description:** Manages hotel data, room availability, and inventory.
*   **Key Endpoints:**
    *   `GET /hotels`: List all hotels.
    *   `GET /hotels/{id}`: Retrieve a specific hotel.
    *   `GET /hotels/{id}/availability`: Check room availability.
    *   `POST /hotels/decrement-room`: Internal endpoint called by Booking Service.
    *   `POST /hotels/increment-room`: Internal endpoint called by Booking Service.
    *   `GET /bookings/by-hotel/{hotelId}`: Get bookings for a specific hotel.

### 3.4. Consumer Interface Backend

*   **Base URL:** `/` (relative to its own deployment)
*   **Description:** Acts as the primary entry point for client applications, aggregating data from other services.
*   **Key Endpoints:**
    *   `GET /`: Health check.
    *   `GET /bookings`: List all bookings (proxies to Booking Service).
    *   `POST /bookings`: Create a new booking (proxies to Booking Service).
    *   `GET /flights`: List all flights (proxies to Flight Service).
    *   `GET /hotels`: List all hotels (proxies to Hotel Service).

## 4. Technology Stack

*   **Backend:** Node.js
*   **Database:** MySQL (per service, as implied by microservice architecture)
*   **Communication:** HTTP, JSON
*   **Architecture:** RESTful Microservices

## 5. Setup and Running

*(Placeholder: Instructions on how to set up the development environment, install dependencies, configure services (e.g., database connections, port numbers), and run each service will be added here.)*

To run this project:

1.  **Prerequisites:**
    *   Node.js (specify version if known)
    *   npm or yarn
    *   MySQL server
2.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd travel-agency-system2
    ```
3.  **Configure each service:**
    *   Navigate to each service directory (`booking-service`, `flight-service`, `hotel-service`, `consumer-interface`).
    *   Create a `.env` file based on `.env.example` (if available) and configure database connections, ports, and other service URLs.
4.  **Install dependencies for each service:**
    ```bash
    cd <service-directory>
    npm install
    # or yarn install
    cd ..
    ```
    (Repeat for all services)
5.  **Set up databases:**
    *   Ensure your MySQL server is running.
    *   Create the necessary databases and tables for each service. (Refer to individual service documentation or migration scripts if available).
6.  **Run each service:**
    ```bash
    cd <service-directory>
    npm start
    # or yarn start
    cd ..
    ```
    (Repeat for all services, preferably in separate terminal windows)

## 6. API Documentation

For detailed API specifications, including request/response examples for all endpoints, please refer to the [API Specification Document](./project_guide/api_spec.md).

## 7. Project Guide

Further details about the project plan, communication flows, and tasks can be found in the `project_guide` directory.
