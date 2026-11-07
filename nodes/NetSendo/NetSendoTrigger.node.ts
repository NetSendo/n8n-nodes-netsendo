import type {
	IHookFunctions,
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	IDataObject,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

import { reportHeartbeat } from './shared/heartbeat';
import { isValidNetSendoSignature } from './shared/signature';

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
		usableAsTool: true,
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
					{ name: 'Email Queued', value: 'email.queued' },
					{ name: 'Payment Refunded (Stripe)', value: 'stripe.payment_refunded' },
					{ name: 'Purchase Completed (Stripe)', value: 'stripe.purchase_completed' },
					{ name: 'SMS Failed', value: 'sms.failed' },
					{ name: 'SMS Queued', value: 'sms.queued' },
					{ name: 'SMS Sent', value: 'sms.sent' },
					{ name: 'Subscriber Bounced', value: 'subscriber.bounced' },
					{ name: 'Subscriber Created', value: 'subscriber.created' },
					{ name: 'Subscriber Deleted', value: 'subscriber.deleted' },
					{ name: 'Subscriber Resubscribed', value: 'subscriber.resubscribed' },
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

				// Report this installation and its node version to NetSendo.
				// Activating a trigger is the natural low-frequency moment for
				// it; the call cannot fail the activation.
				await reportHeartbeat.call(this, webhookUrl);

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
					} catch {
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
		const webhookData = this.getWorkflowStaticData('node');
		const secret = webhookData.webhookSecret as string | undefined;

		// NetSendo gives every webhook a secret and signs every delivery with it,
		// so once the secret is known an unsigned or wrongly signed request did
		// not come from NetSendo. The HMAC covers the raw body, not a
		// re-serialisation of the parsed JSON (see isValidNetSendoSignature).
		if (secret) {
			if (!req.rawBody && typeof req.readRawBody === 'function') {
				await req.readRawBody();
			}

			const signature = req.headers['x-netsendo-signature'];

			if (!req.rawBody || !isValidNetSendoSignature(req.rawBody, signature, secret)) {
				const res = this.getResponseObject();
				res.writeHead(401, { 'Content-Type': 'text/plain; charset=utf-8' });
				res.end('Invalid signature');

				return { noWebhookResponse: true };
			}
		}

		const body = this.getBodyData();

		return {
			workflowData: [this.helpers.returnJsonArray(body as IDataObject)],
		};
	}
}
