import { SearchSettings, UserSettings } from './botCallbackHandler.js';
import { infoMessEnv, yourSettings } from './Messages.js';
import { buttonTextsEnv, menuOptions, options } from './Options.js';
import { filters, gpt, gptWithFilters } from './QueryFunctions.js';
import { saveChats } from '../utils/saveChats.js';

export async function otherMessagesHandler(bot: any, settings: UserSettings, chat_id: number, content?: string) {
  const infoMess = infoMessEnv(settings[chat_id].language || 'En');
  const buttonTexts = buttonTextsEnv(settings[chat_id].language || 'En');
  let arr: string[] = [];
  // with simbols query
  if (content?.includes('{') && content.includes('}')) {
    //   const regGetChatContent = /\{\}/g;
    //   const topicWithColection = content?.replace(regGetChatContent, '');
    //   if (topicWithColection.includes('-')) {
    //     arr = topicWithColection.split('-');
    //   }
    //   const topic = arr[0] || topicWithColection;
    //   const chat = arr[1];
    //   const chats = chat?.split(',') || ['wroclaw'];
    //   await gpt(bot, chat_id, settings[chat_id]);
    // } else if (content?.includes('#')) {
    //   const reg = /\#\]\[/g;
    //   const wordsWithColection = content?.replace('#', '');
    //   console.log(wordsWithColection);
    //   if (wordsWithColection.includes('-')) {
    //     arr = wordsWithColection.split('-');
    //   }
    //   const keyWords = (arr[0] || wordsWithColection).split(';').map((w: string) => w.split(','));
    //   console.log(keyWords);
    //   const collection = arr[1];
    //   const collections = collection?.split(',') || ['Bialystok', 'po'];
    //   await filters(bot, chat_id, settings[chat_id]);
  } else if (content === 'Get') {
    await saveChats(bot, chat_id, ['minaTenerife'], 'Tenerife', 5).catch(console.error);
  } else if (content?.includes('user')) {
    settings[chat_id].user = content.split('user ')[1];
    await filters(bot, chat_id, { ...settings[chat_id], user: content.split('user ')[1], keyWords: undefined });
  } else if (content?.includes('Get')) {
    const chats = content.split(' ')[1]?.split('/');
    const sity = content.split(' ')[2];
    const old = content.split(' ')[3] ? (content.split(' ')[3] as unknown as number) : undefined;
    if (!chats) {
      await bot.sendMessage(chat_id, 'Chats not found in message!');
    } else {
      saveChats(bot, chat_id, chats, sity || 'Random', old || 30).catch(console.error);
    }
  } else if (settings[chat_id].searchType) {
    switch (settings[chat_id].searchType) {
      case buttonTexts.Filters:
        settings[chat_id].keyWords = content
          ?.split('/')
          .filter((k: string) => k !== '')
          .map((w: any) => w.split('&'));
        await bot.sendMessage(
          chat_id,
          `${infoMess.searching} ${yourSettings(settings[chat_id])}\n........................\n ....⏳`,
        );
        await filters(bot, chat_id, settings[chat_id]);
        await bot.sendMessage(chat_id, infoMess.anotherKeyWords, options.Search);
        break;
      case buttonTexts.GPTSearch:
        settings[chat_id].topic = content?.split('/');
        await bot.sendMessage(
          chat_id,
          `${infoMess.searching} ${yourSettings(settings[chat_id])}\n........................\n ....⏳`,
        );
        await gpt(bot, chat_id, settings[chat_id]);
        await bot.sendMessage(chat_id, infoMess.anotherTopic, options.SearchGPT);
        break;
      case buttonTexts.FiltersGPT:
        if (settings[chat_id].topic) {
          settings[chat_id].keyWords = content
            ?.split('/')
            .filter((k: string) => k !== '')
            .map((w: any) => w.split('&'));
        } else {
          settings[chat_id].topic = content?.split('/');
        }
        await bot.sendMessage(
          chat_id,
          `${infoMess.searching} ${yourSettings(settings[chat_id])}\n........................\n ....⏳`,
        );
        await gptWithFilters(bot, chat_id, settings[chat_id]);
        await bot.sendMessage(chat_id, infoMess.anotherTopic, options.SearchFiltersAndGPT);
        break;
    }
  } else {
    console.log(' else block no response');
    await bot.sendMessage(
      chat_id,
      'Soon you will be have here simply chat gpt for talking about anythings, but now i can do only search work',
      menuOptions.SettingsButton,
    );
    await bot.sendMessage(chat_id, infoMess.settingsNow + yourSettings(settings[chat_id]), options.SearchType);
  }
}
