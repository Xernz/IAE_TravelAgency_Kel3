// Apollo Client setup and sample query integration
import { ApolloClient, InMemoryCache, ApolloProvider, gql, useQuery } from '@apollo/client';

// Configure the Apollo Client instance
export const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql', // Adjust the GraphQL endpoint as needed
  cache: new InMemoryCache(),
});

// Sample GraphQL query to fetch all hotels
export const GET_HOTELS = gql`
  query GetHotels($page: Int, $limit: Int) {
    hotels(page: $page, limit: $limit) {
      id
      name
      city
      province
      kabupaten
      postal_code
      property_type
    }
  }
`;

// Custom hook for using the sample query
export function useHotels(page = 1, limit = 10) {
  return useQuery(GET_HOTELS, {
    variables: { page, limit },
  });
}
