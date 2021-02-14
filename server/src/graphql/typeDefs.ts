import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Race {
    test: String!
  }

  type Query {
    test: String!
  }
`;
