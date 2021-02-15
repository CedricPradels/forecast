import { ApolloServer } from 'apollo-server';

import { typeDefs } from '../graphql';

export const startApollo = async () => {
  try {
    const server = new ApolloServer({ typeDefs });
    const serverInfo = await server.listen();

    console.log(`Server's running at : ${serverInfo.url}`);
  } catch (e) {
    console.log(e);
  }
};
