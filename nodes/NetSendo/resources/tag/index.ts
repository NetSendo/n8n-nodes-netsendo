import type { INodeProperties } from 'n8n-workflow';

const showOnlyForTag = {
	resource: ['tag'],
};

export const tagDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForTag,
		},
		options: [
			{
				name: 'Get Many',
				value: 'getMany',
				action: 'Get many tags',
				description: 'Get all tags',
				routing: {
					request: {
						method: 'GET',
						url: '/tags',
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
				action: 'Get a tag',
				description: 'Get a single tag by ID',
				routing: {
					request: {
						method: 'GET',
						url: '=/tags/{{$parameter.tagId}}',
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
	// Tag ID (for Get operation)
	{
		displayName: 'Tag ID',
		name: 'tagId',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: {
			show: {
				resource: ['tag'],
				operation: ['get'],
			},
		},
		description: 'ID of the tag to retrieve',
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
				resource: ['tag'],
				operation: ['getMany'],
			},
		},
		options: [
			{
				displayName: 'Per Page',
				name: 'per_page',
				type: 'number',
				default: 50,
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
					{ name: 'Name', value: 'name' },
					{ name: 'Created At', value: 'created_at' },
				],
				default: 'name',
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
				default: 'asc',
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
