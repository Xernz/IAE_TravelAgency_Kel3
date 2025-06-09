# Central API Documentation

This directory provides a unified reference for all API specifications in the Travel Agency System.

## REST APIs (OpenAPI/Swagger)
- **Users Service:** ../../services/users-service/docs/openapi.yaml
- **Flight Service:** ../../services/flight-service/docs/openapi.yaml
- **Hotel Service:** ../../services/hotel-service/docs/openapi.yaml
- **Local Travel Service:** ../../services/local-travel-service/docs/openapi.yaml
- **Train Service:** ../../services/train-service/docs/openapi.yaml
- **Payment Service:** ../../services/payment-service/docs/openapi.yaml

## GraphQL APIs
- **Booking Service:** ../../services/booking-service/docs/schema.graphql

## Usage
- Use Swagger UI or compatible tools to visualize and interact with the OpenAPI YAML files.
- For GraphQL, use tools like GraphQL Playground or Apollo Studio with the provided SDL schema.

## Documentation Coverage
- Each spec includes endpoint/query descriptions, parameters, request/response examples, and error patterns.
- For error/response format standards, see `../logging_monitoring_error_handling.md`.

---

For updates, see each service's `docs/` directory. This central folder is a convenience index for onboarding and integration.
