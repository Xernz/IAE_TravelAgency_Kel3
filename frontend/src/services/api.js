/**
 * API service for making requests to the backend
 */

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Make a GET request to the API
 * 
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Query parameters
 * @returns {Promise} - Promise with response data
 */
export const get = async (endpoint, params = {}) => {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  
  // Add query parameters
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.append(key, params[key]);
    }
  });
  
  try {
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

/**
 * Make a POST request to the API
 * 
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request body data
 * @returns {Promise} - Promise with response data
 */
export const post = async (endpoint, data = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

/**
 * Flight service API calls
 */
export const flightService = {
  // Get all flights with pagination
  getAllFlights: (page = 1, limit = 10) => {
    return get('/flights', { page, limit });
  },
  
  // Filter flights with pagination
  filterFlights: (filters = {}, page = 1, limit = 10) => {
    return get('/flights/filter', { ...filters, page, limit });
  },
  
  // Get flight details
  getFlightDetails: (id) => {
    return get(`/flights/${id}`);
  }
};

/**
 * Hotel service API calls
 */
export const hotelService = {
  // Get all hotels with pagination
  getAllHotels: (page = 1, limit = 10) => {
    return get('/hotels', { page, limit });
  },
  
  // Filter hotels with pagination
  filterHotels: (filters = {}, page = 1, limit = 10) => {
    // Extract filters explicitly to ensure only non-empty values are sent
    const {
      city,
      province,
      kabupaten,
      postal_code,
      local_area,
      name,
      star_rating,
      min_price,
      max_price,
      accommodation_type,
      price_category,
      amenities,
      has_wifi,
      has_pool,
      has_parking,
      has_restaurant,
      has_ac,
      has_breakfast,
      sort_by,
      sort_order
    } = filters;
    
    // Build query parameters with only non-empty values
    const queryParams = {
      page,
      limit,
      sort_by: sort_by || 'name',
      sort_order: sort_order || 'ASC'
    };
    
    // Add non-empty filters to query params
    if (city) queryParams.city = city;
    if (province) queryParams.province = province;
    if (kabupaten) queryParams.kabupaten = kabupaten;
    if (postal_code) queryParams.postal_code = postal_code;
    if (local_area) queryParams.local_area = local_area;
    if (name) queryParams.name = name;
    if (star_rating) queryParams.star_rating = star_rating;
    if (min_price) queryParams.min_price = min_price;
    if (max_price) queryParams.max_price = max_price;
    if (accommodation_type) queryParams.accommodation_type = accommodation_type;
    if (price_category) queryParams.price_category = price_category;
    if (amenities) queryParams.amenities = amenities;
    
    // Boolean filters
    if (has_wifi) queryParams.has_wifi = has_wifi;
    if (has_pool) queryParams.has_pool = has_pool;
    if (has_parking) queryParams.has_parking = has_parking;
    if (has_restaurant) queryParams.has_restaurant = has_restaurant;
    if (has_ac) queryParams.has_ac = has_ac;
    if (has_breakfast) queryParams.has_breakfast = has_breakfast;
    
    return get('/hotels/filter', queryParams);
  },
  
  // Get hotel details
  getHotelDetails: (id) => {
    return get(`/hotels/${id}`);
  }
};

/**
 * Train service API calls
 */
export const trainService = {
  // Get all trains with pagination
  getAllTrains: (page = 1, limit = 10) => {
    return get('/trains', { page, limit });
  },
  
  // Filter trains with pagination
  filterTrains: (filters = {}, page = 1, limit = 10) => {
    // Prepare filter parameters with Indonesian-specific fields
    const filterParams = {
      page,
      limit,
      sort_by: filters.sort_by || 'departure_time',
      sort_order: filters.sort_order || 'ASC'
    };
    
    // Add Indonesian-specific filters if they exist
    if (filters.origin_city) filterParams.origin_city = filters.origin_city;
    if (filters.destination_city) filterParams.destination_city = filters.destination_city;
    if (filters.origin_province) filterParams.origin_province = filters.origin_province;
    if (filters.destination_province) filterParams.destination_province = filters.destination_province;
    if (filters.origin_station) filterParams.origin_station = filters.origin_station;
    if (filters.destination_station) filterParams.destination_station = filters.destination_station;
    if (filters.train_class) filterParams.train_class = filters.train_class;
    if (filters.subclass) filterParams.subclass = filters.subclass;
    if (filters.train_type) filterParams.train_type = filters.train_type;
    if (filters.operator) filterParams.operator = filters.operator;
    if (filters.departure_date) filterParams.departure_date = filters.departure_date;
    if (filters.min_price) filterParams.min_price = filters.min_price;
    if (filters.max_price) filterParams.max_price = filters.max_price;
    if (filters.price_category) filterParams.price_category = filters.price_category;
    
    return get('/trains/filter', filterParams);
  },
  
  // Get train details
  getTrainDetails: (id) => {
    return get(`/trains/${id}`);
  }
};

/**
 * Local travel service API calls
 */
export const localTravelService = {
  // Get all local travel options with pagination
  getAllLocalTravel: (page = 1, limit = 10) => {
    return get('/local-travel', { page, limit });
  },
  
  // Filter local travel options with pagination
  filterLocalTravel: (filters = {}, page = 1, limit = 10) => {
    // Create a clean filter object with only non-empty values
    const filterParams = {
      page,
      limit,
      sort_by: filters.sort_by || 'type',
      sort_order: filters.sort_order || 'ASC'
    };
    
    // Add Indonesian-specific filters if they exist
    if (filters.city) filterParams.city = filters.city;
    if (filters.province) filterParams.province = filters.province;
    if (filters.district) filterParams.district = filters.district;
    if (filters.type) filterParams.type = filters.type;
    if (filters.provider_name) filterParams.provider_name = filters.provider_name;
    if (filters.route) filterParams.route = filters.route;
    if (filters.min_capacity) filterParams.min_capacity = filters.min_capacity;
    if (filters.max_capacity) filterParams.max_capacity = filters.max_capacity;
    if (filters.has_ac) filterParams.has_ac = filters.has_ac;
    if (filters.has_wifi) filterParams.has_wifi = filters.has_wifi;
    if (filters.min_price) filterParams.min_price = filters.min_price;
    if (filters.max_price) filterParams.max_price = filters.max_price;
    if (filters.service_category) filterParams.service_category = filters.service_category;
    if (filters.vehicle_model) filterParams.vehicle_model = filters.vehicle_model;
    
    return get('/local-travel/filter', filterParams);
  },
  
  // Get local travel details
  getLocalTravelDetails: (id) => {
    return get(`/local-travel/${id}`);
  }
};

/**
 * Booking service API calls
 */
export const bookingService = {
  // Get all bookings with pagination
  getAllBookings: (page = 1, limit = 10) => {
    return get('/bookings', { page, limit });
  },
  
  // Filter bookings with pagination
  filterBookings: (filters = {}, page = 1, limit = 10) => {
    // Extract filters explicitly to ensure only non-empty values are sent
    const {
      booking_id,
      user_id,
      service_type, // flight, hotel, train, local_travel
      service_id,
      status,
      province, // Indonesian province
      kabupaten, // Indonesian district
      city,
      date_from,
      date_to,
      payment_status,
      price_category, // Regular, Promo, Peak Season
      sort_by,
      sort_order
    } = filters;
    
    // Build query parameters with only non-empty values
    const queryParams = {
      page,
      limit,
      sort_by: sort_by || 'created_at',
      sort_order: sort_order || 'DESC'
    };
    
    // Add non-empty filters to query params
    if (booking_id) queryParams.booking_id = booking_id;
    if (user_id) queryParams.user_id = user_id;
    if (service_type) queryParams.service_type = service_type;
    if (service_id) queryParams.service_id = service_id;
    if (status) queryParams.status = status;
    if (province) queryParams.province = province;
    if (kabupaten) queryParams.kabupaten = kabupaten;
    if (city) queryParams.city = city;
    if (date_from) queryParams.date_from = date_from;
    if (date_to) queryParams.date_to = date_to;
    if (payment_status) queryParams.payment_status = payment_status;
    if (price_category) queryParams.price_category = price_category;
    
    return get('/bookings/filter', queryParams);
  },
  
  // Create a new booking
  createBooking: (bookingData) => {
    // Ensure Indonesian-specific fields are included if available
    const enhancedBookingData = {
      ...bookingData,
      // Add metadata for Indonesian context if not already included
      metadata: {
        ...bookingData.metadata,
        language: bookingData.metadata?.language || 'id', // Default to Indonesian
        currency: bookingData.metadata?.currency || 'IDR', // Default to Indonesian Rupiah
      }
    };
    
    return post('/bookings', enhancedBookingData);
  },
  
  // Get booking details
  getBookingDetails: (id) => {
    return get(`/bookings/${id}`);
  },
  
  // Update booking status
  updateBookingStatus: (id, status) => {
    return post(`/bookings/${id}/status`, { status });
  },
  
  // Cancel booking
  cancelBooking: (id, reason) => {
    return post(`/bookings/${id}/cancel`, { reason });
  }
};

/**
 * User service API calls
 */
export const userService = {
  // Get all users with pagination
  getAllUsers: (page = 1, limit = 10) => {
    return get('/users', { page, limit });
  },
  
  // Filter users with pagination
  filterUsers: (filters = {}, page = 1, limit = 10) => {
    return get('/users/filter', { ...filters, page, limit });
  },
};
