import TelegramBot from 'node-telegram-bot-api';
import { sendToServer } from './utils/bots.js';
import { Console } from 'console';
const FinderByChats='6659125986:AAGcWZCUcBhJknQNmK_2InwjwOQo6-h9S7Y'

const bot = new TelegramBot(FinderByChats, { polling: true });

let infoMess =[]
let userSettings = {};



const optionsSearchType = {
  reply_markup: {
    inline_keyboard: [[{text:'GPT search', callback_data: 'GPT search'} , {text:'Filters', callback_data:'Filters' }, {text:'Filters + GPT', callback_data:'Filters + GPT' }]],
    force_reply: true,
    resize_keyboard: true,
    one_time_keyboard: true
  },
};

const optionsSearch = {
  reply_markup:  {
    inline_keyboard: [[{text :'Add KeyWords and run', callback_data:'KeyWords'}]],
    resize_keyboard: true,
  },
}
  const optionsSearch2 ={
    reply_markup:  {
    keyboard: [[ 'Settings', 'Instruction']],
    resize_keyboard: true,
  }}

const optionsSearchSettings = {
  reply_markup: {
    keyboard: [['SearchType', 'LimitReturnedMessages', 'DaysAgo']],
    resize_keyboard: true,
  },
};

const optionsInputDaysAgo = {
  reply_markup: {
    force_reply: true, 
    keyboard: [['1 day', '3 days', '7 days'], ['30 days', 'Other']],
    resize_keyboard: true,
  },
};

const optionsNumberMessages = {
  reply_markup: {
    force_reply: true, 
    inline_keyboard: [[{text :'3',  callback_data: 'button_3' }, {text :'5',  callback_data: 'button_5' }, {text :'10',  callback_data: 'button_10' }],[{text :'20',  callback_data: 'button_20' }, {text :'Other',  callback_data: 'button_other',  color: 'blue'}]], 
    resize_keyboard: true,
  },
};

const optionsInputValue = {
  reply_markup: {
    force_reply: true,
    resize_keyboard: true,
  },
};

const optionsInputChats = {
  reply_markup: {
    force_reply: true, 
    resize_keyboard: true,
  },
};

const optionsInputSities = {
  reply_markup: {
    force_reply: true, 
    resize_keyboard: true,
  },
};




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
    infoMess[6]='🚀 For starting choose type search:'
    bot.sendMessage(chat_id, infoMess[6] , optionsSearchType);
    userSettings[chat_id] = {}
    break;

  case 'Settings' :
    bot.sendMessage(chat_id, 'Choose an option:', optionsSearchSettings);
    break;

  case 'Back':
    bot.sendMessage(chat_id, 'Choose an option:', optionsSearch);
    break;

  case 'Input':
    bot.sendMessage(chat_id, "Your parameters:", optionsSearch2 );
    bot.sendMessage(chat_id, 'Add filter:', optionsSearch );
    break;

  case 'SearchType':
    infoMess[5]='Choose type search:'
    bot.sendMessage(chat_id, infoMess[5] , optionsSearchType);
    break;

  case 'DaysAgo':
    console.log(" 'DaysAgo'!!!");
    infoMess[2] = `Choose max old messages for search:`
    bot.sendMessage(chat_id, infoMess[2] , optionsInputDaysAgo);
   break

  case 'LimitReturnedMessages':
    console.log("LimitReturnedMessages!!!!");
    infoMess[3]='Choose max number returned messages:'
    
    bot.sendMessage(chat_id, infoMess[3], optionsNumberMessages);
    break;

    case '1 day':
    case '3 days':
    case '7 days':
    case '30 days':
      userSettings[chat_id].daysAgo = content?.split(" ")[0] ;
      await bot.sendMessage(chat_id, "Your settings:", optionsSearch2 )
      await bot.sendMessage(chat_id, JSON.stringify(userSettings[chat_id]), optionsSearch)
      break;
      
     
    // case 'GPT search':
    // case 'Filters + GPT':
    // case 'Filters' :
    //   console.log();
    //   userSettings[chat_id].searchType = content;
    //   bot.sendMessage(chat_id, JSON.stringify(userSettings[chat_id]), optionsSearch)
    //   break;

    case 'RUN SEARCH':
    const settings = userSettings[chat_id];
    const searchQuery = JSON.stringify(settings);
    console.log(searchQuery);
    if(!userSettings[chat_id]?.keyWords) bot.sendMessage(chat_id, `KeyWords is required!`);
    await bot.sendMessage(chat_id, `Searching with settings: ${searchQuery}`);
    await filters(chat_id, userSettings[chat_id]?.keyWords, userSettings[chat_id]?.sities, userSettings[chat_id]?.chats,userSettings[chat_id]?.daysAgo,userSettings[chat_id]?.limitMessages )
    await bot.sendMessage(chat_id, "Repeat? You can to change configuration", optionsSearch2 );
    await bot.sendMessage(chat_id, JSON.stringify(userSettings[chat_id]), optionsSearch)
    // Clear user settings after searching
   // userSettings[chat_id];
    break;

  default:
    // Handle other messages if needed
    console.log(msg)
    if (msg.reply_to_message){
  if ( msg.reply_to_message.text === infoMess[3])  userSettings[chat_id].limitMessages = msg.text; 
  if ( msg.reply_to_message.text === infoMess[4]){
    userSettings[chat_id].keyWords = msg.text.split('/').map((w)=>w.split('&'));

    const settings = userSettings[chat_id];
    const searchQuery = JSON.stringify(settings);
    console.log(searchQuery);
    await bot.sendMessage(chat_id, `Searching with settings: ${searchQuery}`);
    await filters(chat_id, userSettings[chat_id]?.keyWords, userSettings[chat_id]?.sities, userSettings[chat_id]?.chats,userSettings[chat_id]?.daysAgo,userSettings[chat_id]?.limitMessages )
    await bot.sendMessage(chat_id, "You can enter other keyWords or change settings", optionsSearch2 );
    await bot.sendMessage(chat_id, JSON.stringify(userSettings[chat_id]), optionsSearch)
  }
  if ( msg.reply_to_message.text === infoMess[0]) userSettings[chat_id].chats = msg.text.split(',')
  if ( msg.reply_to_message.text === infoMess[1]) userSettings[chat_id].sities = msg.text.split(',')
  await bot.sendMessage(chat_id, "Let's go! Add filters:", optionsSearch2 );
  await bot.sendMessage(chat_id,  JSON.stringify(userSettings[chat_id]).replace('/{}/', '') , optionsSearch);
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
    const collection = arr[1]
    const collections = collection?.split(',') || ["wroclaw"]
    const getMessagesByTopic = `query {
      telegram {
          getMessagesByTopic(chats: "${collections}", topic: "${topic}") {
            chat_name
            chat_id
            id
            reply_to_message_id
            date
            from
            text
          }
        }
    }`
    const data = await sendToServer(getMessagesByTopic)
    response = data?.telegram?.getMessagesByTopic[0]?.text || "i don't know!"
    bot.sendMessage(chat_id, response); 
   //if(messages?.length>10) bot.sendMessage(chat_id, "Next 10 messages>>")

} else if(content?.includes('#')&&content.includes('#')){
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
   await filters(keyWords, chat_id, collections)

   
}else{
 console.log(" else block no response")
}
break;
}


});


