
import { FieldResolveInput } from 'stucco-js';
import { resolverFor } from '../zeus/index.js';
import puppeteer from 'puppeteer';
import { setTimeout as wait } from 'timers/promises';
import fs from 'fs';
import { MongOrb } from '../utils/orm.js';


export const handler = async (input: FieldResolveInput) => 
  resolverFor('TelegramQuery','getChatsMessages',async (args) => {
    
    const browser = await puppeteer.launch({
      executablePath: process.env.BROWSER_PATH ? undefined : '/usr/bin/chromium-browser',
      headless: process.env.HEADLESS === 'false' ? false : true,
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
      waitUntil: 'load',
    });// here without /z/, with z for some reason it doesn't work

   // Ustaw obsługę okna dialogowego
   page.on('dialog', async (dialog) => {
    console.log(`Przechwycono dialog: PPPPPPP`);  // ${dialog.message()} 
    console.log(`Przechwycono dialog: ${dialog.message()}`); 
    // Tutaj możesz obsłużyć popup, np. klikając na przycisk "Anuluj"
     await dialog.dismiss();
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

    
    

      
  

    await page.waitForTimeout(8000);
    const tak = await page.$('#column-left > div > div')
    const input = await tak?.$('input[id="telegram-search-input"]')
    await page.type('input[id="telegram-search-input"]', args.input[0]?.regChatName ||"");
    await page.waitForTimeout(4000);
    
    const search = await page.$$('#LeftColumn-main > div.Transition > div.Transition_slide.Transition_slide-active > div > div.Transition > div > div > div> div[role="button"]')
    
    // Odfiltruj elementy zawierające tekst
    const filteredElements = [];
    const chatNames:string[] =[]
    const chatSubNames:string[] =[]
    let allTargetMessages:string[]=[]
    for (const element of search) {
      const textContent = await page.evaluate(el => el.textContent, element);
      
      
      if (textContent?.includes(args.input[0].regChatName)) {
        console.log( textContent);  
        const subNameEl = await element.$('span[class="handle"]')
        const subName = await page.evaluate(el => el?.textContent, subNameEl);
        const fullNameEl = await element.$('h3')
        const chatName = await page.evaluate(el => el?.textContent, fullNameEl);
        console.log(subName);
        
        filteredElements.push(element);
        if(subName) chatSubNames.push(subName)
        if(subName) chatNames.push(chatName || "___")
      }
    }
    
    const n = args.input[0].chatsCount? args.input[0].chatsCount :  filteredElements.length
    await (filteredElements[0])?.click({ delay: 30 });
    for (let i = 0; i <= n; i++) {
      
    await page.waitForTimeout(3000);
    const body = await page.$('body');
    //const select = await firstbody?.$('text/Nieruchomości');


    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight / 2);
    });
   const messages: { 
      sender: string; 
      content: string;
       time?: string | undefined;
       tg_id?: string | undefined; 
        chat_id?: string | undefined;}[] =[]
        

   const rental_infoPromises = await (
      (await body?.$$('div.message-content-wrapper.can-select-text')
    )?.map(async (m) => {
      const sender =  await(await m.$('div > div.content-inner > div.message-title'))?.evaluate((el) => 
      el?.textContent);
      const text =  await(await m.$('div > div.content-inner > div.text-content.clearfix.with-meta'))?.evaluate((el) => 
      el?.textContent);
      const reactions =  await(await m.$('div > div.content-inner > div.text-content.clearfix.with-meta > div'))?.evaluate((el) => 
      el?.textContent);
      const time =  await(await m.$('div > div.content-inner > div.text-content.clearfix.with-meta > div > span > span'))?.evaluate((el) => 
      el?.textContent);
     const message = {sender: sender || "_",content: text?.replace(reactions||""," ") || "_",time: time || "_", tg_id: "",
      chat_id: chatSubNames[i]}
      // push message
      if(text) messages.push(message)
      console.log("text : ",sender || "_",":",text?.replace(reactions||"",""),":",time || "_" )
      //return message
    }));

    const rental_info = rental_infoPromises? await Promise.all(rental_infoPromises) : null;

   
    const CHAT = chatNames[i]
    
    if (messages.length > 0) {

      
      console.log("COLLECTION: ", CHAT)
      await MongOrb(CHAT).collection.insertMany(messages);
    } else {
      console.log('Tablica messages jest pusta, nie ma dokumentów do wstawienia.');
      console.log(messages[0]);
    }
    
    
    
    
    
    
  
    //await MongOrb('MessageCollection').collection.insertMany(messages);
    console.log(args.input[0].regContentTags&&args.input[0].regContentTags[0]? args.input[0].regContentTags[0] : "");
    //page.goBack()
    wait(500);
       
    const regContentTags = args.input[0].regContentTags || [];

    const regexPatterns = regContentTags
      .filter(tag => typeof tag === 'string' && tag.trim() !== '')
      .map(tag => new RegExp(tag||"", 'i'));
    
    const query = {
      'content': {
        $in: regexPatterns,
      },
    };
    console.log(query)
   const targetMessages = await MongOrb(CHAT).collection.find(query)?.toArray();
   // console.log(targetMessage[0]? targetMessage[0].content : undefined)
   console.log(targetMessages)
   allTargetMessages = allTargetMessages.concat(targetMessages)
   
   //await page.type('input[id="telegram-search-input"]', args.input[0]?.regChatName ||"");
   await page.goto(`https://web.telegram.org/k/#@${chatSubNames[i+1]}`);
   // await page.waitForTimeout(4000);

    }
    if (allTargetMessages.length === 0) throw new Error("Messages not found")
    return allTargetMessages
  await wait(50000);
  //await browser.close()
  })(input.arguments);
