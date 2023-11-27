import { MongOrb, defineCollections } from './orm.js';
import { saveOneChat, tgConnect } from './saveChats.js';





export async function updateChats( mongoChats:{_id: string,username: string, collection: string, updatedAt: string}[]) {

  const client = await tgConnect() 
  if (!await client.checkAuthorization()) return;
  try{
  const tgChats:any[] = await client.getEntity(mongoChats.map((c)=>c.username ||c._id))
  if (!tgChats) return

  //const filteredChats = chats.filter(chat => chat.title.includes('Tener'));
  let i = 0
  for (const chat of tgChats) {
    const startDate = Math.round(new Date(mongoChats[i].updatedAt || '2023-12-01T21:13' ).getTime() / 1000);
    i+=1
    console.log("!!!!!!!!!!!chat:", chat.title)
    console.log("!!!!!!!!!!!data for update:", new Date(chat.updatedAt || '2023-12-01T21:13' ))
    const update = await saveOneChat(client, "Tenerife", chat, startDate )
    if (update) console.log(`Chat ${chat.username} successfully saved!!!`);
  }
  return true
}catch(e){
  console.log(e)
}
}



export async function findAndUpdateChats(chatsReg: string[], sities?: string[] ): Promise<{chats?: string[], collections?: string[]}> {
  if(chatsReg.length ===1 && chatsReg[0]==='*') return sities ? {collections: sities} : {}
  let chats:any[] = []
 
  const chatNameRegexPatterns = (chatsReg.length>0? chatsReg : [''])?.map(name => new RegExp(name, "i"));
  const collections = sities || await defineCollections([])
  if (!collections) return {chats:[], collections:[]}


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
        "updatedAt": 1,         
        "date": 1, 
        "username":1, 
        "class_name":1,            
        "name":1, 
        "_id":1,  
        "isPartner":1,   
      }
    }]

    const result: any[]= await MongOrb(collection)?.collection?.aggregate(aggregationPipeline).toArray();
        chats = chats.concat(result.map((chat)=>({...chat, collection: collection , updatedAt: chat.updatedAt || new Date().toISOString()})))       
   }
console.log(chats);
if (chats.length>0) updateChats(chats.filter((ch)=>!ch.isPartner))
return { chats: chats.map((ch)=>(ch.name || ch.username)), collections}
 }