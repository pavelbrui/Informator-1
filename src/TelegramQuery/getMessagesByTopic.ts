import { FieldResolveInput } from 'stucco-js';
import { resolverFor } from '../zeus/index.js';
import { filterMessages } from './getMessagesByTags.js';
import { sendAllToGPT } from './getMessagesByTagsAndTopic.js';
import { getEnv } from '../utils/orm.js';

export const handler = async (input: FieldResolveInput) =>
  resolverFor('TelegramQuery', 'getMessagesByTopic', async (args) => {
    console.log(args);
    const daysAgo = args.daysAgo || 30;
    const messagesForGpt = await filterMessages({
      sities: args.collections || undefined,
      chats: args.chats || undefined,
      chatsReg: args.chatsReg || undefined,
      daysAgo,
      limitMessages: 30,
    });
    const messages = await sendAllToGPT(messagesForGpt, args.topic, parseInt(getEnv('MAX_MESSAGES_FOR_AI')));

    return messages;
  })(input.arguments);
