import { options, menuOptions, buttonTexts } from "./Options.js"

import { infoMess, yourSettings } from "./Messages.js"





export async function callbackHandler(callback:any, bot:any, settings: SearchSettings){
const chat_id = callback.message?.chat?.id
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
        settings.searchType = buttonTexts.FiltersGPT;
      //delete settings.keyWords;
      await bot.sendMessage(chat_id, infoMess.filtersAndGptSettings  + yourSettings(settings), menuOptions.Back );
      await bot.sendMessage(chat_id, infoMess.step_1, { parse_mode: 'Markdown' }) 
      await bot.sendMessage(chat_id, infoMess.addChatNamesOrSkip, options.AddChatFilterOpt)
      break;

      case 'GPT search':
        settings.searchType = buttonTexts.GPTSearch;
        //delete settings.keyWords;
        await bot.sendMessage(chat_id, infoMess.gptTypeInfo, options.Back );
        await bot.sendMessage(chat_id, infoMess.chatNamesFilterReq, options.InputValue)
        break;

      
    case 'Filters' :
      settings.searchType = buttonTexts.Filters;
      settings.limitMessages = settings.limitMessages || 5;
      settings.daysAgo = settings.daysAgo || 30;
      await bot.sendMessage(chat_id, infoMess.filtersSettings + yourSettings(settings), menuOptions.SettingsButton );
      await bot.sendMessage(chat_id,infoMess.filtersMessage, options.Search)
      break;


    case  'addChatFilter':
      await bot.sendMessage(chat_id, infoMess.chatNames , options.InputValue);
      break

    case  'addChatFilterOpt':
      await bot.sendMessage(chat_id, infoMess.chatNamesFilterOpt , options.InputValue);
      break
    case 'skipAddChats':
      await bot.sendMessage(chat_id, infoMess.settingsNow + yourSettings(settings), menuOptions.SettingsButton);
      await bot.sendMessage(chat_id, infoMess.step_2, { parse_mode: 'Markdown' }) 
      await bot.sendMessage(
      chat_id, infoMess.writeTopicWithFilters, options.InputValue);
      break;
      
      
    default:
      if (callback.data.includes('button_')){
         settings.limitMessages = callback.data?.replace("button_","") ; 
         await bot.sendMessage(chat_id, infoMess.settingsNow, menuOptions.SettingsButton );
         await bot.sendMessage(chat_id, yourSettings(settings), options.Search);}
  }
}

export type SearchSettings = {
  searchType: string,
  topic?:string[],
  keyWords?: string[][],
  sities?: string[],
  chats?: string[],
  daysAgo: number,
  limitMessages: number,
}