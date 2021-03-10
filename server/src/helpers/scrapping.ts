import puppeteer, {
  Browser,
  ElementHandle,
  Page,
  WaitForOptions,
} from 'puppeteer';
import { DateTime } from 'luxon';
import {
  Details,
  Discipline,
  PmuRaceType,
  Participant,
  Deferre,
  CourseCommons,
  CourseTrot,
  CourseGalop,
} from '../types';

export const openBrowser = async (): Promise<Browser> => {
  const browser = await puppeteer.launch();
  return browser;
};

export const closeBrowser = async (browser: Browser): Promise<void> => {
  await browser.close();
};

export const newPage = async (browser: Browser): Promise<Page> => {
  const page = await browser.newPage();
  return page;
};

export const closePage = async (page: Page) => {
  await page.close();
};

export const goToUrl = (page: Page) => async (
  url: string,
  options: WaitForOptions = {}
): Promise<void> => {
  const defaultOptions: WaitForOptions = {
    waitUntil: 'networkidle0',
  };
  const finalOptions = { ...defaultOptions, ...options };
  await page.goto(url, finalOptions);
};

export const getMeetingName = async (pmuRacePage: Page) => {
  const selector: string =
    '.bandeau-nav-content-scroll-item--current .reunion-hippodrome > span';
  const meetingName = await pmuRacePage.evaluate(
    (selector: string) =>
      document.querySelector(selector)?.getAttribute('title'),
    selector
  );

  if (!meetingName) throw new Error('Wrong meeting name');

  return meetingName
    .split(' ')
    .filter((word) => !!word)
    .map((word) => word.toLowerCase())
    .join(' ');
};

export const getRacePurse = async (pmuRacePage: Page) => {
  const selector: string =
    '.course-infos-header .course-infos-header-extras-main li:nth-child(2) > strong';

  const raceInfos = await pmuRacePage.evaluate(
    (selector: string) => document.querySelector(selector)?.textContent,
    selector
  );

  if (!raceInfos) throw new Error('Wrong race purse');

  return Number(
    raceInfos
      .split(' ')
      .filter((word) => /^\d+$/.test(word))
      .join('')
  );
};

export const getMeetingNumber = async (pmuRacePage: Page) => {
  const selector: string =
    '.bandeau-nav-content-scroll-item--current .reunion-numero > span:first-child';

  const meetingNumber = await pmuRacePage.evaluate(
    (selector: string) => document.querySelector(selector)?.textContent,
    selector
  );
  if (!meetingNumber) throw new Error('Wrong meeting name');

  return meetingNumber.replace('R', '');
};

export const getRaceName = async (pmuRacePage: Page) => {
  const selector: string = 'h1.course-infos-header-title';

  const raceName = await pmuRacePage.evaluate(
    (selector: string) =>
      document.querySelector(selector)?.getAttribute('title'),
    selector
  );
  if (!raceName) throw new Error('Wrong meeting name');

  return raceName
    .split(' ')
    .filter((word) => !!word)
    .map((word) => word.toLowerCase())
    .join(' ');
};

export const getRaceNumber = async (pmuRacePage: Page) => {
  const selector: string =
    '.bandeau-nav-content-scroll-item--current .course-numero > span';
  const raceNumber = await pmuRacePage.evaluate(
    (selector: string) => document.querySelector(selector)?.textContent,
    selector
  );
  if (!raceNumber) throw new Error('Wrong meeting name');

  return raceNumber.replace('C', '');
};

export const getDiscipline = async (pmuRacePage: Page) => {
  const selector: string = 'ul.disciplines-list > li:first-child > span';

  const raceInfos = await pmuRacePage.evaluate(
    (selector: string) =>
      document.querySelector(selector)?.getAttribute('title'),
    selector
  );
  if (!raceInfos) throw new Error('Wrong race type');

  const parser: { [k in PmuRaceType]: Discipline } = {
    Attelé: 'attele',
    Plat: 'plat',
    Monté: 'monte',
    'Steeple Chase': 'steeple-chase',
    Haies: 'haies',
    'Cross Country': 'cross-country',
  };

  const discipline = raceInfos.split('- ')[0].trim();
  if (!(discipline in parser)) throw new Error('Wrong race type');

  return parser[discipline as PmuRaceType];
};

