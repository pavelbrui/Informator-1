import { getEnv } from "../utils/orm.js";

export const buttonTextsEn = {
  GPTSearch: 'GPT search',
  Filters: 'Filters',
  FiltersGPT: 'Filters + GPT',
  AddKeywordsRun: 'Add KeyWords and run🚀',
  Back: 'Back',
  TopicRun: 'Enter topic or description and run🚀',
  TopicBack: 'Back',
  TopicWithFilters: 'Enter topic or description',
  AddChatFilterOpt: 'Limit chat names',
  SkipAddChats: 'Skip',
  DaysAgoOptions: ['1 day', '3 days', '7 days', '30 days', 'Other'],
  NumberMessagesOptions: ['3', '5', '10', '20', 'Max'],
  Settings: 'Settings',

  ChatNamesFilter: 'Chat Names Filter',
  LocationsFilter: 'Locations Filter',
  DaysAgo: 'Days Ago Filter',
  SearchType: 'Search Type',
  LimitReturnedMessages: 'Limit Returned Messages',

  ShowNext: 'ShowNext'
};


export const buttonTextsRu = {
  GPTSearch: 'GPT',
  Filters: 'Фильтры',
  FiltersGPT: 'Фильтры + GPT',
  AddKeywordsRun: 'Добавить ключевые слова и запустить🚀',
  Back: 'Назад',
  TopicRun: 'Введите тему или описание и запустите🚀',
  TopicBack: 'Назад',
  TopicWithFilters: 'Введите тему или описание',
  AddChatFilterOpt: 'Ограничить названия чатов',
  SkipAddChats: 'Пропустить',
  DaysAgoOptions: ['1 день', '3 дня', '7 дней', '30 дней', 'Other'],
  NumberMessagesOptions: ['3', '5', '10', '20', '35'],


  Settings: 'Настройки',
  ChatNamesFilter: 'Фильтр чатов',
  LocationsFilter: 'Locations Filter',
  DaysAgo: 'Старость',
  SearchType: 'Тип поиска',
  LimitReturnedMessages: 'Лимит сообщений',

  ShowNext: 'ShowNext'
};




const buttonTextsEnv = (lang: string) => lang === 'En' ? buttonTextsEn : buttonTextsRu
export const buttonTexts =  buttonTextsEnv(getEnv('LANGUAGE'))

export const options = {
     SearchType: {
    reply_markup: {
      inline_keyboard: [
        [
          { text: buttonTexts.GPTSearch, callback_data: 'GPT search' },
          { text: buttonTexts.Filters, callback_data: 'Filters' },
          { text: buttonTexts.FiltersGPT, callback_data: 'Filters + GPT' },
        ],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  },
  Search: {
    reply_markup: {
      inline_keyboard: [
        [{ text: buttonTexts.AddKeywordsRun, callback_data: 'KeyWords' }],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  },
  SearchForTopic: {
    reply_markup: {
      inline_keyboard: [
        [
          { text: buttonTexts.AddKeywordsRun, callback_data: 'KeyWords' },
          { text: buttonTexts.Back, callback_data: 'BackToSearchTypes' },
        ],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  },
  AddChatFilterOpt: {
    reply_markup: {
      inline_keyboard: [
        [
          { text: buttonTexts.AddChatFilterOpt, callback_data: 'addChatFilterOpt' },
          { text: buttonTexts.SkipAddChats, callback_data: 'skipAddChats' },
        ],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  },
  SearchGPT: {
    reply_markup: {
      inline_keyboard: [
        [
          { text: buttonTexts.TopicRun, callback_data: 'Topic' },
          { text: buttonTexts.TopicBack, callback_data: 'BackToSearchTypes' },
        ],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  },
  SearchFiltersAndGPT: {
    reply_markup: {
      inline_keyboard: [
        [
          { text: buttonTexts.TopicWithFilters, callback_data: 'TopicWithFilters' },
          { text: buttonTexts.Back, callback_data: 'BackToSearchTypes' },
        ],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  },
   InputDaysAgo:{
     reply_markup: {
       force_reply: true, 
       keyboard: [[buttonTexts.DaysAgoOptions[0], buttonTexts.DaysAgoOptions[1], buttonTexts.DaysAgoOptions[2]], [buttonTexts.DaysAgoOptions[3], buttonTexts.DaysAgoOptions[4]]],
       resize_keyboard: true,
     },
   },
   
   NumberMessages:{
     reply_markup: {
       force_reply: true, 
       inline_keyboard: [[{text :'3',  callback_data: 'button_3' }, {text :'5',  callback_data: 'button_5' }, {text :'10',  callback_data: 'button_10' }],[{text :'20',  callback_data: 'button_20' }, {text: buttonTexts.NumberMessagesOptions[4],  callback_data: 'button_35',  color: 'blue'}]], 
       resize_keyboard: true,
       one_time_keyboard: true
     },
   },
   
    InputValue: {
     reply_markup: {
       force_reply: true,
       resize_keyboard: true,
     },
   },

   Back:{
    reply_markup:  {
    inline_keyboard: [[{text : buttonTexts.Back, callback_data: 'BackToSearchTypes' } ]],
    resize_keyboard: true,
    one_time_keyboard: true
  }},

  ShowNext:{
    reply_markup:  {
    inline_keyboard: [[{text : buttonTexts.ShowNext, callback_data: 'ShowNext' } ]],
    resize_keyboard: true,
    one_time_keyboard: true
  }},
   }



   export const menuOptions = {
    SettingsButton: {
      reply_markup: {
        force_reply: true,
        keyboard: [[buttonTexts.Settings]],
        resize_keyboard: true,
      },
    },
    SearchSettings: {
      reply_markup: {
        force_reply: true,
        keyboard: [
          [
            buttonTexts.ChatNamesFilter,
            buttonTexts.LocationsFilter,
            buttonTexts.DaysAgo
          ],
           [
            buttonTexts.SearchType,
            buttonTexts.LimitReturnedMessages,
          ],
        ],
        resize_keyboard: true,
      },
    },
  Back:{
    reply_markup:  {
    keyboard: [[buttonTexts.Back]],
    resize_keyboard: true,
  }},
   }







