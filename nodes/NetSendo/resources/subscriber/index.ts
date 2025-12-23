import type { INodeProperties } from 'n8n-workflow';

const showOnlyForSubscriber = {
	resource: ['subscriber'],
};

export const subscriberDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForSubscriber,
		},
		options: [
			{
				name: 'Get Many',
				value: 'getMany',
				action: 'Get many subscribers',
				description: 'Get all subscribers',
				routing: {
					request: {
						method: 'GET',
						url: '/subscribers',
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
				name: 'Get',
				value: 'get',
				action: 'Get a subscriber',
				description: 'Get a single subscriber by ID',
				routing: {
					request: {
						method: 'GET',
						url: '=/subscribers/{{$parameter.subscriberId}}',
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
				name: 'Get by Email',
				value: 'getByEmail',
				action: 'Get a subscriber by email',
				description: 'Find a subscriber by their email address',
				routing: {
					request: {
						method: 'GET',
						url: '=/subscribers/by-email/{{$parameter.email}}',
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
				name: 'Create',
				value: 'create',
				action: 'Create a subscriber',
				description: 'Create a new subscriber',
				routing: {
					request: {
						method: 'POST',
						url: '/subscribers',
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
				name: 'Update',
				value: 'update',
				action: 'Update a subscriber',
				description: 'Update an existing subscriber',
				routing: {
					request: {
						method: 'PUT',
						url: '=/subscribers/{{$parameter.subscriberId}}',
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
				name: 'Delete',
				value: 'delete',
				action: 'Delete a subscriber',
				description: 'Delete a subscriber (soft delete)',
				routing: {
					request: {
						method: 'DELETE',
						url: '=/subscribers/{{$parameter.subscriberId}}',
					},
				},
			},
		],
		default: 'getMany',
	},
	// Subscriber ID (for Get, Update, Delete)
	{
		displayName: 'Subscriber ID',
		name: 'subscriberId',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: {
			show: {
				resource: ['subscriber'],
				operation: ['get', 'update', 'delete'],
			},
		},
		description: 'ID of the subscriber',
	},
	// Email (for Get by Email)
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		placeholder: 'name@email.com',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['subscriber'],
				operation: ['getByEmail'],
			},
		},
		description: 'Email address to search for',
	},
	// Email (for Create)
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		placeholder: 'name@email.com',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['subscriber'],
				operation: ['create'],
			},
		},
		description: 'Email address of the subscriber',
		routing: {
			send: {
				type: 'body',
				property: 'email',
			},
		},
	},
	// Contact List (for Create) - dropdown
	{
		displayName: 'Contact List',
		name: 'contactListId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getLists',
		},
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['subscriber'],
				operation: ['create'],
			},
		},
		description: 'Contact list to add the subscriber to',
		routing: {
			send: {
				type: 'body',
				property: 'contact_list_id',
			},
		},
	},
	// Additional fields for Create
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['subscriber'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'First Name',
				name: 'first_name',
				type: 'string',
				default: '',
				routing: {
					send: {
						type: 'body',
						property: 'first_name',
					},
				},
			},
			{
				displayName: 'Last Name',
				name: 'last_name',
				type: 'string',
				default: '',
				routing: {
					send: {
						type: 'body',
						property: 'last_name',
					},
				},
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				routing: {
					send: {
						type: 'body',
						property: 'phone',
					},
				},
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Active', value: 'active' },
					{ name: 'Inactive', value: 'inactive' },
					{ name: 'Unsubscribed', value: 'unsubscribed' },
					{ name: 'Bounced', value: 'bounced' },
				],
				default: 'active',
				routing: {
					send: {
						type: 'body',
						property: 'status',
					},
				},
			},
			{
				displayName: 'Source',
				name: 'source',
				type: 'string',
				default: 'n8n',
				description: 'Source of the subscription',
				routing: {
					send: {
						type: 'body',
						property: 'source',
					},
				},
			},
		],
	},
	// Update fields
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['subscriber'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				placeholder: 'name@email.com',
				default: '',
				routing: {
					send: {
						type: 'body',
						property: 'email',
					},
				},
			},
			{
				displayName: 'First Name',
				name: 'first_name',
				type: 'string',
				default: '',
				routing: {
					send: {
						type: 'body',
						property: 'first_name',
					},
				},
			},
			{
				displayName: 'Last Name',
				name: 'last_name',
				type: 'string',
				default: '',
				routing: {
					send: {
						type: 'body',
						property: 'last_name',
					},
				},
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				routing: {
					send: {
						type: 'body',
						property: 'phone',
					},
				},
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Active', value: 'active' },
					{ name: 'Inactive', value: 'inactive' },
					{ name: 'Unsubscribed', value: 'unsubscribed' },
					{ name: 'Bounced', value: 'bounced' },
				],
				default: 'active',
				routing: {
					send: {
						type: 'body',
						property: 'status',
					},
				},
			},
			{
				displayName: 'Source',
				name: 'source',
				type: 'string',
				default: '',
				routing: {
					send: {
						type: 'body',
						property: 'source',
					},
				},
			},
		],
	},
	// Options for Get Many
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['subscriber'],
				operation: ['getMany'],
			},
		},
		options: [
			{
				displayName: 'Per Page',
				name: 'per_page',
				type: 'number',
				default: 25,
				description: 'Number of results per page',
				routing: {
					send: {
						type: 'query',
						property: 'per_page',
					},
				},
			},
			{
				displayName: 'Sort By',
				name: 'sort_by',
				type: 'options',
				options: [
					{ name: 'Created At', value: 'created_at' },
					{ name: 'Email', value: 'email' },
				],
				default: 'created_at',
				routing: {
					send: {
						type: 'query',
						property: 'sort_by',
					},
				},
			},
			{
				displayName: 'Sort Order',
				name: 'sort_order',
				type: 'options',
				options: [
					{ name: 'Ascending', value: 'asc' },
					{ name: 'Descending', value: 'desc' },
				],
				default: 'desc',
				routing: {
					send: {
						type: 'query',
						property: 'sort_order',
					},
				},
			},
		],
	},
];
