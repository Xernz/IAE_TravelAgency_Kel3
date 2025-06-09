# Indonesian Travel Agency API Documentation

## Overview
This documentation provides comprehensive information about the API endpoints available in the Indonesian Travel Agency system. The system is built as a collection of microservices, each handling specific aspects of the travel booking process.

## Services

### [Flight Service](flight-service-api.md)
API for searching, filtering, and booking flights with Indonesian airlines.
- List all flights
- Filter flights by multiple criteria
- Search flights by origin/destination
- Get flight details, availability, and pricing

### [Hotel Service](hotel-service-api.md)
API for searching, filtering, and booking hotels across Indonesia.
- List all hotels
- Filter hotels by location, amenities, star rating, etc.
- Search hotels by location and dates
- Get hotel details, room types, availability, and pricing

### [Train Service](train-service-api.md)
API for searching, filtering, and booking train tickets across Indonesian railways.
- List all trains
- Filter trains by stations, cities, class, etc.
- Search trains by origin/destination
- Get train details, availability, and pricing

### [Local Travel Service](local-travel-service-api.md)
API for searching, filtering, and booking local travel options like car rentals and tour packages.
- List all local travel options
- Filter options by type, location, features, etc.
- Search local travel by city or route
- Get details, availability, and pricing

### [Booking Service](booking-service-api.md)
API for managing bookings across all travel services.
- List all bookings
- Filter bookings by user, status, date, etc.
- Create new bookings
- Get booking details
- Cancel bookings

### [Users Service](users-service-api.md)
API for user management and authentication.
- List all users
- Filter users by various criteria
- Register new users
- User authentication
- Profile management

## Authentication
Most endpoints require authentication using JWT tokens. To authenticate:
1. Call the `/api/users/login` endpoint with valid credentials
2. Include the returned token in the Authorization header of subsequent requests:
   ```
   Authorization: Bearer <token>
   ```

## Common Response Formats
All API endpoints follow a consistent response format:

### Success Response
```json
{
  "status": "success",
  "data": { ... }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description"
}
```

## Pagination
For endpoints that return multiple items, pagination is supported using the following query parameters:
- `page`: Page number (default: 1)
- `limit`: Number of items per page (default: 10)

Example:
```
GET /api/flights?page=2&limit=20
```

## Filtering
Most list endpoints support filtering using query parameters. See individual service documentation for specific filter options.

## Sorting
Most list endpoints support sorting using the following query parameters:
- `sort_by`: Field to sort by
- `sort_order`: Sort direction ("ASC" or "DESC")

Example:
```
GET /api/hotels?sort_by=price_per_night&sort_order=ASC
```
