import { options } from "./botOptions.js"




export let infoMess = {
    writeKeyWords: `*Enter keywords or fragments\n (for variants use '/', for combinations use '&')*\n For example if you write: 'Warszawa&Bialystok/warshaw&tomorrow' >\n you get messages include the full fragments of "warszawa" and "bialystok" + all messages with the fragment warszaw and the word tomorrow in one text):`,
    writeKeyWordsForTopic: `*Step 2: Enter keywords or fragments\n (for variants use '/', for combinations use '&')*\n For example if you write: 'Warszawa&Bialystok/warshaw&tomorrow' >\n you get messages include the full fragments of "warszawa" and "bialystok" + all messages with the fragment warszaw and the word tomorrow in one text):`,
    writeTopic:`*Enter only topic or full description for your query*:`,
    writeTopicWithFilters: `*Step 1: Enter topic or full description for your query*:`,
    chatNamesFilter: `*For this search type you must provide chat names or fragments:*\n Enter chat names or fragments (separated by '/'):`,

    chatNamesFilterOpt: `You can add chat filter by chat names or fragments (separated by '/'):`,

    sities: `Enter sities filter value:`

}


export async function callbackHandler(callback, infoMess, bot, settings){
const chat_id = callback.message?.chat?.id
  const content = callback.data
  switch (content) {
    case 'KeyWords':
            bot.sendMessage(chat_id, infoMess.writeKeyWords, options.InputValue)//, { parse_mode: 'Markdown' });
         break

   case 'KeyWordsForTopic':
            bot.sendMessage(chat_id, infoMess.writeKeyWordsForTopic, options.InputValue)//, { parse_mode: 'Markdown' });
         break

    case 'Topic':
            bot.sendMessage(chat_id, infoMess.writeTopic, options.InputValue)//, { parse_mode: 'Markdown' });
         break
      
    case 'TopicWithFilters':
        bot.sendMessage(chat_id, infoMess.writeTopicWithFilters, options.InputValue) //, { parse_mode: 'Markdown' });
         break
      
    
    case 'Sities':
            bot.sendMessage(chat_id, infoMess.sities, options.InputValue);
         break

    
    case 'Filters + GPT':
        settings.searchType = content;
      settings.limitMessages = settings.limitMessages || 5;
      settings.daysAgo = settings.daysAgo || 30;
      delete settings.keyWords;
     await bot.sendMessage(chat_id, "Let's go! Your settings now:\n " + JSON.stringify(settings), options.Search2 );
      await bot.sendMessage(chat_id,'You can change the settings or go to enter your query and run search: ', options.SearchFiltersAndGPT)
      break;

      case 'GPT search':
        settings.searchType = content;
        settings.limitMessages = settings.limitMessages || 5;
        settings.daysAgo = settings.daysAgo || 30;
        delete settings.keyWords;
       await bot.sendMessage(chat_id, "Good choose!\n ", options.Search2 );
       await bot.sendMessage(chat_id,'For this search type you must provide chat names or fragments:', options.InputValue)
        break;

      
    case 'Filters' :
      settings.searchType = content;
      settings.limitMessages = userSettings[chat_id].limitMessages || 5;
      settings.daysAgo = userSettings[chat_id].daysAgo || 30;
     await bot.sendMessage(chat_id, "Let's go! Your settings now:\n " + JSON.stringify(settings), options.Search2 );
     await  bot.sendMessage(chat_id,'You can change the settings or go to enter keywords and run search: ', options.Search)
      break;


    case  'addChatFilter':
      bot.sendMessage(chat_id, infoMess.chatNames , options.InputValue);
   break

   case  'AddChatFilterOpt':
      bot.sendMessage(chat_id, infoMess.chatNames , options.InputValue);
   break
      
      
    default:
  userSettings[chat_id].limitMessages = callback.data?.replace("button_","") ; 
 await bot.sendMessage(chat_id, "Your parameters:", options.Search2 );
  bot.sendMessage(chat_id, JSON.stringify(settings), options.Search);
  }
}