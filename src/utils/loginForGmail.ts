import puppeteer from 'puppeteer';
import { DB } from 'gei-crud/lib/db/orm.js';
import { handler as create } from 'gei-crud/lib/Mutation/create.js';
import { sonRequestHandler } from './login.js';
import { screenshotPage } from './screenshot.js';
const browser = await puppeteer.launch({
  executablePath: process.env.BROWSER_PATH ? undefined : '/usr/bin/chromium-browser',
  headless: process.env.HEADLESS === 'false' ? false : true,
  slowMo: process.env.SLOW ? (process.env.SLOW as unknown as number) : 0,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--disable-setuid-sandbox'],
});
const url = 'https://mail.google.com/mail/';
export async function loginForMails(args: { login: { email: string; password: string } }) {
  const context = await browser.createIncognitoBrowserContext();
  const page = await context.newPage();
  try {
    await page.setViewport({ width: 1080, height: 1024 });
    await page.setRequestInterception(true);
    page.on('request', sonRequestHandler);

    try {
      const cookiesObject = await DB().then(async (db) => {
        console.log('finding Cookies.....');
        return db('Cookies').collection.findOne({ name: args.login.password, owner: args.login.email, url: url });
      });
      if (!cookiesObject) throw new Error('Cookies not find');
      console.log('cookies found');

      const cookies = JSON.parse(cookiesObject?.content);
      await page.setCookie(...cookies);

      await page.goto(url);
      await page.waitForTimeout(500);

      const body = await page.$('body');
      const success = await body?.$$('div[class="aio UKr6le"]');

      if (success?.length) {
        await DB().then(async (db) => {
          return db
            ('Cookies').collection
            .updateOne(
              { name: args.login.password, owner: args.login.email, url: url },
              { $set: { content: cookiesObject?.content } },
            );
        });
        return { context, page };
      }

      console.log('cookies outdated');
      throw new Error('cookies outdated');
    } catch {
      await page.goto('https://accounts.google.com/', {
        waitUntil: 'domcontentloaded',
      });
      const body = await page.$('body');
      const success = await body?.$('text/Use your Google Account');
      if (!success) throw new Error('Field for login not find');

      //EMAIL
      console.log('email');
      await page.type('input[type="email"]', args.login?.email);
      const next = await page.$('text/Next');
      await next?.click();
      await page.waitForTimeout(2000);

      //PASSWORD
      console.log('password');
      const body2 = await page.$('body');
      const password = await body2?.$('input[type="password"]');
      if (!password) throw new Error('"Welcome" not find');
      page.mouse.click(100, 200);
      await password.click({ delay: 10 });
      await page.waitForTimeout(400);
      await page.type('input[type="password"]', args.login?.password);
      const next2 = await page.$('text/Next');
      await next2?.click({ delay: 10 });
      console.log('go to mails');
      await page.waitForTimeout(2500);

      await page.goto(url, {
        waitUntil: 'domcontentloaded',
      });
      await page.waitForTimeout(1500);

      const cookiesSave = await page.cookies();
      const cookiesObject = {
        arguments: {
          cookiesObject: {
            content: JSON.stringify(cookiesSave),
            owner: args.login.email as string,
            name: args.login.password as string,
            url: url,
          },
        },
        info: {
          returnType: String,
          fieldName: 'saveCookies',
          parentType: { name: 'SonQuery' },
        },
        source: '',
      };

      console.log('update cookies');
      const update = await DB().then(async (db) => {
        return db
          ('Cookies').collection
          .updateOne(
            { name: args.login.password, owner: args.login.email, url: url },
            { $set: { content: cookiesObject?.arguments.cookiesObject.content } },
          );
      });
      console.log(update);
      if (!update.modifiedCount) {
        console.log('Cookies for update not find');
        console.log('save cookies');
        const save = await create(cookiesObject);
        if (!save) console.log('not save');
      }

      return { context, page };
    }
  } catch (err) {
    const errorScreen = await screenshotPage(page, 'error: signLast');
    await context.close();
    return { info: (err as any).toString() + 'Screen: ' + errorScreen };
  }
}
