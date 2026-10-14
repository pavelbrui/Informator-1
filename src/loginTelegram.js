import { TelegramClient } from 'telegram';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import fs from 'fs';
import path from 'path';

// Wczytanie konfiguracji z pliku .env
function loadEnv() {
  const envPath = path.resolve('.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const apiId = parseInt(process.env.API_ID || '');
const apiHash = process.env.API_HASH;

if (!apiId || !apiHash) {
  console.error('BŁĄD: Brak API_ID lub API_HASH w pliku .env!');
  process.exit(1);
}

const rl = readline.createInterface({ input, output });

async function prompt(question) {
  return (await rl.question(question)).trim();
}

async function main() {
  console.log('====================================================');
  console.log(' Telegram MTProto (GramJS) - Autoryzacja sesji');
  console.log('====================================================');

  const client = new TelegramClient('tgparse', apiId, apiHash, {
    connectionRetries: 5,
  });

  console.log('Łączenie z serwerami Telegram...');
  await client.connect();

  const isAuth = await client.checkAuthorization();
  if (isAuth) {
    const me = await client.getMe();
    console.log(`\nJesteś już zalogowany jako: ${me.firstName} ${me.lastName || ''} (@${me.username || 'brak_username'})`);
    console.log(`Numer telefonu: +${me.phone}`);
    console.log('Sesja w folderze "tgparse" jest aktywna i gotowa do użycia.');
    await client.disconnect();
    rl.close();
    return;
  }

  console.log('\nSesja wygasła lub nie istnieje. Rozpoczynamy procedurę logowania.\n');

  try {
    await client.start({
      phoneNumber: async () => await prompt('Wprowadź numer telefonu (z prefiksem kraju, np. +48123456789): '),
      password: async () => await prompt('Wprowadź hasło chmury / 2FA (jeśli włączone, w przeciwnym razie wciśnij Enter): '),
      phoneCode: async () => await prompt('Wprowadź kod weryfikacyjny otrzymany w Telegramie / SMS: '),
      onError: (err) => console.error('Błąd Telegrama:', err.message || err),
    });

    const me = await client.getMe();
    console.log('\n====================================================');
    console.log(`SUKCES! Zalogowano pomyślnie jako: ${me.firstName} ${me.lastName || ''} (@${me.username || 'brak_username'})`);
    console.log('Nowa sesja została zapisana w folderze "tgparse".');
    console.log('====================================================\n');
  } catch (err) {
    console.error('\nBłąd podczas logowania:', err.message || err);
  } finally {
    await client.disconnect();
    rl.close();
  }
}

main().catch((err) => {
  console.error('Nieoczekiwany błąd:', err);
  rl.close();
});
