import { FieldResolveInput } from 'stucco-js';
import { resolverFor } from '../zeus/index.js';

import { MongOrb, getEnv } from '../utils/orm.js';

import { MongoClient} from 'mongodb';
import { sendToOpenAi } from '../utils/openAi.js';



export const handler = async (input: FieldResolveInput) => 
  resolverFor('TelegramQuery','getMessagesByTopic', async (args) => {
  console.log(args);
    const consDays = args.daysAgo || 30
    const date = new Date()
    if(consDays) date.setDate(date.getDate() - consDays)
    const chatNameRegexPatterns = args.chats?.map(name => new RegExp(name, "i"));
    const client = new MongoClient(getEnv('MONGO_URL'), {  monitorCommands: true });
    const collections = await client.db('son_dev').listCollections().toArray();
     let messagesForGpt:any =[];

  for (const collec of collections) {
          const collectionName = collec.name;
          if(args.collections?.length && args.collections?.length !== 0 && !args.collections.some(element => collectionName.includes(element)))  continue
          const collection = collec?.name.length>2 ? collec.name : "Bialystok"
      
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
            if(messagesForGpt.length ===0) return [{  }]
            //console.log(messagesForGpt?.slice(0, 3).map((mess: any)=>({ ...mess, text: Array.isArray(mess?.text) ? mess?.text?.toString() : mess?.text , from: mess.from || mess.from_id })));
            console.log("---------- All:", messagesForGpt?.length)  
               
            let messages: any[] = []
            let n  = 3// Math.ceil(messagesForGpt / 100)

            // limiter
            if(n>5) n=3

            for (let i = 1; i <= n; i++) {
            const chunkMessages= await sendToOpenAi(messagesForGpt.slice((i-1)*100, i*100), args.topic[0])
              messages = messages.concat(chunkMessages)
            }
            if(messages?.length&&messages?.length>1) await MongOrb('GPTResponseForTarget').createWithAutoFields('_id',
                'createdAt')({topic: args.topic, chats: args.chats, messages});
         
           return messages
    }
)(input.arguments);




  