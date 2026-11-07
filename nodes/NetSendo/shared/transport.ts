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
 * Normalizes baseUrl; the Bearer header comes from the credential's `authenticate`
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
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
	};

	if (Object.keys(body).length > 0) {
		options.body = body;
	}

	return this.helpers.httpRequestWithAuthentication.call(this, 'netSendoApi', options);
}
