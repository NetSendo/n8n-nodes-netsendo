import type {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IHttpRequestMethods,
	IDataObject,
	IHttpRequestOptions,
} from 'n8n-workflow';

/**
 * Make an API request to NetSendo
 * Handles baseUrl normalization and Bearer auth
 */
export async function netSendoApiRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<IDataObject | IDataObject[]> {
	const credentials = await this.getCredentials('netSendoApi');

	// Normalize baseUrl - remove trailing slash
	const baseUrl = (credentials.baseUrl as string).replace(/\/$/, '');

	const options: IHttpRequestOptions = {
		method,
		url: `${baseUrl}/api/v1${endpoint}`,
		qs,
		json: true,
		headers: {
			Authorization: `Bearer ${credentials.apiKey}`,
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
	};

	if (Object.keys(body).length > 0) {
		options.body = body;
	}

	return this.helpers.httpRequest(options);
}
