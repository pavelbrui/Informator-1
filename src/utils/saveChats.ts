import {TelegramClient } from 'telegram';
import { MongOrb, getEnv } from './orm.js';
import { options } from '../BOT/Options.js';
import { infoMess } from '../BOT/Messages.js';


export async function saveChats(bot:any, chat_id:number, chatNames:string[], city:string, maxOld?: number) {
  const date = new Date()
  date.setDate(date.getDate() - (maxOld || 30))
  const startDate = date.getTime() / 1000;
  const client = await tgConnect() 
  if (!await client.checkAuthorization()) signInUser(bot, chat_id, client);
  try{
  const chats:any[] = await client.getEntity(chatNames)
  if (!chats) await bot.sendMessage(chat_id, `error ${chatNames[0]} !!!`)

  //const filteredChats = chats.filter(chat => chat.title.includes('Tener'));
  for (const chat of chats) {
   // console.log("chat:", chat)
    const update = await saveOneChat(client, city, chat, startDate )
    if (update) await bot.sendMessage(chat_id, `Chat ${chat.username} successfully saved!!!`);
  }
  return true
}catch(e){
  console.log(e)
  await bot.sendMessage(chat_id, ` ${e} !!!`)
}
}




export async function saveOneChat(client:any, collection: string, chat: any, startDate: number){
  const chatID = chat.id || (await client.getEntity([chat.username || chat._id]))[0].id
  console.log(chatID.value)
  //   class Integer {
  //   value: bigint;
    
  //   constructor(value: bigint) {
  //     this.value = value;
  //   }
  // }
  // const myObject:{id: Integer } = {
  //   id: new Integer(BigInt((chat._id+'n') as unknown as bigint))
  // };
  // console.log(chatID);
  // console.log(myObject.id)

  const messages:any[] = await client.getMessages(chat.id, { reverse:true, offsetDate: startDate });
  console.log("!!!!!!!!!!  all messages.length: ", messages.length)
 const messageArray =[]
  for (const message of messages) {
    
    if (message.message?.length >2){
    messageArray.push({
      ...(message.replyTo?.replyToMsgId&&{replyTo: message.replyTo?.replyToMsgId}),
     // chat_id: message.peerId?.channelId?.value,
      _id: message.id,
      text: message.message,
      date: new Date(message.date * 1000).toISOString().slice(0,16),
      ...(message.fromId?.userId?.value&&{from_id: message.fromId?.userId?.value})
    });
  }
  }

  const chatsCollection = MongOrb(collection);
  
  const update = await chatsCollection.collection.updateOne(
     {_id: chat.id.value || chat._id},
     {$set:{
        username: chat.username, 
        class_name: chat.className,
        name: chat.title,
        updatedAt: new Date().toISOString().slice(0,16)
           },
       $addToSet:
        {messages: {$each: messageArray}}
      }, 
       { upsert: true });
    console.log(update)
    console.log("pushed messages length: ", messageArray.length)
    console.log("pushed first message: ", messageArray[0])
    return update
 }









 export async function tgConnect(){
  console.log('login1')
  const apiId = parseInt(getEnv('API_ID')) 
  const apiHash = getEnv('API_HASH')
  const client = new TelegramClient('tgparse', apiId, apiHash, { connectionRetries: 5 });
  await client.connect();
  console.log('login2')
  return client
  }


async function signInUser(bot:any, chat_id:number, client: any, apiHash?: string,apiId?: number) {
  try {
    let numb = '';

    await bot.sendMessage(chat_id, infoMess.authNumer, options.InputValue);
    await new Promise((resolve) => {
      bot.on('message', async (msg:any) => {
        console.log(msg.text);
        numb = msg.text;
        await bot.off('message');
        resolve(msg);
      });
    });

    // Oczekiwanie na odpowiedź z kodem SMS
    const code = async () =>  {
      await bot.sendMessage(chat_id, infoMess.authCode, options.InputValue);
      let cod = ""
      await new Promise((resolve) => {
      bot.on('message', async (msg: any) => {
        console.log(msg.text);
        cod = msg.text as string;
        await bot.off('message');
        resolve(msg);
      });
      
    })
    return cod
  };

    // Uruchomienie funkcji signInUser, przekazując numer telefonu i kod SMS
    await client.signInUser({
      apiId: apiId || (getEnv('API_ID') as unknown as number),
      apiHash: apiHash || getEnv('API_HASH')
    },
       {
      phoneNumber: async () => numb,
      phoneCode: async () => await code(),
    });
    await bot.sendMessage(chat_id, "User successfully signed in.");
    console.log("User successfully signed in.");
  } catch (error) {
    await bot.sendMessage(chat_id, "Error during sign-in: "+ error);
    console.error("Error during sign-in:", error);
  }
}  



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
  