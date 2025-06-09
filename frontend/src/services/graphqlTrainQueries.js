import { gql } from '@apollo/client';

// Train detail query
export const GET_TRAIN_DETAIL = gql`
  query GetTrainDetail($id: ID!) {
    train(id: $id) {
      id
      train_name
      origin_province
      destination_province
      subclass
      train_type
      price_category
      details
    }
  }
`;


// Train pricing query
export const TRAIN_PRICING = gql`
  query TrainPricing($id: ID!, $check_in: String, $check_out: String) {
    trainPricing(id: $id, check_in: $check_in, check_out: $check_out) {
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


// Train list query (copied from graphqlQueries.js)
export const GET_TRAINS = gql`
  query GetTrains($origin: String, $destination: String, $date: String) {
    trains(origin: $origin, destination: $destination, date: $date) {
      id
      train_name
      origin_province
      destination_province
      subclass
      train_type
      price_category
    }
  }
`;


export const FILTER_TRAINS = gql`
  query FilterTrains(
    $filters: TrainFiltersInput
    $sort: TrainSortInput
    $pagination: PaginationInput
  ) {
    filterTrains(filters: $filters, sort: $sort, pagination: $pagination) {
      trains {
        id
        train_number
        origin_station_name
        destination_station_name
        origin_city
        destination_city
        origin_province
        destination_province
        departure_time
        arrival_time
        price
        seats_available
        train_class
        subclass
        train_type
        operator
        duration
      }
      pagination {
        totalItems
        totalPages
        currentPage
        pageSize
        hasNextPage
        hasPrevPage
      }
    }
  }
`;

// Train creation (copied from graphqlQueries.js)
export const CREATE_TRAIN = gql`
  mutation CreateTrain($train_number: String, $origin: String, $destination: String, $departure_time: String, $arrival_time: String, $price: Float, $seats_available: Int) {
    createTrain(
      train_number: $train_number,
      origin: $origin,
      destination: $destination,
      departure_time: $departure_time,
      arrival_time: $arrival_time,
      price: $price,
      seats_available: $seats_available
    ) {
      id
      train_number
      origin
      destination
      departure_time
      arrival_time
      price
      seats_available
    }
  }
`;

