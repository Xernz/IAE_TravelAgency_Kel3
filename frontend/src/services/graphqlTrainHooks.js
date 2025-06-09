import { useQuery, useMutation } from '@apollo/client';
import {
  GET_TRAIN_DETAIL,
  GET_TRAINS,
  TRAIN_PRICING,
  // Add other train queries as needed
} from './graphqlTrainQueries';
import {
  CREATE_BOOKING,
  CANCEL_BOOKING,
  // Add other booking mutations as needed
} from './graphqlBookingQueries';

// Query Hooks
export function useTrains(filters = {}) {
  const {
    page = 1,
    limit = 10,
    sort_by,
    sort_order,
    origin_station_name,
    destination_station_name,
    origin_station_code,
    destination_station_code,
    departure_date,
    train_class,
    sub_class,
    min_price,
    max_price,
    operator_name,
    train_type,
    origin_city,
    destination_city,
    origin_province,
    destination_province
  } = filters;

  const queryVariables = {
    origin_station_name,
    destination_station_name,
    origin_station_code,
    destination_station_code,
    departure_date,
    train_class,
    sub_class,
    min_price: min_price ? parseFloat(min_price) : undefined,
    max_price: max_price ? parseFloat(max_price) : undefined,
    operator_name,
    train_type,
    origin_city,
    destination_city,
    origin_province,
    destination_province,
    sort_by,
    sort_order,
    page,
    limit
  };
  Object.keys(queryVariables).forEach(key => queryVariables[key] === undefined && delete queryVariables[key]);

  return useQuery(GET_TRAINS, {
    variables: queryVariables,
    fetchPolicy: 'cache-and-network',
  });
}

export function useTrainDetail(id) {
  return useQuery(GET_TRAIN_DETAIL, { variables: { id } });
}

export function useTrainPricing(id, check_in, check_out) {
  return useQuery(TRAIN_PRICING, { variables: { id, check_in, check_out } });
}

// Mutation Hooks
export function useCreateTrainBooking(options = {}) {
  return useMutation(CREATE_BOOKING, options);
}

export function useCancelTrainBooking(options = {}) {
  return useMutation(CANCEL_BOOKING, options);
}
