import { SearchSettings } from "./botCallbackHandler.js"
import { filters, gpt } from "./botQueryFunctions.js"



export async function  otherMessagesHandler(bot:any, settings: SearchSettings, chat_id: number, content?: string){
    let arr: string[] = []
    
    if(content?.includes('{')&&content.includes('}')){
      const regGetChatContent = /\{\}/g
      const topicWithColection = content?.replace(regGetChatContent,"")
      if(topicWithColection.includes('-')){
        arr = topicWithColection.split('-')
      }
      const topic =arr[0] || topicWithColection
      const chat = arr[1]
      const chats = chat?.split(',') || ["wroclaw"]
      await gpt(bot, chat_id, settings)
      
  
  } else if(content?.includes('#')){
    const reg = /\#\]\[/g
    const wordsWithColection = content?.replace( '#', "")
    console.log(wordsWithColection);
    if(wordsWithColection.includes('-')){
      arr = wordsWithColection.split('-')
    }
    const keyWords =(arr[0] || wordsWithColection).split(';').map((w:string)=>w.split(','));
    console.log(keyWords);
    const collection = arr[1]
      const collections = collection?.split(',') || ["Bialystok","po"]
     await filters(bot, chat_id, settings)
  
  }else{
   console.log(" else block no response")
  }
}