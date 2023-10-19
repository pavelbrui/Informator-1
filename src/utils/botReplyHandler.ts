
import { SearchSettings } from './botCallbackHandler.js';
import { options, menuOptions, buttonTexts } from './botOptions.js';
import {filters, gpt, gptWithFilters } from './botQueryFunctions.js';
import { infoMess, yourSettings } from "./botMessages.js"





export async function  replyToMessageHandler(text: string, bot:any, chat_id: number, msg: any, settings: SearchSettings){
    
    switch (text) {
      case infoMess.maxReturnMess:
        settings.limitMessages = msg.text;
        break;
    
      case infoMess.writeKeyWords:
        settings.keyWords = msg.text.split('/').filter((k: string) => k !== '').map((w: any) => w.split('&'));
        await bot.sendMessage(chat_id, `${infoMess.searching} ${yourSettings(settings)}\n........................`);
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
        settings.topic = msg.text.split('/');
        await bot.sendMessage(chat_id, infoMess.writeKeyWordsForTopic, options.InputValue);
        break;

        case infoMess.writeKeyWordsForTopic:
          settings.keyWords = msg.text.split('/').filter((k: string) => k !== '').map((w: any) => w.split('&'));
          await bot.sendMessage(chat_id, `${infoMess.searching} ${yourSettings(settings)}\n........................`);
          console.log(settings);
          
          await gptWithFilters(bot, chat_id, settings);
          await bot.sendMessage(chat_id, infoMess.anotherTopic, options.SearchFiltersAndGPT);
         break;
     
    
      // case infoMess.writeKeyWordsForTopicWithFilters:
      //   settings.keyWords = msg.text.split('/').filter((k: string) => k !== '').map((w: string) => w.split('&'));
      //   await bot.sendMessage(chat_id, "Enter filter", options.InputValue);
      //   break;
    
  
      case infoMess.chatNamesFilterReq:
      case infoMess.chatNamesFilterOpt:
        settings.chats = msg.text.split('/');
        await bot.sendMessage(chat_id, infoMess.success, menuOptions.SettingsButton);
        await bot.sendMessage(
          chat_id, settings.searchType === buttonTexts.GPTSearch ?  infoMess.writeTopic : infoMess.writeTopicWithFilters, options.InputValue);
        break;
    
      case infoMess.chatNames:
        settings.chats = msg.text.split('/');
        await bot.sendMessage(chat_id, infoMess.success, menuOptions.SettingsButton);
        await bot.sendMessage(
          chat_id,
          infoMess.settingsNow + yourSettings(settings),
          settings.searchType === buttonTexts.Filters ? options.Search : settings.searchType === buttonTexts.GPTSearch ? options.SearchGPT : options.SearchFiltersAndGPT
        );
        break;
    
      case infoMess.sities:
        settings.sities = msg.text.split('/');
        await bot.sendMessage(chat_id, infoMess.success, menuOptions.SettingsButton);
        await bot.sendMessage(
          chat_id,
          infoMess.settingsNow + yourSettings(settings),
          settings.searchType === buttonTexts.Filters ? options.Search : settings.searchType === buttonTexts.GPTSearch ? options.SearchGPT : options.SearchFiltersAndGPT
        );
        break;
    
      default:
        console.log('HHHHH')
        break;
    }
}