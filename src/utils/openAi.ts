
import { getEnv } from "./orm.js";
import { cleanText, cleanTextForGtp, findUniqueObjects, parseText, parseTextForReturn } from "./tools.js";





export async function sendToOpenAi(messages: any[], topic:string){

  const allContent = findUniqueObjects(messages).map((message)=>{
    const {text, type} = message
    const cleanText = cleanTextForGtp(parseText(text))
    if (cleanText.length>3 ) return  `"${cleanText}"`
  })

    const completion = await openAIcreateChatCompletion(getEnv('OPEN_AI_SECRET'), { messages: [{ role: "system", content: "Jestesz moim bardzo rozumnym pomocnikiem który poszukuje dla mnie informacji. Podam ci duży dialog - messages, gdzie ludzi piszą o różnych tematach.I podam temat - topic, który mnie interesuje, a ty zwracaj  mnie json z messages, gdzie znalazłeś coś o mój temat. -Powinieneś przeczytać każdą wiadomość i spróbować zrozumieć jej temat. Zwracaj mnie zawsze tylko array <messages> z json objektami {text: String}"}, {role: "user", content:`{ messages:[${allContent}], topic:'${topic}'}` }]});
      
    
    console.log(completion?.usage);
    
    console.log(completion?.choices[0]?.message);
    if(completion?.error?.message)  return [{text: completion?.error.message, from: "ERROR"}]
    const content: { messages:any[] } | any[]  = JSON.parse(completion?.choices[0]?.message.content);
    console.log('-------------Array----', Array.isArray(content))
    const findedTexts = Array.isArray(content)? content : content.messages
    console.log(findedTexts[0].text || findedTexts[0])
    console.log('-------------clean message----')
    console.log(cleanText(findedTexts[0].text || findedTexts[0]))
    const returnMessages = messages.filter((mess) => {
      const cleanedMessageText = cleanText(mess.text);
      console.log("___________________")
      console.log(cleanedMessageText)
      
      return findedTexts.some(keyword => cleanText(keyword.text || keyword) && cleanedMessageText.includes(cleanText(keyword.text || keyword)));
    });
    
    if(returnMessages.length === 0) return []
    console.log(returnMessages?.slice(0, 3).map((mess: any)=>({ ...mess, text: parseText(mess?.text) || " ", from: mess.from || mess.from_id })));
    console.log(returnMessages?.length)   
    return findUniqueObjects(returnMessages)?.slice(0, 1001).map((mess: any)=>({ ...mess, text:  parseTextForReturn(mess?.text) || " ", from: mess.from || mess.from_id }))
  }



const defaultTextGenerationOptions = {
    top_p: 1,
    temperature: 0.7,
    presence_penalty: 0,
    frequency_penalty: 0,
  };
  export const openAIcreateChatCompletion = async (
    openAiKey: string,
    input: any,
    ftModel?: string,
  ) => {
    const model = ftModel|| `gpt-3.5-turbo-16k`;
    const  messages = input.messages;
    console.log(messages);
    
    const result = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openAiKey}`,
        ['Content-Type']: 'application/json',
      },
      body: JSON.stringify({
        model: model,
        ...defaultTextGenerationOptions,
        messages,
      }),
    });
    const json = await result.json();
    console.log(json);
   
    
    return json as {
      error:{message: string};
      id: string;
      object: string;
      created: number;
      choices: Array<{ index: number; message: any; finish_reason: string }>;
      usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
      };
    };
  };





 