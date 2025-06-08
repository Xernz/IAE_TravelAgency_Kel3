# Train Service API Documentation

## Overview
The Train Service API provides endpoints for searching, filtering, and retrieving train information for Indonesian railways across the archipelago.

## Base URL
```
/api/trains
```

## Endpoints

### List All Trains
Retrieves all available trains ordered by departure time.

**URL**: `/`  
**Method**: `GET`  
**Response Format**:
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "train_number": "KA123",
      "train_name": "Argo Bromo Anggrek",
      "operator": "PT KAI",
      "origin_station": "Gambir",
      "origin_city": "Jakarta",
      "destination_station": "Surabaya Pasar Turi",
      "destination_city": "Surabaya",
      "departure_time": "2023-06-15T08:00:00",
      "arrival_time": "2023-06-15T16:30:00",
      "duration_minutes": 510,
      "train_class": "Executive",
      "price": 350000,
      "available_seats": 80
    },
    // More trains...
  ]
}
```

### Filter Trains
Filters trains based on multiple criteria.

**URL**: `/filter`  
**Method**: `GET`  
**Query Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| origin_station | String | Filter by origin station (e.g., "Gambir") |
| destination_station | String | Filter by destination station (e.g., "Bandung") |
| origin_city | String | Filter by origin city (e.g., "Jakarta") |
| destination_city | String | Filter by destination city (e.g., "Bandung") |
| train_class | String | Filter by train class (e.g., "Executive", "Business", "Economy") |
| operator | String | Filter by operator (e.g., "PT KAI") |
| min_duration | Number | Minimum duration in minutes |
| max_duration | Number | Maximum duration in minutes |
| min_price | Number | Minimum price in IDR |
| max_price | Number | Maximum price in IDR |
| departure_date | String | Filter by departure date (YYYY-MM-DD) |
| sort_by | String | Field to sort by (e.g., "price", "departure_time", "duration_minutes") |
| sort_order | String | Sort order ("ASC" or "DESC") |

**Response Format**:
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "train_number": "KA123",
      "train_name": "Argo Bromo Anggrek",
      "operator": "PT KAI",
      "origin_station": "Gambir",
      "origin_city": "Jakarta",
      "destination_station": "Surabaya Pasar Turi",
      "destination_city": "Surabaya",
      "departure_time": "2023-06-15T08:00:00",
      "arrival_time": "2023-06-15T16:30:00",
      "duration_minutes": 510,
      "train_class": "Executive",
      "price": 350000,
      "available_seats": 80
    },
    // More filtered trains...
  ]
}
```

### Search Trains
Search for trains based on origin and destination.

**URL**: `/search`  
**Method**: `GET`  
**Query Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| origin | String | Origin station or city |
| destination | String | Destination station or city |
| date | String | Departure date (YYYY-MM-DD) |

**Response Format**: Same as filter endpoint

### Get Train Details
Get details for a specific train.

**URL**: `/:id`  
**Method**: `GET`  
**Response Format**:
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "train_number": "KA123",
    "train_name": "Argo Bromo Anggrek",
    "operator": "PT KAI",
    "origin_station": "Gambir",
    "origin_city": "Jakarta",
    "destination_station": "Surabaya Pasar Turi",
    "destination_city": "Surabaya",
    "departure_time": "2023-06-15T08:00:00",
    "arrival_time": "2023-06-15T16:30:00",
    "duration_minutes": 510,
    "train_class": "Executive",
    "price": 350000,
    "available_seats": 80,
    "stops": [
      {
        "station": "Cirebon",
        "arrival_time": "2023-06-15T10:30:00",
        "departure_time": "2023-06-15T10:40:00"
      },
      {
        "station": "Semarang Tawang",
        "arrival_time": "2023-06-15T13:15:00",
        "departure_time": "2023-06-15T13:30:00"
      }
    ]
  }
}
```

### Get Train Availability
Check availability for a specific train on a given date.

**URL**: `/:id/availability`  
**Method**: `GET`  
**Query Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| date | String | Train date (YYYY-MM-DD) |

**Response Format**:
```json
{
  "status": "success",
  "data": {
    "available": true,
    "seats_available": 80,
    "seat_classes": [
      {
        "class": "Executive",
        "available": 40
      },
      {
        "class": "Business",
        "available": 40
      }
    ]
  }
}
```

### Get Train Pricing
Get pricing information for a specific train.

**URL**: `/:id/pricing`  
**Method**: `GET`  
**Query Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| class | String | Train class (optional) |

**Response Format**:
```json
{
  "status": "success",
  "data": {
    "base_price": 350000,
    "service_fee": 7500,
    "total_price": 357500,
    "currency": "IDR"
  }
}
```
