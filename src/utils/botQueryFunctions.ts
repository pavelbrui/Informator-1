import  fetch from 'node-fetch'
import { options, menuOptions } from './botOptions.js';
import { SearchSettings } from './botCallbackHandler.js';

export async function sendToServer(query: string) {
    const todo = JSON.stringify({
        query
      });
   console.log(todo);
  try {
    const response = await (await fetch(process.env.HOST_URL || 'http://localhost:8080/graphql', {
      method: 'POST',
      body: todo,
      headers: { 'Content-Type': 'application/json' },
    })).json();
    console.log("REQUEST>>");
    return response.data || response.errors[0].message
  }catch(e){
    console.log(e)
    return e
    }
}



export async function filters(bot: any, chat_id: number, settings: SearchSettings ){
  let response = 'Anyone message not found'
  const getMessagesByTags = `query {
	telegram{
		getMessagesByTags(
			chats: ${JSON.stringify(settings.chats || ["Белосток"])}
			keyWords: ${JSON.stringify(settings.keyWords)}
      collections:${JSON.stringify(settings.sities || ['Bialystok'])}
      daysAgo: ${settings.daysAgo || 30}
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
  if (!messages?.length) {
    console.log(data)
  await bot.sendMessage(chat_id, response, menuOptions.Search2);
  return
 }
  response = messages.slice(0,settings.limitMessages || 10).map((m:any)=>`\n<${m.chat_name || m.chat_id ||""}>\n${m.from}:\n-"${m.text}"\n                           ${m.date.slice(0, -3).replace('T', " ")}\n `)?.toString()
  await bot.sendMessage(chat_id,`I found ${messages?.length>1000 ? "more then 1000" : messages?.length} messages!!!`)
  await bot.sendMessage(chat_id, response, menuOptions.Search2); 
   if(messages?.length>10) bot.sendMessage(chat_id, `Next ${settings.limitMessages||10} messages>>`)
}






export async function gpt(bot: any, chat_id: number, settings: SearchSettings ){
  let response = 'Anyone message not found'
  const getMessagesByTopic = `query {
    telegram {
        getMessagesByTopic(chats: ${JSON.stringify(settings.chats || ["Белосток"])}, topic: ${JSON.stringify(settings.topic)},collections:${JSON.stringify(settings.sities|| ['Bialystok'])},
        daysAgo: ${settings.daysAgo || 30}) {
          chat_name
          id
          date
          from
          text
        }
      }
  }`
  const data = await sendToServer(getMessagesByTopic)
  if (!data?.telegram?.getMessagesByTopic) {
    console.log(data)
  await bot.sendMessage(chat_id, response, menuOptions.Search2);
  return
 }
  response = data?.telegram?.getMessagesByTopic[0]?.text || "i don't know!"
  bot.sendMessage(chat_id, response, menuOptions.Search2); 
 //if(messages?.length>10) bot.sendMessage(chat_id, "Next 10 messages>>")
}


export async function gptWithFilters(bot: any, chat_id: number, settings: SearchSettings ){
  let response = 'Anyone message not found'
  const getMessagesByTagsAndTopic = `query {
    telegram {
        getMessagesByTagsAndTopic(chats: ${JSON.stringify(settings.chats || ["Белосток"])}, topic: ${JSON.stringify(settings.topic)},collections:${JSON.stringify(settings.sities || ['Bialystok'])},
        daysAgo: ${settings.daysAgo || 30}, keyWords: ${JSON.stringify(settings.keyWords)}) {
          chat_name
          id
          date
          from
          text
        }
      }
  }`
  const data = await sendToServer(getMessagesByTagsAndTopic)
  const messages = data?.telegram?.getMessagesByTagsAndTopic

 if (!messages?.length) {
  console.log(data)
await bot.sendMessage(chat_id, response, menuOptions.Search2);
return
}
response = messages.slice(0,settings.limitMessages || 10).map((m:any)=>`\n<${m.chat_name || m.chat_id ||""}>\n${m.from}:\n-"${m.text}"\n                           ${m.date.slice(0, -3).replace('T', " ")}\n `)?.toString()
await bot.sendMessage(chat_id,`I found ${messages?.length>1000 ? "more then 1000" : messages?.length} messages!!!`)
await bot.sendMessage(chat_id, response, menuOptions.Search2); 
 if(messages?.length>10) bot.sendMessage(chat_id, `Next ${settings.limitMessages||10} messages>>`)
}