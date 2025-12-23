import type { INodePropertyOptions, ILoadOptionsFunctions } from 'n8n-workflow';
import { netSendoApiRequest } from '../shared/transport';

interface ContactList {
	id: number;
	name: string;
}

interface ListsResponse {
	data: ContactList[];
}

/**
 * Load contact lists for dropdown selection
 */
export async function getLists(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const response = (await netSendoApiRequest.call(
		this,
		'GET',
		'/lists',
		{},
		{ per_page: 100 },
	)) as unknown as ListsResponse;

	const lists = response.data || [];

	return lists.map((list) => ({
		name: list.name,
		value: list.id,
	}));
}
