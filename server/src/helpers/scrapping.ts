import puppeteer, {
  Browser,
  ElementHandle,
  Page,
  WaitForOptions,
} from 'puppeteer';
import { DateTime } from 'luxon';
import { Conditions, RaceType, PmuRaceType, Runner, BareShoe } from '../types';

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

export const getRaceType = async (pmuRacePage: Page) => {
  const selector: string = 'ul.disciplines-list > li:first-child > span';

  const raceInfos = await pmuRacePage.evaluate(
    (selector: string) =>
      document.querySelector(selector)?.getAttribute('title'),
    selector
  );
  if (!raceInfos) throw new Error('Wrong race type');

  const parser: { [k in PmuRaceType]: RaceType } = {
    'Cross Country': 'national hunt',
    Attelé: 'harness',
    Plat: 'flat',
    Monté: 'saddle',
    'Steeple Chase': 'steeplechase',
    Haies: 'hurdling',
  };

  const type = raceInfos.split('- ')[0].trim();
  if (!(type in parser)) throw new Error('Wrong race type');

  return parser[type as PmuRaceType];
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

const getRaceConditions = async (pmuRacePage: Page): Promise<Conditions> => ({
  date: await getRaceDate(pmuRacePage),
  meeting: {
    name: await getMeetingName(pmuRacePage),
    number: await getMeetingNumber(pmuRacePage),
  },
  race: {
    name: await getRaceName(pmuRacePage),
    number: await getRaceNumber(pmuRacePage),
  },
  type: await getRaceType(pmuRacePage),
  purse: await getRacePurse(pmuRacePage),
});

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
    conditions: Conditions;
    runner: any;
  }[] = await racesUrl.reduce(
    async (acc, raceUrl) => {
      const result = await acc;

      await goToUrl(page)(raceUrl);
      const conditions = {
        conditions: await getRaceConditions(page),
        runner: await getRunners(page),
      };
      console.log(conditions);
      return [...result, conditions];
    },
    new Promise<{ conditions: Conditions; runner: any }[]>((resolve) =>
      resolve([])
    )
  );

  closePage(page);
  closeBrowser(browser);
  return racesList;
};

export const getRunnerBareShoe = async (
  pmuRunnerRow: ElementHandle<Element>
): Promise<BareShoe> => {
  const allSelector = '.deferre_anterieurs_posterieurs';
  const rearSelector = '.deferre_anterieurs';
  const priorSelector = '.deferre_posterieurs';

  const isAll = !!(await pmuRunnerRow.evaluate(
    (node: Element, selector: string) =>
      node.querySelector(selector)?.textContent,
    allSelector
  ));

  const isRear = !!(await pmuRunnerRow.evaluate(
    (node: Element, selector: string) =>
      node.querySelector(selector)?.textContent,
    rearSelector
  ));

  const isPrior = !!(await pmuRunnerRow.evaluate(
    (node: Element, selector: string) =>
      node.querySelector(selector)?.textContent,
    priorSelector
  ));

  if (isRear) return 'rear';
  if (isPrior) return 'prior';
  if (isAll) return 'all';

  return null;
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
        isNonRunner: await getIsNonRunner(runnerRow),
        bareShoe: await getRunnerBareShoe(runnerRow),
      };

      return [...result, runner];
    },
    new Promise<Runner[]>((resolve) => resolve([]))
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
  if (!horseName) throw new Error('Wrong runner number');

  return horseName.toLowerCase();
};

export const getIsNonRunner = async (pmuRunnerRow: ElementHandle<Element>) => {
  const isNonRunnerRowClass = 'participants-tbody-tr--non-partant';
  const horseName = await pmuRunnerRow.evaluate(
    (node: Element, isNonRunnerRowClass: string) =>
      node.classList.contains(isNonRunnerRowClass),
    isNonRunnerRowClass
  );

  return horseName;
};

getRacesConditions(DateTime.fromISO('2021-03-04').toJSDate()).then(console.log);
