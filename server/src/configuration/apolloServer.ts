import { ApolloServer } from 'apollo-server';

import { typeDefs } from '../graphql';

export const startServer = () => {
  const server = new ApolloServer({ typeDefs });
  server
    .listen()
    .then(({ url }) => console.log(`Server's running at : ${url}`));
};
