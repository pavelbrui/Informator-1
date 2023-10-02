import { getUrl, putUrl } from './S3.js';
import fetch from 'node-fetch';

export const imageUploaderRaw = async (name: string, contentType: string, response: ArrayBuffer) => {
  const fileKey = name + Math.random().toString(16).split('.')[1];

  const put = await putUrl({
    contentType,
    fileKey,
  });

  await fetch(put.putUrl, {
    method: 'PUT',
    body: response,
    headers: {
      'Content-Type': contentType,
    },
  });

  return put.fileKey;
};
