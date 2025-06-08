import { gql } from '@apollo/client';

export const GET_HOTEL_DETAIL = gql`
  query GetHotelDetail($id: ID!) {
    hotel(id: $id) {
      id
      name
      city
      province
      kabupaten
      postal_code
      property_type
      description
      rooms {
        id
        type
        price
        availability
      }
    }
  }
`;

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
