
import { FieldResolveInput } from 'stucco-js';
import { resolverFor } from '../zeus/index.js';
import { MongOrb, defineCollections } from '../utils/orm.js';
import { parseText } from '../utils/tools.js';


export const handler = async (input: FieldResolveInput) => 
  resolverFor('TelegramQuery','getMessagesByTags', async (args) => {
      let messages:any = []
      const keyWords:(string[] | null | undefined)[]|null|undefined = args.keyWords
      console.log(args);
      const consDays = args.daysAgo || 30
      const date = new Date() 
      date.setDate(date.getDate() - consDays)
      console.log(date)

       // Tworzymy tablicę zapytań MongoDB dla każdej grupy słów kluczowych
      const queries = keyWords?.map(group => { const regexPatterns = group?.map(keyword => new RegExp(keyword, "i"));
                                                return {"messages.text": { $all: regexPatterns}};});
      const chatNameRegexPatterns = args.chats?.map(name => new RegExp(name, "i"));
      const collections = await defineCollections(args.collections)

    

console.log(chatNameRegexPatterns);

for (const collection of collections) { 
  console.log(collection);  
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
      "messages.chat_id":  { $ifNull: ["$username", "$_id"] }, 
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
      "text": 1,            
      "from": 1,   
      "from_id": 1,         
      "date": 1,            
      "chat_name":1, 
      "chat_id":1,
      "_id":1,      
    }
  }
  
];
        //console.log(aggregationPipeline);
        const result = await MongOrb(collection)?.collection?.aggregate(aggregationPipeline).toArray();
        messages = messages.concat(result)
        //console.log(result);
        
    }
    if(messages.length ===0) return []
    console.log(messages?.slice(0, 3).map((mess: any)=>({ ...mess, text: parseText(mess?.text) ||" ", from: mess.from || mess.from_id || "Bot" })));
    console.log("---------- All:", messages?.length)   
    return messages?.slice(0, 1001).map((mess: any)=>({ ...mess, text: parseText(mess?.text) || " ", from: mess.from || mess.from_id || "Bot" }))
})(input.arguments);

