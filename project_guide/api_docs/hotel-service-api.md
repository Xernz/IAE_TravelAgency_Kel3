# Hotel Service API Documentation

## Overview
The Hotel Service API provides endpoints for searching, filtering, and retrieving hotel information for Indonesian accommodations across the archipelago.

## Base URL
```
/api/hotels
```

## Endpoints

### List All Hotels
Retrieves all available hotels ordered by name.

**URL**: `/`  
**Method**: `GET`  
**Response Format**:
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Grand Hyatt Jakarta",
      "city": "Jakarta",
      "province": "DKI Jakarta",
      "address": "Jl. M.H. Thamrin No.30, Jakarta Pusat",
      "property_type": "Hotel",
      "star_rating": 5,
      "description": "Luxury hotel in the heart of Jakarta",
      "amenities": {
        "breakfast": true,
        "wifi": true,
        "pool": true,
        "gym": true
      },
      "image_url": "https://example.com/grand-hyatt.jpg",
      "price_per_night": 2500000
    },
    // More hotels...
  ]
}
```

### Filter Hotels
Filters hotels based on multiple criteria.

**URL**: `/filter`  
**Method**: `GET`  
**Query Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| city | String | Filter by city (e.g., "Jakarta", "Bali") |
| province | String | Filter by province (e.g., "DKI Jakarta", "Bali") |
| property_type | String | Filter by property type (e.g., "Hotel", "Villa", "Resort") |
| min_star | Number | Minimum star rating (1-5) |
| max_star | Number | Maximum star rating (1-5) |
| min_price | Number | Minimum price per night in IDR |
| max_price | Number | Maximum price per night in IDR |
| has_breakfast | Boolean | Filter by breakfast availability (true/false) |
| has_wifi | Boolean | Filter by WiFi availability (true/false) |
| min_room_size | Number | Minimum room size in square meters |
| sort_by | String | Field to sort by (e.g., "price_per_night", "star_rating", "name") |
| sort_order | String | Sort order ("ASC" or "DESC") |

**Response Format**:
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Grand Hyatt Jakarta",
      "city": "Jakarta",
      "province": "DKI Jakarta",
      "address": "Jl. M.H. Thamrin No.30, Jakarta Pusat",
      "property_type": "Hotel",
      "star_rating": 5,
      "description": "Luxury hotel in the heart of Jakarta",
      "amenities": {
        "breakfast": true,
        "wifi": true,
        "pool": true,
        "gym": true
      },
      "image_url": "https://example.com/grand-hyatt.jpg",
      "price_per_night": 2500000
    },
    // More filtered hotels...
  ]
}
```

### Search Hotels
Search for hotels based on location and dates.

**URL**: `/search`  
**Method**: `GET`  
**Query Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| location | String | City, province, or area name |
| check_in | String | Check-in date (YYYY-MM-DD) |
| check_out | String | Check-out date (YYYY-MM-DD) |

**Response Format**: Same as filter endpoint

### Get Hotel Details
Get details for a specific hotel.

**URL**: `/:id`  
**Method**: `GET`  
**Response Format**:
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "Grand Hyatt Jakarta",
    "city": "Jakarta",
    "province": "DKI Jakarta",
    "address": "Jl. M.H. Thamrin No.30, Jakarta Pusat",
    "property_type": "Hotel",
    "star_rating": 5,
    "description": "Luxury hotel in the heart of Jakarta",
    "amenities": {
      "breakfast": true,
      "wifi": true,
      "pool": true,
      "gym": true
    },
    "image_url": "https://example.com/grand-hyatt.jpg",
    "price_per_night": 2500000,
    "room_types": [
      {
        "id": 1,
        "name": "Deluxe Room",
        "capacity": 2,
        "price": 2500000,
        "description": "Spacious room with city view"
      },
      {
        "id": 2,
        "name": "Executive Suite",
        "capacity": 4,
        "price": 5000000,
        "description": "Luxury suite with separate living area"
      }
    ]
  }
}
```

### Get Room Types
Get available room types for a specific hotel.

**URL**: `/:id/rooms`  
**Method**: `GET`  
**Response Format**:
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Deluxe Room",
      "capacity": 2,
      "price": 2500000,
      "description": "Spacious room with city view"
    },
    {
      "id": 2,
      "name": "Executive Suite",
      "capacity": 4,
      "price": 5000000,
      "description": "Luxury suite with separate living area"
    }
  ]
}
```

### Check Availability
Check room availability for a specific hotel on given dates.

**URL**: `/:id/availability`  
**Method**: `GET`  
**Query Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| check_in | String | Check-in date (YYYY-MM-DD) |
| check_out | String | Check-out date (YYYY-MM-DD) |
| guests | Number | Number of guests |

**Response Format**:
```json
{
  "status": "success",
  "data": {
    "available": true,
    "available_rooms": [
      {
        "room_type_id": 1,
        "name": "Deluxe Room",
        "available_count": 5
      },
      {
        "room_type_id": 2,
        "name": "Executive Suite",
        "available_count": 2
      }
    ]
  }
}
```

### Get Pricing
Get pricing information for a specific hotel and room type.

**URL**: `/:id/pricing`  
**Method**: `GET`  
**Query Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| room_type_id | Number | ID of the room type |
| check_in | String | Check-in date (YYYY-MM-DD) |
| check_out | String | Check-out date (YYYY-MM-DD) |

**Response Format**:
```json
{
  "status": "success",
  "data": {
    "base_price_per_night": 2500000,
    "taxes_and_fees": 250000,
    "total_price": 5500000,
    "nights": 2,
    "currency": "IDR"
  }
}
```
