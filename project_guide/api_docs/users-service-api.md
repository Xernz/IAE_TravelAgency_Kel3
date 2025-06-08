# Users Service API Documentation

## Overview
The Users Service API provides endpoints for user management, including registration, authentication, profile management, and user filtering for the Indonesian Travel Agency system.

## Base URL
```
/api/users
```

## Endpoints

### List All Users
Retrieves all users ordered by name (excludes sensitive information like passwords).

**URL**: `/`  
**Method**: `GET`  
**Response Format**:
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "full_name": "Budi Santoso",
      "phone_number": "+6281234567890",
      "birth_date": "1990-05-15",
      "no_nik": "3171051505900001",
      "created_at": "2023-01-15T08:00:00",
      "updated_at": "2023-01-15T08:00:00"
    },
    // More users...
  ]
}
```

### Filter Users
Filters users based on multiple criteria.

**URL**: `/filter`  
**Method**: `GET`  
**Query Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| email | String | Filter by email (partial match) |
| full_name | String | Filter by full name (partial match) |
| phone_number | String | Filter by phone number (partial match) |
| min_age | Number | Minimum age in years |
| max_age | Number | Maximum age in years |
| start_date | String | Filter by registration start date (YYYY-MM-DD) |
| end_date | String | Filter by registration end date (YYYY-MM-DD) |
| sort_by | String | Field to sort by (e.g., "full_name", "email", "created_at") |
| sort_order | String | Sort order ("ASC" or "DESC") |

**Response Format**:
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "full_name": "Budi Santoso",
      "phone_number": "+6281234567890",
      "birth_date": "1990-05-15",
      "no_nik": "3171051505900001",
      "created_at": "2023-01-15T08:00:00",
      "updated_at": "2023-01-15T08:00:00"
    },
    // More filtered users...
  ]
}
```

### Register
Register a new user.

**URL**: `/register`  
**Method**: `POST`  
**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "full_name": "Budi Santoso",
  "phone_number": "+6281234567890",
  "birth_date": "1990-05-15",
  "no_nik": "3171051505900001"
}
```

**Response Format**:
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "Budi Santoso",
    "phone_number": "+6281234567890",
    "birth_date": "1990-05-15",
    "no_nik": "3171051505900001"
  }
}
```

### Login
Authenticate a user.

**URL**: `/login`  
**Method**: `POST`  
**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response Format**:
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "Budi Santoso",
    "token": "jwt-token-here"
  }
}
```

### Get User Profile
Get profile information for a specific user.

**URL**: `/:id`  
**Method**: `GET`  
**Response Format**:
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "Budi Santoso",
    "phone_number": "+6281234567890",
    "birth_date": "1990-05-15",
    "no_nik": "3171051505900001",
    "created_at": "2023-01-15T08:00:00",
    "updated_at": "2023-01-15T08:00:00"
  }
}
```

### Update User Profile
Update profile information for a specific user.

**URL**: `/:id`  
**Method**: `PUT`  
**Request Body**:
```json
{
  "full_name": "Budi Santoso Updated",
  "phone_number": "+6287654321098",
  "birth_date": "1990-05-15",
  "no_nik": "3171051505900001"
}
```

**Response Format**:
```json
{
  "status": "success",
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "Budi Santoso Updated",
    "phone_number": "+6287654321098",
    "birth_date": "1990-05-15",
    "no_nik": "3171051505900001"
  }
}
```

### Delete User
Delete a specific user.

**URL**: `/:id`  
**Method**: `DELETE`  
**Response Format**:
```json
{
  "status": "success",
  "message": "User deleted successfully"
}
```
