import  fetch from 'node-fetch'
import { SearchSettings } from './botCallbackHandler.js';
import { responseForUser } from './botResponsesForUser.js';

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
  const getMessagesByTags = `query {
	telegram{
		getMessagesByTags(
			chats: ${JSON.stringify(settings.chats || [''])}
			keyWords: ${JSON.stringify(settings.keyWords)}
      collections:${JSON.stringify(settings.sities||[''])}
      daysAgo: ${settings.daysAgo || 30}
		){
      chat_name
      chat_id
      _id
      reply_to
      date
      from
      text
		}
	}
}`
  const data = await sendToServer(getMessagesByTags) 

 await responseForUser(data, bot, chat_id, settings)
}






export async function gpt(bot: any, chat_id: number, settings: SearchSettings ){
  const getMessagesByTopic = `query {
    telegram {
        getMessagesByTopic(chats: ${JSON.stringify(settings.chats || [""])}, topic: ${JSON.stringify(settings.topic)},collections:${JSON.stringify(settings.sities|| [''])},
        daysAgo: ${settings.daysAgo || 30}) {
          chat_name
          chat_id
          _id
          date
          from
          text
        }
      }
  }`
  const data = await sendToServer(getMessagesByTopic)

  await responseForUser(data, bot, chat_id, settings)
 
}


export async function gptWithFilters(bot: any, chat_id: number, settings: SearchSettings ){
  const getMessagesByTagsAndTopic = `query {
    telegram {
        getMessagesByTagsAndTopic(chats: ${JSON.stringify(settings.chats || [""])}, topic: ${JSON.stringify(settings.topic)},collections:${JSON.stringify(settings.sities||[''])},
        daysAgo: ${settings.daysAgo || 30}, keyWords: ${JSON.stringify(settings.keyWords)}) {
          chat_name
          chat_id
          _id
          date
          from
          text
        }
      }
  }`
  const data = await sendToServer(getMessagesByTagsAndTopic)

  await responseForUser(data, bot, chat_id, settings)
  
}






