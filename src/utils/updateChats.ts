import { MongOrb, defineCollections } from './orm.js';
import { saveOneChat, tgConnect } from './saveChats.js';


export async function updateChats(chatsReg: string[], sitiesReg: string[] ){
const chats = await getMongoChats(chatsReg, sitiesReg)
const client = await tgConnect() 
  if (!await client.checkAuthorization()) console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!! CHATS NOT UPDATED!!!!! \n !!!!!NOT AUTHORIZATION!!!!!!');
for (const chat of chats) {
    const startDate = new Date(chat.updateAt).getTime() / 1000;
     await saveOneChat(client, chat.collection, chat, startDate ).catch(console.error);
}
}


export async function getMongoChats(chatsReg: string[], sitiesReg?: string[] ){
  let chats:any = []
    
  // Tworzymy tablicę zapytań MongoDB dla każdej grupy słów kluczowych
  const chatNameRegexPatterns = chatsReg?.map(name => new RegExp(name, "i"));
  const collections = await defineCollections(sitiesReg)

    
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
      $project: { 
        "updateAt": 1,         
        "date": 1, 
        "username":1, 
        "class_name":1,            
        "name":1, 
        "_id":1,      
      }
    }]

    const result = await MongOrb(collection)?.collection?.aggregate(aggregationPipeline).toArray();
        chats = chats.concat(result.map((chat)=>({...chat, collection: collection })))
        console.log(result);
        
}
return chats
 }