import { SearchSettings } from './botCallbackHandler.js';
import { getEnv } from '../utils/orm.js';

const settingsEn = {
  chats: 'Chats',
  keyWords: 'keyWords',
};

const settingsNames = settingsEn;

export function yourSettings(settings: SearchSettings) {
  const newSettings = {
    searchType: settings.searchType,
    maxReturnMessages: settings.limitMessages,
    maxDaysAgo: settings.daysAgo,
    keyWords: JSON.stringify(settings.keyWords)
      ?.replaceAll('],[', ' + ')
      .replaceAll('[[', '[')
      .replaceAll(']]', ']')
      .replaceAll(',', '&'),
    topic: JSON.stringify(settings.topic)?.replaceAll(',', '+'),
    sities: JSON.stringify(settings.sities?.map((sit) => sit.split('_')[0]))?.replaceAll(',', '+'),
    chats: settings.chats
      ? ',<' + JSON.stringify(settings.chats)?.replace('[', '').replace(']', '').replaceAll(',', '>,<') + '>'
      : 'All saved in DB',
  };

  //  newSettings[`${settingsNames.keyWords}`] = "dvdvd"

  return JSON.stringify(newSettings)
    .replaceAll(',<', '\n<')
    .replaceAll(',"', '\n"')
    .replace('{', '\n')
    .replace('}', '')
    .replaceAll('\\', '');
}

const infoMessEn = {
  welcom: ' *Welcome to Messages Search Bot!* 🌟',
  startTypeSearch: '🚀 For starting choose type search:',
  chooseOption: 'Choose an option:',

  filtersSettings: "Let's go! Your settings now: ",
  filtersMessage: 'You can change the settings or go to enter keywords and run search: ',
  writeKeyWords: `**Enter keywords or fragments\n (for variants use '/', for combinations use '&')**\n For example if you write: \n'Warszawa&Bialystok/warshaw&tomorrow'\n >> you get messages include the full fragments of "warszawa" and "bialystok" + all messages with the fragment warszaw and the word tomorrow in one text):`,

  gptTypeInfo: 'Good choose!\n For this search type you must limit chats:\n ',
  chatNamesFilterReq: `Enter chat names or fragments (separated by '/'):`,
  settingsNow: 'Your settings now:',
  writeTopic: `*Enter only one topic or full description for your query*:`,

  filtersAndGptSettings: 'Good choose! Your settings now: ',
  addChatNamesOrSkip: `Before starting you can limit chats for search`,
  chatNamesFilterOpt: `Enter the names or part names of chats \n(separated by use '/'):`,
  writeTopicAfterKeyWords: `Provide one topic or full description for your query:`,
  writeKeyWordsForTopic: `For example if you write:\n 'Warszawa&Bialystok/warshaw&tomorrow' >\n you get messages include the full fragments of "warszawa" and "bialystok" + all messages with the fragment warszaw and the word tomorrow in one text )::`,
  step_1: '*Step 1: Chats filter*',
  step_2: "*Step 2: Enter keywords or fragments*\n(for variants use '/', for combinations use '&')",
  step_3: '*Step 3: Topic*',

  maxOldMessages: `Choose max old messages for search:`,
  searchType: 'Choose type search:',
  maxReturnMess: 'Choose max number returned messages for one response:',
  chatNames: `Enter chat names or fragments names (separated by '/'):`,
  otherDaysAgo: 'Enter only digital value number days:',
  sities: `For use this filter enter only names or fragments names sities (but now it works only for added sities):`,

  searching: ' Searching with settings:',

  anotherTopic: 'You can enter another topic or change settings',
  anotherKeyWords: 'You can enter other keyWords or change settings',
  anotherKeyWords_Or_GoToStep_3: 'Now you can change keyWords and filters, or go to step 3🚀',
  success: 'Success',

  anyoneMessage: 'Anyone message not found',
  anyoneLocation: 'Anyone location not find, please change filter!',
  anyoneChat: 'Anyone chat not find, please change filter!',

  authNumer: 'For getting chats, write your phone number:',
  authCode: 'Enter sms code:',
};

