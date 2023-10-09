
import { SearchSettings } from './botCallbackHandler.js';
import { options, menuOptions } from './botOptions.js';
import {filters, gpt, gptWithFilters } from '../utils/botQueryFunctions.js';





export async function  replyToMessageHandler(text: string, infoMess:any, bot:any, chat_id: number, msg: any, settings: SearchSettings){
    function searchQuery(settings: SearchSettings) {
   return JSON.stringify(settings)};
    console.log(searchQuery);
    switch (text) {
      case infoMess.maxReturnMess:
        settings.limitMessages = msg.text;
        break;
    
      case infoMess.writeKeyWords:
        settings.keyWords = msg.text.split('/').filter((k: string) => k !== '').map((w: any) => w.split('&'));
        await bot.sendMessage(chat_id, `Searching with settings: ${searchQuery(settings)}`);
        await filters(bot, chat_id, settings);
        await bot.sendMessage(chat_id, "You can enter other keyWords or change settings", options.Search);
        break;
    
      case infoMess.writeTopic:
        settings.topic = msg.text.split('/');
        await bot.sendMessage(chat_id, `Searching with settings: ${searchQuery(settings)}`);
        await gpt(bot, chat_id, settings);
        await bot.sendMessage(chat_id, "You can enter another topic or change settings", options.SearchGPT);
        break;
    
      
      case infoMess.writeTopicWithFilters:
        settings.topic = msg.text.split('/');
        await bot.sendMessage(chat_id, infoMess.writeKeyWordsForTopic, options.InputValue);
        break;

        case infoMess.writeKeyWordsForTopic:
          settings.keyWords = msg.text.split('/').filter((k: string) => k !== '').map((w: any) => w.split('&'));
          await bot.sendMessage(chat_id, `Searching with settings: ${searchQuery(settings)}`);
          console.log(settings);
          
          await gptWithFilters(bot, chat_id, settings);
          await bot.sendMessage(chat_id, "You can enter another topic or change settings", options.SearchFiltersAndGPT);
         break;
     
    
      // case infoMess.writeKeyWordsForTopicWithFilters:
      //   settings.keyWords = msg.text.split('/').filter((k: string) => k !== '').map((w: string) => w.split('&'));
      //   await bot.sendMessage(chat_id, "Enter filter", options.InputValue);
      //   break;
    
      case infoMess.chatNamesFilterReq:
        settings.chats = msg.text.split('/');
        await bot.sendMessage(chat_id, "Success!", menuOptions.Search2);
        await bot.sendMessage(
          chat_id, infoMess.writeTopic, options.InputValue);
        break;

      case infoMess.chatNamesFilterOpt:
        settings.chats = msg.text.split('/');
        await bot.sendMessage(chat_id, "Success!", menuOptions.Search2);
        await bot.sendMessage(
          chat_id, infoMess.writeTopicWithFilters, options.InputValue);
        break;
    
      case infoMess.chatNames:
        settings.chats = msg.text.split('/');
        await bot.sendMessage(chat_id, "Success!", menuOptions.Search2);
        await bot.sendMessage(
          chat_id,
          "Your settings:\n" + JSON.stringify(settings)?.replace('/{}/', ''),
          settings.searchType === 'Filters' ? options.Search : settings.searchType === 'GPT search' ? options.SearchGPT : options.SearchFiltersAndGPT
        );
        break;
    
      case infoMess.sities:
        settings.sities = msg.text.split('/');
        await bot.sendMessage(chat_id, "Success!", menuOptions.Search2);
        await bot.sendMessage(
          chat_id,
          "Your settings:\n" + JSON.stringify(settings)?.replace('/{}/', ''),
          settings.searchType === 'Filters' ? options.Search : settings.searchType === 'GPT search' ? options.SearchGPT : options.SearchFiltersAndGPT
        );
        break;
    
      default:
        break;
    }
}