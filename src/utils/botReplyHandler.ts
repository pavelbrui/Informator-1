
import { SearchSettings } from './botCallbackHandler.js';
import { options, menuOptions } from './botOptions.js';
import {filters, gpt, gptWithFilters } from '../utils/botQueryFunctions.js';





export async function  replyToMessageHandler(text: string, infoMess:any, bot:any, chat_id: number, msg: any, settings: SearchSettings){
    const searchQuery = JSON.stringify(settings);
    console.log(searchQuery);
  if ( text === infoMess.maxReturnMess)  settings.limitMessages = msg.text; 
  if ( text === infoMess.writeKeyWords){
    settings.keyWords = msg.text.split('/').filter((k:string)=>k !=="").map((w:any)=>w.split('&'));
    await bot.sendMessage(chat_id, `Searching with settings: ${searchQuery}`);
    await filters(bot, chat_id, settings)
    await bot.sendMessage(chat_id, "You can enter other keyWords or change settings", options.Search );
    //await bot.sendMessage(chat_id, 'Or you can simply quickly write key words start with symbol #', optionsSearch2)
  }

  if ( text === infoMess.writeTopic){
    settings.topic = msg.text.split('/');
    
    await bot.sendMessage(chat_id, `Searching with settings: ${searchQuery}`);
    await gpt(bot, chat_id, settings )
    await bot.sendMessage(chat_id, "You can enter other topic or change settings", options.SearchGPT);
   // await bot.sendMessage(chat_id, 'Or you can simply quickly write key words start with symbol #', optionsSearch2)
    
  }


  if ( text === infoMess.writeKeyWordsForTopic){
    settings.topic = msg.text.split('/'); 
    await bot.sendMessage(chat_id, `Searching with settings: ${searchQuery}`);
    await gptWithFilters(bot, chat_id, settings)
    await bot.sendMessage(chat_id, "You can enter other topic or change settings", options.SearchFiltersAndGPT);
   // await bot.sendMessage(chat_id, 'Or you can simply quickly write key words start with symbol #', optionsSearch2)
  }

  if (text === infoMess.writeTopicWithFilters){
    settings.keyWords = msg.text.split('/').filter((k:string)=>k !=="").map((w:string)=>w.split('&'));  
    await bot.sendMessage(chat_id, "Enter filter", options.AddChatFilterOpt);
   // await bot.sendMessage(chat_id, 'Or you can simply quickly write key words start with symbol #', optionsSearch2)
  }


  if ( text === infoMess.writeKeyWordsForTopicWithFilters){
    settings.keyWords = msg.text.split('/').filter((k:string)=>k !=="").map((w:string)=>w.split('&'));  
    await bot.sendMessage(chat_id, "Enter filter", options.AddChatFilterOpt);
   // await bot.sendMessage(chat_id, 'Or you can simply quickly write key words start with symbol #', optionsSearch2)
  }


  
  if ( text === infoMess.chatNamesFilter){
    settings.chats = msg.text.split('/')
  await bot.sendMessage(chat_id, "Success!", menuOptions.Search2 );
  await bot.sendMessage(chat_id,  "Your settings:\n"+JSON.stringify(settings)?.replace('/{}/', '') ,settings.searchType === 'Filters' ? options.Search : settings.searchType === 'GPT search'  ?  options.SearchGPT : options.SearchFiltersAndGPT);
    }

  if ( text === infoMess.chatNames){
     settings.chats = msg.text.split('/')
  await bot.sendMessage(chat_id, "Success!", menuOptions.Search2 );
  await bot.sendMessage(chat_id,  "Your settings:\n"+JSON.stringify(settings)?.replace('/{}/', '') ,settings.searchType === 'Filters' ? options.Search : settings.searchType === 'GPT search'  ?  options.SearchGPT : options.SearchFiltersAndGPT);
  }
  if ( text === infoMess.sities){

   settings.sities = msg.text.split('/')
  await bot.sendMessage(chat_id, "Success!", menuOptions.Search2 );
  await bot.sendMessage(chat_id,  "Your settings:\n"+JSON.stringify(settings)?.replace('/{}/', '') ,settings.searchType === 'Filters' ? options.Search : settings.searchType === 'GPT search'  ?  options.SearchGPT : options.SearchFiltersAndGPT);
    }
}