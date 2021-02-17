import { gql } from 'apollo-server';

export const typeDefs = gql`
  type ForecastEvent {
    id: ID!
    conditions: Conditions!
    runners: [Runner!]!
    link: String!
  }

  scalar DateScalar

  type Meeting {
    id: ID!
    name: String!
    number: String!
  }

  type Race {
    id: ID!
    name: String!
    number: String!
  }

  type Conditions {
    id: ID!
    date: DateScalar!
    meeting: Meeting!
    race: Race!
    type: RaceType!
    purse: Int!
  }

  enum RaceType {
    harness
    saddle
    flat
    steeplechase
    hurdling
    national
    hunt
  }

  enum BareShoe {
    rear
    prior
    all
  }

  type Jockey {
    id: ID!
    name: String!
    isAlreadyRunWith: Boolean!
  }

  type Purse {
    id: ID!
    sum: Int!
    average: Float!
    jockey: Jockey!
    bareShoe: BareShoe
    velocity: Int!
    form: String!
  }

  type Runner {
    id: ID!
    number: Int!
    horse: String!
    isNonRunner: Boolean!
    purse: Purse!
  }

  type Query {
    today: ForecastEvent
    event(id: ID!): ForecastEvent
  }
`;
