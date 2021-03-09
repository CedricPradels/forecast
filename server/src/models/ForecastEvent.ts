import { Schema, model, Document, Types, Model } from 'mongoose';

import { Deferre, Details, Discipline, Participant } from '../types';

export type DBBareShoe = Deferre;
const BareShoeSchema = new Schema({
  type: String,
  enum: ['DP', 'DA', 'D4'],
  required: true,
});

export type DBRaceType = Discipline;
const RaceTypeSchema = new Schema({
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

export type DBRunner = Participant;
const RunnerSchema = new Schema({
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

export type DBConditions = Types.EmbeddedDocument & Details;
const ConditionsSchema = new Schema({
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

export type DBForecastEvent = Document & {
  conditions: { date: Date } & Types.Subdocument;
  runners: Types.Array<DBRunner>;
  link: string;
};

const ForecastEventSchema = new Schema({
  conditions: { type: ConditionsSchema, required: true },
  runners: { type: [RunnerSchema], required: true },
  link: { type: String, required: true },
});

export const ForecastEventModel = model<
  DBForecastEvent,
  Model<DBForecastEvent>
>('ForecastEvent', ForecastEventSchema);
