import { FieldResolveInput } from 'stucco-js';
import { resolverFor } from '../zeus/index.js';
import { MongOrb, getEnv } from '../utils/orm.js';
import TelegramBot from 'node-telegram-bot-api';

import { options, menuOptions, buttonTexts } from '../BOT/Options.js';
import { UserSettings, callbackHandler } from '../BOT/botCallbackHandler.js';
import { replyToMessageHandler } from '../BOT/botReplyHandler.js';
import { otherMessagesHandler } from '../BOT/botOtherMessagesHandler.js';
import { infoMess, yourSettings } from '../BOT/Messages.js';
import { pushError } from '../utils/tools.js';
import { ObjectId } from 'mongodb';
//export const defaultSettings = { daysAgo: 30, limitMessages: 5 }

export const handler = async (input: FieldResolveInput) =>
  resolverFor('TelegramMutation', 'newChats', async (args) => {
    const FinderByChats = getEnv('ChatsInfoSeeker');
    const bot = new TelegramBot(FinderByChats, { polling: true });

    const usersSettings: UserSettings = {};
    bot.sendMessage(839036065, `Hej! New chats started successed !`);

    bot.on('message', async (msg) => {
      const id = msg.message_id;
      const chat_name = msg.chat.title;
      const chat_id = msg.chat.id;
      const from = msg.from?.username || msg.from?.first_name + '_' + msg.from?.last_name;
      const from_id = msg.from?.id;
      const content = msg.text;
      try {
        const date = new Date(msg.date * 1000);
        console.log('\n For FINDER! \n from: ', from, ', chat_id: ', chat_id, ', \n text: ', content);

        if (chat_id && !usersSettings[chat_id]) usersSettings[msg.chat.id] = { daysAgo: 30, limitMessages: 5 };
        console.log(usersSettings);

        if (content?.length && content?.length > 1)
          MongOrb('For_bot_En').updateOne(
            { _id: new ObjectId(chat_id) },
            { $set: { chatName: chat_name || from }, $push: { messages: { id, from_id, content, date } } },
            { upsert: true },
          );
        switch (content) {
          case '/start':
            console.log('_______________________________');

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
            usersSettings[chat_id].daysAgo = content?.split(' ')[0] as unknown as number;
            await bot.sendMessage(chat_id, infoMess.settingsNow, menuOptions.SettingsButton);
            await bot.sendMessage(chat_id, yourSettings(usersSettings[msg.chat.id]), options.Search);
            break;

          default:
            // Handle reply messages
            if (msg.reply_to_message?.text) {
              await replyToMessageHandler(msg.reply_to_message.text, bot, chat_id, msg, usersSettings);
              break;
            }

            // Handle other messages
            await bot.sendMessage(chat_id, '.......');
            otherMessagesHandler(bot, usersSettings, chat_id, content);
        }
      } catch (error) {
        pushError(error);
      }
    });

    bot.on('callback_query', async (callback) => {
      try {
        const chat_id = callback.message?.chat?.id;
        if (chat_id) {
          if (!usersSettings[chat_id]) usersSettings[chat_id] = { daysAgo: 30, limitMessages: 5 };
          await callbackHandler(callback, bot, usersSettings, chat_id);
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
