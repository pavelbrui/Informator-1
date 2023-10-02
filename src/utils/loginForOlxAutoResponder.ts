import puppeteer from 'puppeteer';
import { DB } from 'gei-crud/lib/db/orm.js';
import { handler as create } from 'gei-crud/lib/Mutation/create.js';
import { screenshotPage } from './screenshot.js';
import { LoginType } from '../zeus/index.js';
import { loginForMails } from './loginForGmail.js';
const browser = await puppeteer.launch({
  executablePath: process.env.BROWSER_PATH ? undefined : '/usr/bin/chromium-browser',
  headless: process.env.HEADLESS === 'false' ? false : true,
  slowMo: process.env.SLOW ? (process.env.SLOW as unknown as number) : 0,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--disable-setuid-sandbox'],
});
const context = await browser.createIncognitoBrowserContext();

const url = 'https://www.olx.pl/myaccount/answers';

export async function loginForOlxAutoResponder(args: {
  login: { email: string; password: string };
  loginType: LoginType;
  microsoftMail?: string;
  microsoftPassword?: string;
}) {
  const cookiesObject_1 = await DB().then(async (db) => {
    return db('Cookies').collection.findOne({ url: url, name: args.login.password, owner: args.login.email });
  });
  if (cookiesObject_1) {
    const responderInfo = await DB().then(async (db) => {
      return db('AutoResponder').collection.findOne({ address: `AutoResponderLoop for ${args.login.email} ` });
    });
    if (responderInfo) {
      const pages = await browser.pages();
      const id = responderInfo.log[0] as number;
      if (pages[id]) {
        return { context, page: pages[id], pageId: id };
      }
    }
  }
  const context2 = await browser.createIncognitoBrowserContext();
  const page = await context2.newPage();
  console.log(('Open new page with number: ' + ((await browser.pages()).length - 1)) as string);
  const pageId = (await browser.pages()).length - 1;

  await page.setViewport({ width: 1080, height: 1024 });
  try {
    try {
      const cookiesObject = cookiesObject_1
        ? cookiesObject_1
        : await DB().then(async (db) => {
            return db('Cookies').collection
              .findOne({ url: 'https://www.olx.pl/', name: args.login.password, owner: args.login.email });
          });
      if (!cookiesObject) {
        await page.goto(url, {
          waitUntil: 'load',
        });
        console.log('cookies not found');
        throw new Error('Cookies not find');
      }
      console.log('cookies found');

      const cookies = JSON.parse(cookiesObject?.content);
      await page.setCookie(...cookies);

      await page.goto(url, {
        waitUntil: 'load',
      });
      await page.waitForTimeout(7000);

      // POPUP
      const body = await page.$('body');
      const button = await body?.$('button[id="onetrust-accept-btn-handler"]');
      if (button) {
        console.log('Zaakceptuj find');
        await button.click();
        await page.waitForTimeout(500);
      }

      if (!cookiesObject_1) {
        const answers = await page.$('text/Wiadomości');
        if (!answers) {
          console.log('EEEEEEERRRRROOOOOORRRRR -----  Button Wiadomości not found!!!!!!!!!!!!!!!!!!!!!!!');
          throw new Error('Button Wiadomości not found');
        }

        await answers.click();
        await page.waitForTimeout(8000);
      }

      // POPUP
      const popupInfo = await page.$('text/Dbamy o to, aby Twoje dane osobowe poz');
      const Akceptuj = await page.$('text/Akceptuję');
      if (Akceptuj && popupInfo) {
        try {
          await Akceptuj.click();
          await page.waitForTimeout(2000);
        } catch {}
      }

      // CHECK SUCCESS
      const success = await page.$('text/Sprzedaję');
      if (success) {
        try {
          await success.click();
          await page.waitForTimeout(2000);
        } catch {
          console.log('sellerMessage.click() error');
        }
        await DB().then(async (db) => {
          return db('Cookies')
            .collection.updateOne(
              { name: args.login.password, owner: args.login.email, url: url },
              { $set: { content: cookiesObject?.content } },
            );
        });

        const info = 'Cookies find and update ';
        return { context, page, pageId, info };
      }

      console.log('cookies outdated');
      // await page.goto(url, {
      //   waitUntil: 'load',
      // });
      //  await page.waitForTimeout(2000);
      throw new Error('cookies outdated');
    } catch {
      ///
      // IF CHOOSED LOGIN TYPE WITH GOOGLE
      ////
      let info = 'Login with password';
      if (!(args.loginType === LoginType.Login_with_Olx_password)) {
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
          await page.waitForTimeout(1200);
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
          console.log('click to popup');
          await page.waitForTimeout(3000);
        }

        // CHECK FOR POPUP 2
        const body8 = await page.$('body');
        const withGoogle = await body8?.$('text/Continue with Google');
        if (withGoogle) {
          await withGoogle.click();
          console.log('click to google');
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

          await page.type('input', code || '111111');
          await page.keyboard.press('Enter');
        }
      } else {
        // LOGIN WITH PASSWORD
        console.log('Login with password');

        const info = 'Login with password';
        await page.waitForTimeout(5000);

        // POPUP
        const body = await page.$('body');
        const button = await body?.$('button[id="onetrust-accept-btn-handler"]');
        if (button) {
          console.log('Zaakceptuj find');
          await button.click();
        }
        await page.waitForTimeout(350);
        // GO TO MESSAGES
        await page.goto('https://www.olx.pl/myaccount/answers', {
          waitUntil: 'load',
        });
        await page.waitForTimeout(7400);

        // await screenshotPage(page, args.login.email + 'olxLogin');

        // POPUP
        const body2 = await page.$('body');
        const button2 = await body2?.$('button[id="onetrust-accept-btn-handler"]');
        if (button2) console.log('Zaakceptuj find');
        button2 ? await button2.click() : console.log('Popup not find');
        await page.waitForTimeout(350);

        // EMAIL
        const email = await page.$('input[type="email"]');
        if (!email) {
          throw new Error('Field for login not find');
        }
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
      }
      // POPUP
      const popupInfo = await page.$('text/Dbamy o to, aby Twoje dane osobowe poz');
      const Akceptuj = await page.$('text/Akceptuję');
      if (Akceptuj && popupInfo) {
        try {
          await Akceptuj.click();
          await page.waitForTimeout(2000);
        } catch {}
      }
      // CHECK SUCCESS AND SAVE COOKIES
      const sellerMessage = await page.$('text/Sprzedaję');
      if (!sellerMessage)
        throw new Error(`${info}. Error - Button "Sprzedaję" not find. It looks  like page not load.`);
      try {
        await sellerMessage.click();
        await page.waitForTimeout(2000);
      } catch {
        console.log('sellerMessage.click() error');
      }

      const cookiesSave = await page.cookies();
      const cookiesObjectNew = {
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
            { $set: { content: cookiesObjectNew?.arguments.cookiesObject.content } },
          );
      });
      if (!update.modifiedCount) {
        console.log('Cookies for update not find');
        console.log('save cookies');
        const save = await create(cookiesObjectNew);
        if (!save) console.log('not save');
        info += ', Cookies for update not find - save cookies';
      } else {
        info += ', update cookies';
      }
      return { context: context2, page, pageId, info };
    }
  } catch (err) {
    const errorScreen = await screenshotPage(page, 'error: loginForOlx');
    await page.close();
    return { info: `${(err as any).toString()}. Screen:  ${errorScreen}` };
  }
}
