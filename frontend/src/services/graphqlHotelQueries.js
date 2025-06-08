import { gql } from '@apollo/client';

export const FILTER_HOTELS = gql`
  query FilterHotels(
    $name: String
    $city: String
    $province: String
    $country: String
    $property_type: String
    $min_star_rating: Float
    $max_star_rating: Float
    $amenities_include: [String!]
    $is_pet_friendly: Boolean
    $sortBy: String
    $sortOrder: SortOrder
    $page: Int
    $limit: Int
  ) {
    filterHotels(
      filters: {
        name: $name
        city: $city
        province: $province
        country: $country
        property_type: $property_type
        min_star_rating: $min_star_rating
        max_star_rating: $max_star_rating
        amenities_include: $amenities_include
        is_pet_friendly: $is_pet_friendly
      }
      sort: {
        sortBy: $sortBy
        sortOrder: $sortOrder
      }
      pagination: {
        page: $page
        limit: $limit
      }
    ) {
      hotels {
        id
        name
        city
        province
        country
        address
        postal_code
        star_rating
        property_type
        description
        amenities
        images
        has_wifi
        has_breakfast
        has_parking
        is_pet_friendly
        min_price_per_night
        max_price_per_night
      }
      pagination {
        totalItems
        totalPages
        currentPage
        pageSize
      }
    }
  }
`;