const getRaceDate = async (pmuRacePage: Page) => {
  const selector: string =
    '.bandeau-nav-content-scroll-item--current span.statut-course';

  const raceStatus = await pmuRacePage.evaluate(
    (selector: string) => document.querySelector(selector)?.textContent,
    selector
  );
  if (!raceStatus) throw new Error('Wrong race type');

  const raceTime = /\d{2}h\d{2}/.exec(raceStatus);
  if (!raceTime) throw new Error('Wrong race type');

  const urlDate = /\d{8}/.exec(pmuRacePage.url());
  if (!urlDate) throw new Error('Wrong url date');

  const [day, month, year] = ([
    [0, 2],
    [2, 4],
    [4, 8],
  ] as const).map((range) => Number(urlDate[0].slice(...range)));

  const [hour, minute] = raceTime[0].split('h').map((time) => Number(time));

  return DateTime.fromObject({
    day,
    month,
    year,
    hour,
    minute,
    zone: 'Europe/Paris',
  }).toJSDate();
};

const getCourseDistance = async (pmuRacePage: Page) => {
  const selector: string =
    'ul.course-infos-header-extras-main > li:nth-child(3)';

  const raceInfos = await pmuRacePage.evaluate(
    (selector: string) => document.querySelector(selector)?.textContent,
    selector
  );
  if (!raceInfos) throw new Error('Wrong race distance');

  return Number(raceInfos.replace('m', '').trim());
};

export const getCourseAge = async (pmuRacePage: Page) => {
  const selector: string = 'p.details-conditions-tooltip-content-texte';

  const raceInfos = await pmuRacePage.evaluate(
    (selector: string) => document.querySelector(selector)?.textContent,
    selector
  );
  if (!raceInfos) throw new Error('Wrong race age');
  const ageStr = /Pour .+? ans/.exec(raceInfos);

  if (!ageStr) throw new Error('No race string available');

  const ages = ageStr[0]
    .split(' ')
    .map((word) => word.replace(',', ''))
    .map((word) => Number(word))
    .filter((number) => Number.isInteger(number));

  return { min: Math.min(...ages), max: Math.max(...ages) };
};

