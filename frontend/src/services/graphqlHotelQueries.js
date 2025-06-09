import { gql } from '@apollo/client';

// Hotel detail query
export const GET_HOTEL_DETAIL = gql`
  query GetHotelDetail($id: ID!) {
    hotel(id: $id) {
      id
      name
      city
      province
      kabupaten
      postal_code
      property_type
      description
      rooms {
        id
        type
        price
        availability
      }
    }
  }
`;


// Hotel paginated list (copied from graphqlQueries.js)
export const GET_HOTELS = gql`
  query GetHotels($limit: Int, $page: Int) {
    hotels(limit: $limit, page: $page) {
      hotels {
        id
        name
        city
        province
        address
        star_rating
        property_type
        has_wifi
        has_breakfast
      }
      pagination {
        totalItems
        totalPages
        currentPage
        pageSize
      }
    }
  }
`;

// Hotel search by city/province (copied from graphqlQueries.js)
export const SEARCH_HOTELS = gql`
  query SearchHotels($city: String, $province: String) {
    searchHotels(city: $city, province: $province) {
      id
      name
      city
      province
      address
      star_rating
      property_type
      has_wifi
      has_breakfast
      rooms {
        id
        name
        size
        available
        price
      }
      pricing {
        room_type_id
        date
        price
      }
    }
  }
`;


export const FILTER_HOTELS = gql`
  query FilterHotels($filters: HotelFiltersInput, $sort: HotelSortInput, $pagination: PaginationInput) {
    filterHotels(filters: $filters, sort: $sort, pagination: $pagination) {
      hotels {
        id
        name
        city
        province
        country
        address
        postal_code
        star_rating
        property_type
        description
        amenities
        images
        has_wifi
        has_breakfast
        has_parking
        is_pet_friendly
        min_price_per_night
        max_price_per_night
      }
      pagination {
        totalItems
        totalPages
        currentPage
        pageSize
      }
    }
  }
`;

// See HotelList.js for expected filters, pagination, and response structure.

// Hotel availability (copied from graphqlQueries.js)
export const HOTEL_AVAILABILITY = gql`
  query HotelAvailability($id: ID, $check_in: String) {
    hotelAvailability(id: $id, check_in: $check_in) {
      id
      name
      size
      available
      price
    }
  }
`;

// Hotel pricing (copied from graphqlQueries.js)
export const HOTEL_PRICING = gql`
  query HotelPricing($id: ID, $check_in: String, $check_out: String) {
    hotelPricing(id: $id, check_in: $check_in, check_out: $check_out) {
      room_type_id
      date
      price
    }
  }
`;


