
import { FieldResolveInput } from 'stucco-js';
import { resolverFor } from '../zeus/index.js';
import puppeteer from 'puppeteer';
import { setTimeout as wait } from 'timers/promises';
import fs, { NoParamCallback } from 'fs';

export const handler = async (input: FieldResolveInput) => 
  resolverFor('TelegramQuery','getCookies',async (args) => {

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('https://web.telegram.org/z/'); 

    await wait(60000); //We need this in order to have time for qr-code authentication

    const localStorageData = await page.evaluate(() => {
      let json: Record<string, string> ={}
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if(key){
        json[key] = localStorage.getItem(key) || "";
      }
      }
      return json;
    });
    function callback(error: any, data: any): NoParamCallback {
      if (error) {
        console.error('Wystąpił błąd:', error);
        return error
      } else {
        console.log('Sukces:', data);
        return data
      }
    } 
    //await fs.writeFile('localStorageData.json', JSON.stringify(localStorageData, null, 2))  ;
    await fs.writeFileSync('localStorageData.json', JSON.stringify(localStorageData, null, 2));
    
    const client = await page.target().createCDPSession()
    const cookies = await client.send('Network.getAllCookies');

    await fs.writeFileSync('cookies.json', JSON.stringify(cookies, null, 2))

    await browser.close()
  })(input.arguments);
