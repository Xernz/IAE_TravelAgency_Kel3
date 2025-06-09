import { gql } from '@apollo/client';

// Flight detail query
export const GET_FLIGHT_DETAIL = gql`
  query GetFlightDetail($id: ID!) {
    flight(id: $id) {
      id
      airline
      origin
      destination
      departure_time
      arrival_time
      price
      details
    }
  }
`;


// Flight pricing query
export const FLIGHT_PRICING = gql`
  query FlightPricing($id: ID!, $check_in: String, $check_out: String) {
    flightPricing(id: $id, check_in: $check_in, check_out: $check_out) {
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


// Flight list query (copied from graphqlQueries.js)
export const GET_FLIGHTS = gql`
  query GetFlights($origin: String, $destination: String, $date: String) {
    flights(origin: $origin, destination: $destination, date: $date) {
      id
      airline
      flight_number
      origin
      destination
      departure_time
      arrival_time
      price
      seats_available
    }
  }
`;


// Flight filter (copied from graphqlQueries.js)
export const FILTER_FLIGHTS = gql`
  query FilterFlights(
    $origin_city: String
    $destination_city: String
    $origin_code: String
    $destination_code: String
    $airline_name: String
    $airline_code: String
    $flight_class: String
    $departure_date: String # Format YYYY-MM-DD
    $min_price: Float
    $max_price: Float
    $sort_by: String # e.g., "price", "departure_time"
    $sort_order: String # "ASC" or "DESC"
    $page: Int
    $limit: Int
  ) {
    filterFlights(
      filter: {
        origin_city: $origin_city
        destination_city: $destination_city
        origin_code: $origin_code
        destination_code: $destination_code
        airline_name: $airline_name
        airline_code: $airline_code
        flight_class: $flight_class
        departure_date: $departure_date
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
      flights {
        id
        airline_code
        airline_name
        flight_number
        origin_city
        destination_city
        origin_code
        destination_code
        departure_time
        arrival_time
        duration
        flight_class
        price
        seats_available
        currency
        stops
        status
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
// Flight creation (copied from graphqlQueries.js)
export const CREATE_FLIGHT = gql`
  mutation CreateFlight($airline: String, $flight_number: String, $origin: String, $destination: String, $departure_time: String, $arrival_time: String, $price: Float, $seats_available: Int) {
    createFlight(
      airline: $airline
      flight_number: $flight_number
      origin: $origin
      destination: $destination
      departure_time: $departure_time
      arrival_time: $arrival_time
      price: $price
      seats_available: $seats_available
    ) {
      id
      airline
      flight_number
      origin
      destination
      departure_time
      arrival_time
      price
      seats_available
    }
  }
`;

