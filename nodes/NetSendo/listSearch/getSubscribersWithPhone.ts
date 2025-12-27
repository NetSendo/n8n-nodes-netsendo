import type { INodePropertyOptions, ILoadOptionsFunctions } from 'n8n-workflow';
import { netSendoApiRequest } from '../shared/transport';

interface Subscriber {
	id: number;
	email: string;
	phone?: string;
	first_name?: string;
	last_name?: string;
}

interface SubscribersResponse {
	data: Subscriber[];
	meta?: {
		last_page: number;
	};
}

/**
 * Load subscribers with phone numbers from a contact list for dropdown selection
 */
export async function getSubscribersWithPhone(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const contactListId = this.getCurrentNodeParameter('smsContactListId') as string;

	if (!contactListId) {
		return [];
	}

	const allSubscribers: Subscriber[] = [];
	let page = 1;
	let lastPage = 1;

	// Fetch all pages of subscribers
	do {
		const response = (await netSendoApiRequest.call(
			this,
			'GET',
			`/lists/${contactListId}/subscribers`,
			{},
			{ per_page: 100, page },
		)) as unknown as SubscribersResponse;

		const subscribers = response.data || [];
		allSubscribers.push(...subscribers);

		if (response.meta?.last_page) {
			lastPage = response.meta.last_page;
		}
		page++;
	} while (page <= lastPage);

	// Filter only subscribers with phone numbers and map to options
	return allSubscribers
		.filter((sub) => sub.phone && sub.phone.trim() !== '')
		.map((sub) => {
			const displayName = sub.first_name || sub.last_name
				? `${sub.first_name || ''} ${sub.last_name || ''} (${sub.phone})`.trim()
				: `${sub.email} (${sub.phone})`;

			return {
				name: displayName,
				value: sub.phone as string,
			};
		});
}
