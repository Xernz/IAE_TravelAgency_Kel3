import { gql } from '@apollo/client';

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
