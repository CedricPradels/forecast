export type ForecastEvent = {
  conditions: Conditions;
  Runners: Runner[];
  link: string;
};

export type Conditions = {
  date: Date;
  meeting: {
    name: string;
    number: string;
  };
  race: {
    name: string;
    number: string;
  };
  type: RaceType; // plat trot
  purse: number; // de 15k à 40k
};

export type Runner = {
  number: string;
  horse: string;
  isNonRunner: boolean;
  purse: {
    sum: number;
    average: number; // dotationTotale/nbrCourese
    jokey: {
      name: string;
      isAlreadyRunWith: boolean;
    };
    bareShoe?: BareShoe;
    velocity: number; // temps / dernières courses / longueur
    form: string;
  };
};

export type BareShoe = 'rear' | 'prior' | 'all';

export type RaceType =
  | 'harness'
  | 'saddle'
  | 'flat'
  | 'steeplechase'
  | 'hurdling'
  | 'national hunt';
