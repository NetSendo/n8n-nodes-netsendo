import type {
	IHookFunctions,
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	IDataObject,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

export class NetSendoTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NetSendo Trigger',
		name: 'netSendoTrigger',
		icon: 'file:../../icons/netsendo.svg',
		group: ['trigger'],
		version: 1,
		description: 'Starts the workflow when NetSendo events occur',
		defaults: {
			name: 'NetSendo Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'netSendoApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				options: [
					{ name: 'Subscriber Bounced', value: 'subscriber.bounced' },
					{ name: 'Subscriber Created', value: 'subscriber.created' },
					{ name: 'Subscriber Deleted', value: 'subscriber.deleted' },
					{ name: 'Subscriber Subscribed', value: 'subscriber.subscribed' },
					{ name: 'Subscriber Unsubscribed', value: 'subscriber.unsubscribed' },
					{ name: 'Subscriber Updated', value: 'subscriber.updated' },
					{ name: 'Tag Added', value: 'subscriber.tag_added' },
					{ name: 'Tag Removed', value: 'subscriber.tag_removed' },
				],
				default: ['subscriber.created'],
				required: true,
				description: 'Events to listen for',
			},
		],
	};

	webhookMethods = {
		default: {
			// Check if webhook already exists
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				return webhookData.webhookId !== undefined;
			},

			// Register webhook in NetSendo
			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const events = this.getNodeParameter('events') as string[];
				const credentials = await this.getCredentials('netSendoApi');

				const baseUrl = (credentials.baseUrl as string).replace(/\/$/, '');

				const body = {
					name: `n8n Workflow: ${this.getWorkflow().name}`,
					url: webhookUrl,
					events: events,
				};

				const response = await this.helpers.httpRequest({
					method: 'POST',
					url: `${baseUrl}/api/v1/webhooks`,
					headers: {
						Authorization: `Bearer ${credentials.apiKey}`,
						'Content-Type': 'application/json',
					},
					body: body,
					json: true,
				});

				const webhookData = this.getWorkflowStaticData('node');
				webhookData.webhookId = (response.data as IDataObject).id;
				webhookData.webhookSecret = (response.data as IDataObject).secret;

				return true;
			},

			// Delete webhook from NetSendo
			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				const credentials = await this.getCredentials('netSendoApi');

				const baseUrl = (credentials.baseUrl as string).replace(/\/$/, '');

				if (webhookData.webhookId) {
					try {
						await this.helpers.httpRequest({
							method: 'DELETE',
							url: `${baseUrl}/api/v1/webhooks/${webhookData.webhookId}`,
							headers: {
								Authorization: `Bearer ${credentials.apiKey}`,
							},
						});
					} catch (error) {
						// Webhook may already be deleted, ignore error
					}
				}

				delete webhookData.webhookId;
				delete webhookData.webhookSecret;

				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		const body = this.getBodyData();

		// Optional: Verify HMAC signature
		const webhookData = this.getWorkflowStaticData('node');
		const signature = req.headers['x-netsendo-signature'] as string;

		if (webhookData.webhookSecret && signature) {
			// eslint-disable-next-line @typescript-eslint/no-require-imports
			const crypto = require('crypto');
			const expectedSignature = crypto
				.createHmac('sha256', webhookData.webhookSecret as string)
				.update(JSON.stringify(body))
				.digest('hex');

			if (signature !== expectedSignature) {
				return {
					webhookResponse: 'Invalid signature',
				};
			}
		}

		return {
			workflowData: [this.helpers.returnJsonArray(body as IDataObject)],
		};
	}
}
