# Flight Service API Documentation

## Overview
The Flight Service API provides endpoints for searching, filtering, and retrieving flight information for Indonesian airlines and destinations.

## Base URL
```
/api/flights
```

## Endpoints

### List All Flights
Retrieves all available flights ordered by departure time.

**URL**: `/`  
**Method**: `GET`  
**Response Format**:
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "flight_number": "GA123",
      "airline_code": "GA",
      "airline_name": "Garuda Indonesia",
      "origin_airport_code": "CGK",
      "origin_city": "Jakarta",
      "destination_airport_code": "DPS",
      "destination_city": "Denpasar",
      "departure_time": "2023-06-15T08:00:00",
      "arrival_time": "2023-06-15T10:30:00",
      "duration_minutes": 150,
      "aircraft_type": "Boeing 737-800",
      "flight_class": "Economy",
      "price": 1500000,
      "available_seats": 120
    },
    // More flights...
  ]
}
```

### Filter Flights
Filters flights based on multiple criteria.

**URL**: `/filter`  
**Method**: `GET`  
**Query Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| origin_city | String | Filter by origin city (e.g., "Jakarta") |
| destination_city | String | Filter by destination city (e.g., "Surabaya") |
| origin_airport_code | String | Filter by origin airport code (e.g., "CGK") |
| destination_airport_code | String | Filter by destination airport code (e.g., "SUB") |
| airline_code | String | Filter by airline code (e.g., "GA") |
| airline_name | String | Filter by airline name (e.g., "Garuda Indonesia") |
| flight_class | String | Filter by flight class (e.g., "Economy", "Business") |
| departure_date | String | Filter by departure date (YYYY-MM-DD) |
| min_price | Number | Minimum price in IDR |
| max_price | Number | Maximum price in IDR |
| sort_by | String | Field to sort by (e.g., "price", "departure_time") |
| sort_order | String | Sort order ("ASC" or "DESC") |

**Response Format**:
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "flight_number": "GA123",
      "airline_code": "GA",
      "airline_name": "Garuda Indonesia",
      "origin_airport_code": "CGK",
      "origin_city": "Jakarta",
      "destination_airport_code": "DPS",
      "destination_city": "Denpasar",
      "departure_time": "2023-06-15T08:00:00",
      "arrival_time": "2023-06-15T10:30:00",
      "duration_minutes": 150,
      "aircraft_type": "Boeing 737-800",
      "flight_class": "Economy",
      "price": 1500000,
      "available_seats": 120
    },
    // More filtered flights...
  ]
}
```

### Search Flights
Search for flights based on origin and destination.

**URL**: `/search`  
**Method**: `GET`  
**Query Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| origin | String | Origin airport code or city |
| destination | String | Destination airport code or city |
| date | String | Departure date (YYYY-MM-DD) |

**Response Format**: Same as filter endpoint

### Get Flight Details
Get details for a specific flight.

**URL**: `/:id`  
**Method**: `GET`  
**Response Format**:
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "flight_number": "GA123",
    "airline_code": "GA",
    "airline_name": "Garuda Indonesia",
    "origin_airport_code": "CGK",
    "origin_city": "Jakarta",
    "destination_airport_code": "DPS",
    "destination_city": "Denpasar",
    "departure_time": "2023-06-15T08:00:00",
    "arrival_time": "2023-06-15T10:30:00",
    "duration_minutes": 150,
    "aircraft_type": "Boeing 737-800",
    "flight_class": "Economy",
    "price": 1500000,
    "available_seats": 120
  }
}
```

### Get Flight Availability
Check availability for a specific flight on a given date.

**URL**: `/:id/availability`  
**Method**: `GET`  
**Query Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| date | String | Flight date (YYYY-MM-DD) |

**Response Format**:
```json
{
  "status": "success",
  "data": {
    "available": true,
    "seats_available": 120
  }
}
```

### Get Flight Pricing
Get pricing information for a specific flight.

**URL**: `/:id/pricing`  
**Method**: `GET`  
**Response Format**:
```json
{
  "status": "success",
  "data": {
    "base_price": 1500000,
    "taxes": 150000,
    "total_price": 1650000,
    "currency": "IDR"
  }
}
```
