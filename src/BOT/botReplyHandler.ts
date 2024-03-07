import { SearchSettings, UserSettings } from './botCallbackHandler.js';
import { options, menuOptions, buttonTextsEnv } from './Options.js';
import { filters, gpt, gptWithFilters } from './QueryFunctions.js';
import { infoMessEnv, yourSettings } from './Messages.js';
import { findAndUpdateChats } from '../utils/updateChats.js';
import { defineCollections } from '../utils/orm.js';
import getMessagesByTags from '../TelegramQuery/getMessagesByTags.js';
import { sendAllToGPT } from '../TelegramQuery/getMessagesByTagsAndTopic.js';
import { responseForUser } from './botResponsesForUser.js';

export interface messagesForGpt {
  [key: number]: any[];
}
const messagesForGpt: messagesForGpt = {};

export async function replyToMessageHandler(text: string, bot: any, chat_id: number, msg: any, settings: UserSettings) {
  const infoMess = infoMessEnv(settings[chat_id].language || 'En');
  const buttonTexts = buttonTextsEnv(settings[chat_id].language || 'En');
  try {
    switch (text) {
      case infoMess.writeKeyWords:
      case infoMess.anotherKeyWords:
        settings[chat_id].keyWords = msg.text
          .split('/')
          .filter((k: string) => k !== '')
          .map((w: any) => w.split('&'));
        await bot.sendMessage(
          chat_id,
          `${infoMess.searching} ${yourSettings(settings[chat_id])}\n......................⏳`,
        );
        await filters(bot, chat_id, settings[chat_id]);
        await bot.sendMessage(chat_id, infoMess.anotherKeyWords, options.Search);
        break;

      case infoMess.chatNamesFilterReq:
      case infoMess.chatNamesFilterOpt:
        const chatsByChatFilter = await findAndUpdateChats(msg.text.split('/') || [], settings[chat_id].sities);
        if (!chatsByChatFilter?.chats?.length) {
          await bot.sendMessage(chat_id, 'Anyone chats not find, please change filter');
        } else {
          settings[chat_id].chats = chatsByChatFilter.chats;
          await bot.sendMessage(
            chat_id,
            'Finded saved ' + chatsByChatFilter.chats.length + ' chats!',
            menuOptions.SearchSettings,
          );

          await bot.sendMessage(chat_id, infoMess.success, menuOptions.SettingsButton);
          if (settings[chat_id].searchType !== buttonTexts.GPTSearch) {
            await bot.sendMessage(chat_id, infoMess.step_2);
          } else {
            const data = await getMessagesByTags({ arguments: settings[chat_id], info: { fieldName: 'unknown' } });
            messagesForGpt[chat_id] = data?.messages;
            await bot.sendMessage(chat_id, 'And ' + messagesForGpt[chat_id].length + ' messages!');
          }
          await bot.sendMessage(
            chat_id,
            settings[chat_id].searchType === buttonTexts.GPTSearch
              ? infoMess.writeTopic
              : infoMess.writeKeyWordsForTopic,
            options.InputValue,
          );
        }
        break;

      case infoMess.writeTopic:
        settings[chat_id].topic = msg.text.split('/');
        await bot.sendMessage(
          chat_id,
          `${infoMess.searching} ${yourSettings(settings[chat_id])}\n........................\n ....⏳`,
        );

        const messagesByTopic = await sendAllToGPT(messagesForGpt[chat_id], msg.text.split('/'));
        await responseForUser(bot, chat_id, settings[chat_id], messagesByTopic);
        await bot.sendMessage(chat_id, infoMess.anotherTopic, options.SearchGPT);
        break;

      case infoMess.anotherKeyWords_Or_GoToStep_3:
      case infoMess.writeKeyWordsForTopic:
        settings[chat_id].keyWords = msg.text
          .split('/')
          .filter((k: string) => k !== '')
          .map((w: any) => w.split('&'));
        const data = await getMessagesByTags({ arguments: settings[chat_id], info: { fieldName: 'unknown' } });

        messagesForGpt[chat_id] = data?.messages;
        await bot.sendMessage(
          chat_id,
          data?.length ? `Finded ${data?.length} messages!` : 'No messages for this query!',
          menuOptions.SearchSettings,
        );
        await bot.sendMessage(
          chat_id,
          infoMess.anotherKeyWords_Or_GoToStep_3,
          data?.length ? options.FilterWithGptOrChange : options.BackOrOtherKeyWords,
        );
        break;

      case infoMess.writeTopicAfterKeyWords:
        settings[chat_id].topic = msg.text.split('/');
        await bot.sendMessage(
          chat_id,
          `${infoMess.searching} ${yourSettings(settings[chat_id])}\n..........................\n ....⏳`,
          { parse_mode: 'Markdown' },
        );
        const messages = await sendAllToGPT(messagesForGpt[chat_id], msg.text.split('/'));
        //await gptWithFilters(bot, chat_id, settings[chat_id]);
        await responseForUser(bot, chat_id, settings[chat_id], messages);
        await bot.sendMessage(chat_id, infoMess.anotherTopic, options.SearchFiltersAndGPT);
        break;

      case infoMess.sities:
        if (text === infoMess.sities) {
          const collections = await defineCollections(msg.text.split('/'));
          if (!collections.length) {
            await bot.sendMessage(chat_id, infoMess.anyoneLocation, menuOptions.SearchSettings);
          } else {
            settings[chat_id].sities = collections;
            await bot.sendMessage(
              chat_id,
              infoMess.findedSavedLocations + collections.map((n) => n.split('_')[0]).join('\n'),
            );
            const findByLocation = await findAndUpdateChats([], collections);
            settings[chat_id].chats = findByLocation?.chats;
            await bot.sendMessage(
              chat_id,
              'And ' + findByLocation?.chats?.length + ' chats!',
              menuOptions.SearchSettings,
            );
          }
        }
      case infoMess.chatNames:
        if (text === infoMess.chatNames) {
          const chatsByChatNames = await findAndUpdateChats(msg.text.split('/') || [], settings[chat_id].sities);
          if (!chatsByChatNames?.chats?.length) {
            await bot.sendMessage(chat_id, infoMess.anyoneChat, menuOptions.SearchSettings);
          } else {
            settings[chat_id].chats = chatsByChatNames.chats;
            await bot.sendMessage(
              chat_id,
              `Success! Finded saved ${chatsByChatNames.chats.length} chats!`,
              menuOptions.SearchSettings,
            );
          }
        }
      case infoMess.otherDaysAgo:
        if (text === infoMess.otherDaysAgo) {
          settings[chat_id].daysAgo = msg.text;
          await bot.sendMessage(chat_id, infoMess.success, menuOptions.SearchSettings);
        }
        await bot.sendMessage(chat_id, infoMess.settingsNow + yourSettings(settings[chat_id]), {
          parse_mode: 'Markdown',
          reply_markup:
            settings[chat_id].searchType === buttonTexts.Filters
              ? options.Search.reply_markup
              : settings[chat_id].searchType === buttonTexts.GPTSearch
              ? options.SearchGPT.reply_markup
              : settings[chat_id].searchType === buttonTexts.FiltersGPT
              ? options.SearchFiltersAndGPT.reply_markup
              : options.SearchType.reply_markup,
        });
        break;

      default:
        console.log('botReplyHandler :     HHHHH');
        break;
    }
  } catch (e) {
    console.log(e);
  }
}
