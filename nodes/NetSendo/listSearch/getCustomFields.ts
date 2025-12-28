import type { INodePropertyOptions, ILoadOptionsFunctions } from 'n8n-workflow';
import { netSendoApiRequest } from '../shared/transport';

interface CustomField {
	id: number;
	name: string;
	label: string;
	type: string;
}

interface CustomFieldsResponse {
	data: CustomField[];
}

/**
 * Load custom fields for dropdown selection
 */
export async function getCustomFields(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	try {
		const response = (await netSendoApiRequest.call(
			this,
			'GET',
			'/custom-fields',
			{},
			{ per_page: 100 },
		)) as unknown as CustomFieldsResponse;

		const fields = response.data || [];

		return fields.map((field) => ({
			name: `${field.label} (${field.name})`,
			value: field.name,
			description: `Type: ${field.type}`,
		}));
	} catch {
		// If endpoint doesn't exist or fails, return empty array
		return [];
	}
}
