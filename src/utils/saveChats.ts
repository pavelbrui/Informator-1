import {TelegramClient } from 'telegram';
import { MongOrb, getEnv } from './orm.js';
import { options } from './botOptions.js';
import { infoMess } from './botMessages.js';


export async function saveChats(bot:any, chat_id:number, chatNames:string[], city:string, maxOld?: number) {
  const date = new Date()
  date.setDate(date.getDate() - (maxOld || 30))
  const startDate = date.getTime() / 1000;
  const chatsCollection = await MongOrb(city||'messagesDDD');
  const apiId = getEnv('API_ID') as unknown as number 
  const apiHash = getEnv('API_HASH')
  const client = new TelegramClient('tgparse', apiId, apiHash, { connectionRetries: 5 });
  await client.connect();
  if (!await client.checkAuthorization()) signInUser(bot, chat_id, client, apiHash,apiId);
  

  const chats:any[] = await client.getEntity(chatNames)
  //const filteredChats = chats.filter(chat => chat.title.includes('Tener'));

  for (const chat of chats) {
    console.log(chat)
    const messages:any[] = await client.getMessages(chat.id, { reverse:true, offsetDate: startDate });
    
   const messageArray =[]
    for (const message of messages) {
      console.log(message)
      messageArray.push({
        replyTo: message.replyTo?.replyToMsgId,
       // chat_id: message.peerId?.channelId?.value,
        _id: message.id,
        text: message.message,
        date: new Date(message.date * 1000),
        from_id: message.fromId?.userId?.value
      });
    }
  
    const saveChat = {
      username: chat.username,
      class_name: chat.className,
      name: chat.title,
      _id: chat.id.value,
      messages: messageArray,
      }
      const update = await chatsCollection.collection.updateOne({_id: chat.id.value},
        {$set:{username: chat.username,class_name: chat.className, name: chat.title},
         $addToSet: {messages:{$each: messageArray}}
        },  { upsert: true });

      if (update) await bot.sendMessage(chat_id, `Chat ${chat.username} successfully saved!!!`);
  }
  return true
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
  




async function signInUser(bot:any, chat_id:number, client: any, apiHash: string,apiId: number) {
  try {
    let numb = '';

    await bot.sendMessage(chat_id, infoMess.authNumer, options.InputValue);
    await new Promise((resolve) => {
      bot.on('message', async (msg) => {
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
      bot.on('message', async (msg) => {
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
      apiId,
      apiHash,
    }, {
      phoneNumber: async () => numb,
      phoneCode: async () => await code(),
      onError: (err) => console.log(err),
    });

    console.log("User successfully signed in.");
  } catch (error) {
    console.error("Error during sign-in:", error);
  }
}  