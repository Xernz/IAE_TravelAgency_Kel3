import { useQuery, useMutation } from '@apollo/client';
import {
  GET_LOCAL_TRAVEL_DETAIL,
  GET_LOCAL_TRAVEL,
  LOCAL_TRAVEL_PRICING,
  // Add other local travel queries as needed
} from './graphqlLocalTravelQueries';
import {
  CREATE_BOOKING,
  CANCEL_BOOKING,
  // Add other booking mutations as needed
} from './graphqlBookingQueries';

// Query Hooks
export function useLocalTravels(filters = {}) {
  const {
    page = 1,
    limit = 10,
    sort_by,
    sort_order,
    origin_city,
    destination_city,
    origin_province,
    destination_province,
    origin_kabupaten,
    destination_kabupaten,
    date,
    type,
    operator_name,
    provider,
    min_capacity,
    max_capacity,
    amenities_include_any,
    amenities_include_all,
    min_price,
    max_price,
  } = filters;

  const filtersObj = {
    origin_city,
    destination_city,
    origin_province,
    destination_province,
    origin_kabupaten,
    destination_kabupaten,
    date,
    type,
    operator_name,
    provider,
    min_capacity,
    max_capacity,
    amenities_include_any,
    amenities_include_all,
    min_price: min_price ? parseFloat(min_price) : undefined,
    max_price: max_price ? parseFloat(max_price) : undefined,
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

  return useQuery(GET_LOCAL_TRAVEL, {
    variables: queryVariables,
    fetchPolicy: 'cache-and-network',
  });
}

export function useLocalTravelDetail(id) {
  return useQuery(GET_LOCAL_TRAVEL_DETAIL, { variables: { id } });
}

export function useLocalTravelPricing(id, check_in, check_out) {
  return useQuery(LOCAL_TRAVEL_PRICING, { variables: { id, check_in, check_out } });
}

// Mutation Hooks
export function useCreateLocalTravelBooking(options = {}) {
  return useMutation(CREATE_BOOKING, options);
}

export function useCancelLocalTravelBooking(options = {}) {
  return useMutation(CANCEL_BOOKING, options);
}
