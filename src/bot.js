import TelegramBot from 'node-telegram-bot-api';
import { sendToServer } from './utils/botSendQuery.js';
const GPTFree = '6558053312:AAGD80lI2Q47SqbUPOAZ0aKJlOo12DO0snY'
const bot = new TelegramBot(GPTFree, { polling: true });
 // call to start second bot
 const query2 =  `mutation
 mutation{
  telegram{
 newChats
 }
 }`

 const query =  `mutation
 mutation{
  telegram{
 startBot
 }
 }`
 const runBot = await sendToServer(query)
 const runBot2 = sendToServer(query2)
 bot.sendMessage(839036065, `Hej! New chats started successed ${JSON.stringify(runBot2.telegram)}`)










