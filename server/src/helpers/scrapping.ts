import puppeteer, { Browser, Page, WaitForOptions } from 'puppeteer';
import { DateTime } from 'luxon';
import { RaceType } from '../types/commons';
import { PmuRaceType } from '../types/pmu';

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
  const defaultOptions: WaitForOptions = { waitUntil: 'networkidle0' };
  const finalOptions = { ...defaultOptions, ...options };
  await page.goto(url, finalOptions);
};

export const getMeetingName = async (zeturfRacePage: Page) => {
  const selector: string =
    '.bandeau-nav-content-scroll-item--current .reunion-hippodrome > span';
  const meetingName = await zeturfRacePage.evaluate(
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

export const getRacePurse = async (zeturfRacePage: Page) => {
  const selector: string =
    '.course-infos-header .course-infos-header-extras-main li:nth-child(2) > strong';

  const raceInfos = await zeturfRacePage.evaluate(
    (selector: string) => document.querySelector(selector)?.textContent,
    selector
  );
  console.log(raceInfos);
  if (!raceInfos) throw new Error('Wrong race purse');

  return Number(
    raceInfos
      .split(' ')
      .filter((word) => /^\d+$/.test(word))
      .join('')
  );
};

export const getMeetingNumber = async (zeturfRacePage: Page) => {
  const selector: string =
    '.bandeau-nav-content-scroll-item--current .reunion-numero > span:first-child';

  const meetingNumber = await zeturfRacePage.evaluate(
    (selector: string) => document.querySelector(selector)?.textContent,
    selector
  );
  if (!meetingNumber) throw new Error('Wrong meeting name');

  return meetingNumber.replace('R', '');
};

export const getRaceName = async (zeturfRacePage: Page) => {
  const selector: string = 'h1.course-infos-header-title';

  const raceName = await zeturfRacePage.evaluate(
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

export const getRaceNumber = async (zeturfRacePage: Page) => {
  const selector: string =
    '.bandeau-nav-content-scroll-item--current .course-numero > span';
  const raceNumber = await zeturfRacePage.evaluate(
    (selector: string) => document.querySelector(selector)?.textContent,
    selector
  );
  if (!raceNumber) throw new Error('Wrong meeting name');

  return raceNumber.replace('C', '');
};

export const getRaceType = async (zeturfRacePage: Page) => {
  const selector: string = 'ul.disciplines-list > li:first-child > span';

  const raceInfos = await zeturfRacePage.evaluate(
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

export const getRacesFromDate = async (date: Date) => {
  const browser = await openBrowser();
  const page = await newPage(browser);
  const formatedDate = DateTime.fromJSDate(date).toFormat('ddLLyyyy');

  // GET RACES URLs
  const pmuUrl = `https://www.pmu.fr/turf/${formatedDate}`;

  await goToUrl(page)(pmuUrl);
  const racesURL = (
    await page.evaluate(() =>
      Array.from(
        document.querySelectorAll('#timeline-view a.timeline-course-link'),
        (anchor) => anchor.getAttribute('href')
      )
    )
  ).map((anchor) => `${pmuUrl}/${anchor?.split('/').slice(-2).join('/')}`);

  // TODO: CASE ALREADY END
  for (const raceURL of racesURL) {
    await goToUrl(page)(raceURL);
    console.log(raceURL);
    const meetingName = await getRaceType(page);
    console.log(meetingName);
  }

  closePage(page);
  closeBrowser(browser);
  return racesURL;
};

getRacesFromDate(DateTime.fromISO('2021-03-04').toJSDate()).then(console.log);
