import dotenv from 'dotenv';

export async function sendToServer(query) {
  console.log(dotenv.config().parsed.API_URL);
  const todo = JSON.stringify({
    query,
  });
  //console.log(todo);
  try {
    const response = await (
      await fetch(dotenv.config().parsed.API_URL, {
        method: 'POST',
        body: todo,
        headers: { 'Content-Type': 'application/json' },
      })
    ).json();
    console.log('REQUEST>>');
    console.log('response');
    console.log(JSON.stringify(response.data?.telegram));
    return response.data || response.errors[0].message;
  } catch (e) {
    console.log(e);
    return e;
  }
}
