


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




 