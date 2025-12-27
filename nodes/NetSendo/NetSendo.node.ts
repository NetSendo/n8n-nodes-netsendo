import {
	NodeConnectionTypes,
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription,
	type IHttpRequestMethods,
	type IDataObject,
} from 'n8n-workflow';
import { listDescription } from './resources/list';
import { smsDescription } from './resources/sms';
import { subscriberDescription } from './resources/subscriber';
import { tagDescription } from './resources/tag';
import { emailDescription } from './resources/email';
import { getLists } from './listSearch/getLists';
import { getSubscribersWithPhone } from './listSearch/getSubscribersWithPhone';
import { getMailboxes } from './listSearch/getMailboxes';

/**
 * Fetch all pages from a paginated API endpoint (Laravel pagination)
 */
async function fetchAllPages(
	context: IExecuteFunctions,
	baseUrl: string,
	endpoint: string,
	qs: IDataObject,
	returnAll: boolean,
	limit: number,
): Promise<IDataObject[]> {
	const allResults: IDataObject[] = [];
	let page = 1;
	let lastPage = 1;

	do {
		qs.page = page;

		const response = await context.helpers.httpRequestWithAuthentication.call(
			context,
			'netSendoApi',
			{
				method: 'GET' as IHttpRequestMethods,
				url: `${baseUrl}${endpoint}`,
				qs,
			},
		);

		const data = response.data as IDataObject[];
		if (data && data.length > 0) {
			allResults.push(...data);
		}

		// Get pagination info from meta
		if (response.meta && response.meta.last_page) {
			lastPage = response.meta.last_page as number;
		}

		// Check if we've reached the limit (when not returning all)
		if (!returnAll && allResults.length >= limit) {
			allResults.splice(limit);
			break;
		}

		page++;
	} while (page <= lastPage);

	return allResults;
}

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
						name: 'Email',
						value: 'email',
						description: 'Send and manage email messages',
					},
					{
						name: 'List',
						value: 'list',
						description: 'Manage contact lists',
					},
					{
						name: 'SMS',
						value: 'sms',
						description: 'Send and manage SMS messages',
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
			...emailDescription,
			...listDescription,
			...smsDescription,
			...subscriberDescription,
			...tagDescription,
		],
	};

	methods = {
		loadOptions: {
			getLists,
			getSubscribersWithPhone,
			getMailboxes,
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		// Get credentials and construct base URL
		const credentials = await this.getCredentials('netSendoApi');
		const baseUrl = `${(credentials.baseUrl as string).replace(/\/$/, '')}/api/v1`;

		for (let i = 0; i < items.length; i++) {
			try {
				// ==================== SUBSCRIBER RESOURCE ====================
				if (resource === 'subscriber') {
					if (operation === 'getMany') {
						// Paginated operation
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const limit = returnAll ? 0 : (this.getNodeParameter('limit', i, 50) as number);
						const contactListId = this.getNodeParameter('contactListId', i) as string;
						const options = this.getNodeParameter('options', i, {}) as IDataObject;

						const qs: IDataObject = {
							per_page: 100,
							contact_list_id: contactListId,
						};

						if (options.status) qs.status = options.status;
						if (options.sort_by) qs.sort_by = options.sort_by;
						if (options.sort_order) qs.sort_order = options.sort_order;

						const results = await fetchAllPages(this, baseUrl, '/subscribers', qs, returnAll, limit);

						for (const item of results) {
							returnData.push({ json: item });
						}
					} else if (operation === 'get') {
						const subscriberId = this.getNodeParameter('subscriberId', i) as number;
						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'netSendoApi',
							{
								method: 'GET' as IHttpRequestMethods,
								url: `${baseUrl}/subscribers/${subscriberId}`,
							},
						);
						returnData.push({ json: response.data || response });
					} else if (operation === 'getByEmail') {
						const email = this.getNodeParameter('email', i) as string;
						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'netSendoApi',
							{
								method: 'GET' as IHttpRequestMethods,
								url: `${baseUrl}/subscribers/by-email/${encodeURIComponent(email)}`,
							},
						);
						returnData.push({ json: response.data || response });
					} else if (operation === 'create') {
						const email = this.getNodeParameter('email', i) as string;
						const contactListId = this.getNodeParameter('contactListId', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

						const body: IDataObject = {
							email,
							contact_list_id: contactListId,
							...additionalFields,
						};

						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'netSendoApi',
							{
								method: 'POST' as IHttpRequestMethods,
								url: `${baseUrl}/subscribers`,
								body,
							},
						);
						returnData.push({ json: response.data || response });
					} else if (operation === 'update') {
						const subscriberId = this.getNodeParameter('subscriberId', i) as number;
						const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'netSendoApi',
							{
								method: 'PUT' as IHttpRequestMethods,
								url: `${baseUrl}/subscribers/${subscriberId}`,
								body: updateFields,
							},
						);
						returnData.push({ json: response.data || response });
					} else if (operation === 'delete') {
						const subscriberId = this.getNodeParameter('subscriberId', i) as number;
						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'netSendoApi',
							{
								method: 'DELETE' as IHttpRequestMethods,
								url: `${baseUrl}/subscribers/${subscriberId}`,
							},
						);
						returnData.push({ json: response.data || response || { success: true } });
					}
				}

				// ==================== LIST RESOURCE ====================
				if (resource === 'list') {
					if (operation === 'getMany') {
						const options = this.getNodeParameter('options', i, {}) as IDataObject;
						const qs: IDataObject = {};

						if (options.per_page) qs.per_page = options.per_page;
						if (options.sort_by) qs.sort_by = options.sort_by;
						if (options.sort_order) qs.sort_order = options.sort_order;

						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'netSendoApi',
							{
								method: 'GET' as IHttpRequestMethods,
								url: `${baseUrl}/lists`,
								qs,
							},
						);

						const data = response.data || response;
						if (Array.isArray(data)) {
							for (const item of data) {
								returnData.push({ json: item });
							}
						} else {
							returnData.push({ json: data });
						}
					} else if (operation === 'get') {
						const listId = this.getNodeParameter('listId', i) as string;
						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'netSendoApi',
							{
								method: 'GET' as IHttpRequestMethods,
								url: `${baseUrl}/lists/${listId}`,
							},
						);
						returnData.push({ json: response.data || response });
					} else if (operation === 'getSubscribers') {
						// Paginated operation
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const limit = returnAll ? 0 : (this.getNodeParameter('limit', i, 50) as number);
						const listId = this.getNodeParameter('listId', i) as string;
						const options = this.getNodeParameter('options', i, {}) as IDataObject;

						const qs: IDataObject = {
							per_page: 100,
						};

						if (options.status) qs.status = options.status;
						if (options.sort_by) qs.sort_by = options.sort_by;
						if (options.sort_order) qs.sort_order = options.sort_order;

						const results = await fetchAllPages(
							this,
							baseUrl,
							`/lists/${listId}/subscribers`,
							qs,
							returnAll,
							limit,
						);

						for (const item of results) {
							returnData.push({ json: item });
						}
					}
				}

				// ==================== EMAIL RESOURCE ====================
				if (resource === 'email') {
					if (operation === 'send') {
						const emailAddress = this.getNodeParameter('emailAddress', i) as string;
						const subject = this.getNodeParameter('subject', i) as string;
						const content = this.getNodeParameter('content', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

						const body: IDataObject = {
							email: emailAddress,
							subject,
							content,
							...additionalFields,
						};

						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'netSendoApi',
							{
								method: 'POST' as IHttpRequestMethods,
								url: `${baseUrl}/email/send`,
								body,
							},
						);
						returnData.push({ json: response.data || response });
					} else if (operation === 'sendBatch') {
						const subject = this.getNodeParameter('subject', i) as string;
						const content = this.getNodeParameter('content', i) as string;
						const targetType = this.getNodeParameter('targetType', i) as string;
						const mailboxId = this.getNodeParameter('mailboxId', i, '') as string;
						const scheduleAt = this.getNodeParameter('scheduleAt', i, '') as string;
						const excludedListIds = this.getNodeParameter('excludedListIds', i, []) as string[];

						const body: IDataObject = {
							subject,
							content,
						};

						if (mailboxId) body.mailbox_id = mailboxId;
						if (scheduleAt) body.schedule_at = scheduleAt;
						if (excludedListIds.length) body.excluded_list_ids = excludedListIds;

						if (targetType === 'list') {
							body.contact_list_id = this.getNodeParameter('contactListId', i) as string;
						} else if (targetType === 'tags') {
							const tagsString = this.getNodeParameter('tags', i) as string;
							body.tags = tagsString.split(',').map((tag) => tag.trim());
						} else if (targetType === 'subscribers') {
							const subscriberIdsString = this.getNodeParameter('subscriberIds', i) as string;
							body.subscriber_ids = subscriberIdsString.split(',').map((id) => parseInt(id.trim()));
						}

						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'netSendoApi',
							{
								method: 'POST' as IHttpRequestMethods,
								url: `${baseUrl}/email/batch`,
								body,
							},
						);
						returnData.push({ json: response.data || response });
					} else if (operation === 'getStatus') {
						const emailId = this.getNodeParameter('emailId', i) as string;
						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'netSendoApi',
							{
								method: 'GET' as IHttpRequestMethods,
								url: `${baseUrl}/email/status/${emailId}`,
							},
						);
						returnData.push({ json: response.data || response });
					} else if (operation === 'listMailboxes') {
						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'netSendoApi',
							{
								method: 'GET' as IHttpRequestMethods,
								url: `${baseUrl}/email/mailboxes`,
							},
						);

						const data = response.data || response;
						if (Array.isArray(data)) {
							for (const item of data) {
								returnData.push({ json: item });
							}
						} else {
							returnData.push({ json: data });
						}
					}
				}

				// ==================== SMS RESOURCE ====================
				if (resource === 'sms') {
					if (operation === 'send') {
						const phoneNumber = this.getNodeParameter('phoneNumber', i) as string;
						const message = this.getNodeParameter('message', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

						const body: IDataObject = {
							phone_number: phoneNumber,
							message,
							...additionalFields,
						};

						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'netSendoApi',
							{
								method: 'POST' as IHttpRequestMethods,
								url: `${baseUrl}/sms/send`,
								body,
							},
						);
						returnData.push({ json: response.data || response });
					} else if (operation === 'sendBatch') {
						const message = this.getNodeParameter('message', i) as string;
						const targetType = this.getNodeParameter('targetType', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

						const body: IDataObject = {
							message,
							...additionalFields,
						};

						if (targetType === 'list') {
							body.contact_list_id = this.getNodeParameter('contactListId', i) as string;
						} else if (targetType === 'tags') {
							const tagsString = this.getNodeParameter('tags', i) as string;
							body.tags = tagsString.split(',').map((tag) => tag.trim());
						}

						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'netSendoApi',
							{
								method: 'POST' as IHttpRequestMethods,
								url: `${baseUrl}/sms/batch`,
								body,
							},
						);
						returnData.push({ json: response.data || response });
					} else if (operation === 'getStatus') {
						const smsId = this.getNodeParameter('smsId', i) as string;
						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'netSendoApi',
							{
								method: 'GET' as IHttpRequestMethods,
								url: `${baseUrl}/sms/status/${smsId}`,
							},
						);
						returnData.push({ json: response.data || response });
					} else if (operation === 'listProviders') {
						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'netSendoApi',
							{
								method: 'GET' as IHttpRequestMethods,
								url: `${baseUrl}/sms/providers`,
							},
						);

						const data = response.data || response;
						if (Array.isArray(data)) {
							for (const item of data) {
								returnData.push({ json: item });
							}
						} else {
							returnData.push({ json: data });
						}
					}
				}

				// ==================== TAG RESOURCE ====================
				if (resource === 'tag') {
					if (operation === 'getMany') {
						const options = this.getNodeParameter('options', i, {}) as IDataObject;
						const qs: IDataObject = {};

						if (options.per_page) qs.per_page = options.per_page;

						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'netSendoApi',
							{
								method: 'GET' as IHttpRequestMethods,
								url: `${baseUrl}/tags`,
								qs,
							},
						);

						const data = response.data || response;
						if (Array.isArray(data)) {
							for (const item of data) {
								returnData.push({ json: item });
							}
						} else {
							returnData.push({ json: data });
						}
					} else if (operation === 'get') {
						const tagId = this.getNodeParameter('tagId', i) as number;
						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'netSendoApi',
							{
								method: 'GET' as IHttpRequestMethods,
								url: `${baseUrl}/tags/${tagId}`,
							},
						);
						returnData.push({ json: response.data || response });
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message } });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
