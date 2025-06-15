# New Login Feature Plan (External User Service)

This document outlines the plan to add a new login feature using an external GraphQL user service running on port 4001. This will provide an alternative login method for the application.

**Phase 1: Define User Service Interaction & API Gateway Setup**

1.  **Understand External User Service Schema:**
    *   Examine `user-service/src/schema.graphql` and `user-service/src/resolvers.js` to confirm the exact query/mutation for login, its input arguments (e.g., email, password), and the structure of its response (e.g., token, user details).
    *   For this plan, we'll assume the external service has a mutation like:
        ```graphql
        # External User Service (user-service:4001)
        type User {
          id: ID!
          email: String!
          name: String
          # other fields...
        }

        type AuthPayload {
          token: String!
          user: User!
        }

        type Mutation {
          # Assumed mutation in the external user service
          loginExternal(email: String!, password: String!): AuthPayload
        }
        ```

2.  **API Gateway (`api-gateway` directory):**
    *   **Update Configuration to Access User Service:**
        *   Modify `docker-compose.yaml` (or equivalent configuration for your API Gateway) to allow the API Gateway to connect to the user service at `http://user-service:4001/graphql`. This typically involves adding the `user-service` to the same Docker network as the `api-gateway` and referencing it by its service name.
    *   **Extend API Gateway GraphQL Schema (`api-gateway/src/schema.graphql`):**
        *   Define types corresponding to the user service's response if they don't already exist or are different. It's good practice to namespace or prefix them if there's a chance of collision with existing types, or if they represent a distinctly external entity.
            ```graphql
            type ExternalUser {
              id: ID!
              email: String!
              name: String
            }

            type ExternalAuthPayload {
              token: String!
              user: ExternalUser!
            }
            ```
        *   Add a new mutation to the API Gateway's schema to expose this login functionality:
            ```graphql
            type Mutation {
              # ... existing mutations
              loginWithExternalService(email: String!, password: String!): ExternalAuthPayload
            }
            ```
    *   **Implement Resolver for `loginWithExternalService` (`api-gateway/src/resolvers.js`):**
        *   Create a new resolver function for `loginWithExternalService`.
        *   This resolver will:
            *   Use a GraphQL client (like `axios` with `graphql-request` or `apollo-link-http` if the gateway uses Apollo Server internally for federation/stitching, or a simple HTTP client) to send the `loginExternal` mutation (as defined by the user service) to `http://user-service:4001/graphql` with the provided `email` and `password`.
            *   Receive the response (token and user data) from the user service.
            *   Map the response to the `ExternalAuthPayload` type defined in the API Gateway's schema.
            *   Handle potential errors (e.g., invalid credentials from the user service, user service unavailable, network issues).

**Phase 2: Frontend Implementation (`frontend` directory)**

1.  **Create New Login Page/Component (e.g., `frontend/src/pages/ExternalLoginPage.jsx` or `frontend/src/components/Auth/ExternalLoginForm.jsx`):**
    *   Design a simple UI with input fields for "email" and "password", and a "Login with External Service" button.
    *   Add routing for this new page (e.g., in your React Router setup, add a route for `/external-login` pointing to this new page/component).
2.  **Implement Frontend GraphQL Mutation (`frontend/src/graphql/mutations.js` or a dedicated auth mutations file):**
    *   Define a GraphQL mutation to call the API Gateway's `loginWithExternalService` mutation:
        ```graphql
        import { gql } from '@apollo/client';

        export const LOGIN_WITH_EXTERNAL_SERVICE = gql`
          mutation LoginWithExternalService($email: String!, $password: String!) {
            loginWithExternalService(email: $email, password: $password) {
              token
              user {
                id
                email
                name
              }
            }
          }
        `;
        ```
3.  **Handle Login Logic in the New Component:**
    *   Use Apollo Client's `useMutation` hook (or equivalent for your GraphQL client) with the `LOGIN_WITH_EXTERNAL_SERVICE` mutation.
    *   On form submission:
        *   Call the mutation with the entered email and password.
        *   If the login is successful:
            *   Store the received `token` (e.g., in `localStorage`, `sessionStorage`, or a state management solution like Redux/Zustand/Context API).
            *   Store relevant user information as needed (e.g., in global state).
            *   Redirect the user to the main application page (e.g., dashboard or home page) using `react-router-dom`'s navigation capabilities.
        *   If the login fails (either from the API Gateway or the external service):
            *   Display an appropriate error message to the user on the form.
4.  **Update UI to Offer Alternative Login:**
    *   On the existing login page, add a link or button (e.g., "Login with another service") that navigates the user to the new `/external-login` page.

**Phase 3: Testing and Refinement**

1.  **Unit/Integration Tests:**
    *   **API Gateway:** Test the `loginWithExternalService` resolver. Mock the external user service to simulate successful and error responses.
    *   **Frontend:** Test the `ExternalLoginPage` component: form submission, successful login (mocked API response), failed login (mocked API response), UI updates.
2.  **End-to-End Testing:**
    *   Ensure the external user service is running and accessible.
    *   Test the entire login flow: User navigates to the external login page, enters credentials, submits, and is either logged in and redirected or sees an error message.

**Considerations:**

*   **Error Handling:** Implement robust error handling at each stage (frontend, API Gateway, and during communication with the external service).
*   **Security:** Ensure tokens are handled securely. Consider implications if the external service token has different properties or lifecycles than existing tokens.
*   **User Experience:** Provide clear feedback to the user during the login process (loading states, success messages, error messages).
*   **Configuration:** Make the URL for the external user service configurable in the API Gateway (e.g., via environment variables).
