import { IFieldResolver } from 'apollo-server';
import { DateTime } from 'luxon';
import { QuerySelector } from 'mongodb';

import { ForecastEventModel } from '../models';

const today: IFieldResolver<any, any> = async () => {
  const [todayStart, todayEnd] = (['startOf', 'endOf'] as const).map((method) =>
    DateTime.fromObject({ zone: 'Europe/Paris' })[method]('day').toJSDate()
  );

  const ForecastEvent = await ForecastEventModel.findOne({
    'conditions.date': {
      $lte: todayEnd,
      $gte: todayStart,
    } as QuerySelector<Date>,
  });

  return ForecastEvent;
};

const event: IFieldResolver<> = (source, args, context, info) => {};

export const Query = {
  today,
  event,
};
