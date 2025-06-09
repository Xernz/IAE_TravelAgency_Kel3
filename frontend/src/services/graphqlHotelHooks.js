import { useQuery, useMutation } from '@apollo/client';
import {
  GET_HOTEL_DETAIL,
  FILTER_HOTELS,
  SEARCH_HOTELS,
  HOTEL_AVAILABILITY,
  HOTEL_PRICING,
  // Add other hotel queries as needed
} from './graphqlHotelQueries';
import {
  CREATE_BOOKING,
  CANCEL_BOOKING,
  // Add other booking mutations as needed
} from './graphqlBookingQueries';

// Query Hooks
export function useHotels(filters = {}) {
  // Adapted from centralized graphql.js
  const {
    page = 1,
    limit = 10,
    sort_by,
    sort_order,
    name,
    city,
    province,
    country,
    property_type,
    min_star_rating,
    max_star_rating,
    amenities_include,
    is_pet_friendly,
  } = filters;

  const filtersObj = {
    name,
    city,
    province,
    country,
    property_type,
    min_star_rating: min_star_rating ? parseFloat(min_star_rating) : undefined,
    max_star_rating: max_star_rating ? parseFloat(max_star_rating) : undefined,
    amenities_include,
    is_pet_friendly,
  };
  Object.keys(filtersObj).forEach(key => filtersObj[key] === undefined && delete filtersObj[key]);

  const sort = {
    sortBy: sort_by,
    sortOrder: sort_order,
  };
  Object.keys(sort).forEach(key => sort[key] === undefined && delete sort[key]);

  const pagination = {
    page,
    limit,
  };
  Object.keys(pagination).forEach(key => pagination[key] === undefined && delete pagination[key]);

  const queryVariables = { filters: filtersObj, sort, pagination };

  return useQuery(FILTER_HOTELS, {
    variables: queryVariables,
    fetchPolicy: 'cache-and-network',
  });
}

export function useHotelDetail(id) {
  return useQuery(GET_HOTEL_DETAIL, { variables: { id } });
}

export function useHotelPricing(id, check_in, check_out) {
  return useQuery(HOTEL_PRICING, { variables: { id, check_in, check_out } });
}

export function useHotelAvailability(id, check_in) {
  return useQuery(HOTEL_AVAILABILITY, { variables: { id, check_in } });
}

export function useSearchHotels(city, province) {
  return useQuery(SEARCH_HOTELS, { variables: { city, province } });
}

// Mutation Hooks
export function useCreateHotelBooking(options = {}) {
  return useMutation(CREATE_BOOKING, options);
}

export function useCancelHotelBooking(options = {}) {
  return useMutation(CANCEL_BOOKING, options);
}
