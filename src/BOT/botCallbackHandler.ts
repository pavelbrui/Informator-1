import { options, menuOptions, buttonTexts } from "./Options.js"

import { infoMess, yourSettings } from "./Messages.js"
//import { defaultSettings } from "../TelegramMutation/startBot.js"





export async function callbackHandler(callback:any, bot:any, settings: UserSettings){
const chat_id = callback.message?.chat?.id
if(chat_id && !settings[chat_id]) settings[chat_id] = { daysAgo: 30, limitMessages: 5 }
  const content = callback.data
  switch (content) {
    case 'KeyWords':
        await bot.sendMessage(chat_id, infoMess.writeKeyWords,  options.InputValue) //, { parse_mode: 'Markdown' });
        break

  //  case 'KeyWordsForTopic':
  //   await bot.sendMessage(chat_id, infoMess.step_3, { parse_mode: 'Markdown' }) 
  //    await bot.sendMessage(chat_id, infoMess.writeKeyWordsForTopic, options.InputValue)//, { parse_mode: 'Markdown' });
  //        break

    case 'Topic':
      await bot.sendMessage(chat_id, infoMess.writeTopic, options.InputValue)
         break
      
    case 'TopicWithFilters':
      await bot.sendMessage(chat_id, infoMess.step_2, { parse_mode: 'Markdown' }) 
      await bot.sendMessage(chat_id, infoMess.writeTopicWithFilters, options.InputValue)
    break
      
    
    case 'Sities':
      await bot.sendMessage(chat_id, infoMess.sities, options.InputValue);
      break

    case 'BackToSearchTypes':
      await bot.sendMessage(chat_id, infoMess.welcom, { parse_mode: 'Markdown' });
      await bot.sendMessage(chat_id, infoMess.startTypeSearch , options.SearchType);
      break

    
    case 'Filters + GPT':
        settings[chat_id].searchType = buttonTexts.FiltersGPT;
      //delete settings.keyWords;
      await bot.sendMessage(chat_id, infoMess.filtersAndGptSettings  + yourSettings(settings[chat_id]), menuOptions.Back );
      await bot.sendMessage(chat_id, infoMess.step_1, { parse_mode: 'Markdown' }) 
      await bot.sendMessage(chat_id, infoMess.addChatNamesOrSkip, options.AddChatFilterOpt)
      break;

      case 'GPT search':
        settings[chat_id].searchType = buttonTexts.GPTSearch;
        //delete settings.keyWords;
        await bot.sendMessage(chat_id, infoMess.gptTypeInfo, options.Back );
        await bot.sendMessage(chat_id, infoMess.chatNamesFilterReq, options.InputValue)
        break;

      
    case 'Filters' :
      settings[chat_id].searchType = buttonTexts.Filters;
      settings[chat_id].limitMessages = settings[chat_id].limitMessages || 5;
      settings[chat_id].daysAgo = settings[chat_id].daysAgo || 30;
      await bot.sendMessage(chat_id, infoMess.filtersSettings + yourSettings(settings[chat_id]), menuOptions.SettingsButton );
      await bot.sendMessage(chat_id,infoMess.filtersMessage, options.Search)
      break;


    case  'addChatFilter':
      await bot.sendMessage(chat_id, infoMess.chatNames , options.InputValue);
      break

    case  'addChatFilterOpt':
      await bot.sendMessage(chat_id, infoMess.chatNamesFilterOpt , options.InputValue);
      break
    case 'skipAddChats':
      await bot.sendMessage(chat_id, infoMess.settingsNow + yourSettings(settings[chat_id]), menuOptions.SettingsButton);
      await bot.sendMessage(chat_id, infoMess.step_2, { parse_mode: 'Markdown' }) 
      await bot.sendMessage(
      chat_id, infoMess.writeTopicWithFilters, options.InputValue);
      break;
      
      
    default:
      if (callback.data.includes('button_')){
         settings[chat_id].limitMessages = callback.data?.replace("button_","") ; 
         console.log(settings) 
         console.log(settings[chat_id])
         await bot.sendMessage(chat_id, infoMess.settingsNow, menuOptions.SettingsButton );
         await bot.sendMessage(chat_id, yourSettings(settings[chat_id]), options.Search);}
  }
}



export interface UserSettings {
  [key: number]: SearchSettings; 
}

export type SearchSettings = {
  searchType?: string,
  topic?:string[],
  keyWords?: string[][],
  sities?: string[],
  chats?: string[],
  daysAgo: number,
  limitMessages: number,
}