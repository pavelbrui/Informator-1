import puppeteer, { HTTPRequest } from 'puppeteer';
import { DB } from 'gei-crud/lib/db/orm.js';
import { handler as create } from 'gei-crud/lib/Mutation/create.js';
const browser = await puppeteer.launch({
  ignoreDefaultArgs: ['--disable-extensions'],
  executablePath: process.env.BROWSER_PATH ? undefined : '/usr/bin/chromium-browser',
  headless: process.env.HEADLESS === 'false' ? false : true,
  slowMo: process.env.SLOW ? (process.env.SLOW as unknown as number) : 5,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-setuid-sandbox', '--disable-gpu'],
});
export const sonRequestHandler = (req: HTTPRequest) => {
  if (req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image') {
    req.abort();
  } else {
    req.continue();
  }
};
export async function login(
  args: {
    login: { email: string; password: string };
    requestedUrl: string;
  },
  style: boolean,
) {
  const context = await browser.createIncognitoBrowserContext();
  const page = await context.newPage();
  await page.setViewport({ width: 1080, height: 1024 });

  if (!style) {
    await page.setRequestInterception(true);

    page.on('request', sonRequestHandler);
  }
  try {
    const cookiesObject = await DB().then(async (db) => {
      console.log('finding Cookies.....');
      return db
        ('Cookies').collection
        .findOne({ name: args.login.password, owner: args.login.email, url: args.requestedUrl });
    });
    if (!cookiesObject) throw new Error('Cookies not find');
    console.log('cookies found');

    const cookies = JSON.parse(cookiesObject?.content);
    await page.setCookie(...cookies);

    await page.goto(args.requestedUrl || 'https://systemobsluginajmu.pl', {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(500);
    const body = await page.waitForSelector('body');
    const success = await body?.$$('div[class="page-header navbar navbar-fixed-top"]');

    if (success?.length) {
      await DB().then(async (db) => {
        return db
          ('Cookies').collection
          .updateOne(
            { name: args.login.password, owner: args.login.email },
            { $set: { content: cookiesObject?.content } },
          );
      });
      return { context, page, cookies: cookies };
    }

    console.log('cookies outdated');
    throw new Error('cookies outdated');
  } catch {
    await page.goto(`${args.requestedUrl}/login`, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(500);

    console.log('set email and password');
    await page.type('input[name="login"][type="text"]', args.login?.email);
    await page.type('input[name="password"][type="password"]', args.login?.password);

    const login = await page.waitForSelector('button[type="submit"]');
    await login?.click({ delay: 0 });
    await page.waitForTimeout(2500);
    console.log('login click');
    const cookiesSave = await page.cookies();

    const cookiesObject = {
      arguments: {
        cookiesObject: {
          content: JSON.stringify(cookiesSave),
          owner: args.login.email as string,
          name: args.login.password as string,
          url: args.requestedUrl,
        },
      },
      info: {
        returnType: String,
        fieldName: 'saveCookies',
        parentType: { name: 'SonQuery' },
      },
      source: '',
    };

    const update = await DB().then(async (db) => {
      return db
        ('Cookies').collection
        .updateOne(
          { name: args.login.password, owner: args.login.email, url: args.requestedUrl },
          { $set: { content: cookiesObject?.arguments.cookiesObject.content } },
        );
    });
    if (!update.modifiedCount) {
      console.log('save cookies');
      // await bazalog('loginOlx', 'save cookies');
      const save = await create(cookiesObject);
      if (!save) console.log('!!!!!!!!!ERROR!!!! Cookies not save');
    } else {
      console.log('update cookies');
    }

    return { context, page };
  }
}
