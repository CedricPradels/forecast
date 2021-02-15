import { startApollo, startMongoose, startAgenda } from './configuration';

const startServer = async () => {
  await startMongoose();
  await startApollo();
  startAgenda();
};

startServer();
