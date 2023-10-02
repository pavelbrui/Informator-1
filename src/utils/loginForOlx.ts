import puppeteer from 'puppeteer';
import { DB } from 'gei-crud/lib/db/orm.js';
import { handler as create } from 'gei-crud/lib/Mutation/create.js';
import { screenshotPage } from './screenshot.js';
const browser = await puppeteer.launch({
  executablePath: process.env.BROWSER_PATH ? undefined : '/usr/bin/chromium-browser',
  headless: process.env.HEADLESS === 'false' ? false : true,
  slowMo: process.env.SLOW ? (process.env.SLOW as unknown as number) : 0,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--disable-setuid-sandbox'],
});

const url = 'https://www.olx.pl/';

export async function loginForOlx(args: { login: { email: string; password: string } }) {
  const context = await browser.createIncognitoBrowserContext();
  const page = await context.newPage();
  try {
    await page.setViewport({ width: 1080, height: 1024 });

    try {
      const cookiesObject = await DB().then(async (db) => {
        console.log('finding Cookies.....');
        return db('Cookies').collection.findOne({ url: url, name: args.login.password, owner: args.login.email });
      });
      if (!cookiesObject) {
        await page.goto(url, {
          waitUntil: 'load',
        });
        console.log('cookies not found');
        throw new Error('Cookies not find');
      }
      console.log('cookies found');
      // await bazalog('loginOlx', 'cookies found');

      const cookies = JSON.parse(cookiesObject?.content);
      await page.setCookie(...cookies);

      await page.goto(url + '/d/nowe-ogloszenie/?bs=homepage_adding', {
        waitUntil: 'load',
      });
      await page.waitForTimeout(5000);
      const success = await page.$('textarea[id="title"]');

      if (success) {
        await DB().then(async (db) => {
          return db
            ('Cookies').collection
            .updateOne(
              { name: args.login.password, owner: args.login.email, url: url },
              { $set: { content: cookiesObject?.content } },
            );
        });
        const info = 'Cookies find and update ';
        return { context, page, info };
      }

      console.log('cookies outdated');
      throw new Error('cookies outdated');
    } catch {
      // LOGIN WITH PASSWORD
      console.log('Login with password');
    }
    let info = 'Login with password';
    await page.waitForTimeout(5000);
    const body = await page.$('body');
    // POPUP
    const button = await body?.$('button[id="onetrust-accept-btn-handler"]');
    if (button) console.log('Zaakceptuj find');

    button ? await button.click() : console.log('Popup not find');
    await page.waitForTimeout(350);
    // NEW POST
    await page.goto('https://www.olx.pl/d/nowe-ogloszenie/?bs=homepage_adding', {
      waitUntil: 'load',
    });
    await page.waitForTimeout(6400);

    // await screenshotPage(page, args.login.email + 'olxLogin');

    //POPUP
    const body2 = await page.$('body');
    const button2 = await body2?.$('button[id="onetrust-accept-btn-handler"]');
    if (button2) console.log('Zaakceptuj find');
    button2 ? await button2.click() : console.log('Popup not find');
    await page.waitForTimeout(350);

    //EMAIL
    const email = await page.$('input[type="email"]');
    if (!email) throw new Error('Field for login not find');

    console.log('email');
    // await bazalog('loginOlx', 'email');
    await page.type('input[type="email"]', args.login?.email);
    await page.waitForTimeout(950);
    //PASSWORD
    if (!(await page?.$('input[type="password"]'))) throw new Error('Field for password not find');
    console.log('password');
    // await bazalog('loginOlx', 'password');
    await page.type('input[type="password"]', args.login?.password);

    const logIn = await page.$('button[type="submit"]');
    if (!logIn) throw new Error('Field for login not find');

    await logIn?.click({ delay: 10 });

    await page.waitForTimeout(2000);

    // CHECK FOR CAPTCHA
    const body3 = await page.$('body');
    const capchaBody = await body3?.$('iframe[title="reCAPTCHA"]');
    if (capchaBody) {
      console.log('capcha body found');
      const capcha = await capchaBody.$$('div[class="recaptcha-checkbox-border"]');
      if (capcha.length) {
        console.log('click capcha');
        // await capcha[0].click();
      } else {
        await page.waitForTimeout(3000);
        const body4 = await page.$('body');
        const captcha2 = await body4?.$$('div[class="recaptcha-checkbox-border"]');
        if (captcha2?.length) {
          // await captcha2[0]?.click();
          console.log('capcha2 click');
        } else {
          console.log('capcha not found');
          //await capchaBody.click();
        }
      }
      console.log('captcha body not found');
    }
    if (await page.$('text/Nieprawidłowy login')) throw new Error('Invalid login or password');
    await page.waitForTimeout(1500);
    const body5 = await page.$('body');
    const capchaBody2 = await body5?.$('div[class="recaptcha-checkbox-border"]');
    if (capchaBody2 && process.env.HEADLESS === 'false') await page.waitForTimeout(30000);
    console.log('go to files');
    await page.waitForTimeout(13000);

    // CHECK SUCCESS AND SAVE COOKIES
    const success2 = await page.$('textarea[id="title"]');
    if (!success2) {
      const loginError = await screenshotPage(page, 'login error');
      // await context.close();
      return { info: `${info}. Page not load. Error: ${loginError} ` };
    }
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
    if (!update.modifiedCount) {
      console.log('Cookies for update not find');
      console.log('save cookies');
      const save = await create(cookiesObject);
      if (!save) console.log('not save');
      info += ', Cookies for update not find - save cookies';
    } else {
      info += ', update cookies';
    }

    return { context, page, info };
  } catch (err) {
    const errorScreen = await screenshotPage(page, 'error: loginForOlx');
    await context.close();
    return { info: `${(err as any).toString()}.Screen: ${errorScreen}` };
  }
}
