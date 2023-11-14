import { SearchSettings } from "./botCallbackHandler.js";
import { infoMess } from "./Messages.js";
import { menuOptions, options } from "./Options.js";


const responseString = (messages: any)=>
  ( messages.map((m:any)=>
`\n<${m.chat_name || m.chat_id ||""}>\n${m.from}:\n-"${m.text}\nhttps://t.me/${m.chat_id }/${m._id}"\n                           ${m.date.replace('T', " ")}\n `)?.toString())

export async function responseForUser(data:any, bot: any, chat_id: number, settings: SearchSettings ){
    let response = infoMess.anyoneMessage
    if (!data.telegram) {
      console.log(data)
    await bot.sendMessage(chat_id, "Connection error", menuOptions.SettingsButton);
    return
    }
    const messages = data.telegram.getMessagesByTags || data.telegram.getMessagesByTagsAndTopic || data.telegram.getMessagesByTopic
    if (!messages?.length) {
      console.log(data)
    await bot.sendMessage(chat_id, response, menuOptions.SettingsButton);
    return
   }
  
    await bot.sendMessage(chat_id,`I found ${messages?.length>1000 ? "more then 1000" : messages?.length} messages!!!`)
    const limit = settings.limitMessages || 10
    let n = limit
    
    const partOne = responseString(messages.slice(0, limit))
    await sendBigMessage(bot, chat_id, partOne, menuOptions.SettingsButton); 
    
     
    for (n; n < messages.length; n += limit) {
      await bot.sendMessage(chat_id, `Next ${settings.limitMessages||10} from ${messages?.length - n} messages >>`, options.ShowNext)
      await new Promise((resolve) => {
        bot.on('callback_query', async (callback:any) => {
          const text = callback.data 
          console.log(text);
          if (text === 'ShowNext'){
          const partNext = responseString( messages.slice(n, n + limit))
          await sendBigMessage(bot, chat_id, partNext, menuOptions.SettingsButton); 
          resolve(callback);
          }
          //await bot.off('callback_query');
          
        });
        
      })
     }
  }

 



 async function sendBigMessage(bot: any, chat_id: number, response: string, option:any){ 
    try{
    await bot.sendMessage(chat_id, response, option); 
    }catch(e){
      console.log(e)
      console.log(response.length)
      if (JSON.stringify(e).includes('TelegramError: ETELEGRAM: 400 Bad Request: message is too long')){
        await bot.sendMessage(chat_id, response.slice(0,response.length/2));
        console.log(response.length)
        await bot.sendMessage(chat_id, response.slice(response.length/2,response.length), option);
      }
      await bot.sendMessage(chat_id, e, option);
    }
  }