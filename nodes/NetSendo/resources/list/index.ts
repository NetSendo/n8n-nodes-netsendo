import type { INodeProperties } from 'n8n-workflow';

const showOnlyForList = {
	resource: ['list'],
};

export const listDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForList,
		},
		options: [
			{
				name: 'Get Many',
				value: 'getMany',
				action: 'Get many contact lists',
				description: 'Get all contact lists',
				routing: {
					request: {
						method: 'GET',
						url: '/lists',
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
				action: 'Get a contact list',
				description: 'Get a single contact list by ID',
				routing: {
					request: {
						method: 'GET',
						url: '=/lists/{{$parameter.listId}}',
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
				name: 'Get Subscribers',
				value: 'getSubscribers',
				action: 'Get subscribers from a list',
				description: 'Get all subscribers belonging to a specific contact list',
				routing: {
					request: {
						method: 'GET',
						url: '=/lists/{{$parameter.listId}}/subscribers',
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
		default: 'getMany',
	},
	// List ID (for Get and Get Subscribers operations)
	{
		displayName: 'Contact List Name or ID',
		name: 'listId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getLists',
		},
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['list'],
				operation: ['get', 'getSubscribers'],
			},
		},
		description: 'Select a contact list. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	// Return All (for Get Subscribers)
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['list'],
				operation: ['getSubscribers'],
			},
		},
		description: 'Whether to return all results or only up to a given limit',
	},
	// Limit (for Get Subscribers when Return All is false)
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		typeOptions: {
			minValue: 1,
			maxValue: 5000,
		},
		displayOptions: {
			show: {
				resource: ['list'],
				operation: ['getSubscribers'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
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
				resource: ['list'],
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
					{ name: 'Name', value: 'name' },
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
	// Options for Get Subscribers
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['list'],
				operation: ['getSubscribers'],
			},
		},
		options: [
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
				description: 'Filter by subscriber status',
				routing: {
					send: {
						type: 'query',
						property: 'status',
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
