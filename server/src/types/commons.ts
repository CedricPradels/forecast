export type ForecastEvent = {
  conditions: Details;
  runners: Participant[];
  link: string;
};

export type Details = {
  date: Date;
  meeting: {
    name: string;
    number: string;
  };
  race: {
    name: string;
    number: string;
  };
  type: Discipline; // plat trot
  purse: number; // de 15k à 40k
  isQuintePlus: boolean;
  distance: number;
  conditions: Conditions;
};

type ParticipantIsNonPartant = { isNonPartant: true };
type ParticipantIsPartant = { isNonPartant: false };

type Driver = {
  name: string;
  isAlreadyRunWith: boolean;
  isCrackDriver: boolean;
  performance: {
    hippodrome: string;
    date: Date;
    distance: number;
    horse: string;
  }[];
};

type Trotteur = {
  discipline: 'trot';
  purse: {
    sum: number;
    average: number; // dotationTotale/nbrCourese
  };
  driver: Driver;
  deferre: Deferre;
  velocite: number; // temps / dernières courses / longueur
  handicap: 0 | 25 | 50;
  age: number;
  historique: {
    date: Date;
    reductionKilometrique: number;
    driver: Driver;
    gains: number;
    deferre: Deferre;
    place: Place;
    distance: number;
    hippodrome: string;
    conditions: {
      age: number;
      gainsMax: number;
    };
  }[];
} & ParticipantIsPartant;

type Place = 'disqualifie' | 'arrete' | 'tombe' | number;

type Galoppeur = {
  discipline: 'galop';
  jokey: {
    name: string;
    isAlreadyRunWith: boolean;
  };
} & ParticipantIsPartant;

export type Participant = {
  numero: string;
  cheval: string;
} & ((Trotteur | Galoppeur) | ParticipantIsNonPartant);

export type Deferre = 'DP' | 'DA' | 'D4' | null;

export type Discipline =
  | 'attele'
  | 'plat'
  | 'steeple-chase'
  | 'haies'
  | 'monte'
  | 'cross-country';

export type Conditions = {
  gains: Gains;
};

type Gains =
  | Record<'min' | 'max', number>
  | Record<'min', number>
  | Record<'max', number>
  | null;
