import { gql } from '@apollo/client';

// Local travel detail query
export const GET_LOCAL_TRAVEL_DETAIL = gql`
  query GetLocalTravelDetail($id: ID!) {
    localTravel(id: $id) {
      id
      name
      origin
      destination
      vehicle_model
      price
      details
    }
  }
`;


// Local travel pricing query
export const LOCAL_TRAVEL_PRICING = gql`
  query LocalTravelPricing($id: ID!, $check_in: String, $check_out: String) {
    localTravelPricing(id: $id, check_in: $check_in, check_out: $check_out) {
      basePrice
      taxes
      fees
      total
      currency
      discount
      available
    }
  }
`;


// Local travel list query (copied from graphqlQueries.js)
export const GET_LOCAL_TRAVEL = gql`
  query GetLocalTravel($origin: String, $destination: String, $date: String) {
    localTravel(origin: $origin, destination: $destination, date: $date) {
      id
      name
      origin
      destination
      vehicle_model
      price
    }
  }
`;


// Local travel filter (copied from graphqlQueries.js)
export const FILTER_LOCAL_TRAVELS = gql`
  query FilterLocalTravels(
    $origin_city: String
    $destination_city: String
    $origin_province: String
    $destination_province: String
    $origin_kabupaten: String
    $destination_kabupaten: String
    $date: String # Format "YYYY-MM-DD"
    $type: String # e.g., "taxi", "ojek", "bus"
    $operator_name: String
    $provider: String
    $min_capacity: Int
    $max_capacity: Int
    $amenities_include_any: [String!]
    $amenities_include_all: [String!]
    $min_price: Float
    $max_price: Float
    $sort_by: String # e.g., "name", "price"
    $sort_order: String # "ASC" or "DESC"
    $page: Int
    $limit: Int
  ) {
    filterLocalTravels(
      filter: {
        origin_city: $origin_city
        destination_city: $destination_city
        origin_province: $origin_province
        destination_province: $destination_province
        origin_kabupaten: $origin_kabupaten
        destination_kabupaten: $destination_kabupaten
        date: $date
        type: $type
        operator_name: $operator_name
        provider: $provider
        min_capacity: $min_capacity
        max_capacity: $max_capacity

        min_price: $min_price
        max_price: $max_price
      }
      sort: {
        by: $sort_by
        order: $sort_order
      }
      pagination: {
        page: $page
        limit: $limit
      }
    ) {
      localTravels {
        id
        name
        type
        provider
        operator_name
        origin_city
        destination_city
        origin_province
        destination_province
        departure_time
        arrival_time
        duration
        price
        currency
        seats_available
        capacity
        vehicle_model
        has_ac
        has_wifi
        amenities # Array of strings
        images # Array of strings (URLs)
      }
      pagination {
        total_items
        total_pages
        current_page
        limit
      }
    }
  }
`;
// Local travel creation (copied from graphqlQueries.js)
export const CREATE_LOCAL_TRAVEL = gql`
  mutation CreateLocalTravel($type: String, $provider: String, $origin: String, $destination: String, $departure_time: String, $arrival_time: String, $price: Float, $seats_available: Int) {
    createLocalTravel(
      type: $type,
      provider: $provider,
      origin: $origin,
      destination: $destination,
      departure_time: $departure_time,
      arrival_time: $arrival_time,
      price: $price,
      seats_available: $seats_available
    ) {
      id
      type
      provider
      origin
      destination
      departure_time
      arrival_time
      price
      seats_available
    }
  }
`;
