import { FieldResolveInput } from 'stucco-js';
import { resolverFor } from '../zeus/index.js';
import TelegramBot from 'node-telegram-bot-api';
import { MongOrb, getEnv } from './../utils/orm.js';

export const handler = async (input: FieldResolveInput) => 
  resolverFor('TelegramMutation','startBot',async (args) => {
const bot2 = new TelegramBot(getEnv("HappyEmigrant"), { polling: true });

// Obsługa przychodzących wiadomości
bot2.on('message', async (msg) => {
   console.log(msg);
  const _id = msg.message_id;
  const isBot = msg.from?.is_bot
  const chat_name = msg.chat.title;
  const chat_id = msg.chat.id;
  const from = msg.from?.username  || msg.from?.first_name +"_"+ msg.from?.last_name
  const from_id = msg.from?.id
  const message_thread_id =msg.message_thread_id
  const reply_to = msg.reply_to_message?.message_id
  const text = msg.text || msg.caption;
  const topic = msg.forum_topic_created?.name
  const date = new Date(msg.date * 1000).toISOString().slice(0,16); 

  const deleteDate = new Date();
  deleteDate.setDate(deleteDate.getDate() - 60);
  console.log("\n For HappyEmigrant! from: ", from, ",\n chat_name: ", chat_name, ",\n text: ", text, ",\n date: ", date )
  if(text?.length&&text?.length>1) await MongOrb('Bialystok').collection.updateOne(
    {_id: chat_id},
    { $set: {name: chat_name, updatedAt: new Date().toISOString(), isPartner: true},
     $push:
      {messages:{_id,message_thread_id,reply_to, from, from_id, text, date, isBot, topic}},
      // $pull: {
      //   messages: {
      //     date: { $lt: deleteDate.toISOString() }
      //   }
      }, 
       { upsert: true });

});


bot2.on('polling_error', (error) => {
  console.log(`Polling error: ${error}`);
});
bot2.sendMessage(839036065, `Hej! New chats started successed !`)
return true
  })(input.arguments);




  // db.chaty.update(
  //   {},
  //   {
  //     $pull: {
  //       messages: {
  //         date: { $lt: new Date(new Date() - 60 * 24 * 60 * 60 * 1000) }
  //       }
  //     }
  //   },
  //   { multi: true }
  // )