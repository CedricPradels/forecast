import puppeteer, { Browser, Page, WaitForOptions } from 'puppeteer';
import { DateTime } from 'luxon';
import { RaceType } from '../types/commons';
import { ZeturfRaceType } from '../types/zeturf';

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

  const meetingName = await zeturfRacePage.evaluate(
    (selector: string) => document.querySelector(selector)?.textContent,
    selector
  );
  if (!meetingName) throw new Error('Wrong meeting name');

  return meetingName.replace('R', '').toLowerCase();
};

export const getRaceName = async (zeturfRacePage: Page) => {
  const isRaceAvailable = await getIsRaceAvailable(zeturfRacePage);
  const selector: string = isRaceAvailable
    ? '#infos-course .informations .nom-course'
    : '#arriveeDetails .nom-course';
  const meetingName = await zeturfRacePage.evaluate(
    (selector: string) => document.querySelector(selector)?.textContent,
    selector
  );
  if (!meetingName) throw new Error('Wrong meeting name');

  return meetingName.trim().toLowerCase();
};

export const getRaceNumber = async (zeturfRacePage: Page) => {
  const isRaceAvailable = await getIsRaceAvailable(zeturfRacePage);
  const selector: string = isRaceAvailable
    ? '#infos-course .titre > .numero-course'
    : '#arrivee-course .titre .numero-course';
  const meetingName = await zeturfRacePage.evaluate(
    (selector: string) => document.querySelector(selector)?.textContent,
    selector
  );
  if (!meetingName) throw new Error('Wrong meeting name');

  return meetingName.replace('C', '').trim().toLowerCase();
};

export const getRaceType = async (zeturfRacePage: Page) => {
  const isRaceAvailable = await getIsRaceAvailable(zeturfRacePage);

  const selector: string = isRaceAvailable
    ? '#infos-course > .content > .informations > .infos'
    : '#conditions > strong';

  const raceInfos = await zeturfRacePage.evaluate(
    (selector: string) => document.querySelector(selector)?.textContent,
    selector
  );
  if (!raceInfos) throw new Error('Wrong race type');

  const parser: { [k in ZeturfRaceType]: RaceType } = {
    'Cross-country': 'national hunt',
    Attelé: 'harness',
    Plat: 'flat',
    Monté: 'saddle',
    'Steeple-chase': 'steeplechase',
    Haies: 'hurdling',
  };

  const type = raceInfos.split('- ')[0].trim();
  if (!(type in parser)) throw new Error('Wrong race type');

  return parser[type as ZeturfRaceType];
};

export const getIsRaceAvailable = async (zeturfRacePage: Page) => {
  const getResult = await zeturfRacePage.evaluate(() =>
    document.querySelector('#tab-arrivee')
  );
  return !getResult;
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
    const meetingName = await getMeetingNumber(page);
    console.log(meetingName);
  }

  closePage(page);
  closeBrowser(browser);
  return racesURL;
};

getRacesFromDate(DateTime.fromISO('2021-03-05').toJSDate()).then(console.log);
