require('dotenv').config();


export  async function sendToServer(query) {
  console.log(process.env.API_URL);
    const todo = JSON.stringify({
        query
      });
   console.log(todo);
  try {
    // const response = await (await fetch("https://obeisant-advertisement-production.up.railway.app/graphql" || 'http://localhost:8080/graphql', {
    //   method: 'POST',
    //   body: todo,
    //   headers: { 'Content-Type': 'application/json' },
    // })).json();
    // console.log("REQUEST>>");
    // console.log(response.data.telegram.getMessagesByTags);
    const response = await (await fetch(process.env.API_UR, {
      method: 'POST',
      body: todo,
      headers: { 'Content-Type': 'application/json' },
    })).json();
    console.log("response2");
    console.log(JSON.stringify(response.data.telegram));
    return response.data || response.errors[0].message
  }catch(e){
    console.log(e)
    return e
    }
}
