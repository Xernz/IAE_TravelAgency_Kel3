# Booking Service API Documentation

## Overview
The Booking Service API provides endpoints for managing bookings, including creating, retrieving, filtering, and canceling bookings for various travel services.

## Base URL
```
/api/bookings
```

## Endpoints

### List All Bookings
Retrieves all bookings ordered by creation date (newest first).

**URL**: `/`  
**Method**: `GET`  
**Response Format**:
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "user_id": 123,
      "booking_code": "BK12345678",
      "status": "confirmed",
      "payment_status": "paid",
      "total_amount": 2500000,
      "created_at": "2023-06-15T08:00:00",
      "updated_at": "2023-06-15T08:30:00",
      "item_type": "flight"
    },
    // More bookings...
  ]
}
```

### Filter Bookings
Filters bookings based on multiple criteria.

**URL**: `/filter`  
**Method**: `GET`  
**Query Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| user_id | Number | Filter by user ID |
| booking_code | String | Filter by booking code |
| status | String | Filter by status (e.g., "confirmed", "cancelled", "pending") |
| payment_status | String | Filter by payment status (e.g., "paid", "pending", "refunded") |
| item_type | String | Filter by item type (e.g., "flight", "hotel", "train", "local_travel") |
| min_total | Number | Minimum total amount in IDR |
| max_total | Number | Maximum total amount in IDR |
| start_date | String | Filter by start date (YYYY-MM-DD) |
| end_date | String | Filter by end date (YYYY-MM-DD) |
| sort_by | String | Field to sort by (e.g., "created_at", "total_amount", "status") |
| sort_order | String | Sort order ("ASC" or "DESC") |

**Response Format**:
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "user_id": 123,
      "booking_code": "BK12345678",
      "status": "confirmed",
      "payment_status": "paid",
      "total_amount": 2500000,
      "created_at": "2023-06-15T08:00:00",
      "updated_at": "2023-06-15T08:30:00",
      "item_type": "flight"
    },
    // More filtered bookings...
  ]
}
```

### Get User Bookings
Get all bookings for a specific user.

**URL**: `/user/:userId`  
**Method**: `GET`  
**Response Format**:
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "user_id": 123,
      "booking_code": "BK12345678",
      "status": "confirmed",
      "payment_status": "paid",
      "total_amount": 2500000,
      "created_at": "2023-06-15T08:00:00",
      "updated_at": "2023-06-15T08:30:00"
    },
    // More bookings for this user...
  ]
}
```

### Get Booking Details
Get details for a specific booking, including booking items.

**URL**: `/:id`  
**Method**: `GET`  
**Response Format**:
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "user_id": 123,
    "booking_code": "BK12345678",
    "status": "confirmed",
    "payment_status": "paid",
    "total_amount": 2500000,
    "created_at": "2023-06-15T08:00:00",
    "updated_at": "2023-06-15T08:30:00",
    "items": [
      {
        "id": 1,
        "booking_id": 1,
        "type": "flight",
        "ref_id": 456,
        "date": "2023-07-01",
        "details": {
          "flight_number": "GA123",
          "origin": "Jakarta",
          "destination": "Bali",
          "passengers": 2
        }
      },
      {
        "id": 2,
        "booking_id": 1,
        "type": "hotel",
        "ref_id": 789,
        "date": "2023-07-01",
        "details": {
          "hotel_name": "Grand Hyatt Bali",
          "check_in": "2023-07-01",
          "check_out": "2023-07-05",
          "room_type": "Deluxe Room",
          "guests": 2
        }
      }
    ]
  }
}
```

### Create Booking
Create a new booking with one or more booking items.

**URL**: `/`  
**Method**: `POST`  
**Request Body**:
```json
{
  "userId": 123,
  "items": [
    {
      "type": "flight",
      "refId": 456,
      "date": "2023-07-01",
      "details": {
        "flight_number": "GA123",
        "origin": "Jakarta",
        "destination": "Bali",
        "passengers": 2
      }
    },
    {
      "type": "hotel",
      "refId": 789,
      "date": "2023-07-01",
      "details": {
        "hotel_name": "Grand Hyatt Bali",
        "check_in": "2023-07-01",
        "check_out": "2023-07-05",
        "room_type": "Deluxe Room",
        "guests": 2
      }
    }
  ]
}
```

**Response Format**:
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "booking_code": "BK12345678"
  }
}
```

### Cancel Booking
Cancel a specific booking.

**URL**: `/:id/cancel`  
**Method**: `PUT`  
**Response Format**:
```json
{
  "status": "success",
  "message": "Booking cancelled successfully"
}
```
