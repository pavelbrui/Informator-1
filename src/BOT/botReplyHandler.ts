
import { SearchSettings } from './botCallbackHandler.js';
import { options, menuOptions, buttonTexts } from './Options.js';
import {filters, gpt, gptWithFilters } from './QueryFunctions.js';
import { infoMess, yourSettings } from "./Messages.js"
import { findAndUpdateChats } from '../utils/updateChats.js';





export async function  replyToMessageHandler(text: string, bot:any, chat_id: number, msg: any, settings: SearchSettings){

    switch (text) {
      case infoMess.maxReturnMess:
        settings.limitMessages = msg.text;
        break;
    
      case infoMess.writeKeyWords:
      case infoMess.anotherKeyWords:
        settings.keyWords = msg.text.split('/').filter((k: string) => k !== '').map((w: any) => w.split('&'));
        await bot.sendMessage(chat_id, `${infoMess.searching} ${yourSettings(settings)}\n......................⏳`);
        await filters(bot, chat_id, settings);
        await bot.sendMessage(chat_id, infoMess.anotherKeyWords, options.Search);
        break;
    
      case infoMess.writeTopic:
        settings.topic = msg.text.split('/');
        await bot.sendMessage(chat_id, `${infoMess.searching} ${yourSettings(settings)}\n........................\n ....⏳`);
        await gpt(bot, chat_id, settings);
        await bot.sendMessage(chat_id, infoMess.anotherTopic, options.SearchGPT);
        break;
    
        
      case infoMess.writeTopicWithFilters:
        console.log('writeTopicWithFilters');
        
        settings.topic = msg.text.split('/');
        await bot.sendMessage(chat_id, infoMess.step_3) //, { parse_mode: 'Markdown' })
        await bot.sendMessage(chat_id, infoMess.writeKeyWordsForTopic, options.InputValue);
        break;

      case infoMess.writeKeyWordsForTopic:
          settings.keyWords = msg.text.split('/').filter((k: string) => k !== '').map((w: any) => w.split('&'));
          await bot.sendMessage(chat_id, `${infoMess.searching} ${yourSettings(settings)}\n..........................\n ....⏳`);
          await gptWithFilters(bot, chat_id, settings);
          await bot.sendMessage(chat_id, infoMess.anotherTopic, options.SearchFiltersAndGPT);
         break;
     
    
   
  
      case infoMess.chatNamesFilterReq:
      case infoMess.chatNamesFilterOpt:
        settings.chats = msg.text.split('/');
        findAndUpdateChats(settings.chats || [], settings.sities )
        await bot.sendMessage(chat_id, infoMess.success, menuOptions.SettingsButton);
        if(settings.searchType !== buttonTexts.GPTSearch) await bot.sendMessage(chat_id, infoMess.step_2)
        await bot.sendMessage(
          chat_id, settings.searchType === buttonTexts.GPTSearch ?  infoMess.writeTopic : infoMess.writeTopicWithFilters, options.InputValue);
        break;
    
      case infoMess.chatNames: 
        if(text === infoMess.chatNames) settings.chats = msg.text.split('/');
      case infoMess.sities:
        if(text === infoMess.sities)   settings.sities = msg.text.split('/');
        findAndUpdateChats(settings.chats || [], settings.sities )
      case infoMess.otherDaysAgo: 
        if(text === infoMess.otherDaysAgo)  settings.daysAgo = msg.text;
        await bot.sendMessage(chat_id, infoMess.success, menuOptions.SearchSettings);
        await bot.sendMessage(
          chat_id,
          infoMess.settingsNow + yourSettings(settings),
          settings.searchType === buttonTexts.Filters ? options.Search : settings.searchType === buttonTexts.GPTSearch ? options.SearchGPT :  settings.searchType === buttonTexts.FiltersGPT ? options.SearchFiltersAndGPT : options.SearchType
        );
        break;
    
      
        

    
      default:
        console.log('botReplyHandler :     HHHHH')
      break;
    }
}