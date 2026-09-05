import type { IHookFunctions, IExecuteFunctions } from 'n8n-workflow';

/**
 * Version this node reports to NetSendo. Keep it in step with package.json —
 * the platform compares it against its own plugin registry to tell the account
 * owner which n8n instances are running an outdated node.
 */
export const NODE_VERSION = '1.3.2';

/**
 * Tell NetSendo that this n8n instance is running the node, and which version.
 *
 * Purely informational: the call is fire-and-forget and any failure (older
 * NetSendo without the endpoint, key without the permission, network hiccup)
 * is swallowed, because reporting a version must never stop a workflow from
 * activating.
 *
 * @param instanceUrl any URL served by this n8n instance — its origin identifies the installation
 */
export async function reportHeartbeat(
	this: IHookFunctions | IExecuteFunctions,
	instanceUrl: string | undefined,
): Promise<void> {
	if (!instanceUrl) {
		return;
	}

	try {
		const credentials = await this.getCredentials('netSendoApi');
		const baseUrl = (credentials.baseUrl as string).replace(/\/$/, '');

		let siteUrl: string;
		try {
			siteUrl = new URL(instanceUrl).origin;
		} catch {
			return; // No usable instance URL — nothing worth reporting
		}

		await this.helpers.httpRequest({
			method: 'POST',
			url: `${baseUrl}/api/v1/plugin/heartbeat`,
			headers: {
				Authorization: `Bearer ${credentials.apiKey}`,
				'Content-Type': 'application/json',
			},
			body: {
				plugin_type: 'n8n',
				site_url: siteUrl,
				site_name: 'n8n',
				plugin_version: NODE_VERSION,
			},
			json: true,
		});
	} catch {
		// Intentionally ignored — see the doc block above
	}
}
