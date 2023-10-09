
export  async function sendToServer(query) {

    const todo = JSON.stringify({
        query
      });
   console.log(todo);
  try {
    const response = await (await fetch(process.env.HOST_URL || 'http://localhost:8080/graphql', {
      method: 'POST',
      body: todo,
      headers: { 'Content-Type': 'application/json' },
    })).json();
    console.log("REQUEST>>");
    //console.log(response.data.telegram.getMessagesByTags);
    return response.data || response.errors[0].message
  }catch(e){
    console.log(e)
    return e
    }
}
