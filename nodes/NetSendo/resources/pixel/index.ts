import type { INodeProperties } from 'n8n-workflow';

const showOnlyForPixel = {
	resource: ['pixel'],
};

export const pixelDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForPixel,
		},
		options: [
			{
				name: 'Track Event',
				value: 'trackEvent',
				action: 'Track a pixel event',
				description: 'Track a single pixel event',
			},
			{
				name: 'Batch Track Events',
				value: 'batchTrackEvents',
				action: 'Track multiple pixel events',
				description: 'Track multiple pixel events in a single request',
			},
		],
		default: 'trackEvent',
	},
	// User ID (required for Track Event)
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: {
			show: {
				resource: ['pixel'],
				operation: ['trackEvent'],
			},
		},
		description: 'ID of the user/subscriber',
	},
	// Visitor Token (required for Track Event)
	{
		displayName: 'Visitor Token',
		name: 'visitorToken',
		type: 'string',
		typeOptions: { password: true },
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['pixel'],
				operation: ['trackEvent'],
			},
		},
		description: 'Unique visitor token',
	},
	// Event Type (required for Track Event)
	{
		displayName: 'Event Type',
		name: 'eventType',
		type: 'string',
		default: 'page_view',
		required: true,
		displayOptions: {
			show: {
				resource: ['pixel'],
				operation: ['trackEvent'],
			},
		},
		description: 'Type of event (e.g., page_view, click, purchase)',
	},
	// Additional Fields for Track Event
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['pixel'],
				operation: ['trackEvent'],
			},
		},
		options: [
			{
				displayName: 'Page URL',
				name: 'page_url',
				type: 'string',
				default: '',
				description: 'URL of the page where the event occurred',
			},
			{
				displayName: 'Client IP Address',
				name: 'client_ip',
				type: 'string',
				default: '',
				description:
					'Real IP address of the client. Useful when request comes through webhook/proxy.',
				placeholder: '{{ $json.headers["x-forwarded-for"] }}',
			},
		],
	},
	// Events array for Batch Track
	{
		displayName: 'Events',
		name: 'events',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		displayOptions: {
			show: {
				resource: ['pixel'],
				operation: ['batchTrackEvents'],
			},
		},
		options: [
			{
				name: 'event',
				displayName: 'Event',
				values: [
					{
						displayName: 'Client IP',
						name: 'client_ip',
						type: 'string',
						default: '',
						description: 'Real IP address of the client',
						placeholder: '{{	$json.headers[\'x-forwarded-for\' ]	}}',
					},
					{
						displayName: 'Event Type',
						name: 'event_type',
						type: 'string',
						default: 'page_view',
							required:	true,
						description: 'Type of event',
					},
					{
						displayName: 'Page URL',
						name: 'page_url',
						type: 'string',
						default: '',
						description: 'URL of the page where the event occurred',
					},
					{
						displayName: 'User ID',
						name: 'user_id',
						type: 'number',
						default: 0,
							required:	true,
						description: 'ID of the user/subscriber',
					},
					{
						displayName: 'Visitor Token',
						name: 'visitor_token',
						type: 'string',
						typeOptions: { password: true },
						default: '',
							required:	true,
						description: 'Unique visitor token',
					},
			],
			},
		],
		description: 'List of pixel events to track',
	},
];
