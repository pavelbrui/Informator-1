


export const options = {
    SearchType: {
     reply_markup: {
       inline_keyboard: [[{text:'GPT search', callback_data: 'GPT search'} , {text:'Filters', callback_data:'Filters' }, {text:'Filters + GPT', callback_data:'Filters + GPT' }]],
       resize_keyboard: true,
       one_time_keyboard: true
     },
   },
   
    Search : {
     reply_markup:  {
       inline_keyboard: [[{text :'Add KeyWords and run🚀', callback_data:'KeyWords'}]],
       resize_keyboard: true,
       one_time_keyboard: true
     },
   },
   
   
    SearchForTopic:{
     reply_markup:  {
       inline_keyboard: [[{text :'Add KeyWords', callback_data:'KeyWords'}]],
       resize_keyboard: true,
       one_time_keyboard: true
     },
   },
   
   
    AddChatFilterOpt:{
     reply_markup:  {
       inline_keyboard: [[{text :'Limit chat names', callback_data:'addChatFilterOpt'}, {text: 'Skip', callback_data: 'skipAddChats'}]],
       resize_keyboard: true,
       one_time_keyboard: true
     },
   },
   
   SearchGPT: {
     reply_markup:  {
       inline_keyboard: [[{text :'Enter topic or description and run🚀', callback_data:'Topic'}]],
       resize_keyboard: true,
       one_time_keyboard: true
     },
   },
   
   SearchFiltersAndGPT: {
     reply_markup:  {
       inline_keyboard: [[{text :'Enter topic or description', callback_data:'TopicWithFilters'}]],
       resize_keyboard: true,
       one_time_keyboard: true
     },
   },
   
   
   InputDaysAgo:{
     reply_markup: {
       force_reply: true, 
       keyboard: [['1 day', '3 days', '7 days'], ['30 days', 'Other']],
       resize_keyboard: true,
     },
   },
   
   NumberMessages:{
     reply_markup: {
       force_reply: true, 
       inline_keyboard: [[{text :'3',  callback_data: 'button_3' }, {text :'5',  callback_data: 'button_5' }, {text :'10',  callback_data: 'button_10' }],[{text :'20',  callback_data: 'button_20' }, {text :'Other',  callback_data: 'button_other',  color: 'blue'}]], 
       resize_keyboard: true,
       one_time_keyboard: true
     },
   },
   
    InputValue: {
     reply_markup: {
       force_reply: true,
       resize_keyboard: true,
     },
   }
   }



   export const menuOptions = {
    Search2:{
      reply_markup:  {
      force_reply: true, 
      keyboard: [[ 'Settings']],
      resize_keyboard: true,
    }},
  
  SearchSettings: {
    reply_markup: {
      force_reply: true, 
      keyboard: [['ChatNamesFilter', 'DaysAgo', 'SearchType', 'LimitReturnedMessages']],
      resize_keyboard: true,
    },
  },
   }