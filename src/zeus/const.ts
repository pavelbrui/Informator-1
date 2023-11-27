/* eslint-disable */

export const AllTypesProps: Record<string,any> = {
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
	LoginType: "enum" as const,
	DgraphDgraphIndex: "enum" as const,
	DgraphDateTime: `scalar.DgraphDateTime` as const,
	AWSDateTime: `scalar.AWSDateTime` as const,
	AWSDate: `scalar.AWSDate` as const,
	AWSTime: `scalar.AWSTime` as const,
	AWSTimestamp: `scalar.AWSTimestamp` as const,
	AWSEmail: `scalar.AWSEmail` as const,
	AWSJSON: `scalar.AWSJSON` as const,
	AWSURL: `scalar.AWSURL` as const,
	AWSPhone: `scalar.AWSPhone` as const,
	AWSIPAddress: `scalar.AWSIPAddress` as const,
	ModelMutationMap:{

	},
	ModelQueryMap:{

	},
	ModelSubscriptionMap:{
		level:"ModelSubscriptionLevel"
	},
	ModelSubscriptionLevel: "enum" as const,
	TimestampConfiguration:{

	},
	HttpMethod: "enum" as const,
	HttpHeader:{

	},
	PredictionsActions: "enum" as const,
	SearchableQueryMap:{

	},
	AuthRule:{
		allow:"AuthStrategy",
		provider:"AuthProvider",
		operations:"ModelOperation",
		queries:"ModelQuery",
		mutations:"ModelMutation"
	},
	AuthStrategy: "enum" as const,
	AuthProvider: "enum" as const,
	ModelOperation: "enum" as const,
	ModelQuery: "enum" as const,
	ModelMutation: "enum" as const
}

export const ReturnTypes: Record<string,any> = {
	Mutation:{
		telegram:"TelegramMutation"
	},
	TelegramMutation:{
		startBot:"Boolean",
		startBotRu:"Boolean",
		startBotClone:"Boolean",
		newChats:"Boolean"
	},
	TelegramQuery:{
		getCookies:"Boolean",
		getChats:"Chat",
		getChatsMessages:"Message",
		getChatContent:"String",
		getMessagesFromManyChats:"Message",
		getMessagesByTags:"FiltersResponse",
		getMessagesByTagsAndTopic:"Message",
		getMessagesByTopic:"Message"
	},
	FiltersResponse:{
		messages:"Message",
		length:"Int"
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
		username:"String",
		name_id:"String",
		name:"String",
		updateAt:"String",
		messages:"Message"
	},
	Query:{
		telegram:"TelegramQuery"
	},
	ResponseWithUrls:{
		responseText:"String",
		urls:"String"
	},
	DgraphDateTime: `scalar.DgraphDateTime` as const,
	DgraphhasInverse:{
		field:"String"
	},
	Dgraphsearch:{
		by:"DgraphDgraphIndex"
	},
	AWSDateTime: `scalar.AWSDateTime` as const,
	AWSDate: `scalar.AWSDate` as const,
	AWSTime: `scalar.AWSTime` as const,
	AWSTimestamp: `scalar.AWSTimestamp` as const,
	AWSEmail: `scalar.AWSEmail` as const,
	AWSJSON: `scalar.AWSJSON` as const,
	AWSURL: `scalar.AWSURL` as const,
	AWSPhone: `scalar.AWSPhone` as const,
	AWSIPAddress: `scalar.AWSIPAddress` as const,
	model:{
		queries:"ModelQueryMap",
		mutations:"ModelMutationMap",
		subscriptions:"ModelSubscriptionMap",
		timestamps:"TimestampConfiguration"
	},
	mapsTo:{
		name:"String"
	},
	primaryKey:{
		sortKeyFields:"String"
	},
	index:{
		name:"String",
		sortKeyFields:"String",
		queryField:"String"
	},
	function:{
		name:"String",
		region:"String"
	},
	http:{
		method:"HttpMethod",
		url:"String",
		headers:"HttpHeader"
	},
	predictions:{
		actions:"PredictionsActions"
	},
	searchable:{
		queries:"SearchableQueryMap"
	},
	hasOne:{
		fields:"String"
	},
	hasMany:{
		indexName:"String",
		fields:"String",
		limit:"Int"
	},
	belongsTo:{
		fields:"String"
	},
	manyToMany:{
		relationName:"String",
		limit:"Int"
	},
	auth:{
		rules:"AuthRule"
	},
	connection:{
		name:"String",
		keyField:"String",
		sortField:"String",
		keyName:"String",
		limit:"Int",
		fields:"String"
	},
	versioned:{
		versionField:"String",
		versionInput:"String"
	},
	aws_api_key:{

	},
	aws_iam:{

	},
	aws_oidc:{

	},
	aws_lambda:{

	},
	aws_cognito_user_pools:{
		cognito_groups:"String"
	},
	aws_auth:{
		cognito_groups:"String"
	},
	aws_subscribe:{
		mutations:"String"
	},
	key:{
		name:"String",
		fields:"String",
		queryField:"String"
	},
	default:{
		value:"String"
	}
}

export const Ops = {
query: "Query" as const,
	mutation: "Mutation" as const
}