/* eslint-disable */

export const AllTypesProps: Record<string,any> = {
	Mutation:{
		gmail:{
			login:"Credentials"
		},
		olx:{
			login:"Credentials",
			loginType:"LoginType"
		}
	},
	TelegramMutation:{
		newChats:{

		}
	},
	TelegramQuery:{
		getChats:{

		},
		getChatsMessages:{
			input:"GetInfoInput"
		},
		getChatContent:{
			input:"GetInfoInput"
		},
		getMessagesFromManyChats:{

		},
		getMessagesByTags:{

		},
		getMessagesByTagsAndTopic:{

		},
		getMessagesByTopic:{

		}
	},
	GetInfoInput:{

	},
	GmailMutation:{
		signByText:{

		},
		signLast:{
			autentiLogin:"Credentials"
		}
	},
	Query:{
		olx:{
			login:"Credentials",
			loginType:"LoginType"
		}
	},
	Credentials:{

	},
	OlxMutation:{
		autoResponder:{

		},
		autoResponderLoop:{

		}
	},
	LoginType: "enum" as const
}

export const ReturnTypes: Record<string,any> = {
	Mutation:{
		gmail:"GmailMutation",
		olx:"OlxMutation",
		telegram:"TelegramMutation"
	},
	TelegramMutation:{
		startBot:"Boolean",
		newChats:"Boolean"
	},
	TelegramQuery:{
		getCookies:"Boolean",
		getChats:"Chat",
		getChatsMessages:"Message",
		getChatContent:"String",
		getMessagesFromManyChats:"Message",
		getMessagesByTags:"Message",
		getMessagesByTagsAndTopic:"Message",
		getMessagesByTopic:"Message"
	},
	Message:{
		from:"String",
		from_id:"String",
		text:"String",
		date:"String",
		_id:"String",
		chat_id:"String",
		chat_name:"String",
		message_thread_id:"String",
		reply_to:"String",
		photo:"String",
		type:"String"
	},
	Chat:{
		type:"String",
		_id:"String",
		name_id:"String",
		name:"String",
		updateAt:"String",
		messages:"Message"
	},
	GmailMutation:{
		signByText:"ResponseWithUrls",
		signLast:"ResponseWithUrls"
	},
	Query:{
		olx:"OlxQuery",
		telegram:"TelegramQuery"
	},
	OlxMutation:{
		autoResponder:"String",
		autoResponderLoop:"String"
	},
	OlxQuery:{
		getCookies:"ResponseWithUrls",
		getApartmens:"String"
	},
	ResponseWithUrls:{
		responseText:"String",
		urls:"String"
	},
	CookieObject:{
		content:"String",
		owner:"String",
		name:"String",
		requestedUrl:"String"
	}
}

export const Ops = {
query: "Query" as const,
	mutation: "Mutation" as const
}