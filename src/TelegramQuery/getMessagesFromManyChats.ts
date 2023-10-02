

import { FieldResolveInput } from 'stucco-js';
import { resolverFor } from '../zeus/index.js';
import { MongOrb } from '../utils/orm.js';



export const handler = async (input: FieldResolveInput) => 
  resolverFor('TelegramQuery','getMessagesFromManyChats', async (args) => {
    let messages:any = []
    const keyWords:(string[] | null | undefined)[]|null|undefined = args.keyWords

    console.log(args);
    
  for (const chat of args.chats&&args.chats[0]? args.chats : ["Bialystok"]) {
     const collection = chat.length>2 ? chat : "Bialystok"
      

      // Tworzymy tablicę zapytań MongoDB dla każdej grupy słów kluczowych
      const queries = keyWords?.map(group => {
          const regexPatterns = group?.map(keyword => new RegExp(keyword, "i"));
return {
  "messages.text": {
    $all: regexPatterns
  }
};
});

// Tworzymy zapytanie MongoDB przy użyciu agregacji, aby znaleźć i wyświetlić tylko pasujące wiadomości
const aggregationPipeline = [
{
  $unwind: "$messages"
},
{
  $match: {
    $or: queries
  }
},
{
  $replaceRoot: {
    newRoot: "$messages"
  }
}
];
      const result = await MongOrb(collection)?.collection?.aggregate(aggregationPipeline).toArray();
      messages = messages.concat(result)
      console.log(result);
      
  }
      return messages
})(input.arguments);