import type { INodeProperties } from 'n8n-workflow';

const showOnlyForSms = {
	resource: ['sms'],
};

export const smsDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForSms,
		},
		options: [
			{
				name: 'Get Status',
				value: 'getStatus',
				action: 'Get SMS status',
				description: 'Get the status of a sent SMS message',
				routing: {
					request: {
						method: 'GET',
						url: '=/sms/status/{{$parameter.smsId}}',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
						],
					},
				},
			},
			{
				name: 'List Providers',
				value: 'listProviders',
				action: 'List SMS providers',
				description: 'Get a list of available SMS providers',
				routing: {
					request: {
						method: 'GET',
						url: '/sms/providers',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
						],
					},
				},
			},
			{
				name: 'Send',
				value: 'send',
				action: 'Send an SMS',
				description: 'Send a single SMS message',
				routing: {
					request: {
						method: 'POST',
						url: '/sms/send',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
						],
					},
				},
			},
			{
				name: 'Send Batch',
				value: 'sendBatch',
				action: 'Send batch SMS',
				description: 'Send SMS messages to a list or tag group',
				routing: {
					request: {
						method: 'POST',
						url: '/sms/batch',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
						],
					},
				},
			},
		],
		default: 'send',
	},
	// Placeholders Notice
	{
		displayName: 'Available Placeholders',
		name: 'placeholdersNotice',
		type: 'notice',
		displayOptions: {
			show: {
				resource: ['sms'],
				operation: ['send', 'sendBatch'],
			},
		},
		default: '',
		description:
			'<strong>Available placeholders for personalization:</strong><br/><code>[[fname]]</code> - First name<br/><code>[[!fname]]</code> - First name (Polish vocative)<br/><code>[[lname]]</code> - Last name<br/><code>[[phone]]</code> - Phone number<br/><code>[[custom_field]]</code> - Custom fields<br/><code>{{male|female}}</code> - Gender conditional',
	},
	// ==================== SEND SMS ====================
	// Contact List (optional - for loading subscribers with phone numbers)
	{
		displayName: 'Contact List Name or ID',
		name: 'smsContactListId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getLists',
		},
		default: '',
		displayOptions: {
			show: {
				resource: ['sms'],
				operation: ['send'],
			},
		},
		description: 'Optional: Select a contact list to load subscribers with phone numbers. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	// Phone Number (for Send) - dynamic dropdown based on selected list or manual input
	{
		displayName: 'Phone Number Name or ID',
		name: 'phoneNumber',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getSubscribersWithPhone',
			loadOptionsDependsOn: ['smsContactListId'],
		},
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['sms'],
				operation: ['send'],
			},
			hide: {
				smsContactListId: [''],
			},
		},
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		routing: {
			send: {
				type: 'body',
				property: 'phone_number',
			},
		},
	},
	// Phone Number (for Send) - manual input when no list selected
	{
		displayName: 'Phone Number',
		name: 'phoneNumber',
		type: 'string',
		placeholder: '+48123456789',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['sms'],
				operation: ['send'],
				smsContactListId: [''],
			},
		},
		description: 'Phone number to send SMS to (E.164 format recommended)',
		routing: {
			send: {
				type: 'body',
				property: 'phone_number',
			},
		},
	},
	// Message (for Send)
	{
		displayName: 'Message',
		name: 'message',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['sms'],
				operation: ['send'],
			},
		},
		description: 'SMS message content (max 160 characters for single SMS)',
		routing: {
			send: {
				type: 'body',
				property: 'message',
			},
		},
	},
	// Additional fields for Send
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['sms'],
				operation: ['send'],
			},
		},
		options: [
			{
				displayName: 'Provider ID',
				name: 'provider_id',
				type: 'number',
				default: 0,
				description: 'ID of the SMS provider to use. Leave empty for default provider.',
				routing: {
					send: {
						type: 'body',
						property: 'provider_id',
					},
				},
			},
			{
				displayName: 'Sender ID',
				name: 'sender_id',
				type: 'string',
				default: '',
				description: 'Custom sender ID (if supported by provider)',
				routing: {
					send: {
						type: 'body',
						property: 'sender_id',
					},
				},
			},
			{
				displayName: 'Schedule At',
				name: 'schedule_at',
				type: 'dateTime',
				default: '',
				description: 'Schedule SMS for later delivery (ISO 8601 format)',
				routing: {
					send: {
						type: 'body',
						property: 'schedule_at',
					},
				},
			},
			{
				displayName: 'Subscriber ID',
				name: 'subscriber_id',
				type: 'number',
				default: 0,
				description: 'Link SMS to an existing subscriber by their ID',
				routing: {
					send: {
						type: 'body',
						property: 'subscriber_id',
					},
				},
			},
		],
	},
	// ==================== SEND BATCH SMS ====================
	// Message (for Send Batch)
	{
		displayName: 'Message',
		name: 'message',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['sms'],
				operation: ['sendBatch'],
			},
		},
		description: 'SMS message content to send to all recipients',
		routing: {
			send: {
				type: 'body',
				property: 'message',
			},
		},
	},
	// Target Type (for Send Batch)
	{
		displayName: 'Target Type',
		name: 'targetType',
		type: 'options',
		options: [
			{
				name: 'Contact List',
				value: 'list',
				description: 'Send to all subscribers in a contact list',
			},
			{
				name: 'Tags',
				value: 'tags',
				description: 'Send to subscribers with specific tags',
			},
		],
		default: 'list',
		required: true,
		displayOptions: {
			show: {
				resource: ['sms'],
				operation: ['sendBatch'],
			},
		},
		description: 'Choose how to target recipients',
	},
	// Contact List ID (for Send Batch - list target)
	{
		displayName: 'Contact List Name or ID',
		name: 'contactListId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getLists',
		},
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['sms'],
				operation: ['sendBatch'],
				targetType: ['list'],
			},
		},
		description:
			'Contact list to send SMS to. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		routing: {
			send: {
				type: 'body',
				property: 'contact_list_id',
			},
		},
	},
	// Tags (for Send Batch - tags target)
	{
		displayName: 'Tags',
		name: 'tags',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['sms'],
				operation: ['sendBatch'],
				targetType: ['tags'],
			},
		},
		description: 'Comma-separated list of tag IDs to target',
		routing: {
			send: {
				type: 'body',
				property: 'tags',
			},
		},
	},
	// Additional fields for Send Batch
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['sms'],
				operation: ['sendBatch'],
			},
		},
		options: [
			{
				displayName: 'Provider ID',
				name: 'provider_id',
				type: 'number',
				default: 0,
				description: 'ID of the SMS provider to use. Leave empty for default provider.',
				routing: {
					send: {
						type: 'body',
						property: 'provider_id',
					},
				},
			},
			{
				displayName: 'Sender ID',
				name: 'sender_id',
				type: 'string',
				default: '',
				description: 'Custom sender ID (if supported by provider)',
				routing: {
					send: {
						type: 'body',
						property: 'sender_id',
					},
				},
			},
		],
	},
	// ==================== GET STATUS ====================
	// SMS ID (for Get Status)
	{
		displayName: 'SMS ID',
		name: 'smsId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['sms'],
				operation: ['getStatus'],
			},
		},
		description: 'ID of the SMS message to get status for',
	},
];
