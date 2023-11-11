
import { getEnv } from "./orm.js";
import { cleanText, cleanTextForGtp, findUniqueObjects, parseText, parseTextForReturn } from "./tools.js";





export async function sendToOpenAi(messages: any[], topic:string){
const contextForGpt = "You are my very rational assistant who searches information for me. I will provide a large dialogue - messages, where people discuss various topics.I will also provide my topic and you should read each message, try to understand its topic and return to me a JSON with messages where you found something about my topic. Always return only an array <messages> with JSON objects {text: String}"
  const allContent = findUniqueObjects(messages).map((message)=>{
    const {text, type} = message
    const cleanText = cleanTextForGtp(parseText(text))
    if (cleanText.length>3 ) return  `"${cleanText}"`
  })

    const completion = await openAIcreateChatCompletion(getEnv('OPEN_AI_SECRET'),
     { messages: [{
       role: "system", 
       content: contextForGpt
      }, 
     {
       role: "user", 
       content:`{ messages:[${allContent}], topic:'${topic}'}` 
     }]});
      
    
    

    if(completion?.error?.message)  return [{text: completion?.error.message, from: "ERROR"}]
    const content: { messages:any[] } | any[]  = JSON.parse(completion?.choices[0]?.message.content);
    console.log(completion?.usage);
    console.log(completion?.choices[0]?.message);
    //console.log('-------------Array----', Array.isArray(content))
    const findedTexts = Array.isArray(content)? content : Array.isArray(content.messages) ? content.messages : JSON.parse(content.messages)
    if (!findedTexts || findedTexts.length === 0) return []
    
    //console.log(findedTexts[0].text || findedTexts[0])
    //console.log('-------------clean message----')
    console.log(cleanText(findedTexts[0].text || findedTexts[0]))
    const returnMessages = messages.filter((mess) => {
      const cleanedMessageText = cleanText(mess.text);
     // console.log("___________________")
      //console.log(cleanedMessageText)
      
      return findedTexts.some(keyword => cleanText(keyword.text || keyword) && cleanedMessageText.includes(cleanText(keyword.text || keyword)));
    });
    console.log("!!! All returned from AI: ", findedTexts.length)
    console.log("!!! Finded By CleanText: ", returnMessages?.length)
    if(returnMessages.length === 0) return []
    //console.log(returnMessages?.slice(0, 1).map((mess: any)=>({ ...mess, text: parseText(mess?.text) || " ", from: mess.from || mess.from_id })));
       
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
    console.log("input:  ",messages);
    
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
    //console.log(json);
   
    
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





 