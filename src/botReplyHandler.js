
import {filters, gpt, gptWithFilters } from './utils/bots.js';





export async function  replyToMessageHandler(text, infoMess, bot, chat_id, settings){
    const searchQuery = JSON.stringify(settings);
    console.log(searchQuery);
  if ( text === infoMess.maxReturnMess)  userSettings[chat_id].limitMessages = msg.text; 
  if ( text === infoMess.writeKeyWords){
    userSettings[chat_id].keyWords = msg.text.split('/').filter((k)=>k !=="").map((w)=>w.split('&'));
    await bot.sendMessage(chat_id, `Searching with settings: ${searchQuery}`);
    await filters(bot, chat_id, userSettings[chat_id]?.keyWords, userSettings[chat_id]?.sities, userSettings[chat_id]?.chats,userSettings[chat_id]?.daysAgo,userSettings[chat_id]?.limitMessages )
    await bot.sendMessage(chat_id, "You can enter other keyWords or change settings", optionsSearch );
    //await bot.sendMessage(chat_id, 'Or you can simply quickly write key words start with symbol #', optionsSearch2)
  }

  if ( text === infoMess.writeTopic){
    userSettings[chat_id].topic = msg.text.split('/');
    
    await bot.sendMessage(chat_id, `Searching with settings: ${searchQuery}`);
    await gpt(bot, chat_id, userSettings[chat_id]?.topic, userSettings[chat_id]?.sities, userSettings[chat_id]?.chats,userSettings[chat_id]?.daysAgo,userSettings[chat_id]?.limitMessages )
    await bot.sendMessage(chat_id, "You can enter other topic or change settings", optionsSearchGPT);
   // await bot.sendMessage(chat_id, 'Or you can simply quickly write key words start with symbol #', optionsSearch2)
    
  }


  if ( text === infoMess.writeKeyWordsForTopic){
    userSettings[chat_id].topic = msg.text.split('/'); 
    await bot.sendMessage(chat_id, `Searching with settings: ${searchQuery}`);
    await gptWithFilters(bot, chat_id, userSettings[chat_id]?.topic, userSettings[chat_id]?.keyWords, userSettings[chat_id]?.sities, userSettings[chat_id]?.chats,userSettings[chat_id]?.daysAgo,userSettings[chat_id]?.limitMessages )
    await bot.sendMessage(chat_id, "You can enter other topic or change settings", optionsSearchFiltersAndGPT);
   // await bot.sendMessage(chat_id, 'Or you can simply quickly write key words start with symbol #', optionsSearch2)
  }

  if (text === infoMess.writeTopicWithFilters){
    userSettings[chat_id].keyWords = msg.text.split('/').filter((k)=>k !=="").map((w)=>w.split('&'));  
    await bot.sendMessage(chat_id, "Enter filter", optionsAddChatFilterOpt);
   // await bot.sendMessage(chat_id, 'Or you can simply quickly write key words start with symbol #', optionsSearch2)
  }


  if ( text === infoMess.writeKeyWordsForTopicWithFilters){
    userSettings[chat_id].keyWords = msg.text.split('/').filter((k)=>k !=="").map((w)=>w.split('&'));  
    await bot.sendMessage(chat_id, "Enter filter", optionsAddChatFilterOpt);
   // await bot.sendMessage(chat_id, 'Or you can simply quickly write key words start with symbol #', optionsSearch2)
  }


  
  if ( text === infoMess.chatNamesFilter){
    userSettings[chat_id].chats = msg.text.split('/')
  await bot.sendMessage(chat_id, "Success!", optionsSearch2 );
  await bot.sendMessage(chat_id,  "Your settings:\n"+JSON.stringify(userSettings[chat_id])?.replace('/{}/', '') ,userSettings[chat_id].searchType === 'Filters' ? optionsSearch : userSettings[chat_id].searchType === 'GPT search'  ?  optionsSearchGPT : optionsSearchFiltersAndGPT);
    }

  if ( text === infoMess.chatNames){
     userSettings[chat_id].chats = msg.text.split('/')
  await bot.sendMessage(chat_id, "Success!", optionsSearch2 );
  await bot.sendMessage(chat_id,  "Your settings:\n"+JSON.stringify(userSettings[chat_id])?.replace('/{}/', '') ,userSettings[chat_id].searchType === 'Filters' ? optionsSearch : userSettings[chat_id].searchType === 'GPT search'  ?  optionsSearchGPT : optionsSearchFiltersAndGPT);
  }
  if ( text === infoMess.sities){

   userSettings[chat_id].sities = msg.text.split('/')
  await bot.sendMessage(chat_id, "Success!", optionsSearch2 );
  await bot.sendMessage(chat_id,  "Your settings:\n"+JSON.stringify(userSettings[chat_id])?.replace('/{}/', '') ,userSettings[chat_id].searchType === 'Filters' ? optionsSearch : userSettings[chat_id].searchType === 'GPT search'  ?  optionsSearchGPT : optionsSearchFiltersAndGPT);
    }
}