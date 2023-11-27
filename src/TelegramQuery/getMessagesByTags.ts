
import { FieldResolveInput } from 'stucco-js';
import { resolverFor } from '../zeus/index.js';
import { MongOrb, defineCollections } from '../utils/orm.js';
import { parseText } from '../utils/tools.js';
import { SearchSettings, UserSettings } from '../BOT/botCallbackHandler.js';

export const handler = async (input: FieldResolveInput) => 
  resolverFor('TelegramQuery','getMessagesByTags', async (args) => {
      let keyWords:string [][] = []
      args.keyWords?.map((words)=>{
       if (typeof words === 'object'&& words) keyWords.push(words)})

    const messages = await filterMessages( {sities: args.collections || undefined, sitiesReg: args.collectionsReg || undefined, chats: args.chats||undefined, chatsReg: args.chatsReg||undefined, daysAgo: args.daysAgo ||30, keyWords, limitMessages:30  });


    if(messages.length ===0) return {}
    console.log(messages?.slice(0, 3).map((mess: any)=>({ ...mess, text: parseText(mess?.text) ||" ", from: mess.from || mess.from_id || "Bot" })));
    console.log("---------- All:", messages?.length)   
    return {length: messages?.length, messages: messages?.slice(0, 1000).map((mess: any)=>({ ...mess, text: parseText(mess?.text) || " ", from: mess.from || mess.from_id || "Bot" }))}
})(input.arguments);

export default handler






export async function filterMessagesOld(filters:SearchSettings){   
  const {sities, chats, daysAgo, keyWords, chatsReg, user} = filters
  if(!sities || sities?.length ===0) return [];
   console.log(filters)
  
  const chatsArray = chatsReg ? chats?.map(name => new RegExp(name, "i")) : chats||undefined
  const sitiesArray: string[] = chatsReg ? await defineCollections(sities) : sities ? sities : await defineCollections([])
  console.log(filters)
  const date = new Date() 
        date.setDate(date.getDate() - (daysAgo || 30))
        console.log(date)
  let messages:any = []


    // Tworzymy tablicę zapytań MongoDB dla każdej grupy słów kluczowych
    const queries = user ? {"messages.from_id": user} : keyWords?.map(group => { const regexPatterns = group?.map(keyword => new RegExp(keyword, "i"));
    return {"messages.text": { $all: regexPatterns}};});

  
  for (const collection of sitiesArray) { 
    console.log(collection);  
    const aggregationPipeline = [
    {
      $match:
       {$or:[{
        name: {
          $in: chatsArray || []
        }
      },
      {
        username: {
          $in: chatsArray || []
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
      return messages
    }


    export async function filterMessages2(filters: SearchSettings) {
      const { sities, chats, daysAgo, keyWords, chatsReg, user } = filters;
      if (!sities || sities?.length === 0) return [];
    
      const chatsArray = chatsReg ? chats?.map(name => new RegExp(name, "i")) : chats || undefined;
      const sitiesArray: string[] = chatsReg ? await defineCollections(sities) : sities ? sities : await defineCollections([]);
      const date = new Date();
      date.setDate(date.getDate() - (daysAgo || 30));
      let messages: any = [];
    
      const queries = user ? { "messages.from_id": user } : keyWords?.map(group => {
        const regexPatterns = group?.map(keyword => new RegExp(keyword, "i"));
        return { "messages.text": { $all: regexPatterns } };
      });
    
      const promises = sitiesArray.map(async (collection) => {
        const aggregationPipeline = [
          { $match: { $or: [{ name: { $in: chatsArray } }, { username: { $in: chatsArray } }] } },
          { $unwind: "$messages" },
          {
            $set: {
              "messages.chat_id": { $ifNull: ["$username", "$_id"] },
              "messages.chat_name": "$name"
            }
          },
          {
            $match: {
              $and: [
                { $or: queries },
                { "messages.date": { $gte: date.toISOString() } }
              ]
            }
          },
          {
            $replaceRoot: { newRoot: "$messages" }
          },
          {
            $project: {
              "text": 1,
              "from": 1,
              "from_id": 1,
              "date": 1,
              "chat_name": 1,
              "chat_id": 1,
              "_id": 1,
            }
          }
        ];
    
        return await MongOrb(collection)?.collection?.aggregate(aggregationPipeline).toArray();
      });
    
      const results = await Promise.all(promises);
      messages = results.flat();
    
      return messages;
    }


    export async function filterMessages(filters: SearchSettings) {
      console.log(filters);
      
      const { sities, chats, daysAgo, keyWords, chatsReg,sitiesReg, user, excludeWords } = filters;
      const chatsArray = chatsReg ? chats?.map(name => new RegExp(name, "i")) : chats;
      const sitiesArray: string[] = sitiesReg ? await defineCollections(sities ? sities : []) : sities || await defineCollections([])
      const date = new Date();
      date.setDate(date.getDate() - (daysAgo || 30));
      let messages: any = [];
    
      const queries = user ? { "messages.from_id": user } : keyWords?.length&&keyWords[0].length ? keyWords?.map(group => {
        const regexPatterns = group?.map(keyword => new RegExp(keyword, "i"));
        return { "messages.text": { $all: regexPatterns } };
      }) : undefined;
    
      const excludePatterns = excludeWords?.map(word => new RegExp(word, "i")) || [];
      console.log(chatsArray);
      console.log(filters);
      const promises = sitiesArray.map(async (collection) => {
        const aggregationPipeline = [
          {
            $match: {
              ...(chatsArray && chatsArray.length > 0
                ? {
                    $or: [
                      { name: { $in: chatsArray } },
                      { username: { $in: chatsArray } },
                    ],
                  }
                : {}),
            }
          },
          { $unwind: "$messages" },
          {
            $set: {
              "messages.chat_id": { $ifNull: ["$username", "$_id"] },
              "messages.chat_name": "$name"
            }
          },
          {
            $match: {
              $and: [
                {...(queries ? {$or: queries } : {})},
                { "messages.date": { $gte: date.toISOString() } },
                { "messages.text": { $not: { $all: excludePatterns } } }
              ]
            }
          },
          {
            $replaceRoot: { newRoot: "$messages" }
          },
          {
            $project: {
              "text": 1,
              "from": 1,
              "from_id": 1,
              "date": 1,
              "chat_name": 1,
              "chat_id": 1,
              "_id": 1,
            }
          }
        ];
    
        return await MongOrb(collection)?.collection?.aggregate(aggregationPipeline).toArray();
      });
    
      const results = await Promise.all(promises);
      messages = results.flat();
    
      return messages;
    }