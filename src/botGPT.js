import TelegramBot from 'node-telegram-bot-api';
import { sendToServer } from './utils/botSendQuery.js';


 // call to start second bot
 const query =  `mutation
 mutation{
  telegram{
 newChats
 }
 }`
 const runBot = await sendToServer(query)
 //bot.sendMessage(839036065, `Hej! New chats started successed ${JSON.stringify(runBot.telegram)}`)




//import {runAllBots} from './TelegramMutation/newChats'
const todo = JSON.stringify({
  query: `mutation
Mutation{
 telegram{
startBot2
}
}`,
});
const response = await (await fetch(process.env.HOST_URL || 'http://localhost:8080/graphql', {
  method: 'POST',
  body: todo,
  headers: { 'Content-Type': 'application/json' },
})).json();
  console.log(response)
 
  
const GPTFree = '6558053312:AAGD80lI2Q47SqbUPOAZ0aKJlOo12DO0snY'
const FinderByChats='6659125986:AAGcWZCUcBhJknQNmK_2InwjwOQo6-h9S7Y'
const bot = new TelegramBot(GPTFree, { polling: true });
//bot.sendMessage(839036065, `Hej! Start GPT-free, HappyEmigrant and me is sucscess ${JSON.stringify(response.data)}`)
// const imageUrl = 'https://example.com/path/to/your/image.jpg';
// const imageBuffer = await fetch(imageUrl).then(res => res.buffer());

// // Wysyłanie obrazka
// bot.sendPhoto(chat_id, imageBuffer, { caption: 'Oto przykładowy obrazek!' });



// Obsługa przychodzących wiadomości
bot.on('message', async (msg) => {
  const chat_id = msg.chat.id;
  const from = msg.from?.username
  const text = msg.text;
  const date = new Date(msg.date * 1000); 
  console.log("For FinderByChats! from: ", from, ", chat_id: ", chat_id, ", text: ", text, ", date: ", date )
  const regGetChatContent = /\{\}\#/g
  

  //queryToGpt
  if(content?.includes('#')){
    const topic = content?.replace(regGetChatContent,"")
    const collections = ["szczecin"]
    const todo = JSON.stringify({
        query: `query {
          telegram {
              getMessagesByTopic(chats: "${collections}", topic: "${topic}") {
                from
                text
              }
            }
        }`
      });

  try {
    const response = await (await fetch(process.env.HOST_URL || 'http://localhost:8080/graphql', {
      method: 'POST',
      body: todo,
      headers: { 'Content-Type': 'application/json' },
    })).json();
    console.log("PPPPPPPPPPPPPPPPPP");
    console.log(response.data.telegram.getMessagesByTopic[0]);
    console.log(response.data);
    bot.sendMessage(chat_id, response.data.telegram.getMessagesByTopic[0].content || response.errors[0].message);
  }catch(e){console.log(e)}
  
}else{
  // Odpowiedz na wiadomość
  bot.sendMessage(878727057, "Hello my friend. I am worker from my boss Pasha Brui! I wish for you good day! ")
  bot.sendMessage(chat_id, "I'm sorry! This bot is in the process of being updated. Try again later. ");
}





  //query to puppeteer
if(text.includes('-')&&text.includes('{')&&text.includes('}')){
const regex = text?.replace(regGetChatContent,"").split('-')
const tags = regex[1]?.replace().split(",")
// Run Puppeteer bot
//const todo = JSON.stringify({query:`query query {telegram{getChatContent(input:{regChatName:"${regex&&regex[0] ? regex[0] : ""}" regContentTags:["${tags[0]}"]})}}}`});
const todo = JSON.stringify({
  query: ` query
query{
 telegram{
getChatContent( input:{
  regChatName:"${regex&&regex[0]?regex[0]:""}"
  regContentTags:["${tags[0]}"]
  }
)
}
}`,
});
//console.log(regex&&regex[1]?regex[1]:"")
 try {
  const response = await (await fetch(process.env.HOST_URL || 'http://localhost:8080/graphql', {
    method: 'POST',
    body: todo,
    headers: { 'Content-Type': 'application/json' },
  })).json();



  //console.log(response)
  console.log( response)
  console.log(response.data.telegram.getChatContent)
 if (response.data.telegram.getChatContent)
  bot.sendMessage(839036065, `Hej! Sucscess! This is results: \n ${response.data.telegram.getChatContent.toString()}`)
 if (response.errors)
  bot.sendMessage(839036065, `Hej! this is error ${JSON.stringify(response?.errors[0]?.message)}`)
} catch(e){
  bot.sendMessage(839036065, `Hej! this is error {response?.errors[0]?.message + JSON.stringify(e)}`)
}
 }
  // Odpowiedz na wiadomość
  bot.sendMessage(chat_id, "If you want find information in one chat, write message with this type:  {chatName-tag1,tag2..} ");

});

//const runBots = runAllBots()



bot.on('polling_error', (error) => {
  console.log(`Polling error: ${error}`);
});













