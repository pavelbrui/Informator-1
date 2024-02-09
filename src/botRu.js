import TelegramBot from 'node-telegram-bot-api';
import { sendToServer } from './utils/botSendQuery.js';


 const query3 =  `mutation
 mutation{
  telegram{
 startBotRu
 }
 }`

 const runBot3 = sendToServer(query3)
 console.log(`Hej! New chats started successed ${JSON.stringify(runBot3.telegram)}`)

