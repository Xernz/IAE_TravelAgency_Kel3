// GraphQL schema and resolvers for Hotel Service, to be used in API Gateway
const { gql } = require('apollo-server-express');
const fetch = require('node-fetch');

const typeDefs = gql`
  type Hotel {
    id: ID!
    name: String!
    city: String
    province: String
    country: String # Added country
    address: String
    postal_code: String # Added postal_code
    star_rating: Float # Changed to Float for ratings like 4.5
    property_type: String
    description: String # Added description
    phone_number: String # Added phone_number
    email: String # Added email
    website: String # Added website
    amenities: [String] # Added list of amenities
    images: [String] # Added list of image URLs
    check_in_time: String
    check_out_time: String
    has_wifi: Boolean
    has_breakfast: Boolean
    has_parking: Boolean # Added parking
    is_pet_friendly: Boolean # Added pet friendly status
    rooms: [RoomType] # Detailed room types if available from this query
    # pricing: [Pricing] # Pricing might be too complex for a list view, often fetched separately
    # For simplicity in filterHotels, we might only return basic price range or average price
    min_price_per_night: Float
    max_price_per_night: Float
  }

  type RoomType {
    id: ID!
    hotel_id: ID!
    name: String
    description: String
    type_code: String # e.g. DBL, SGL, STE
    bed_type: String
    size_sqm: Float
    max_occupancy: Int
    price_per_night: Float # Average or base price
    amenities: [String]
    images: [String]
    # available: Int # Availability is dynamic, usually fetched separately
  }

  # Pricing is often complex and date-dependent, usually a separate query or part of booking process
  # type Pricing {
  #   room_type_id: ID!
  #   date: String!
  #   price: Float!
  #   currency: String!
  #   availability: Int
  # }

  input HotelFiltersInput {
    name: String # New: for searching by hotel name
    city: String
    province: String
    country: String
    property_type: String
    min_star_rating: Float
    max_star_rating: Float
    min_price: Float # Min price per night for a standard room
    max_price: Float # Max price per night for a standard room
    has_breakfast: Boolean
    has_wifi: Boolean
    has_parking: Boolean
    is_pet_friendly: Boolean
    amenities_include: [String] # Filter by hotels that have ALL specified amenities
    # room_size_min: Int # This might be too specific for general hotel filter, consider room type filters
  }

  enum SortOrder {
    ASC
    DESC
  }

  input HotelSortInput {
    sortBy: String # e.g., "star_rating", "price", "name"
    sortOrder: SortOrder
  }

  input PaginationInput {
    page: Int
    limit: Int
  }

  type PaginationInfo {
    totalItems: Int
    totalPages: Int
    currentPage: Int
    pageSize: Int
    hasNextPage: Boolean
    hasPrevPage: Boolean
  }

  type HotelsPage {
    hotels: [Hotel!]!
    pagination: PaginationInfo
  }

  type Query {
    hotels(limit: Int, page: Int): HotelsPage # Updated to return HotelsPage
    hotel(id: ID!): Hotel # Returns detailed info for one hotel
    searchHotels(city: String, province: String, name: String): [Hotel] # Simple search, might be deprecated by filterHotels
    
    filterHotels(
      filters: HotelFiltersInput
      sort: HotelSortInput
      pagination: PaginationInput
    ): HotelsPage # Updated to use inputs and return HotelsPage

    hotelAvailability(hotelId: ID!, checkInDate: String!, checkOutDate: String!): [RoomAvailability]
    hotelPricing(id: ID!, check_in: String, check_out: String): [Pricing] # Pricing might be part of booking flow
  }

  type RoomAvailability {
    roomTypeId: ID!
    roomTypeName: String
    date: String!
    availableCount: Int!
    price: Float # Price for this room type on this date
    currency: String
  }

  type Pricing {
    roomTypeId: ID
    price: Float
    currency: String
    date: String
  }

  type Mutation {
    # Example mutations, actual mutations depend on service capabilities
    # createHotelBooking(userId: ID!, hotelId: ID!, roomTypeId: ID!, checkInDate: String!, checkOutDate: String!, numberOfGuests: Int!): Booking
    decreaseRoomAvailability(hotelId: ID!, roomTypeId: ID!, date: String!, quantity: Int!): AvailabilityResponse
    increaseRoomAvailability(hotelId: ID!, roomTypeId: ID!, date: String!, quantity: Int!): AvailabilityResponse
  }

  type AvailabilityResponse {
    status: String!
    message: String
    affectedRows: Int
  }
`;

