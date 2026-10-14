import TelegramBot from 'node-telegram-bot-api';
import { sendToServer } from './utils/botSendQuery.js';

export async function startBots() {
  console.log('--- Initializing all Telegram bots via GraphQL ---');
  
  const query = `mutation { telegram { startBot } }`;
  const query2 = `mutation { telegram { startBotRu } }`;
  const query3 = `mutation { telegram { newChats } }`;

  try {
    console.log('Starting main bot (FinderByChats)...');
    const runBot = await sendToServer(query);
    console.log('Main bot started:', JSON.stringify(runBot));

    console.log('Starting RU bot (ChatContentFinder)...');
    const runBot2 = await sendToServer(query2);
    console.log('RU bot started:', JSON.stringify(runBot2));

    console.log('Starting new chats monitor (HappyEmigrant)...');
    const runBot3 = await sendToServer(query3);
    console.log('New chats monitor started:', JSON.stringify(runBot3));

    try {
      const GPTFree = process.env.GPT4FREE || '6558053312:AAGD80lI2Q47SqbUPOAZ0aKJlOo12DO0snY';
      const bot = new TelegramBot(GPTFree, { polling: false });
      await bot.sendMessage(839036065, `Hej! Bots started successfully!`).catch(() => {});
    } catch (e) {
      // Ignore notification error
    }

    console.log('✓ All bots initialized successfully!');
    return true;
  } catch (err) {
    console.error('Error starting bots:', err);
    return false;
  }
}

// Auto-run if executed directly
if (process.argv[1]?.replace(/\\/g, '/').endsWith('src/botStarter.js')) {
  await startBots();
}
