
import { SearchSettings } from '../BOT/botCallbackHandler.js';
import { parseText } from '../utils/tools.js';
import { filterMessages } from './getMessagesByTags.js';


export async function getMessagesByUser(args:SearchSettings){

    const messages = await filterMessages( args);

    return {length: messages?.length, messages: messages?.slice(0, 1001).map((mess: any)=>({ ...mess, text: parseText(mess?.text) || " ", from: mess.from || mess.from_id || "Bot" }))}




}