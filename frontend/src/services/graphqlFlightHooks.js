import { useQuery, useMutation } from '@apollo/client';
import {
  GET_FLIGHT_DETAIL,
  GET_FLIGHTS,
  FLIGHT_PRICING,
  // Add other flight queries as needed
} from './graphqlFlightQueries';
import {
  CREATE_BOOKING,
  CANCEL_BOOKING,
  // Add other booking mutations as needed
} from './graphqlBookingQueries';

// Query Hooks
export function useFlights(filters = {}) {
  const {
    page = 1,
    limit = 10,
    sort_by,
    sort_order,
    origin_city,
    destination_city,
    origin_code,
    destination_code,
    airline_name,
    airline_code,
    flight_class,
    departure_date,
    min_price,
    max_price,
  } = filters;

  const filtersObj = {
    origin_city,
    destination_city,
    origin_code,
    destination_code,
    airline_name,
    airline_code,
    flight_class,
    departure_date,
    min_price: min_price ? parseFloat(min_price) : undefined,
    max_price: max_price ? parseFloat(max_price) : undefined,
  };
  Object.keys(filtersObj).forEach(key => filtersObj[key] === undefined && delete filtersObj[key]);

  const sort = {
    field: sort_by,
    direction: sort_order,
  };
  Object.keys(sort).forEach(key => sort[key] === undefined && delete sort[key]);

  const pagination = {
    page,
    limit,
  };
  Object.keys(pagination).forEach(key => pagination[key] === undefined && delete pagination[key]);

  const queryVariables = { filters: filtersObj, sort, pagination };

  return useQuery(GET_FLIGHTS, {
    variables: queryVariables,
    fetchPolicy: 'cache-and-network',
  });
}

export function useFlightDetail(id) {
  return useQuery(GET_FLIGHT_DETAIL, { variables: { id } });
}

export function useFlightPricing(id, check_in, check_out) {
  return useQuery(FLIGHT_PRICING, { variables: { id, check_in, check_out } });
}

// Mutation Hooks
export function useCreateFlightBooking(options = {}) {
  return useMutation(CREATE_BOOKING, options);
}

export function useCancelFlightBooking(options = {}) {
  return useMutation(CANCEL_BOOKING, options);
}
