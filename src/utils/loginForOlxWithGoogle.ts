import puppeteer from 'puppeteer';
import { DB } from 'gei-crud/lib/db/orm.js';
import { handler as create } from 'gei-crud/lib/Mutation/create.js';
import { screenshotPage } from './screenshot.js';
import { loginForMails } from './loginForGmail.js';
const browser = await puppeteer.launch({
  executablePath: process.env.BROWSER_PATH ? undefined : '/usr/bin/chromium-browser',
  headless: process.env.HEADLESS === 'false' ? false : true,
  slowMo: process.env.SLOW ? (process.env.SLOW as unknown as number) : 0,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--disable-setuid-sandbox'],
});
const url = 'https://www.olx.pl/';

export async function loginForOlxWithGoogle(args: {
  login: { email: string; password: string };
  microsoftMail?: string;
  microsoftPassword?: string;
}) {
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
      await page.waitForTimeout(6000);
      const success = await page.$('textarea[id="title"]');

      if (success) {
        await DB().then(async (db) => {
          return db
            ('Cookies')
            .collection.updateOne(
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
      // LOGIN WITH GOOGLE PASSWORD
      console.log('Login with google password');
    }
    let info = 'Login with google password';
    await page.waitForTimeout(5000);
    const body = await page.$('body');
    //POPUP
    const button = await body?.$('button[id="onetrust-accept-btn-handler"]');
    if (button) console.log('Zaakceptuj find');

    button ? await button.click() : console.log('Popup not find');
    await page.waitForTimeout(350);
    //NEW POST
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

    // GOOGLE LOGIN
    const googleButton = await page.$('button[data-testid="google-button"]');
    if (!googleButton) throw new Error('GoogleButton not find');
    await googleButton.click({ delay: 10 });
    await page.waitForTimeout(1200);
    // EMAIL
    console.log('email');
    const body5 = await page.$('body');
    const email = await body5?.$('input[type="email"]');
    if (!email) throw new Error('Field for email not find');
    await email.type(args.login?.email);
    await page.waitForTimeout(50);
    page.keyboard.press('Enter');
    await page.waitForTimeout(2000);

    // CHECK FOR MICROSOFT
    const emailMicrosoft = await page.$('input[type="email"][name="loginfmt"]');
    if (emailMicrosoft) {
      console.log('microsoft!!');
      await emailMicrosoft.type(args.microsoftMail || args.login?.email);
      await page.waitForTimeout(50);
      page.keyboard.press('Enter');
      await page.waitForTimeout(1300);
    }

    // PASSWORD
    console.log('password');
    const body3 = await page.$('body');
    const password = await body3?.$('input[type="password"]');
    if (!password) throw new Error('"Welcome" not find');
    await password.click({ delay: 10 });
    await password.type(args.microsoftPassword || args.login?.password);
    await page.waitForTimeout(50);
    page.keyboard.press('Enter');
    await page.waitForTimeout(3000);

    // CHECK FOR POPUP
    const body7 = await page.$('body');
    const logIn = await body7?.$('*[type="submit"]');
    if (logIn) {
      await logIn.click();
      console.log('go to files');
      await page.waitForTimeout(3000);
    }

    // CHECK FOR POPUP 2
    const body8 = await page.$('body');
    const withGoogle = await body8?.$('text/Continue with Google');
    if (withGoogle) {
      await withGoogle.click();
      console.log('go to files');
    }

    await page.waitForTimeout(2000);
    // VERYFICATION
    const veryfyType =
      (await page.$('text/Odbierz kod weryfikacyjny')) || (await page.$('text/Odbierz kod weryfikacyjny'));
    if (veryfyType) {
      await veryfyType.click();
      await page.waitForTimeout(5000);
    }

    const verify = (await page.$('text/Wpisz')) || (await page.$('text/Enter'));
    if (verify) {
      let code = null;
      /// GOOGLE 2
      const login2 = await loginForMails({
        login: { email: args.microsoftMail || ' ', password: args.microsoftPassword || '' },
      });
      if (!login2.page) throw new Error(login2.info);
      const mail = await login2.page.$('tr[jscontroller="ZdOxDb"]');
      if (!mail) {
        const emailscreen = await screenshotPage(login2.page, 'error: lastMail');
        throw new Error(`Last mail not found. Screen: ${emailscreen}`);
      }
      await mail?.click();
      await login2?.page.waitForTimeout(1000);

      const docs = await login2.page.$('body');
      const viewDoc = await docs?.$('text/Verification Code');
      if (!viewDoc) throw new Error('No code');
      const codeElement = await docs?.$('td > div > p > strong');

      if (!codeElement) throw new Error('ERRERRERER');
      code = await codeElement.evaluate((node) => node.textContent);

      /////
      await page.type('input', code || '111111');
      await page.keyboard.press('Enter');
    }
    // CHECK SUCCESS AND SAVE COOKIES
    await page.waitForTimeout(10000);
    const success2 = await page.$('textarea[id="title"]');
    if (!success2) {
      const loginError = await screenshotPage(page, 'login error');
      await context.close();
      info = `${info}. Page not load. Error: ${loginError}`;
      return { info };
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
    const errorScreen = await screenshotPage(page, 'error: GoogleLOginForOLx');
    await context.close();
    return { info: `${(err as any).toString()}.Screen: ${errorScreen}` };
  }
}
