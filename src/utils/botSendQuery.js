import dotenv from 'dotenv';

export async function sendToServer(query) {
  const apiUrl = process.env.API_URL || dotenv.config()?.parsed?.API_URL || 'http://localhost:8080/graphql';
  console.log('Sending GraphQL query to:', apiUrl);
  const todo = JSON.stringify({
    query,
  });
  //console.log(todo);
  try {
    const response = await (
      await fetch(apiUrl, {
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
