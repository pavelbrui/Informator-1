
import { FieldResolveInput } from 'stucco-js';
import { resolverFor } from '../zeus/index.js';
import TelegramBot from 'node-telegram-bot-api';
import { MongOrb, getEnv } from './../utils/orm.js';

export const handler = async (input: FieldResolveInput) => 
  resolverFor('TelegramMutation','startBot',async (args) => {


const bot2 = new TelegramBot(getEnv("HappyEmigrant"), { polling: true });
// Obsługa przychodzących wiadomości
bot2.on('message', async (msg) => {
  //console.log(msg);
  const id = msg.message_id;
  const chat_name = msg.chat.title;
  const chat_id = msg.chat.id;
  const from = msg.from?.username  || msg.from?.first_name +"_"+ msg.from?.last_name
  const from_id = msg.from?.id
  const message_thread_id =msg.message_thread_id
  const reply_to_message_id = msg.reply_to_message?.message_id
  const text = msg.text;
  const date = new Date(msg.date * 1000).toISOString(); 
  console.log("For HappyEmigrant! from: ", from, ", chat_id: ", chat_id, ", text: ", text, ", date: ", date )
  if(text?.length&&text?.length>1) await MongOrb('Bialystok').collection.updateOne({id: chat_id},{ $set: {name: chat_name} , $push: {messages:{chat_name, chat_id,id,message_thread_id,reply_to_message_id, from, from_id, text, date }}},  { upsert: true });
});




bot2.on('polling_error', (error) => {
  console.log(`Polling error: ${error}`);
});









return true
  })(input.arguments);
