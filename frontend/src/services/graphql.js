// Apollo Client setup and sample query integration
import { ApolloClient, InMemoryCache, useQuery } from '@apollo/client';
import { FILTER_HOTELS, FILTER_FLIGHTS, FILTER_TRAINS, FILTER_LOCAL_TRAVELS } from './graphqlQueries';

// Configure the Apollo Client instance
export const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql', // Adjust the GraphQL endpoint as needed
  cache: new InMemoryCache(),
});

// Custom hook for fetching and filtering hotels
// Refactored to match FILTER_HOTELS query definition: variables must be top-level (no filter/pagination/sort nesting)
// Custom hook for fetching and filtering hotels
// Variables must match FILTER_HOTELS query exactly
export function useHotels(filters = {}) {
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


// Repeat similar refactor for useFlights, useTrains, useLocalTravels (examples below)


// Custom hook for fetching and filtering flights
// Variables must match FILTER_FLIGHTS query exactly
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

  // Variables must be passed as nested objects: { filters, sort, pagination }
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


  return useQuery(FILTER_FLIGHTS, {
    variables: queryVariables,
    fetchPolicy: 'cache-and-network',
  });
}

// Custom hook for fetching and filtering trains
// Variables must match FILTER_TRAINS query exactly
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

  // Only include variables defined in FILTER_TRAINS
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

  return useQuery(FILTER_TRAINS, {
    variables: queryVariables,
    fetchPolicy: 'cache-and-network',
  });
}

// Custom hook for fetching and filtering local travels
// Variables must match FILTER_LOCAL_TRAVELS query exactly
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

  // Variables must be passed as nested objects: { filters, sort, pagination }
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


  return useQuery(FILTER_LOCAL_TRAVELS, {
    variables: queryVariables,
    fetchPolicy: 'cache-and-network',
  });
}
