
import { FieldResolveInput } from 'stucco-js';
import { resolverFor } from '../zeus/index.js';
import { MongOrb, defineCollections, getEnv } from '../utils/orm.js';

import { sendToOpenAi } from '../utils/openAi.js';
import { parseText } from '../utils/tools.js';


export const handler = async (input: FieldResolveInput) => 
  resolverFor('TelegramQuery','getMessagesByTagsAndTopic',async (args) => { 
    console.log(args);
    const consDays = args.daysAgo || 30
    const keyWords:(string[] | null | undefined)[]|null|undefined = args.keyWords
    const date = new Date()
    if(consDays) date.setDate(date.getDate() - consDays)
    const chatNameRegexPatterns = args.chats?.map(name => new RegExp(name, "i"));
    const queries = keyWords?.map(group => { const regexPatterns = group?.map(keyword => new RegExp(keyword, "i"));
    return {"messages.text": { $all: regexPatterns}};});
    const collections = await defineCollections(args.collections)
     let messagesForGpt:any =[];

  for (const collection of collections) {
    const aggregationPipeline = [
            {
              $match: {
                name: {
                  $in: chatNameRegexPatterns 
                }
              }
            },
            {
              $unwind: "$messages"
            },
            {
              $set: {
                "messages.chat_id": "$id", 
                "messages.chat_name": "$name" 
              }
            },
            { $match: {
              $and: [
                { $or: queries }, 
                { "messages.date": { $gte: date.toISOString() } } 
                
              ]
            },
          },
            {
              $replaceRoot: {
                newRoot: "$messages"
              }
            },
            {
              $project: {
                "type": 1,
                "text": 1,            
                "from": 1,   
                "from_id": 1,         
                "date": 1,            
                "chat_name":1, 
                "chat_id":1,      
              }
            }
            
          ];
        const result = await MongOrb(collection)?.collection?.aggregate(aggregationPipeline).toArray();
        messagesForGpt = messagesForGpt.concat(result)
          console.log("iteracija!:",collection);   
            }
   if(messagesForGpt.length ===0) return []
   console.log(messagesForGpt?.slice(0, 3).map((mess: any)=>({ ...mess, text: parseText(mess?.text) , from: mess.from || mess.from_id })));
   console.log(messagesForGpt?.length)  
      
   const response = await sendToOpenAi(messagesForGpt.slice(0, 100), args.topic[0])
   if(response?.length&&response?.length>1) await MongOrb('GPTResponseForTarget').createWithAutoFields('_id',
       'createdAt')({topic: args.topic, chats: args.chats, response});

  return  response
    }
)(input.arguments);





