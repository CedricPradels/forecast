import puppeteer, { Browser, Page, WaitForOptions } from 'puppeteer';

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

export const goToUrl = async (
  page: Page,
  url: string,
  options: WaitForOptions = {}
): Promise<void> => {
  const defaultOptions: WaitForOptions = { waitUntil: 'networkidle2' };
  const finalOptions = { ...defaultOptions, ...options };
  await page.goto(url, finalOptions);
};
