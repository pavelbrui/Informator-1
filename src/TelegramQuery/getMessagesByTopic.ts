import { FieldResolveInput } from 'stucco-js';
import { resolverFor } from '../zeus/index.js';

import { MongOrb, defineCollections } from '../utils/orm.js';
import { sendToOpenAi } from '../utils/openAi.js';



export const handler = async (input: FieldResolveInput) => 
  resolverFor('TelegramQuery','getMessagesByTopic', async (args) => {
  console.log(args);
    const consDays = args.daysAgo || 30
    const date = new Date()
    if(consDays) date.setDate(date.getDate() - consDays)
    const chatNameRegexPatterns = args.chats?.map(name => new RegExp(name, "i"));
    const collections = await defineCollections(args.collections)
     let messagesForGpt:any =[];

  for (const collection of collections) {  
    const aggregationPipeline = [
          {
            $match:
     {$or:[{
      name: {
        $in: chatNameRegexPatterns 
      }
    },
    {
      username: {
        $in: chatNameRegexPatterns 
      }
    }]
  }
          },
          {
            $unwind: "$messages"
          },
          {
            $set: {
              "messages.chat_id": { $ifNull: ["$username", "$_id"] }, 
              "messages.chat_name": "$name" 
            }
          },
          { $match: 
              { "messages.date": { $gte: date.toISOString() } } 
          },
          {
            $replaceRoot: {
              newRoot: "$messages"
            }
          },
          {
            $project: {
              "text": 1,            
             // "from": 1,   
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

            if(messagesForGpt.length ===0) return [{  }]
            //console.log(messagesForGpt?.slice(0, 3).map((mess: any)=>({ ...mess, text: Array.isArray(mess?.text) ? mess?.text?.toString() : mess?.text , from: mess.from || mess.from_id })));
            console.log("---------- All:", messagesForGpt?.length)  
               
            let messages: any[] = []
            let n  =  Math.ceil(messagesForGpt.length / 100)

            // limiter
            if(n>5) n=2

            for (let i = 1; i <= n; i++) {
            const chunkMessages= await sendToOpenAi(messagesForGpt.slice((i-1)*100, i*100), args.topic[0])
            console.log("chunkMessages",chunkMessages)
              messages = messages.concat(chunkMessages)
            }
            if(messages?.length&&messages?.length>0) MongOrb('GPTResponseForTarget').createWithAutoFields('_id',
                'createdAt')({topic: args.topic.join(','), chats: args.chats?.join(','), response: messages.join(";")});
         
           return messages
    }
)(input.arguments);




  