import type { INodeProperties } from 'n8n-workflow';

const showOnlyForEmail = {
	resource: ['email'],
};

export const emailDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForEmail,
		},
		options: [
			{
				name: 'Get Status',
				value: 'getStatus',
				action: 'Get email status',
				description: 'Get the delivery status of an email',
				routing: {
					request: {
						method: 'GET',
						url: '=/email/status/{{$parameter.emailId}}',
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
				name: 'List Mailboxes',
				value: 'listMailboxes',
				action: 'List mailboxes',
				description: 'Get a list of available mailboxes',
				routing: {
					request: {
						method: 'GET',
						url: '/email/mailboxes',
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
				action: 'Send an email',
				description: 'Send a single email message',
				routing: {
					request: {
						method: 'POST',
						url: '/email/send',
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
				action: 'Send batch email',
				description: 'Send email to multiple recipients via list or tags',
				routing: {
					request: {
						method: 'POST',
						url: '/email/batch',
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
				resource: ['email'],
				operation: ['send', 'sendBatch'],
			},
		},
		default: '',
		description:
			'Use placeholders for personalization: [[email]], [[fname]], [[!fname]] (vocative), [[lname]], [[phone]], [[unsubscribe]], [[manage]], [[custom_field]], {{male|female}} (gender conditional)',
	},
	// ==================== SEND EMAIL ====================
	// Email Address (for Send)
	{
		displayName: 'Email Address',
		name: 'emailAddress',
		type: 'string',
		placeholder: 'user@example.com',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['send'],
			},
		},
		description: 'Recipient email address',
		routing: {
			send: {
				type: 'body',
				property: 'email',
			},
		},
	},
	// Subject (for Send and Send Batch)
	{
		displayName: 'Subject',
		name: 'subject',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['send', 'sendBatch'],
			},
		},
		description: 'Email subject line',
		routing: {
			send: {
				type: 'body',
				property: 'subject',
			},
		},
	},
	// Content (for Send and Send Batch)
	{
		displayName: 'Content (HTML)',
		name: 'content',
		type: 'string',
		typeOptions: {
			rows: 8,
		},
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['send', 'sendBatch'],
			},
		},
		description: 'Email body content (HTML supported)',
		routing: {
			send: {
				type: 'body',
				property: 'content',
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
				resource: ['email'],
				operation: ['send'],
			},
		},
		options: [
			{
				displayName: 'Mailbox Name or ID',
				name: 'mailbox_id',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getMailboxes',
				},
				default: '',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				routing: {
					send: {
						type: 'body',
						property: 'mailbox_id',
					},
				},
			},
			{
				displayName: 'Preheader',
				name: 'preheader',
				type: 'string',
				default: '',
				description: 'Email preheader text (preview text)',
				routing: {
					send: {
						type: 'body',
						property: 'preheader',
					},
				},
			},
			{
				displayName: 'Schedule At',
				name: 'schedule_at',
				type: 'dateTime',
				default: '',
				description: 'Schedule email for later delivery (ISO 8601 format)',
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
				description: 'Link email to an existing subscriber by their ID',
				routing: {
					send: {
						type: 'body',
						property: 'subscriber_id',
					},
				},
			},
		],
	},
	// ==================== SEND BATCH EMAIL ====================
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
			{
				name: 'Subscriber IDs',
				value: 'subscribers',
				description: 'Send to specific subscriber IDs',
			},
		],
		default: 'list',
		required: true,
		displayOptions: {
			show: {
				resource: ['email'],
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
				resource: ['email'],
				operation: ['sendBatch'],
				targetType: ['list'],
			},
		},
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
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
				resource: ['email'],
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
	// Subscriber IDs (for Send Batch - subscribers target)
	{
		displayName: 'Subscriber IDs',
		name: 'subscriberIds',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['sendBatch'],
				targetType: ['subscribers'],
			},
		},
		placeholder: '1,2,3',
		description: 'Comma-separated list of subscriber IDs',
		routing: {
			send: {
				type: 'body',
				property: 'subscriber_ids',
			},
		},
	},
	// Mailbox (for Send Batch)
	{
		displayName: 'Mailbox Name or ID',
		name: 'mailboxId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getMailboxes',
		},
		default: '',
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['sendBatch'],
			},
		},
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		routing: {
			send: {
				type: 'body',
				property: 'mailbox_id',
			},
		},
	},
	// Schedule At (for Send Batch)
	{
		displayName: 'Schedule At',
		name: 'scheduleAt',
		type: 'dateTime',
		default: '',
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['sendBatch'],
			},
		},
		description: 'Schedule batch email for later delivery (ISO 8601 format)',
		routing: {
			send: {
				type: 'body',
				property: 'schedule_at',
			},
		},
	},
	// Excluded Lists (for Send Batch)
	{
		displayName: 'Excluded List Names or IDs',
		name: 'excludedListIds',
		type: 'multiOptions',
		typeOptions: {
			loadOptionsMethod: 'getLists',
		},
		default: [],
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['sendBatch'],
			},
		},
		description: 'Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		routing: {
			send: {
				type: 'body',
				property: 'excluded_list_ids',
			},
		},
	},
	// ==================== GET STATUS ====================
	// Email ID (for Get Status)
	{
		displayName: 'Email ID',
		name: 'emailId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['getStatus'],
			},
		},
		description: 'ID of the email message to get status for',
	},
];
