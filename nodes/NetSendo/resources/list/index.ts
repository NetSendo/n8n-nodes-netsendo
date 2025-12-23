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
		],
		default: 'getMany',
	},
	// List ID (for Get operation)
	{
		displayName: 'List ID',
		name: 'listId',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: {
			show: {
				resource: ['list'],
				operation: ['get'],
			},
		},
		description: 'ID of the contact list to retrieve',
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
];
