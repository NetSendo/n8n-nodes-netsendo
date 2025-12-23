import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { listDescription } from './resources/list';
import { subscriberDescription } from './resources/subscriber';
import { tagDescription } from './resources/tag';
import { getLists } from './listSearch/getLists';

export class NetSendo implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NetSendo',
		name: 'netSendo',
		icon: 'file:../../icons/netsendo.svg',
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with NetSendo Email Marketing Platform',
		defaults: {
			name: 'NetSendo',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'netSendoApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '={{$credentials?.baseUrl.replace(/\\/$/, "")}}/api/v1',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'List',
						value: 'list',
						description: 'Manage contact lists',
					},
					{
						name: 'Subscriber',
						value: 'subscriber',
						description: 'Manage subscribers',
					},
					{
						name: 'Tag',
						value: 'tag',
						description: 'Manage tags',
					},
				],
				default: 'subscriber',
			},
			...listDescription,
			...subscriberDescription,
			...tagDescription,
		],
	};

	methods = {
		loadOptions: {
			getLists,
		},
	};
}
