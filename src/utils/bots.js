import  fetch from 'node-fetch'

export async function sendToServer(query) {

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
    //console.log(response.data.telegram.getMessagesByTags);
    return response.data || response.errors[0].message
  }catch(e){
    console.log(e.json())
    return e
    }
}



export async function filters(bot, chat_id, keyWords, collections, chats, daysAgo,n ){
  let response = 'Anyone message not found'
  const getMessagesByTags = `query {
	telegram{
		getMessagesByTags(
			chats: ${JSON.stringify(chats || ["Белосток"])}
			keyWords: ${JSON.stringify(keyWords)}
      collections:${JSON.stringify(collections || ['Bialystok'])}
      daysAgo: ${daysAgo || 30}
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
  if (messages?.length) {
    console.log(data)
  await bot.sendMessage(chat_id, response);
  return
 }
  response = messages.slice(0,n || 10).map((m)=>`\n<${m.chat_name || m.chat_id ||""}>\n${m.from}:\n-"${m.text}"\n                           ${m.date.slice(0, -3).replace('T', " ")}\n `)?.toString()
  await bot.sendMessage(chat_id,`I found ${messages?.length>1000 ? "more then 1000" : messages?.length} messages!!!`)
  await bot.sendMessage(chat_id, response); 
   if(messages?.length>10) bot.sendMessage(chat_id, `Next ${n||10} messages>>`)
   
}






export async function gpt(bot, chat_id, topic, collections, chats, daysAgo,n){
  const getMessagesByTopic = `query {
    telegram {
        getMessagesByTopic(chats: ${JSON.stringify(chats || ["Белосток"])}, topic: ${JSON.stringify(topic)},collections:${JSON.stringify(collections || ['Bialystok'])},
        daysAgo: ${daysAgo || 30}) {
          chat_name
          id
          date
          from
          text
        }
      }
  }`
  const data = await sendToServer(getMessagesByTopic)
  response = data?.telegram?.getMessagesByTopic[0]?.text || "i don't know!"
  bot.sendMessage(chat_id, response); 
 //if(messages?.length>10) bot.sendMessage(chat_id, "Next 10 messages>>")
}