import { SearchSettings } from './botCallbackHandler.js';
import { infoMessEnv } from './Messages.js';
import { menuOptions, options } from './Options.js';

const responseString = (messages: any) =>
  messages
    .map((m: any) => {
      return `\n<${m.chat_name || m.chat_id || ''}>\n${m.from}:\n-"${m.text || ''}\nhttps://t.me/${m.chat_id}/${
        m._id
      }"\n                           ${m.date.replace('T', ' ')}\n `;
    })
    ?.toString();

export const responseLink = (m: any) =>
  `https://t.me/${
    m.username || m.chat_id.toString().startsWith('-100') ? m.chat_id.toString().replace('-100', 'c/') : m.chat_id
  }/${m._id}`;

export const restMessages: { [key: number]: any } = {};

export async function responseForUser(
  bot: any,
  chat_id: number,
  settings: SearchSettings,
  messages?: any[],
  data?: any,
) {
  const infoMess = infoMessEnv(settings.language || 'En');
  try {
    const response = infoMess.anyoneMessage;
    if (!messages && !data.telegram) {
      console.log(data);
      await bot.sendMessage(chat_id, 'Connection error', menuOptions.SettingsButton);
      return;
    }
    if (!messages) {
      const messages =
        data.telegram.getMessagesByTags?.messages ||
        data.telegram.getMessagesByTagsAndTopic ||
        data.telegram.getMessagesByTopic;
    }
    if (!messages?.length) {
      console.log(data);
      await bot.sendMessage(chat_id, response, menuOptions.SettingsButton);
      return;
    }

    await bot.sendMessage(
      chat_id,
      `I found ${messages?.length > 1000 ? 'more then 1000' : messages?.length} messages!!!`,
    );
    const limit = settings.limitMessages || 5;

    // const partOne = responseString(messages.slice(0, limit))
    //console.log(partOne);
    await sendPartMessages(bot, chat_id, messages.slice(0, limit), menuOptions.SettingsButton);
    if (limit < messages.length) {
      restMessages[chat_id] = messages.slice(limit);
      await bot.sendMessage(
        chat_id,
        messages?.length > limit
          ? `Next ${limit} from rest ${restMessages[chat_id].length} messages >>`
          : `Rest ${restMessages[chat_id].length}  messages >>`,
        options.ShowNext,
      );
    }
  } catch (e) {
    console.log(e);
  }
}

export async function sendPartMessages(bot: any, chat_id: number, messages: any[], option: any) {
  for (let i = 0; i < messages.length - 1; i++) {
    await bot.sendMessage(chat_id, responseLink(messages[i]));
  }
  await bot.sendMessage(chat_id, responseLink(messages[messages.length - 1]), option);
}

async function sendBigMessage(bot: any, chat_id: number, response: string, option: any) {
  try {
    console.log(response.length);
    if (response.length > 4000) {
      await bot.sendMessage(chat_id, response.slice(0, 4000));
      await sendBigMessage(bot, chat_id, response.slice(4000), option);
    }
    await bot.sendMessage(chat_id, response, option);
  } catch (e) {
    console.log('error');
    console.log(e);
    console.log(response.length);
    if (JSON.stringify(e).includes('TelegramError: ETELEGRAM: 400 Bad Request: message is too long')) {
      await bot.sendMessage(chat_id, response.slice(0, response.length / 2));
      console.log(response.length);
      await bot.sendMessage(chat_id, response.slice(response.length / 2, response.length), option);
    }
    await bot.sendMessage(chat_id, e, option);
  }
}
