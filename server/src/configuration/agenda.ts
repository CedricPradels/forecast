import Agenda from 'agenda';

import { MONGODB_URI } from './constants';

export const startAgenda = () => {
  const agenda = new Agenda({ db: { address: MONGODB_URI } });
};
