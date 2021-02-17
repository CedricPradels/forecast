import { Schema, model, Document } from 'mongoose';

import {
  BareShoe,
  Conditions,
  ForecastEvent,
  RaceType,
  Runner,
} from '../types';

const BareShoeSchema = new Schema<Document<BareShoe>>({
  type: String,
  enum: ['rear', 'prior', 'all'],
  required: true,
});

const RaceTypeSchema = new Schema<Document<RaceType>>({
  type: String,
  required: true,
  enum: [
    'harness',
    'saddle',
    'flat',
    'steeplechase',
    'hurdling',
    'national hunt',
  ],
});

const RunnerSchema = new Schema<Document<Runner>>({
  number: { type: String, required: true },
  horse: { type: String, required: true },
  isNonRunner: { type: Boolean, required: true },
  purse: {
    required: true,
    type: {
      sum: { type: Number, required: true },
      average: { type: Number, required: true },
      jockey: {
        required: true,
        type: {
          name: { type: String, required: true },
          isAlreadyRunWith: { type: Boolean, require: true },
        },
      },
      bareShoe: { type: BareShoeSchema, required: false },
      velocity: { type: Number, required: true },
      form: { type: String, required: true },
    },
  },
});

const ConditionsSchema = new Schema<Document<Conditions>>({
  date: { type: Date, required: true },
  meeting: {
    required: true,
    type: {
      name: { type: String, required: true },
      number: { type: String, required: true },
    },
  },
  race: {
    required: true,
    type: {
      name: { type: String, required: true },
      number: { type: String, required: true },
    },
  },
  type: { type: RaceTypeSchema, required: true },
  purse: { type: Number, required: true },
});

const ForecastEventSchema = new Schema<Document<ForecastEvent>>({
  conditions: { type: ConditionsSchema, required: true },
  runners: { type: RunnerSchema, required: true },
  link: { type: String, required: true },
});

export const ForecastEventModel = model('ForecastEvent', ForecastEventSchema);
