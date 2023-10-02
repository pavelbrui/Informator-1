
import { FieldResolveInput } from 'stucco-js';
import { resolverFor } from '../zeus/index.js';
import puppeteer from 'puppeteer';
import { setTimeout as wait } from 'timers/promises';
import fs from 'fs';
import { MongOrb } from '../utils/orm.js';


export const handler = async (input: FieldResolveInput) => 
  resolverFor('TelegramQuery','getChatContent',async (args) => {
    
    const browser = await puppeteer.launch({
      executablePath: process.env.BROWSER_PATH ? undefined : '/usr/bin/chromium-browser',
      headless: process.env.HEADLESS === 'false' ? false : 'new',
      slowMo: process.env.SLOW ? (process.env.SLOW as unknown as number) : 0,
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--disable-setuid-sandbox'],
    });;

    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();
    //const page = await browser.newPage();
  

   
    await fs.readFile('./cookies.json', async (err, data) => {
         if (err){
           console.log(err);
         } else {
           let json = JSON.parse(data.toString());
           await page.setCookie(...json.cookies);
           //console.log(json);
         //your code using json object
         }
    });

     
    await page.goto('https://web.telegram.org',{
      waitUntil: 'domcontentloaded',
    });// here without /z/, with z for some reason it doesn't work

   // Ustaw obsługę okna dialogowego
   page.on('dialog', async (dialog) => {
    console.log(`Przechwycono dialog: PPPPPPP`);  // ${dialog.message()} 
    console.log(`Przechwycono dialog: ${dialog.message()}`); 
    // Tutaj możesz obsłużyć popup, np. klikając na przycisk "Anuluj"
    //await dialog.accept('text/Allow')
    //await dialog.dismiss();
  })

    await fs.readFile('./localStorageData.json', async (err, data) => {
      if (err){
        console.log(err);
      } else {
        let json = JSON.parse(data.toString());
      
        await page.evaluate(localStorageData => {
          localStorage.clear();
          for (let key in localStorageData) {
              //console.log(key);
            localStorage.setItem(key, localStorageData[key]);
          }
        }, json);
        //console.log(json);
      }
 });

    
    

      
  

    await page.waitForTimeout(12000);

    await page.type('input[id="telegram-search-input"]', args.input?.regChatName);
    await page.waitForTimeout(4000);
    const search = await page.$(
      '#LeftColumn-main > div.Transition > div.Transition_slide.Transition_slide-active > div > div.Transition > div > div:nth-child(2) > div:nth-child(3) > div > div > div.info > div > h3',
    );
    const search2 = await page.$$(
      '#LeftColumn-main > div.Transition > div.Transition_slide.Transition_slide-active > div > div.Transition > div > div > div> div[role="button"]')
    
    // Odfiltruj elementy zawierające tekst
    const filteredElements = [];
    const chatNames:string[] =[]
    for (const element of search? [search].concat(search2): search2 ) {
      const textContent = await page.evaluate(el => el.textContent, element);
     
      
      if (textContent?.includes(args.input.regChatName)) {
        const subNameEl = search? search : await element.$('span[class="handle"]')
        const subName = await page.evaluate(el => el?.textContent, subNameEl);
        if(subName)chatNames.push(subName)
        filteredElements.push(element);
      }
    }


    await (search || search2[0])?.click({ delay: 30 });
    await page.waitForTimeout(3000);
    const body = await page.$('body');
    //const select = await firstbody?.$('text/Nieruchomości');


    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight / 2);
    });
   

   const rental_infoPromises = await (
      (await body?.$$('div.message-content-wrapper.can-select-text')
    )?.map(async (m) => {
      const from =  await(await m.$('div > div.content-inner > div.message-title'))?.evaluate((el) => 
      el?.textContent);
      const text =  await(await m.$('div > div.content-inner > div.text-content.clearfix.with-meta'))?.evaluate((el) => 
      el?.textContent);
      const reactions =  await(await m.$('div > div.content-inner > div.text-content.clearfix.with-meta > div'))?.evaluate((el) => 
      el?.textContent);
      const time =  await(await m.$('div > div.content-inner > div.text-content.clearfix.with-meta > div > span > span'))?.evaluate((el) => 
      el?.textContent);
     const message = {from: from || "_",text: text?.replace(reactions||""," ") || "_",date: time || "_", id: "",
      chat_id: ""}
    
      console.log("From : ", from || "_",":",text?.replace(reactions||"",""),":",time || "_" )
      if(text) return message
    }));

    const messages = rental_infoPromises? await Promise.all(rental_infoPromises) : null;
    const CHAT = chatNames[0]
    if (!CHAT) return ["Chat not found"]
    console.log("COLLECTION: ", CHAT)
    if (messages?.length&&messages?.length >0) {
      await MongOrb(CHAT).collection.insertMany(messages);
    }
    
    const regContentTags = args.input?.regContentTags || []; 

    const regexPatterns = regContentTags
  .filter(tag => typeof tag === 'string' && tag.trim() !== '')
  .map(tag => new RegExp(tag as string, "i"))

const query = {
  content: {
    $regex: { $in: regexPatterns },
  },
};

   const targetMessages = await MongOrb(CHAT).collection.find(query)?.toArray();
    await context.close()
    if (targetMessages.length === 0) return ["Messages not found"]
    return targetMessages.map((mes)=>{return(mes.text+" : "+mes.from+" : "+ mes.date)})
   await wait(50000);
  //await browser.close()
  })(input.arguments);
