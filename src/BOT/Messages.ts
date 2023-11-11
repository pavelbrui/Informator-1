import { SearchSettings } from "./botCallbackHandler.js"
import { getEnv } from "../utils/orm.js";


const settingsEn= {
    chats: 'Chats',
    keyWords: 'keyWords'
}

const settingsNames = settingsEn

export function yourSettings(settings: SearchSettings ){
    const newSettings= {...settings,
         chats: JSON.stringify(settings.chats)?.replaceAll(',', '+'),
         keyWords: JSON.stringify(settings.keyWords)?.replaceAll('],[', ' + ').replaceAll('[[', '[').replaceAll(']]', ']').replaceAll(',', '&'),
         sities: JSON.stringify(settings.sities)?.replaceAll(',', '+'),
         topic: JSON.stringify(settings.topic)?.replaceAll(',', '+')
        }

      //  newSettings[`${settingsNames.keyWords}`] = "dvdvd"
     
    return  JSON.stringify(newSettings).replaceAll(',"', '\n"').replace("{", "\n").replace("}", "").replaceAll('\\', "")
}
    



    const infoMessEn = {
  
    welcom : ' *Welcome to Messages Search Bot!* 🌟',
    startTypeSearch:'🚀 For starting choose type search:',
    chooseOption: 'Choose an option:',

    filtersSettings: "Let's go! Your settings now: ",
    filtersMessage: 'You can change the settings or go to enter keywords and run search: ',
    writeKeyWords: `**Enter keywords or fragments\n (for variants use '/', for combinations use '&')**\n For example if you write: \n'Warszawa&Bialystok/warshaw&tomorrow'\n >> you get messages include the full fragments of "warszawa" and "bialystok" + all messages with the fragment warszaw and the word tomorrow in one text):`,

    gptTypeInfo:"Good choose!\n For this search type you must limit chats:\n ",
    chatNamesFilterReq: `Enter chat names or fragments (separated by '/'):`,
    settingsNow: 'Your settings now:',
    writeTopic:`*Enter only one topic or full description for your query*:`,            
   

    filtersAndGptSettings: "Good choose! Your settings now: ",
    addChatNamesOrSkip: `Before starting you can limit chats for search`,
    chatNamesFilterOpt: `Enter the names or part names of chats \n(separated by use '/'):`,
    writeTopicWithFilters: `Provide one topic or full description for your query:`,
    writeKeyWordsForTopic: `For example if you write:\n 'Warszawa&Bialystok/warshaw&tomorrow' >\n you get messages include the full fragments of "warszawa" and "bialystok" + all messages with the fragment warszaw and the word tomorrow in one text )::`,
    step_1:"*Step 1: Chats filter*",
    step_2:"*Step 2: Topic*",
    step_3:"*Step 3: Enter keywords or fragments\n(for variants use '/', for combinations use '&')*",
    
    maxOldMessages : `Choose max old messages for search:`,
    searchType:'Choose type search:',
    maxReturnMess:'Choose max number returned messages for one response:',
    chatNames :`Enter chat names or fragments names (separated by '/'):`,
    otherDaysAgo: 'Enter only digital value number days:',
    sities: `For use this filter enter only names or fragments names sities (but now it works only for added sities):`,


    searching: " Searching with settings:",

    anotherTopic: "You can enter another topic or change settings",
    anotherKeyWords: "You can enter other keyWords or change settings",
    success: "Success",

    anyoneMessage: "Anyone message not found",


    authNumer: "For getting chats, write your phone number:",
    authCode: "Enter sms code:"
}



const infoMessRu = {
    welcom: "*Добро пожаловать в бота поиска сообщений!* 🌟",
    startTypeSearch: "🚀 Для начала выберите тип поиска:",
    chooseOption: "Выберите тип:",
  
    filtersSettings: "Поехали! Ваши настройки сейчас:",
    filtersMessage: "Вы можете изменить настройки или перейти к вводу ключевых слов и запуску поиска: ",
    writeKeyWords: "**Введите ключевые слова или фрагменты**\n (для вариантов используйте '/', для комбинаций используйте '&')*\n Например, если вы напишете: 'Warszawa&Bialystok/warshaw&tomorrow' >\n вы получите сообщения, включающие полные фрагменты \"warszawa\" и \"bialystok\" + все сообщения с фрагментом warszaw и словом tomorrow в одном тексте):",
  
    gptTypeInfo: "Хороший выбор!\n Для этого типа поиска вы должны ограничить чаты:\n ",
    chatNamesFilterReq: "Введите имена чатов или фрагменты (разделяйте '/'):",
    settingsNow: "Ваши настройки сейчас:\n",
    writeTopic: "*Введите только тему или полное описание запроса*:",
  
    filtersAndGptSettings: "Хороший выбор! Ваши настройки сейчас:\n ",
    addChatNamesOrSkip: "Прежде чем начать, вы можете ограничить чаты для поиска",
    chatNamesFilterOpt: "Введите имена или фрагменты имен чатов (разделяйте '/'):",
    writeTopicWithFilters: " Введите тему или полное описание вашего запроса:",
    writeKeyWordsForTopic: "Например, если вы напишете: 'Warszawa&Bialystok/warshaw&tomorrow' >\n вы получите сообщения, включающие полные фрагменты \"warszawa\" и \"bialystok\" + все сообщения с фрагментом \"warszaw\" и словом \"tomorrow\" в одном тексте):",
    step_1: "*Шаг 1: *",
    step_2: "*Шаг 2: *",
    step_3: "*Шаг 3: Введите ключевые слова или фрагменты слов\n (для вариантов используйте '/', для комбинаций используйте '&')*",
  
    maxOldMessages: "Выберите максимальную старость сообщений для поиска:",
    searchType: "Выберите тип поиска:",
    maxReturnMess: "Выберите максимальное количество возвращаемых сообщений для одного ответа:",
    chatNames: "Введите имена чатов или фрагменты (разделяйте '/') :  ",
    otherDaysAgo: 'Enter only value',
    sities: "Введите значение фильтра городов:",
  
    searching: " Поиск с установками:",
  
    anotherTopic: "Вы можете ввести другую тему или изменить настройки",
    anotherKeyWords: "Вы можете ввести другие ключевые слова или изменить настройки",
    success: "Success",
  
    anyoneMessage: "Anyone message not found",
  
    authNumer: "For getting chats, write your phone number:",
    authCode: "Enter sms code:"
  };
  


const infoMessEnv = (lang: string) => lang === 'En' ? infoMessEn : infoMessRu
export const infoMess =  infoMessEnv(getEnv('LANGUAGE'))