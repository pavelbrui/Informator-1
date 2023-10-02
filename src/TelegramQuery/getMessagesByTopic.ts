import { FieldResolveInput } from 'stucco-js';
import { resolverFor } from '../zeus/index.js';

import { MongOrb, getEnv } from '../utils/orm.js';

import { MongoClient} from 'mongodb';
import { openAIcreateChatCompletion } from '../utils/openAi.js';



export const handler = async (input: FieldResolveInput) => 
  resolverFor('TelegramQuery','getMessagesByTopic', async (args) => {
    console.log(args.chats);
    console.log(args.topic);

    const client = new MongoClient(getEnv('MONGO_URL'), {  monitorCommands: true });
    const collections = await client.db('son_dev').listCollections().toArray();
     let messagesForGpt:any =[];
    for (const collection of collections) {
          const collectionName = collection.name;
          if(args.chats?.length && args.chats?.length !== 0 && !args.chats.some(element => collectionName.includes(element)))  continue
          const documents = await client.db('son_dev').collection(collectionName).find({}).toArray();
          console.log(collection.name);
          // Tutaj możesz przetwarzać dokumenty z danej kolekcji, np. wypisywać pole
          for (const document of documents) {
          //  console.log(document.content); 
            messagesForGpt.push(document)
          }
        }
      
        const response = await sendToOpenAi(messagesForGpt, args.topic[0])
  if(response?.length&&response?.length>1) await MongOrb('GPTResponseForTarget').createWithAutoFields('_id',
  'createdAt')({topic: args.topic, chats: args.chats, response});
        return [{content: await response}]
    }
)(input.arguments);





async function sendToOpenAi(messages: any[], topic:string){
  const allContent = messages.map((message)=>{
    const {text, chat_id, chat_name, from , from_id} = message
    return `${chat_name || chat_id} - ${from || from_id} : ${text}, `
  })

   
   // const openai = new OpenAI({apiKey:"it876uyt5y6we4jx", organization:'org-OcXM2M35rxb1tx4ENJmdmbuP'})
    const completion = await openAIcreateChatCompletion(getEnv('OPEN_AI_SECRET'), { messages: [{ role: "system", content: "Jestesz moim bardzo rozumnym pomocnikiem który poszukuje dla mnie informacji. Podam ci duży dialog - messages, gdzie ludzi piszą o różnych tematach. I podam temat - topic, który mnie interesuje, a ty zwracasz mnie tylko te messages, gdzie znalazłeś coś o mój temat. -Powinieneś przeczytać każdą wiadomość i spróbować zrozumieć jej temat.- Nie zwracaj dublicatów-Zwracaj mnie tylko array z json objektami message:{from: String, content: String}"}, {role: "user", content:`{ messages:'${allContent}', topic:'${topic}'}` }]});
     
    console.log(completion?.usage);
    console.log(completion?.choices[0]?.message);
    return completion?.choices[0]?.message.content || completion?.error.message;
    
  }


  