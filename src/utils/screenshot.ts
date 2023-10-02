import { Page } from 'puppeteer';
import { DB } from 'gei-crud/lib/db/orm.js';
import { getUrl } from './S3.js';
import { imageUploaderRaw } from './imageUploader.js';
import { handler as create } from 'gei-crud/lib/Mutation/create.js';

// LOG
export const bazaLog = async (address: string, text: string) => {
  const imageObject = {
    arguments: {
      logObject: {
        log: [text],
        address: address,
      },
    },
    info: {
      returnType: String,
      fieldName: 'autoResponderLoop',
      parentType: { name: 'OlxMutation' },
    },
    source: '',
  };

  try {
    await create(imageObject);
    console.log('save');
  } catch {
    if (text.length) {
      await DB().then(async (db) => {
        return db('AutoResponder').collection.updateOne(
          { address: address },
          {
            $push: {
              log: text,
            },
          },
        );
      });
    }
  }
};

// SCREENSHOT
export const screenshotPage = async (page: Page, name: string) => {
  const screenshotBuffer = await page.screenshot({ fullPage: true });
  await page.waitForTimeout(300);
  const key = await imageUploaderRaw(name, 'image', screenshotBuffer);
  const url = await getUrl(key);
  console.log(url);

  const imageObject = {
    arguments: {
      imageObject: {
        fileKey: key,
        path: url,
        address: name,
      },
    },
    info: {
      returnType: String,
      fieldName: 'firstRegister',
      parentType: { name: 'SonMutation' },
    },
    source: '',
  };

  try {
    await create(imageObject);
    console.log('save');
  } catch {
    await DB().then(async (db) => {
      return db('Screenshots').collection.updateOne(
        { address: name },
        {
          $set: {
            fileKey: key,
            path: url,
          },
        },
      );
    });
  }
  return url;
};
