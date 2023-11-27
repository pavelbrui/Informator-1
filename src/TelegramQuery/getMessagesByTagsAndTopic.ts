
import { FieldResolveInput } from 'stucco-js';
import { resolverFor } from '../zeus/index.js';
import { MongOrb, defineCollections, getEnv } from '../utils/orm.js';

import { sendToOpenAi } from '../utils/openAi.js';
import { parseText } from '../utils/tools.js';
import { filterMessages } from './getMessagesByTags.js';


export const handler = async (input: FieldResolveInput) => 
  resolverFor('TelegramQuery','getMessagesByTagsAndTopic', async (args) => { 
    console.log(args);
    const daysAgo = args.daysAgo || 30
    let keyWords:string [][] = []
    args.keyWords?.map((words)=>{
       if (typeof words === 'object'&& words) keyWords.push(words)})
    
      const messagesForGpt = await filterMessages( {sities: args.collections || undefined, chatsReg: args.chatsReg||undefined, daysAgo, keyWords, limitMessages:30  });
      const messages = await sendAllToGPT(messagesForGpt, args.topic)

  return  messages
    }
)(input.arguments);




export async function sendAllToGPT(messagesForGpt: any[], topic:string[], max?: number){
  if(messagesForGpt.length ===0) return []
  let messages: any[] = []
  let n  =  Math.ceil(messagesForGpt.length / 100)
  // limiter
  if(n>(max||500)/100) n=(max||500)/100

  console.log(messagesForGpt?.slice(0, 3).map((mess: any)=>({ ...mess, text: parseText(mess?.text) , from: mess.from || mess.from_id || 'bot'})));
   console.log("---------- All:", messagesForGpt?.length)  
  
  for (let i = 1; i <= n; i++) {
  const chunkMessages= await sendToOpenAi(messagesForGpt.slice((i-1)*100, i*100), topic[0])
  console.log(chunkMessages)
    messages = messages.concat(chunkMessages)
  }

  if(messages?.length&&messages?.length>1) await MongOrb('GPTResponseForTarget').createWithAutoFields('_id',
               'createdAt')({topic, input: messagesForGpt,  response: messages});
 
 return messages
 }