export const getCourseGains = async (pmuRacePage: Page) => {
  const selector: string = 'p.details-conditions-tooltip-content-texte';

  const raceInfos = await pmuRacePage.evaluate(
    (selector: string) => document.querySelector(selector)?.textContent,
    selector
  );
  if (!raceInfos) throw new Error('Wrong race gain');

  const parseRange = (range: RegExp[]) =>
    range
      .map((regex) => regex.exec(raceInfos.replace(/\./g, '')))
      .filter((str): str is RegExpExecArray => !!str)
      .map((tab) => Number(tab[1]));
  const either = <T, U>(f: (a: T[]) => U[]) => (x: T[]) => {
    const result = f(x);
    return result.length > 0 ? f(x) : null;
  };

  const min = either(parseRange)([/ayant gagné au moins (\d+)/]);
  const max = either(parseRange)([/mais pas (\d+)/, /n'ayant pas gagné (\d+)/]);

  if (min && !max) return { min: min[0] };
  if (!min && max) return { max: max[0] };
  if (min && max) return { min: min[0], max: max[0] };

  throw new Error('Wrong race gain');
};

const getCourseDetails = async (pmuRacePage: Page): Promise<Details> => {
  const discipline: Discipline = await getDiscipline(pmuRacePage);

  const commons: CourseCommons = {
    date: await getRaceDate(pmuRacePage),
    meeting: {
      name: await getMeetingName(pmuRacePage),
      number: await getMeetingNumber(pmuRacePage),
    },
    race: {
      name: await getRaceName(pmuRacePage),
      number: await getRaceNumber(pmuRacePage),
    },
    purse: await getRacePurse(pmuRacePage),
    isQuintePlus: await getRaceIsQuintePlus(pmuRacePage),
  };

  if (discipline === 'attele') {
    const attele: CourseTrot = {
      discipline,
      distance: await getCourseDistance(pmuRacePage),
      conditions: {
        gains: await getCourseGains(pmuRacePage),
        age: await getCourseAge(pmuRacePage),
      },
    };
    return { ...commons, ...attele };
  }

  if (discipline === 'plat') {
    const plat: CourseGalop = {
      discipline,
      distance: await getCourseDistance(pmuRacePage),
    };
    return { ...commons, ...plat };
  }

  return { ...commons, discipline };
};

export const getRaceIsQuintePlus = async (pmuRacePage: Page) => {
  const selector: string =
    '.bandeau-course-region .bandeau-nav-content-scroll-item--current .pari-picto';

  const isQuintePlus =
    (await pmuRacePage.evaluate(
      (selector: string) =>
        document.querySelector(selector)?.getAttribute('data-pari'),
      selector
    )) === 'E_QUINTE_PLUS';

  return isQuintePlus;
};

export const getRacesConditions = async (date: Date) => {
  const browser = await openBrowser();
  const page = await newPage(browser);
  const formatedDate = DateTime.fromJSDate(date).toFormat('ddLLyyyy');

  // GET RACES URLs
  const pmuUrl = `https://www.pmu.fr/turf/${formatedDate}`;

  await goToUrl(page)(pmuUrl);
  const racesUrl = (
    await page.evaluate(() =>
      Array.from(
        document.querySelectorAll('#timeline-view a.timeline-course-link'),
        (anchor) => anchor.getAttribute('href')
      )
    )
  ).map((anchor) => `${pmuUrl}/${anchor?.split('/').slice(-2).join('/')}`);

  const racesList: {
    conditions: Details;
    runner: any;
  }[] = await racesUrl.reduce(
    async (acc, raceUrl) => {
      const result = await acc;

      await goToUrl(page)(raceUrl);
      const conditions = {
        conditions: await getCourseDetails(page),
        runner: await getRunners(page),
      };
      console.log(conditions);
      return [...result, conditions];
    },
    new Promise<{ conditions: Details; runner: any }[]>((resolve) =>
      resolve([])
    )
  );

  closePage(page);
  closeBrowser(browser);
  return racesList;
};

export const getPartantDeferre = async (
  pmuRunnerRow: ElementHandle<Element>
): Promise<Deferre> => {
  const allSelector = '.deferre_anterieurs_posterieurs';
  const rearSelector = '.deferre_anterieurs';
  const priorSelector = '.deferre_posterieurs';

  const isD4 = !!(await pmuRunnerRow.evaluate(
    (node: Element, selector: string) =>
      node.querySelector(selector)?.textContent,
    allSelector
  ));

  const isDP = !!(await pmuRunnerRow.evaluate(
    (node: Element, selector: string) =>
      node.querySelector(selector)?.textContent,
    rearSelector
  ));

  const isDA = !!(await pmuRunnerRow.evaluate(
    (node: Element, selector: string) =>
      node.querySelector(selector)?.textContent,
    priorSelector
  ));

  if (isDP) return 'DP';
  if (isDA) return 'DA';
  if (isD4) return 'D4';

  return null;
};

export const getRunnerJokey = async (pmuRunnerRow: ElementHandle<Element>) => {
  const selector = '.participants-jokey';

  const runnerJokeyName = await pmuRunnerRow.evaluate(
    (node: Element, selector: string) =>
      node.querySelector(selector)?.getAttribute('title'),
    selector
  );
  if (!runnerJokeyName) throw new Error('Wrong runner jockey');

  return runnerJokeyName;
};

export const getRunners = async (pmuRacePage: Page) => {
  const runnerRows = await pmuRacePage.$$('.participants-table > tbody > tr');
  // const selector: string = '.participants-table > tbody > tr';

  // const runnerRows = await pmuRacePage.evaluate(
  //   (selector: string) =>
  //     Array.from(document.querySelectorAll<HTMLTableRowElement>(selector)),
  //   selector
  // );

  const runners = runnerRows.reduce(
    async (acc, runnerRow) => {
      const result = await acc;

      const runner: any = {
        number: await getRunnerNumber(runnerRow),
        horse: await getRunnerHorseName(runnerRow),
        isNonPartant: await getIsNonPartant(runnerRow),
      };

      if (runner.isNonPartant) return [...result, runner];

      const isRunnerData: any = {
        bareShoe: await getPartantDeferre(runnerRow),
        jokeyName: await getRunnerJokey(runnerRow),
      };

      return [...result, { ...runner, ...isRunnerData }];
    },
    new Promise<Participant[]>((resolve) => resolve([]))
  );
  return runners;
};

export const getRunnerNumber = async (pmuRunnerRow: ElementHandle<Element>) => {
  const selector = '.participants-num';

  const runnerNumber = await pmuRunnerRow.evaluate(
    (node: Element, selector: string) =>
      node.querySelector(selector)?.textContent,
    selector
  );
  if (!runnerNumber) throw new Error('Wrong runner number');

  return runnerNumber;
};

export const getRunnerHorseName = async (
  pmuRunnerRow: ElementHandle<Element>
) => {
  const selector = '.participants-name';
  const horseName = await pmuRunnerRow.evaluate(
    (node: Element, selector: string) =>
      node.querySelector(selector)?.getAttribute('title'),
    selector
  );
  if (!horseName) throw new Error('Wrong runner name');

  return horseName.toLowerCase();
};

export const getIsNonPartant = async (pmuRunnerRow: ElementHandle<Element>) => {
  const isNonRunnerRowClass = 'participants-tbody-tr--non-partant';
  const horseName = await pmuRunnerRow.evaluate(
    (node: Element, isNonRunnerRowClass: string) =>
      node.classList.contains(isNonRunnerRowClass),
    isNonRunnerRowClass
  );

  return horseName;
};

getRacesConditions(DateTime.fromISO('2021-03-04').toJSDate()).then(console.log);
