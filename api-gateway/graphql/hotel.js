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
  }
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
        console.log('Hotel resolver fetch status:', res.status);
        if (!res.ok) {
          const errorBody = await res.text();
          console.error(`Hotel service request failed (hotels) with status ${res.status}: ${errorBody}`);
          throw new Error(`Failed to fetch hotels from service. Status: ${res.status}`);
        }
        const serviceResponse = await res.json();
        console.log('Hotel resolver serviceResponse:', JSON.stringify(serviceResponse, null, 2));

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
        if (error.response) {
          console.error('Error response:', error.response.status, error.response.statusText);
        }
        if (error.stack) {
          console.error('Error stack:', error.stack);
        }
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
    async filterHotels(_, { filters, sort, pagination }) {
      const HOTEL_FILTER_URL = `${HOTEL_SERVICE_URL}/filter`;
      const queryParams = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            if (Array.isArray(value)) {
              value.forEach(v => queryParams.append(key, v));
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
      const queryParams = new URLSearchParams();
      if (check_in) queryParams.append('check_in', check_in);
      if (check_out) queryParams.append('check_out', check_out);
      const url = `${HOTEL_SERVICE_URL}/${id}/pricing?${queryParams.toString()}`;
      try {
        const res = await fetch(url);
        if (!res.ok) {
          const errorBody = await res.text();
          console.error(`Hotel service request failed (hotelPricing) with status ${res.status}: ${errorBody}`);
          throw new Error(`Failed to fetch hotel pricing from service. Status: ${res.status}`);
        }
        const serviceResponse = await res.json();
        if (serviceResponse.status !== 'success' || !serviceResponse.data) {
          return [];
        }
        return Array.isArray(serviceResponse.data)
          ? serviceResponse.data.map(price => ({
              roomTypeId: price.room_type_id || price.roomTypeId || null,
              price: price.price,
              currency: price.currency || 'IDR',
              date: price.date || null,
            }))
          : [];
      } catch (error) {
        throw new Error('An error occurred while fetching hotel pricing: ' + error.message);
      }
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
