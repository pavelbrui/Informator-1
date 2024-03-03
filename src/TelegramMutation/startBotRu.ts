import { FieldResolveInput } from 'stucco-js';
import { resolverFor } from '../zeus/index.js';
import { MongOrb, getEnv } from '../utils/orm.js';
import TelegramBot from 'node-telegram-bot-api';

import { options, menuOptions, buttonTexts } from '../BOT/Options.js';
import { callbackHandler } from '../BOT/botCallbackHandler.js';
import { replyToMessageHandler } from '../BOT/botReplyHandler.js';
import { otherMessagesHandler } from '../BOT/botOtherMessagesHandler.js';
import { infoMessEnv, yourSettings } from '../BOT/Messages.js';
import { pushError } from '../utils/tools.js';
//export const defaultSettings = { daysAgo: 30, limitMessages: 5 }
const infoMess = infoMessEnv('Ru');

export const handler = async (input: FieldResolveInput) =>
  resolverFor('TelegramMutation', 'newChats', async (args) => {
    const ChatContentFinder = getEnv('ChatContentFinder');
    const bot = new TelegramBot(ChatContentFinder, { polling: true });

    const userSettings: any = {};
    bot.sendMessage(839036065, `Hej! New ru chat started successed!`);

    bot.on('message', async (msg) => {
      const id = msg.message_id;
      const chat_name = msg.chat.title;
      const chat_id = msg.chat.id;
      const from = msg.from?.username || msg.from?.first_name + '_' + msg.from?.last_name;
      const from_id = msg.from?.id;
      const content = msg.text;
      try {
        const date = new Date(msg.date * 1000);
        console.log('\n For ChatContentFINDER! \n from: ', from, ', chat_id: ', chat_id, ', \n text: ', content);

        if (chat_id && !userSettings[chat_id])
          userSettings[msg.chat.id] = { daysAgo: 30, limitMessages: 5, language: 'Ru' };
        console.log(userSettings);

        if (content?.length && content?.length > 1)
          MongOrb('For_bot_Ru').collection.updateOne(
            { _id: chat_id },
            { $set: { chatName: chat_name || from }, $push: { messages: { id, from_id, content, date } } },
            { upsert: true },
          );
        switch (content) {
          case '/start':
            console.log('HHHHHHHHHHHHHHHHHHHH');

            await bot.sendMessage(chat_id, infoMess.welcom, { parse_mode: 'Markdown' });
            await bot.sendMessage(chat_id, infoMess.startTypeSearch, options.SearchType);

            break;

          case buttonTexts.Settings:
            await bot.sendMessage(chat_id, infoMess.chooseOption, menuOptions.SearchSettings);
            break;

          case buttonTexts.Back:
            await bot.sendMessage(chat_id, infoMess.startTypeSearch, options.SearchType);
            await bot.sendMessage(chat_id, infoMess.chooseOption, menuOptions.SettingsButton);
            break;

          case buttonTexts.SearchType:
            await bot.sendMessage(chat_id, infoMess.searchType, options.SearchType);
            break;

          case buttonTexts.DaysAgo:
            await bot.sendMessage(chat_id, infoMess.maxOldMessages, options.InputDaysAgo);
            break;

          case buttonTexts.LimitReturnedMessages:
            await bot.sendMessage(chat_id, infoMess.maxReturnMess, options.NumberMessages);
            break;

          case buttonTexts.ChatNamesFilter:
            await bot.sendMessage(chat_id, infoMess.chatNames, options.InputValue);
            break;

          case buttonTexts.LocationsFilter:
            await bot.sendMessage(chat_id, infoMess.sities, options.InputValue);
            break;

          case buttonTexts.DaysAgoOptions[4]:
            await bot.sendMessage(chat_id, infoMess.otherDaysAgo, options.InputValue);
            break;

          case buttonTexts.DaysAgoOptions[0]:
          case buttonTexts.DaysAgoOptions[1]:
          case buttonTexts.DaysAgoOptions[2]:
          case buttonTexts.DaysAgoOptions[3]:
            userSettings[chat_id].daysAgo = content?.split(' ')[0];
            await bot.sendMessage(chat_id, infoMess.settingsNow, menuOptions.SettingsButton);
            await bot.sendMessage(chat_id, yourSettings(userSettings[msg.chat.id]), options.Search);
            break;

          default:
            // Handle reply messages
            if (msg.reply_to_message?.text) {
              await replyToMessageHandler(msg.reply_to_message.text, bot, chat_id, msg, userSettings);
              break;
            }

            // Handle other messages
            await bot.sendMessage(chat_id, '.......');
            otherMessagesHandler(bot, userSettings, chat_id, content);
        }
      } catch (error) {
        pushError(error);
      }
    });

    bot.on('callback_query', async (callback) => {
      try {
        const chat_id = callback.message?.chat?.id;
        if (chat_id) {
          if (!userSettings[chat_id]) userSettings[chat_id] = { daysAgo: 30, limitMessages: 5, language: 'Ru' };
          await callbackHandler(callback, bot, userSettings, chat_id);
        }
      } catch (error) {
        pushError(error);
      }
    });

    bot.on('polling_error', (error) => {
      console.log(`Polling error: ${error.message}`);
    });

    return true;
  })(input.arguments);
