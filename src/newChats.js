

import { getEnv } from './../utils/orm.js';
import { Telegraf } from 'telegraf'; 


export function runAllBots(name){
const bot = new Telegraf(getEnv("HappyEmigrant")); 

 // Obsługa przychodzących wiadomości 
 bot.on('text', async (ctx) => {
   const chat_id = ctx.message.chat.id; 
    const text = ctx.message.text; 
    const date = new Date(ctx.message.date * 1000); 
    console.log("from: ", ctx.message.from.username);
    console.log("text: ", text);
    console.log("chat_id: ", chat_id);
    console.log("date: ", date);})
    // Odpowiedz na wiadomość potwierdzeniem zapisu w bazie danych 
    //ctx.reply('Wiadomość została zapisana w bazie danych.'); }); 
    // Startujemy naszego bota 
    bot.launch();


    //bot2
    const bot2 = new Telegraf(getEnv("FinderByChats")); 
    bot2.on('text', async (ctx) => {
      const chat_id = ctx.message.chat.id; 
       const text = ctx.message.text; 
       const date = new Date(ctx.message.date * 1000); 

     console.log("from: ", ctx.message.from.username);
     console.log("text: ", text);
     console.log("chat_id: ", chat_id);
     console.log("date: ", date);


       // Odpowiedz na wiadomość potwierdzeniem zapisu w bazie danych 
       ctx.reply(" Hello! I was created to help you quickly find information in telegram chats!"); }); 
       // Startujemy naszego bota 
       bot2.launch();

       
       
        return true
      }
  


