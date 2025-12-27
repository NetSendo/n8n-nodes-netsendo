import type { INodePropertyOptions, ILoadOptionsFunctions } from 'n8n-workflow';
import { netSendoApiRequest } from '../shared/transport';

interface Mailbox {
	id: number;
	name: string;
	from_email: string;
	is_default?: boolean;
}

interface MailboxesResponse {
	data: Mailbox[];
}

/**
 * Load mailboxes for dropdown selection
 */
export async function getMailboxes(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const response = (await netSendoApiRequest.call(
		this,
		'GET',
		'/email/mailboxes',
		{},
		{},
	)) as unknown as MailboxesResponse;

	const mailboxes = response.data || [];

	return mailboxes.map((mailbox) => ({
		name: `${mailbox.name} (${mailbox.from_email})${mailbox.is_default ? ' ★' : ''}`,
		value: mailbox.id,
	}));
}
