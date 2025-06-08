# Local Travel Service API Documentation

## Overview
The Local Travel Service API provides endpoints for searching, filtering, and retrieving local travel options across Indonesia, including car rentals, tour packages, and local transportation.

## Base URL
```
/api/local-travel
```

## Endpoints

### List All Local Travel Options
Retrieves all available local travel options ordered by type and provider name.

**URL**: `/`  
**Method**: `GET`  
**Response Format**:
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "type": "Car Rental",
      "provider_name": "Trac Astra",
      "city": "Jakarta",
      "route": null,
      "capacity": 5,
      "has_ac": true,
      "has_wifi": false,
      "price": 500000,
      "description": "Toyota Avanza or similar",
      "image_url": "https://example.com/avanza.jpg"
    },
    {
      "id": 2,
      "type": "Tour Package",
      "provider_name": "Bali Adventure Tours",
      "city": "Bali",
      "route": "Ubud - Kintamani - Tegallalang",
      "capacity": 10,
      "has_ac": true,
      "has_wifi": true,
      "price": 850000,
      "description": "Full day tour of Ubud highlights with lunch",
      "image_url": "https://example.com/ubud-tour.jpg"
    },
    // More local travel options...
  ]
}
```

### Filter Local Travel Options
Filters local travel options based on multiple criteria.

**URL**: `/filter`  
**Method**: `GET`  
**Query Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| city | String | Filter by city (e.g., "Jakarta", "Bali") |
| type | String | Filter by type (e.g., "Car Rental", "Tour Package", "Local Transport") |
| provider_name | String | Filter by provider name |
| route | String | Filter by route description |
| min_capacity | Number | Minimum capacity |
| max_capacity | Number | Maximum capacity |
| has_ac | Boolean | Filter by AC availability (true/false) |
| has_wifi | Boolean | Filter by WiFi availability (true/false) |
| min_price | Number | Minimum price in IDR |
| max_price | Number | Maximum price in IDR |
| sort_by | String | Field to sort by (e.g., "price", "type", "provider_name") |
| sort_order | String | Sort order ("ASC" or "DESC") |

**Response Format**:
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "type": "Car Rental",
      "provider_name": "Trac Astra",
      "city": "Jakarta",
      "route": null,
      "capacity": 5,
      "has_ac": true,
      "has_wifi": false,
      "price": 500000,
      "description": "Toyota Avanza or similar",
      "image_url": "https://example.com/avanza.jpg"
    },
    // More filtered local travel options...
  ]
}
```

### Search Local Travel Options
Search for local travel options based on city or route.

**URL**: `/search`  
**Method**: `GET`  
**Query Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| city | String | City name |
| route | String | Route description |

**Response Format**: Same as filter endpoint

### Get Local Travel Details
Get details for a specific local travel option.

**URL**: `/:id`  
**Method**: `GET`  
**Response Format**:
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "type": "Car Rental",
    "provider_name": "Trac Astra",
    "city": "Jakarta",
    "route": null,
    "capacity": 5,
    "has_ac": true,
    "has_wifi": false,
    "price": 500000,
    "description": "Toyota Avanza or similar",
    "image_url": "https://example.com/avanza.jpg",
    "terms_and_conditions": "Driver's license required. Minimum rental period: 24 hours.",
    "included_items": ["Driver", "Fuel", "Insurance"],
    "excluded_items": ["Toll fees", "Parking fees"]
  }
}
```

### Get Local Travel Availability
Check availability for a specific local travel option on a given date.

**URL**: `/:id/availability`  
**Method**: `GET`  
**Query Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| date | String | Date (YYYY-MM-DD) |
| duration | Number | Duration in days (for rentals) or hours (for tours) |

**Response Format**:
```json
{
  "status": "success",
  "data": {
    "available": true,
    "units_available": 3,
    "next_available_date": null
  }
}
```

### Get Local Travel Pricing
Get pricing information for a specific local travel option.

**URL**: `/:id/pricing`  
**Method**: `GET`  
**Query Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| date | String | Date (YYYY-MM-DD) |
| duration | Number | Duration in days (for rentals) or hours (for tours) |
| participants | Number | Number of participants (for tours) |

**Response Format**:
```json
{
  "status": "success",
  "data": {
    "base_price": 500000,
    "duration_multiplier": 3,
    "additional_fees": 50000,
    "total_price": 1550000,
    "currency": "IDR",
    "price_breakdown": {
      "daily_rate": 500000,
      "duration": "3 days",
      "insurance": 50000
    }
  }
}
```
