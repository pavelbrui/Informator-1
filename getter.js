import {TelegramClient } from 'telegram';
import { MongoClient } from 'mongodb';
import input from 'input'

const mongo_uri = 'mongodb+srv://Aexol:9MNKgBB8cfpwIe0u@testowabaza.hbefbdz.mongodb.net/?retryWrites=true&w=majority'
const mongo_db = 'Telegram'

const apiId = 23922055
const apiHash = '3455944cf82c8452feb11ae15887761f'

const mongoUrl = "mongodb+srv://son_dev:87gG9XFXSbdyhqz@aexoldev.umnle.mongodb.net/son_dev"; //?retryWrites=true&w=majority";
const dbName = 'Telegram';

export async function saveChats(chatNames, city, startDate) {
  const client = new TelegramClient('tgparse', apiId, apiHash, { connectionRetries: 5 });
  await client.connect();
  if (!await client.checkAuthorization()){
    await client.signInUser({
      apiId :23922055,
      apiHash : '3455944cf82c8452feb11ae15887761f'
    },{
    phoneNumber: async () => await input.text("number ?"),
    password: async () => await input.text("password?"),
    phoneCode: async () => await input.text("Code ?"),
    onError: (err) => console.log(err),
    })
 }
  
  const chats = await client.getEntity(['https://t.me/bialystok_polska', '@Tenerife_2023'])
  const filteredChats = chats.filter(chat => chat.title.includes('Tener'));

  const clientMongo = new MongoClient(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
  await clientMongo.connect();
  const db = clientMongo.db(dbName);
  const chatsCollection = db.collection(sity||'messagesDDD');
  
  for (const chat of chats) {
    console.log(chat)
    const messages = await client.getMessages(chat.id, { reverse:true, offsetDate: startDate });
    
   const messageArray =[]
    for (const message of messages) {
      messageArray.push({
        replyTo: message.replyTo?.replyToMsgId,
        chatId: message.peerId?.channelId?.value,
        messageId: message.id,
        text: message.message,
        date: new Date(message.date * 1000),
        fromId: message.fromId?.userId?.value
      });
    }
  
    const saveChat = {
      username: chat.username,
      class_name: chat.className,
      chat_name: chat.title,
      chat_id: chat.id,
      messages: messageArray,
      }
      chatsCollection.insertOne(saveChat)
  }
  

  await clientMongo.close()
}
saveChats().catch(console.error);







// async function listDialogs() {
//   // Iterate over all dialogs
//   for await (const dialog of client.iterDialogs({})) {
//     //console.log(`${dialog.id}: ${dialog.title}`);
//   }
// }
// const startDate = new Date('2023-09-16T12:00:00Z').getTime() / 1000;
// // Call the function to list dialogs
// listDialogs();

// for await (const message of client.iterMessages(chats[0], { reverse:true, offsetDate: startDate })) {
//   //console.log(message.text);
//   //console.log(startDate, message.date );
//   //console.log(new Date(message.date * 1000));
//   console.log(message);
  
// }