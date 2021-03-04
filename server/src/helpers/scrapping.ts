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
  const defaultOptions: WaitForOptions = { waitUntil: 'networkidle2' };
  const finalOptions = { ...defaultOptions, ...options };
  await page.goto(url, finalOptions);
};

export const getMeetingName = async (zeturfRacePage: Page) => {
  const isRaceAvailable = await getIsRaceAvailable(zeturfRacePage);
  const selector: string = isRaceAvailable
    ? '#infos-course .titre > .nom-course > span'
    : '#arrivee-course .titre .nom-course > span';
  const meetingName = await zeturfRacePage.evaluate(
    (selector: string) => document.querySelector(selector)?.textContent,
    selector
  );
  if (!meetingName) throw new Error('Wrong meeting name');

  return meetingName.replace('-', '').trim().toLowerCase();
};

export const getRacePurse = async (zeturfRacePage: Page) => {
  const isRaceAvailable = await getIsRaceAvailable(zeturfRacePage);

  const selector: string = isRaceAvailable
    ? '#infos-course > .content > .informations > .infos'
    : '#conditions > strong';

  const raceInfos = await zeturfRacePage.evaluate(
    (selector: string) => document.querySelector(selector)?.textContent,
    selector
  );
  if (!raceInfos) throw new Error('Wrong race type');

  return Number(
    raceInfos.split('- ')[2].replace('€', '').replace('$', '').trim()
  );
};

export const getMeetingNumber = async (zeturfRacePage: Page) => {
  const isRaceAvailable = await getIsRaceAvailable(zeturfRacePage);
  const selector: string = isRaceAvailable
    ? '#infos-course .titre > .numero-reunion-wrapper .numero-reunion span'
    : '#arrivee-course .titre .numero-reunion-wrapper .numero-reunion span';
  const meetingName = await zeturfRacePage.evaluate(
    (selector: string) => document.querySelector(selector)?.textContent,
    selector
  );
  if (!meetingName) throw new Error('Wrong meeting name');

  return meetingName.replace('R', '').trim().toLowerCase();
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

export const getRaces = async (date: Date) => {
  const browser = await openBrowser();
  const page = await newPage(browser);
  const isoDate = DateTime.fromJSDate(date).toISODate();

  const zeturfBase = 'https://www.zeturf.fr';

  // GET RACES URLs
  const url = `${zeturfBase}/fr/resultats-et-rapports/${isoDate}/turf`;
  await goToUrl(page)(url);
  const racesURL = (
    await page.evaluate(() =>
      Array.from(
        document.querySelectorAll("div[id='frise-course'] ul > li > a"),
        (anchor) => anchor.getAttribute('href')
      )
    )
  ).map((anchor) => `${zeturfBase}${anchor}`);

  // TODO: CASE ALREADY END
  const racesTypes: RaceType[] = [];
  for (const raceURL of racesURL) {
    await goToUrl(page)(raceURL);
    console.log(raceURL);
    const meetingName = await getRacePurse(page);
    console.log(meetingName);
  }

  closePage(page);
  closeBrowser(browser);
  return racesTypes;
};

getRaces(DateTime.now().toJSDate()).then(console.log);
