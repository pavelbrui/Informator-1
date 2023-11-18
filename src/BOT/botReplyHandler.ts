
import { SearchSettings, UserSettings } from './botCallbackHandler.js';
import { options, menuOptions, buttonTexts } from './Options.js';
import {filters, gpt, gptWithFilters } from './QueryFunctions.js';
import { infoMess, yourSettings } from "./Messages.js"
import { findAndUpdateChats } from '../utils/updateChats.js';
import { defineCollections } from '../utils/orm.js';





export async function  replyToMessageHandler(text: string, bot:any, chat_id: number, msg: any, settings: UserSettings){

    switch (text) {
      case infoMess.maxReturnMess:
        settings[chat_id].limitMessages = msg.text;
       
        break;
    
      case infoMess.writeKeyWords:
      case infoMess.anotherKeyWords:
        settings[chat_id].keyWords = msg.text.split('/').filter((k: string) => k !== '').map((w: any) => w.split('&'));
        await bot.sendMessage(chat_id, `${infoMess.searching} ${yourSettings(settings[chat_id])}\n......................⏳`);
        await filters(bot, chat_id, settings[chat_id]);
        await bot.sendMessage(chat_id, infoMess.anotherKeyWords, options.Search);
        break;
    
      case infoMess.writeTopic:
        settings[chat_id].topic = msg.text.split('/');
        await bot.sendMessage(chat_id, `${infoMess.searching} ${yourSettings(settings[chat_id])}\n........................\n ....⏳`);
        await gpt(bot, chat_id, settings[chat_id]);
        await bot.sendMessage(chat_id, infoMess.anotherTopic, options.SearchGPT);
        break;
    
        
      case infoMess.writeTopicWithFilters:
        console.log('writeTopicWithFilters');
        
        settings[chat_id].topic = msg.text.split('/');
        await bot.sendMessage(chat_id, infoMess.step_3) //, { parse_mode: 'Markdown' })
        await bot.sendMessage(chat_id, infoMess.writeKeyWordsForTopic, options.InputValue);
        break;

      case infoMess.writeKeyWordsForTopic:
          settings[chat_id].keyWords = msg.text.split('/').filter((k: string) => k !== '').map((w: any) => w.split('&'));
          await bot.sendMessage(chat_id, `${infoMess.searching} ${yourSettings(settings[chat_id])}\n..........................\n ....⏳`);
          await gptWithFilters(bot, chat_id, settings[chat_id]);
          await bot.sendMessage(chat_id, infoMess.anotherTopic, options.SearchFiltersAndGPT);
         break;
     
    
   
  
      case infoMess.chatNamesFilterReq:
      case infoMess.chatNamesFilterOpt:
        settings[chat_id].chats = msg.text.split('/');
        const chatsByChatFilter = await findAndUpdateChats(settings[chat_id].chats || [], settings[chat_id].sities )
        if(!chatsByChatFilter.chats?.length) {await bot.sendMessage(chat_id, "Anyone location not find, please change filter");
      }else{
        await bot.sendMessage(chat_id, "Finded collections: \n" +chatsByChatFilter.chats.join('\n') , menuOptions.SearchSettings)
      }
        await bot.sendMessage(chat_id, infoMess.success, menuOptions.SettingsButton);
        if(settings[chat_id].searchType !== buttonTexts.GPTSearch) await bot.sendMessage(chat_id, infoMess.step_2)
        await bot.sendMessage(
          chat_id, settings[chat_id].searchType === buttonTexts.GPTSearch ?  infoMess.writeTopic : infoMess.writeTopicWithFilters, options.InputValue);
        break;
      
      case infoMess.sities:
        if(text === infoMess.sities)   {
        const collections = await defineCollections(msg.text.split('/'))
        if(!collections.length) {await bot.sendMessage(chat_id, "Anyone location not find, please change filter");
      }else{
        settings[chat_id].sities = collections;
        await bot.sendMessage(chat_id, "Success! Finded saved locations: \n" +collections.join('\n') )
        const findByLocation = await findAndUpdateChats([], collections )
        settings[chat_id].chats = findByLocation.chats;
        await bot.sendMessage(chat_id, "And " + findByLocation.chats?.length + " chats!", menuOptions.SearchSettings)
      }
      }
      case infoMess.chatNames: 
        if(text === infoMess.chatNames) {
        const chatsByChatNames = await findAndUpdateChats(msg.text.split('/')|| [], settings[chat_id].sities )
        if (!chatsByChatNames.chats?.length) {await bot.sendMessage(chat_id, "Anyone chat not find, please change filter", menuOptions.SearchSettings)
      }else{
        settings[chat_id].chats = chatsByChatNames.chats;
        await bot.sendMessage(chat_id, "Success! Finded saved chats: \n <" +chatsByChatNames.chats.join('>\n<')+'>' , menuOptions.SearchSettings)
      };
        }
      case infoMess.otherDaysAgo: 
        if(text === infoMess.otherDaysAgo)  {settings[chat_id].daysAgo = msg.text;
        await bot.sendMessage(chat_id, infoMess.success, menuOptions.SearchSettings);}
        await bot.sendMessage(
          chat_id,
          infoMess.settingsNow + yourSettings(settings[chat_id]),
          settings[chat_id].searchType === buttonTexts.Filters ? options.Search : settings[chat_id].searchType === buttonTexts.GPTSearch ? options.SearchGPT :  settings[chat_id].searchType === buttonTexts.FiltersGPT ? options.SearchFiltersAndGPT : options.SearchType
        );
        break;
    
      
        

    
      default:
        console.log('botReplyHandler :     HHHHH')
      break;
    }
}