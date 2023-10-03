
import { FieldResolveInput } from 'stucco-js';
import { resolverFor } from '../zeus/index.js';
import { MongOrb } from '../utils/orm.js';


export const handler = async (input: FieldResolveInput) => 
  resolverFor('TelegramQuery','getMessagesByTags', async (args) => {
      let messages:any = []
      const keyWords:(string[] | null | undefined)[]|null|undefined = args.keyWords
      console.log(args);
      const consDays = args.daysAgo || 30
      const date = new Date()
      if(consDays) date.setDate(date.getDate() - consDays)
      console.log(date)
       // Tworzymy tablicę zapytań MongoDB dla każdej grupy słów kluczowych
      const queries = keyWords?.map(group => { const regexPatterns = group?.map(keyword => new RegExp(keyword, "i"));
                                                return {"messages.text": { $all: regexPatterns}};});
      const chatNameRegexPatterns = args.chats?.map(name => new RegExp(name, "i"));
      
for (const collec of args.collections? args.collections : ["Bialystok", "poz"]) {
       const collection = collec.length>2 ? collec : "Bialystok"
      
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
        messages = messages.concat(result)
        //console.log(result);
        
    }
    if(messages.length ===0) return []
    console.log(messages?.slice(0, 3).map((mess: any)=>({ ...mess, text: Array.isArray(mess?.text) ? mess?.text?.toString() : mess?.text , from: mess.from || mess.from_id })));
    console.log(messages?.length)   
    return messages?.slice(0, 1001).map((mess: any)=>({ ...mess, text: Array.isArray(mess?.text) ? mess?.text?.toString() : mess?.text || " ", from: mess.from || mess.from_id }))
})(input.arguments);

