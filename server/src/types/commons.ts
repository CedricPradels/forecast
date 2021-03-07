export type ForecastEvent = {
  conditions: Conditions;
  runners: Runner[];
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
  isQuintePlus: boolean;
};

type RunnerIsRunner = {
  isNonRunner: false;
  purse: {
    sum: number;
    average: number; // dotationTotale/nbrCourese
  };
  jokey: {
    name: string;
    isAlreadyRunWith: boolean;
  };
  bareShoe: BareShoe;
  velocity: number; // temps / dernières courses / longueur
  form: string; // Musique
};
type RunnerIsNonRunner = { isnonRunner: true };

export type Runner = {
  number: string;
  horse: string;
} & (RunnerIsNonRunner | RunnerIsRunner);

export type BareShoe = 'rear' | 'prior' | 'all' | null;

export type RaceType =
  | 'harness'
  | 'saddle'
  | 'flat'
  | 'steeplechase'
  | 'hurdling'
  | 'national hunt';
