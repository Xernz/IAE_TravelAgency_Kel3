import { gql } from '@apollo/client';

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