const HOTEL_SERVICE_URL = 'http://localhost:3003/api/hotels';

const resolvers = {
  Query: {
    async hotels(_, { limit, page }) {
      const queryParams = new URLSearchParams();
      if (limit) queryParams.append('limit', limit);
      if (page) queryParams.append('page', page);
      
      const url = `${HOTEL_SERVICE_URL}?${queryParams.toString()}`;
      console.log(`Fetching hotels from: ${url}`);

      try {
        const res = await fetch(url);
        if (!res.ok) {
          const errorBody = await res.text();
          console.error(`Hotel service request failed (hotels) with status ${res.status}: ${errorBody}`);
          throw new Error(`Failed to fetch hotels from service. Status: ${res.status}`);
        }
        const serviceResponse = await res.json();

        if (serviceResponse.status !== 'success' || !serviceResponse.data) {
          console.warn('Hotel service (hotels) did not return success or data:', serviceResponse);
          return { hotels: [], pagination: null };
        }

        const mappedHotels = serviceResponse.data.map(hotel => ({
          id: hotel.id,
          name: hotel.name,
          city: hotel.city || hotel.location || null,
          province: hotel.province || null,
          country: hotel.country || null,
          address: hotel.address || null,
          postal_code: hotel.postal_code || null,
          star_rating: hotel.star_rating !== undefined ? parseFloat(hotel.star_rating) : null,
          property_type: hotel.property_type || null,
          description: hotel.description || null,
          phone_number: hotel.phone_number || null,
          email: hotel.email || null,
          website: hotel.website || null,
          amenities: hotel.amenities || [],
          images: hotel.images || [],
          check_in_time: hotel.check_in_time || null,
          check_out_time: hotel.check_out_time || null,
          has_wifi: hotel.has_wifi,
          has_breakfast: hotel.has_breakfast,
          has_parking: hotel.has_parking,
          is_pet_friendly: hotel.is_pet_friendly,
          rooms: hotel.rooms ? hotel.rooms.map(room => ({
            id: room.id,
            hotel_id: hotel.id, // Assign parent hotel ID
            name: room.name || room.room_type_name || null,
            description: room.description || null,
            type_code: room.type_code || room.room_type_code || null,
            bed_type: room.bed_type || null,
            size_sqm: room.size_sqm !== undefined ? parseFloat(room.size_sqm) : null,
            max_occupancy: room.max_occupancy !== undefined ? parseInt(room.max_occupancy, 10) : null,
            price_per_night: room.price_per_night !== undefined ? parseFloat(room.price_per_night) : null,
            amenities: room.amenities || [],
            images: room.images || [],
          })) : [],
          min_price_per_night: hotel.min_price !== undefined ? parseFloat(hotel.min_price) : (hotel.min_price_per_night !== undefined ? parseFloat(hotel.min_price_per_night) : null),
          max_price_per_night: hotel.max_price !== undefined ? parseFloat(hotel.max_price) : (hotel.max_price_per_night !== undefined ? parseFloat(hotel.max_price_per_night) : null),
        }));

        const servicePagination = serviceResponse.pagination || {};
        const currentPage = parseInt(servicePagination.current_page || servicePagination.page, 10) || 1;
        const totalPages = parseInt(servicePagination.total_pages || servicePagination.pages, 10) || 0;

        const mappedPagination = {
          totalItems: parseInt(servicePagination.total_items || servicePagination.total, 10) || 0,
          totalPages: totalPages,
          currentPage: currentPage,
          pageSize: parseInt(servicePagination.per_page || servicePagination.limit, 10) || 0,
          hasNextPage: currentPage < totalPages,
          hasPrevPage: currentPage > 1,
        };

        return {
          hotels: mappedHotels,
          pagination: mappedPagination,
        };

      } catch (error) {
        console.error('Error in hotels resolver:', error);
        throw new Error('An error occurred while fetching hotels.');
      }
    },
    async hotel(_, { id }) {
      const url = `${HOTEL_SERVICE_URL}?${limit ? `limit=${limit}&` : ''}${page ? `page=${page}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status !== 'success') return [];
      // Map REST fields to GraphQL fields
      const hotelData = Array.isArray(data.data) ? data.data : (data.data && Array.isArray(data.data.hotels) ? data.data.hotels : []);
      return hotelData.map(hotel => ({
        id: hotel.id,
        name: hotel.name,
        city: hotel.location || null, // Map 'location' to 'city'
        province: null, // Not provided by REST
        address: null, // Not provided by REST
        star_rating: null, // Not provided by REST
        property_type: null, // Not provided by REST
        has_wifi: null, // Not provided by REST
        has_breakfast: null, // Not provided by REST
        rooms: [], // Not provided by REST
        pricing: [], // Not provided by REST
      }));
    },
    async hotel(_, { id }) {
      const res = await fetch(`${HOTEL_SERVICE_URL}/${id}`);
      const data = await res.json();
      if (data.status !== 'success' || !data.data) return null;
      const hotel = data.data;
      // Apply detailed mapping similar to 'hotels' resolver for consistency
      return {
        id: hotel.id,
        name: hotel.name,
        city: hotel.city || hotel.location || null,
        province: hotel.province || null,
        country: hotel.country || null,
        address: hotel.address || null,
        postal_code: hotel.postal_code || null,
        star_rating: hotel.star_rating !== undefined ? parseFloat(hotel.star_rating) : null,
        property_type: hotel.property_type || null,
        description: hotel.description || null,
        phone_number: hotel.phone_number || null,
        email: hotel.email || null,
        website: hotel.website || null,
        amenities: hotel.amenities || [],
        images: hotel.images || [],
        check_in_time: hotel.check_in_time || null,
        check_out_time: hotel.check_out_time || null,
        has_wifi: hotel.has_wifi,
        has_breakfast: hotel.has_breakfast,
        has_parking: hotel.has_parking,
        is_pet_friendly: hotel.is_pet_friendly,
        rooms: hotel.rooms ? hotel.rooms.map(room => ({
          id: room.id,
          hotel_id: hotel.id,
          name: room.name || room.room_type_name || null,
          description: room.description || null,
          type_code: room.type_code || room.room_type_code || null,
          bed_type: room.bed_type || null,
          size_sqm: room.size_sqm !== undefined ? parseFloat(room.size_sqm) : null,
          max_occupancy: room.max_occupancy !== undefined ? parseInt(room.max_occupancy, 10) : null,
          price_per_night: room.price_per_night !== undefined ? parseFloat(room.price_per_night) : null,
          amenities: room.amenities || [],
          images: room.images || [],
        })) : [],
        min_price_per_night: hotel.min_price !== undefined ? parseFloat(hotel.min_price) : (hotel.min_price_per_night !== undefined ? parseFloat(hotel.min_price_per_night) : null),
        max_price_per_night: hotel.max_price !== undefined ? parseFloat(hotel.max_price) : (hotel.max_price_per_night !== undefined ? parseFloat(hotel.max_price_per_night) : null),
      };
    },
    async searchHotels(_, { city, province, name }) {
      const queryParams = new URLSearchParams();
      if (city) queryParams.append('city', city);
      if (province) queryParams.append('province', province);
      if (name) queryParams.append('name', name); // Add name to query if provided

      const url = `${HOTEL_SERVICE_URL}/search?${queryParams.toString()}`;
      console.log(`Fetching searched hotels from: ${url}`);

      try {
        const res = await fetch(url);
        if (!res.ok) {
          const errorBody = await res.text();
          console.error(`Hotel service request failed (searchHotels) with status ${res.status}: ${errorBody}`);
          throw new Error(`Failed to fetch searched hotels from service. Status: ${res.status}`);
        }
        const serviceResponse = await res.json();

        if (serviceResponse.status !== 'success' || !serviceResponse.data) {
          console.warn('Hotel service (searchHotels) did not return success or data:', serviceResponse);
          return []; // Return empty array if no data or error
        }

        // Assuming serviceResponse.data is an array of hotels
        const hotelData = Array.isArray(serviceResponse.data) ? serviceResponse.data : [];
        return hotelData.map(hotel => ({
          id: hotel.id,
          name: hotel.name,
          city: hotel.city || hotel.location || null,
          province: hotel.province || null,
          country: hotel.country || null,
          address: hotel.address || null,
          postal_code: hotel.postal_code || null,
          star_rating: hotel.star_rating !== undefined ? parseFloat(hotel.star_rating) : null,
          property_type: hotel.property_type || null,
          description: hotel.description || null,
          phone_number: hotel.phone_number || null,
          email: hotel.email || null,
          website: hotel.website || null,
          amenities: hotel.amenities || [],
          images: hotel.images || [],
          check_in_time: hotel.check_in_time || null,
          check_out_time: hotel.check_out_time || null,
          has_wifi: typeof hotel.has_wifi === 'boolean' ? hotel.has_wifi : null,
          has_breakfast: typeof hotel.has_breakfast === 'boolean' ? hotel.has_breakfast : null,
          has_parking: typeof hotel.has_parking === 'boolean' ? hotel.has_parking : null,
          is_pet_friendly: typeof hotel.is_pet_friendly === 'boolean' ? hotel.is_pet_friendly : null,
          rooms: hotel.rooms ? hotel.rooms.map(room => ({
            id: room.id,
            hotel_id: hotel.id,
            name: room.name || room.room_type_name || null,
            description: room.description || null,
            type_code: room.type_code || room.room_type_code || null,
            bed_type: room.bed_type || null,
            size_sqm: room.size_sqm !== undefined ? parseFloat(room.size_sqm) : null,
            max_occupancy: room.max_occupancy !== undefined ? parseInt(room.max_occupancy, 10) : null,
            price_per_night: room.price_per_night !== undefined ? parseFloat(room.price_per_night) : null,
            amenities: room.amenities || [],
            images: room.images || [],
          })) : [],
          min_price_per_night: hotel.min_price !== undefined ? parseFloat(hotel.min_price) : (hotel.min_price_per_night !== undefined ? parseFloat(hotel.min_price_per_night) : null),
          max_price_per_night: hotel.max_price !== undefined ? parseFloat(hotel.max_price) : (hotel.max_price_per_night !== undefined ? parseFloat(hotel.max_price_per_night) : null),
        }));
      } catch (error) {
        console.error('Error in searchHotels resolver:', error);
        throw new Error('An error occurred while searching hotels.');
      }
    },
    async filterHotels(_, { filters, sort, pagination }) {
      const HOTEL_FILTER_URL = `${HOTEL_SERVICE_URL}/filter`;
      const queryParams = new URLSearchParams();

      if (filters) {
        // Map GraphQL filter names to potential service query param names if different
        // For now, assume they are the same or service handles variations
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            if (Array.isArray(value)) {
              value.forEach(v => queryParams.append(key, v)); // For array inputs like amenities_include
            } else if (String(value).trim() !== '') {
              queryParams.append(key, value);
            }
          }
        });
      }

      if (sort) {
        if (sort.sortBy) queryParams.append('sort_by', sort.sortBy);
        if (sort.sortOrder) queryParams.append('sort_order', sort.sortOrder);
      }

      if (pagination) {
        if (pagination.page) queryParams.append('page', pagination.page);
        if (pagination.limit) queryParams.append('limit', pagination.limit);
      }

      const url = `${HOTEL_FILTER_URL}?${queryParams.toString()}`;
      console.log(`Fetching filtered hotels from: ${url}`); // For debugging

      try {
        const res = await fetch(url);
        if (!res.ok) {
          const errorBody = await res.text();
          console.error(`Hotel service request failed (filterHotels) with status ${res.status}: ${errorBody}`);
          throw new Error(`Failed to fetch filtered hotels from service. Status: ${res.status}`);
        }
        const serviceResponse = await res.json();

        if (serviceResponse.status !== 'success' || !serviceResponse.data) {
          console.warn('Hotel service (filterHotels) did not return success or data:', serviceResponse);
          return { hotels: [], pagination: null };
        }

        const mappedHotels = serviceResponse.data.map(hotel => ({
          // Consistent mapping as in the 'hotels' resolver
          id: hotel.id,
          name: hotel.name,
          city: hotel.city || hotel.location || null,
          province: hotel.province || null,
          country: hotel.country || null,
          address: hotel.address || null,
          postal_code: hotel.postal_code || null,
          star_rating: hotel.star_rating !== undefined ? parseFloat(hotel.star_rating) : null,
          property_type: hotel.property_type || null,
          description: hotel.description || null,
          phone_number: hotel.phone_number || null,
          email: hotel.email || null,
          website: hotel.website || null,
          amenities: hotel.amenities || [],
          images: hotel.images || [],
          check_in_time: hotel.check_in_time || null,
          check_out_time: hotel.check_out_time || null,
          has_wifi: hotel.has_wifi,
          has_breakfast: hotel.has_breakfast,
          has_parking: hotel.has_parking,
          is_pet_friendly: hotel.is_pet_friendly,
          rooms: hotel.rooms ? hotel.rooms.map(room => ({
            id: room.id,
            hotel_id: hotel.id,
            name: room.name || room.room_type_name || null,
            description: room.description || null,
            type_code: room.type_code || room.room_type_code || null,
            bed_type: room.bed_type || null,
            size_sqm: room.size_sqm !== undefined ? parseFloat(room.size_sqm) : null,
            max_occupancy: room.max_occupancy !== undefined ? parseInt(room.max_occupancy, 10) : null,
            price_per_night: room.price_per_night !== undefined ? parseFloat(room.price_per_night) : null,
            amenities: room.amenities || [],
            images: room.images || [],
          })) : [],
          min_price_per_night: hotel.min_price !== undefined ? parseFloat(hotel.min_price) : (hotel.min_price_per_night !== undefined ? parseFloat(hotel.min_price_per_night) : null),
          max_price_per_night: hotel.max_price !== undefined ? parseFloat(hotel.max_price) : (hotel.max_price_per_night !== undefined ? parseFloat(hotel.max_price_per_night) : null),
        }));

        const servicePagination = serviceResponse.pagination || {};
        const currentPage = parseInt(servicePagination.current_page || servicePagination.page, 10) || 1;
        const totalPages = parseInt(servicePagination.total_pages || servicePagination.pages, 10) || 0;

        const mappedPagination = {
          totalItems: parseInt(servicePagination.total_items || servicePagination.total, 10) || 0,
          totalPages: totalPages,
          currentPage: currentPage,
          pageSize: parseInt(servicePagination.per_page || servicePagination.limit, 10) || 0,
          hasNextPage: currentPage < totalPages,
          hasPrevPage: currentPage > 1,
        };

        return {
          hotels: mappedHotels,
          pagination: mappedPagination,
        };
      } catch (error) {
        console.error('Error in filterHotels resolver:', error);
        throw new Error('An error occurred while fetching filtered hotels.');
      }
    },
    async hotelAvailability(_, { id, check_in }) {
      let url = `${HOTEL_SERVICE_URL}/filter?`;
      Object.entries(args).forEach(([key, value]) => {
        if (value !== undefined && value !== null) url += `${key}=${encodeURIComponent(value)}&`;
      });
      const res = await fetch(url);
      const data = await res.json();
      if (data.status !== 'success') return [];
      return data.data;
    },
    async hotelAvailability(_, { hotelId, checkInDate, checkOutDate }) {
      // This resolver needs to be adapted based on how the service provides availability for a date range and multiple room types.
      // The current service endpoint /:id/availability?check_in=... seems to be for one day and might not directly map.
      // For now, let's assume a conceptual endpoint or adapt if the service has a better one.
      // This is a placeholder and likely needs significant adjustment based on actual service capabilities for date ranges.
      const queryParams = new URLSearchParams();
      if (checkInDate) queryParams.append('check_in_date', checkInDate);
      if (checkOutDate) queryParams.append('check_out_date', checkOutDate); // Assuming service supports date range

      const url = `${HOTEL_SERVICE_URL}/${hotelId}/room_availability_range?${queryParams.toString()}`;
      console.log(`Fetching hotel room availability from: ${url}`);

      try {
        const res = await fetch(url);
        if (!res.ok) {
          const errorBody = await res.text();
          console.error(`Hotel service request failed (hotelAvailability) with status ${res.status}: ${errorBody}`);
          throw new Error(`Failed to fetch hotel availability. Status: ${res.status}`);
        }
        const serviceResponse = await res.json();
        if (serviceResponse.status !== 'success' || !serviceResponse.data) {
          console.warn('Hotel service (hotelAvailability) did not return success or data:', serviceResponse);
          return [];
        }
        // Assuming serviceResponse.data is an array of objects matching RoomAvailability type
        return serviceResponse.data.map(avail => ({
          roomTypeId: avail.room_type_id,
          roomTypeName: avail.room_type_name,
          date: avail.date,
          availableCount: parseInt(avail.available_count || avail.available_rooms, 10),
          price: parseFloat(avail.price),
          currency: avail.currency
        }));
      } catch (error) {
        console.error('Error in hotelAvailability resolver:', error);
        throw new Error('An error occurred while fetching hotel availability.');
      }
    },
    async hotelPricing(_, { id, check_in, check_out }) {
      const url = `${HOTEL_SERVICE_URL}/${id}/availability?check_in=${encodeURIComponent(check_in)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status !== 'success') return [];
      return data.data;
    },
    async hotelPricing(_, { id, check_in, check_out }) {
      const url = `${HOTEL_SERVICE_URL}/${id}/pricing?check_in=${encodeURIComponent(check_in)}&check_out=${encodeURIComponent(check_out)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status !== 'success') return [];
      return data.data;
    }
  },
  Mutation: {
    async decreaseRoomAvailability(_, { hotelId, roomTypeId, date, quantity }) {
      if (!hotelId || !roomTypeId || !date || !quantity) {
        throw new Error('hotelId, roomTypeId, date, and quantity are required');
      }
      try {
        const url = `${HOTEL_SERVICE_URL}/${hotelId}/availability/decrease`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ room_type_id: roomTypeId, date, quantity })
        });
        const data = await res.json();
        if (data.status !== 'success') throw new Error(data.message || 'Failed to decrease room availability');
        return data;
      } catch (err) {
        throw new Error('Decrease room availability failed: ' + err.message);
      }
    },
    async increaseRoomAvailability(_, { hotelId, roomTypeId, date, quantity }) {
      if (!hotelId || !roomTypeId || !date || !quantity) {
        throw new Error('hotelId, roomTypeId, date, and quantity are required');
      }
      try {
        const url = `${HOTEL_SERVICE_URL}/${hotelId}/availability/increase`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ room_type_id: roomTypeId, date, quantity })
        });
        const data = await res.json();
        if (data.status !== 'success') throw new Error(data.message || 'Failed to increase room availability');
        return data;
      } catch (err) {
        throw new Error('Increase room availability failed: ' + err.message);
      }
    }
  }
};

module.exports = { typeDefs, resolvers };