bot.on('callback_query', async (callback) => {
  console.log(callback.message)
  const chat_id = callback.message?.chat?.id
  const content = callback.data
  switch (content) {
    // case 'SearchType':
    // infoMess[5]='Choose type search:'
    // const optionsSearchType = {
    //   reply_markup: {
    //     inline_keyboard: [[{text:'GPT search', callback_data: 'GPT search'} , {text:'Filters', callback_data:'Filters' }, {text:'Filters + GPT', callback_data:'Filters + GPT' }], ['Back']],
    //     force_reply: true,
    //     resize_keyboard: true,
    //   },
    // };
    // bot.sendMessage(chat_id, infoMess[5] , optionsSearchType);
    // break;


    case 'KeyWords':
          infoMess[4]= `Enter keywords or fragments (separated by '/', if you want find message include group keyWords use symbol &. For example if you write Warszawa&Bialystok/warshaw&tomorrow, bot find for you messages includes full fragments 'warszawa' and fragment 'Bialystok' + all messages with fragment warszaw and word tomorrow in one text):` 
            bot.sendMessage(chat_id, infoMess[4] , optionsInputValue);
         break
      
         case 'ChatNames':
          infoMess[0] = `Enter ${content} or fragments (separated by '/'):`
            bot.sendMessage(chat_id, infoMess[0] , optionsInputChats);
         break
      
         case 'Sities':
          infoMess[1] = `Enter ${content}:`
            bot.sendMessage(chat_id, infoMess[1] , optionsInputSities);
         break

    case 'GPT search':
    case 'Filters + GPT':
    case 'Filters' :
      userSettings[chat_id].searchType = content;
      userSettings[chat_id].limitMessages = userSettings[chat_id].limitMessages || 5;
      userSettings[chat_id].daysAgo = userSettings[chat_id].daysAgo || 30;
     await bot.sendMessage(chat_id, "Let's go! Your settings now:", optionsSearch2 );
      bot.sendMessage(chat_id, JSON.stringify(userSettings[chat_id])+'\n You can change settings or go to write your key words for search: ', optionsSearch)
      break;
      
      
      

    default:
  userSettings[chat_id].limitMessages = callback.data?.replace("button_","") ; 
 await bot.sendMessage(chat_id, "Your parameters:", optionsSearch2 );
  bot.sendMessage(chat_id, JSON.stringify(userSettings[chat_id]), optionsSearch);
  }


}
)


bot.on('polling_error', (error) => {
    console.log(`Polling error: ${error}`);
  });





  //bot.sendMessage(878727057, "Hello my friend. I am worker from my boss Pasha Brui! I wish for you good day!")
 // bot.sendMessage(chat_id, "I'm sorry! This bot is in the process of being updated. Try again later. ");





 async function filters(chat_id, keyWords, collections, chats, daysAgo,n ){
  let response = 'Not found anyone message'
  //let messages =["Not found anyone message"]
  const getMessagesByTags = `query {
	telegram{
		getMessagesByTags(
			chats: ${JSON.stringify(chats || ["Белосток"])}
			keyWords: ${JSON.stringify(keyWords)}
      collections:${JSON.stringify(collections || ['Bialystok'])}
      daysAgo: ${daysAgo || 30}
		){
      chat_name
      chat_id
      id
      reply_to_message_id
      date
      from
      text
		}
	}
}`
  const data = await sendToServer(getMessagesByTags) 
  const messages = data?.telegram?.getMessagesByTags
  response = messages?.length ? messages.slice(0,n || 10).map((m)=>`\n<${m.chat_name || m.chat_id ||""}>\n${m.from}:\n-"${m.text}"\n                           ${m.date.slice(0, -3).replace('T', " ")}\n `)?.toString() : data
  bot.sendMessage(chat_id,`I found ${messages?.length>1000 ? "more then 1000" : messages?.length} messages!!!`)
  bot.sendMessage(chat_id, response); 
   if(messages?.length>10) bot.sendMessage(chat_id, "Next 10 messages>>")
   
}