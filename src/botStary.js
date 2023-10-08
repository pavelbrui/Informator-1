import TelegramBot from 'node-telegram-bot-api';
import {filters, gpt, gptWithFilters } from './utils/bots.js';
import { options } from './botOptions.js';
import { callbackHandler, infoMess } from './botCallbackHandler.js';

const FinderByChats='6659125986:AAGcWZCUcBhJknQNmK_2InwjwOQo6-h9S7Y'
const bot = new TelegramBot(FinderByChats, { polling: true });

let userSettings = {};



bot.on('message', async (msg) => {
  const id = msg.message_id;
  const chat_name = msg.chat.title;
  const chat_id = msg.chat.id;
  const from = msg.from?.username  || msg.from?.first_name +"_"+ msg.from?.last_name
  const from_id = msg.from?.id
  const content = msg.text;
  const date = new Date(msg.date * 1000); 
  console.log("For FINDER! from: ", from, ", chat_id: ", chat_id, ", text: ", content)
  
 // if(content?.length&&content?.length>1) MongOrb('GPT4Listener').collection.updateOne({_id: chat_id},{ $set: {chatName: chat_name} , $push: {messages:{message_id,message_thread_id,reply_to_message_id, sender_name,sender, content,time }}},  { upsert: true });
 switch (content) {
  case '/start':
    await bot.sendMessage(chat_id, ' *Welcome to Messages Search Bot!* 🌟', { parse_mode: 'Markdown' });
    infoMess.startTypeSearch='🚀 For starting choose type search:'
    bot.sendMessage(chat_id, infoMess.startTypeSearch , options.SearchType);
    userSettings[chat_id] = {}
    break;

  case 'Settings' :
    bot.sendMessage(chat_id, 'Choose an option:', options.SearchSettings);
    break;

  case 'Back':
    bot.sendMessage(chat_id, 'Choose an option:', options.Search);
    break;


  case 'SearchType':
    infoMess.searchType='Choose type search:'
    bot.sendMessage(chat_id, infoMess.searchType , options.SearchType);
    break;

  case 'DaysAgo':
    infoMess.maxOldMessages = `Choose max old messages for search:`
    bot.sendMessage(chat_id, infoMess.maxOldMessages , options.InputDaysAgo);
   break

  case 'LimitReturnedMessages':
    console.log("LimitReturnedMessages!!!!");
    infoMess.maxReturnMess='Choose max number returned messages for one response:'
    bot.sendMessage(chat_id, infoMess.maxReturnMess , options.NumberMessages)
    break

  case 'ChatNamesFilter':
      infoMess.chatNames = `Enter ${content} or fragments (separated by '/'):`
        bot.sendMessage(chat_id, infoMess.chatNames , options.InputChats);
     break

  case '1 day':
  case '3 days':
  case '7 days':
  case '30 days':
      userSettings[chat_id].daysAgo = content?.split(" ")[0] ;
      await bot.sendMessage(chat_id, "Your settings:", options.Search2 )
      await bot.sendMessage(chat_id, JSON.stringify(userSettings[chat_id]), options.Search)
   break;
      
     
  default:
    // Handle reply messages if needed
    if (msg.reply_to_message){
      console.log(msg.reply_to_message)
      const settings = userSettings[chat_id];
      replyToMessageHandler(msg.reply_to_message.text,infoMess, bot, chat_id, settings)
      break
  }
  bot.sendMessage(chat_id, ".......")
 
  
  let arr = []
  
  if(content?.includes('{')&&content.includes('}')){
    const regGetChatContent = /\{\}/g
    const topicWithColection = content?.replace(regGetChatContent,"")
    if(topicWithColection.includes('-')){
      arr = topicWithColection.split('-')
    }
    const topic =arr[0] || topicWithColection
    const chat = arr[1]
    const chats = chat?.split(',') || ["wroclaw"]
    await gpt(chat_id, topic, chats)
    

} else if(content?.includes('#')){
  const reg = /\#\]\[/g
  const wordsWithColection = content?.replace( '#', "", 1)
  console.log(wordsWithColection);
  if(wordsWithColection.includes('-')){
    arr = wordsWithColection.split('-')
  }
  const keyWords =(arr[0] || wordsWithColection).split(';').map((w)=>w.split(','));
  console.log(keyWords);
  const collection = arr[1]
    const collections = collection?.split(',') || ["Bialystok","po"]
   await filters(chat_id, keyWords, collections)

}else{
 console.log(" else block no response")
}
break;
}
});

bot.on('callback_query', async (callback) => {
  console.log(callback.message)
  callbackHandler(callback, infoMess, bot, settings)

}
)

bot.on('polling_error', (error) => {
    console.log(`Polling error: ${error.body}`);
  });





  //bot.sendMessage(878727057, "Hello my friend. I am worker from my boss Pasha Brui! I wish for you good day!")
 // bot.sendMessage(chat_id, "I'm sorry! This bot is in the process of being updated. Try again later. ");





 