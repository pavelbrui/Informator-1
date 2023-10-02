import { sonRequestHandler } from './login.js';
import { loginForMails } from './loginForGmail.js';

export const getGoogleDoc = async (url: string, format: string): Promise<string> => {
  const { page, context, info } = await loginForMails({
    login: { email: 'autentiapi@gmail.com', password: 'autentiAPI12' },
  });
  // ON IMAGES
  if (!page) return info;
  page.off('request', sonRequestHandler);
  let download_url = '';
  page.on('request', async (req) => {
    if (req.resourceType() == 'font' || (req.resourceType() == 'document' && req.url().includes('export?format='))) {
      if (req.url().includes('export?format=')) {
        download_url = req.url();
      }
      req.abort();
    } else {
      req.continue();
    }
  });

  await page.goto(url, {
    waitUntil: 'load',
  });
  await page.waitForTimeout(500);

  const menu = await page.$('#docs-file-menu');
  if (!menu) throw new Error('Button "menu" not found');
  await menu?.click({ delay: 10 });
  await page.waitForTimeout(500);
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('ArrowDown');
  }
  await page.keyboard.press('ArrowRight');
  if (format.includes('pdf')) {
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('ArrowDown');
    }
  }
  await page.keyboard.press('Enter');

  await page.waitForTimeout(100);
  //console.log(download_url);
  await context.close();
  if (!download_url) throw new Error('File not found');
  return download_url;
};
