import { FieldResolveInput } from 'stucco-js';
import { resolverFor } from '../zeus/index.js';
import { MongOrb, getEnv } from '../utils/orm.js';
import TelegramBot from 'node-telegram-bot-api';

import { options, menuOptions } from '../utils/botOptions.js';
import { callbackHandler, infoMess } from '../utils/botCallbackHandler.js';
import { replyToMessageHandler } from '../utils/botReplyHandler.js';
import { otherMessagesHandler } from '../utils/botOtherMessagesHandler.js';



export const handler = async (input: FieldResolveInput) => 
  resolverFor('TelegramMutation','newChats',async (args) => {

    const FinderByChats='6659125986:AAGcWZCUcBhJknQNmK_2InwjwOQo6-h9S7Y'
    const bot = new TelegramBot(FinderByChats, { polling: true });
    const defaultSettings = { daysAgo: 30, limitMessages: 5 }
    let userSettings: any = {};
    //bot.sendMessage(839036065, `Hej! New chats started successed !`)

    bot.on('message', async (msg) => {
      
      const id = msg.message_id;
      const chat_name = msg.chat.title;
      const chat_id = msg.chat.id;
      const from = msg.from?.username  || msg.from?.first_name +"_"+ msg.from?.last_name
      const from_id = msg.from?.id
      const content = msg.text;
      try {
      const date = new Date(msg.date * 1000); 
      console.log("For FINDER! from: ", from, ", chat_id: ", chat_id, ", text: ", content)
      if(chat_id && !userSettings[chat_id] ) userSettings[chat_id] = defaultSettings
      
      if(content?.length&&content?.length>1) MongOrb('FinderListener').collection.updateOne({_id: chat_id},{ $set: {chatName: chat_name || from} , $push: {messages:{id, content, date }}},  { upsert: true });
     switch (content) {
      case '/start':
        await bot.sendMessage(chat_id, ' *Welcome to Messages Search Bot!* 🌟', { parse_mode: 'Markdown' });
        await bot.sendMessage(chat_id, infoMess.startTypeSearch , options.SearchType);
        break;
    
      case 'Settings' :
       await  bot.sendMessage(chat_id, 'Choose an option:', menuOptions.SearchSettings);
        break;
    
      case 'Back':
       await  bot.sendMessage(chat_id, 'Choose an option:', options.Search);
        break;
    
    
      case 'SearchType':
        await bot.sendMessage(chat_id, infoMess.searchType , options.SearchType);
        break;
    
      case 'DaysAgo':
        await bot.sendMessage(chat_id, infoMess.maxOldMessages , options.InputDaysAgo);
       break
    
      case 'LimitReturnedMessages':
        await bot.sendMessage(chat_id, infoMess.maxReturnMess , options.NumberMessages)
        break
    
      case 'ChatNamesFilter':
           await bot.sendMessage(chat_id, infoMess.chatNames , options.InputValue);
         break
    
      case '1 day':
      case '3 days':
      case '7 days':
      case '30 days':
          userSettings[chat_id].daysAgo = content?.split(" ")[0] ;
          await bot.sendMessage(chat_id, "Your settings:", menuOptions.Search2 )
          await bot.sendMessage(chat_id, JSON.stringify(userSettings[chat_id]), options.Search)
       break;
          
         
      default:
       // Handle reply messages
       if (msg.reply_to_message?.text){
        const settings = userSettings[chat_id]
        await replyToMessageHandler(msg.reply_to_message.text,infoMess, bot, chat_id, msg, settings)
        break;
    }
    
       // Handle other messages
      await  bot.sendMessage(chat_id, ".......")
      await otherMessagesHandler(bot, userSettings[chat_id], chat_id, content);
 
     }} catch (error) {
      pushError(error)
    
    }
    
    })


     
  bot.on('callback_query', async (callback) => {
    
    console.log(callback.message)
    const chat_id = callback.message?.chat.id 
    try {
    if(chat_id && !userSettings[chat_id] ) userSettings[chat_id] = defaultSettings
    if(chat_id) callbackHandler(callback, infoMess, bot, userSettings[chat_id] )

  } catch (error) {
    pushError(error)
  }
  })


  bot.on('polling_error', (error) => {
        console.log(`Polling error: ${error.message}`);
      });
    
       
    return true
  })(input.arguments);




  async function pushError(error: any){
    console.error('Error in message handler:', error);
  // await MongOrb('FinderListener').collection.updateOne({chatName: "errors"},{$push:{errors: {  error }}},  { upsert: true });
  }