import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class NetSendoApi implements ICredentialType {
	name = 'netSendoApi';

	displayName = 'NetSendo API';

	icon: Icon = 'file:../icons/netsendo.svg';

	documentationUrl = 'https://github.com/NetSendo/NetSendo';

	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: '',
			placeholder: 'https://twoja-domena.pl',
			description:
				'Wklej domenę swojej instalacji NetSendo (bez /api/v1), np. https://premium.gregciupek.com',
			required: true,
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			placeholder: 'ns_live_...',
			description: 'Wklej klucz API wygenerowany w NetSendo → Klucze API',
			required: true,
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials?.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials?.baseUrl.replace(/\\/$/, "")}}/api/v1',
			url: '/lists',
			method: 'GET',
		},
	};
}
