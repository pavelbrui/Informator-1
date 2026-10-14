import { spawn } from 'child_process';
import { startBots } from './botStarter.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('====================================================');
console.log('       INFORMATOR PRODUCTION RUNNER STARTING        ');
console.log('====================================================');

const port = process.env.PORT || '8080';
console.log(`Port configured: ${port}`);

// Run the GraphQL server via npm run start2 (stucco) or npm run start
const serverCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const serverProcess = spawn(serverCmd, ['run', 'start'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PORT: port }
});

serverProcess.on('error', (err) => {
  console.error('Failed to spawn GraphQL server process:', err);
});

async function waitForServer(url, maxRetries = 30) {
  console.log(`Waiting for GraphQL server at ${url}...`);
  for (let i = 1; i <= maxRetries; i++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: '{ __typename }' }),
      });
      if (res.ok) {
        console.log(`✓ GraphQL server is LIVE and responding! (attempt ${i})`);
        return true;
      }
    } catch (e) {
      // Server warming up
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(`GraphQL server did not respond after ${maxRetries} attempts`);
}

async function main() {
  const apiUrl = process.env.API_URL || `http://localhost:${port}/graphql`;
  try {
    await waitForServer(apiUrl);
    console.log('\n--- Triggering Telegram Bots Activation ---');
    await startBots();
    console.log('--- Informator is fully operational ---\n');
  } catch (err) {
    console.error('Error during startup sequence:', err);
  }
}

main();

process.on('SIGTERM', () => {
  console.log('SIGTERM received, terminating server process...');
  serverProcess.kill('SIGTERM');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, terminating server process...');
  serverProcess.kill('SIGINT');
  process.exit(0);
});
