import { SafeExclude, SafeExtract } from './mappedTypes';

export type ForecastEvent = {
  conditions: Details;
  runners: Participant[];
  link: string;
};

type PisteType =
  | 'herbe'
  | 'sable fibre'
  | 'cendre'
  | 'sable'
  | 'pouzzolane'
  | 'machefer'
  | 'gazon';

type Piste = {
  type: PisteType;
  etat: number;
};

export type CourseGalop = {
  discipline: SafeExtract<Discipline, 'plat'>;
  distance: number;
  // conditions: ConditionsPlat;
  // terrain: Piste;
};

export type CourseTrot = {
  discipline: SafeExtract<Discipline, 'attele'>;
  distance: number;
  conditions: ConditionsAttele;
};

export type CourseOther = {
  discipline: SafeExclude<Discipline, 'attele' | 'plat'>;
};

export type CourseCommons = {
  date: Date;
  meeting: {
    name: string;
    number: string;
  };
  race: {
    name: string;
    number: string;
  };
  purse: number; // de 15k à 40k
  isQuintePlus: boolean;
};

export type Details = CourseCommons & (CourseGalop | CourseTrot | CourseOther);

type ParticipantIsNonPartant = { isNonPartant: true };
type ParticipantIsPartant = { isNonPartant: false };

type Driver = {
  name: string;
  isCrackDriver: boolean;
  performance: {
    hippodrome: string;
    date: Date;
    distance: number;
    horse: string;
  }[];
};

type Jockey = {
  name: string;
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
  jokey: Jockey;
  poids: number;
  historique: {
    date: Date;
    distance: number;
    piste: Piste;
    place: Place;
    poids: number;
    jockey: Jockey;
    conditions: Pick<ConditionsPlat, 'categorie'>;
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

export type ConditionsPlat = {
  age: Record<'min' | 'max', number>;
  categorie: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
};

export type ConditionsAttele = {
  gains: Partial<Record<'min' | 'max', number>>;
  age: Record<'min' | 'max', number>;
};