const infoMessRu = {
  welcom: ' *Добро пожаловать в бота поиска сообщений!* 🌟',
  startTypeSearch: '🚀 Для начала выберите тип поиска:',
  chooseOption: 'Выберите вариант:',

  filtersSettings: '*Поехали! Ваши настройки сейчас:* ',
  filtersMessage: 'Вы можете изменить настройки или перейти к вводу ключевых слов и запустить поиск: ',
  writeKeyWords: `**Введите ключевые слова или фрагменты\n (для вариантов используйте '/', для комбинаций используйте '&')**\n Например, если вы напишете: \n'Warszawa&Bialystok/warshaw&tomorrow'\n >> вы получите сообщения, включающие полные фрагменты "warszawa" и "bialystok" + все сообщения с фрагментом warszaw и словом tomorrow в одном тексте):`,

  gptTypeInfo: 'Хороший выбор!\n Для этого типа поиска вы должны ограничить чаты:\n ',
  chatNamesFilterReq: `Введите имена чатов или фрагменты (разделенные '/'):`,
  settingsNow: 'Ваши настройки сейчас:',
  writeTopic: `*Введите только одну тему или полное описание для вашего запроса*:`,

  filtersAndGptSettings: 'Хороший выбор! Ваши настройки сейчас: ',
  addChatNamesOrSkip: `Перед началом вы можете ограничить чаты для поиска`,
  chatNamesFilterOpt: `Введите имена или части имен чатов \n(разделенные '/'):`,
  writeTopicAfterKeyWords: `Укажите одну тему или полное описание для вашего запроса:`,
  writeKeyWordsForTopic: `Например, если вы напишете:\n 'Warszawa&Bialystok/warshaw&tomorrow' >\n вы получите сообщения, включающие полные фрагменты "warszawa" и "bialystok" + все сообщения с фрагментом warszaw и словом tomorrow в одном тексте )::`,
  step_1: '*Шаг 1: Фильтр чатов*',
  step_2:
    "*Шаг 2: Введите ключевые слова или фрагменты*\n(для вариантов используйте '/', для комбинаций используйте '&')",
  step_3: '*Шаг 3: Тема*',

  maxOldMessages: `Выберите максимальное количество старых сообщений для поиска:`,
  searchType: 'Выберите тип поиска:',
  maxReturnMess: 'Выберите максимальное количество возвращаемых сообщений для одного ответа:',
  chatNames: `Введите имена чатов или фрагменты имен чатов (разделенные '/'):`,
  otherDaysAgo: 'Введите только цифровое значение числа дней:',
  sities: `Для использования этого фильтра введите только имена или фрагменты имен городов (но сейчас он работает только для добавленных городов):`,

  searching: ' Поиск с настройками:',

  anotherTopic: 'Вы можете ввести другую тему или изменить настройки',
  anotherKeyWords: 'Вы можете ввести другие ключевые слова или изменить настройки',
  anotherKeyWords_Or_GoToStep_3: 'Теперь вы можете изменить ключевые слова и фильтры или перейти к шагу 3🚀',
  success: 'Успеx',

  anyoneMessage: 'Сообщение не найдено',
  anyoneLocation: 'Ни одного местоположения не найдено, пожалуйста, измените фильтр!',
  anyoneChat: 'Ни одного чата не найдено, пожалуйста, измените фильтр!',

  authNumer: 'Для получения чатов напишите свой номер телефона:',
  authCode: 'Введите код из SMS:',
};

export const infoMessEnv = (lang: string) => (lang === 'En' ? infoMessEn : lang === 'Ru' ? infoMessRu : infoMessEn);
export const infoMess = infoMessEnv(getEnv('LANGUAGE'));

export const clickLink = (text: string, link: string) => `[${text}](${link})`;
