'use strict';

/*
 * What n8n's community-node review checks for: every request goes through the
 * credential (httpRequestWithAuthentication, no hand-made Authorization
 * header), output items keep their link to the input item (pairedItem), and
 * errors reach n8n as NodeApiError. Runs on the compiled output: `npm test`
 * builds first.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { NodeApiError } = require('n8n-workflow');

const { NetSendo } = require('../dist/nodes/NetSendo/NetSendo.node.js');
const { NetSendoTrigger } = require('../dist/nodes/NetSendo/NetSendoTrigger.node.js');
const { NODE_VERSION } = require('../dist/nodes/NetSendo/shared/heartbeat.js');

const credentials = { baseUrl: 'https://ns.example.com/', apiKey: 'ns_live_secret' };

/** Records every authenticated request and answers it with `respond(options)`. */
function authenticatedHelpers(respond) {
	const calls = [];
	return {
		calls,
		helpers: {
			async httpRequestWithAuthentication(credentialsType, options) {
				calls.push({ credentialsType, options });
				return respond(options);
			},
			async httpRequest() {
				throw new Error('httpRequest must not be used: requests go through the credential');
			},
		},
	};
}

function assertNoManualAuth(call) {
	assert.equal(call.credentialsType, 'netSendoApi');
	const headers = call.options.headers || {};
	assert.ok(!('Authorization' in headers), 'the credential adds the Authorization header');
}

// ==================== NetSendo node ====================

const nodeInfo = {
	id: 'node-1',
	name: 'NetSendo',
	type: 'n8n-nodes-netsendo.netSendo',
	typeVersion: 1,
	position: [0, 0],
	parameters: {},
};

function executeContext({ items, params, respond, continueOnFail = false }) {
	const { calls, helpers } = authenticatedHelpers(respond);
	const context = {
		getInputData: () => items,
		getNodeParameter: (name, _i, fallback) => (name in params ? params[name] : fallback),
		getCredentials: async () => credentials,
		getNode: () => nodeInfo,
		continueOnFail: () => continueOnFail,
		helpers,
	};
	return { context, calls };
}

const execute = (context) => new NetSendo().execute.call(context);
const twoItems = [{ json: {} }, { json: {} }];

test('each output item points at the input item it came from', async () => {
	const { context, calls } = executeContext({
		items: twoItems,
		params: { resource: 'subscriber', operation: 'get', subscriberId: 42 },
		respond: () => ({ data: { id: 42 } }),
	});

	const [output] = await execute(context);

	assert.deepEqual(
		output.map((item) => item.pairedItem),
		[{ item: 0 }, { item: 1 }],
	);
	assert.equal(calls[0].options.url, 'https://ns.example.com/api/v1/subscribers/42');
	calls.forEach(assertNoManualAuth);
});

test('an input item that returns several results pairs all of them with that item', async () => {
	const { context } = executeContext({
		items: twoItems,
		params: { resource: 'list', operation: 'getMany', options: {} },
		respond: () => ({ data: [{ id: 1 }, { id: 2 }] }),
	});

	const [output] = await execute(context);

	assert.deepEqual(
		output.map((item) => item.pairedItem.item),
		[0, 0, 1, 1],
	);
});

test('with "Continue On Fail" the error item is paired with the failing input item', async () => {
	let call = 0;
	const { context } = executeContext({
		items: twoItems,
		params: { resource: 'tag', operation: 'get', tagId: 5 },
		respond: () => {
			call++;
			if (call === 2) throw new Error('boom');
			return { data: { id: 5 } };
		},
		continueOnFail: true,
	});

	const [output] = await execute(context);

	assert.deepEqual(output[1], { json: { error: 'boom' }, pairedItem: { item: 1 } });
});

test('a failure reaches n8n as NodeApiError carrying the item index', async () => {
	let call = 0;
	const { context } = executeContext({
		items: twoItems,
		params: { resource: 'tag', operation: 'get', tagId: 5 },
		respond: () => {
			call++;
			if (call === 2) throw new Error('boom');
			return { data: { id: 5 } };
		},
	});

	await assert.rejects(execute(context), (error) => {
		assert.ok(error instanceof NodeApiError);
		assert.equal(error.context.itemIndex, 1);
		return true;
	});
});

test('a NodeApiError from the request helper is passed on unchanged', async () => {
	const original = new NodeApiError(nodeInfo, { message: 'Not Found', httpCode: '404' });
	const { context } = executeContext({
		items: [{ json: {} }],
		params: { resource: 'tag', operation: 'get', tagId: 5 },
		respond: () => {
			throw original;
		},
	});

	await assert.rejects(execute(context), (error) => error === original);
});

// ==================== NetSendo Trigger: webhook lifecycle ====================

function hookContext({ staticData = {}, respond }) {
	const { calls, helpers } = authenticatedHelpers(respond);
	const warnings = [];
	const context = {
		getNodeWebhookUrl: () => 'https://n8n.example.com/webhook/abc/webhook',
		getNodeParameter: (name) =>
			name === 'events' ? ['subscriber.created', 'sms.sent'] : undefined,
		getCredentials: async () => credentials,
		getWorkflow: () => ({ name: 'Welcome flow' }),
		getWorkflowStaticData: () => staticData,
		logger: { warn: (message) => warnings.push(message) },
		helpers,
	};
	return { context, calls, warnings, staticData };
}

const lifecycle = () => new NetSendoTrigger().webhookMethods.default;

test('activating the trigger registers the webhook and reports the node version', async () => {
	const { context, calls, staticData } = hookContext({
		respond: (options) =>
			options.url.endsWith('/webhooks') ? { data: { id: 7, secret: 'whsec' } } : { success: true },
	});

	assert.equal(await lifecycle().create.call(context), true);

	assert.equal(calls.length, 2);
	calls.forEach(assertNoManualAuth);

	const [register, heartbeat] = calls.map((call) => call.options);
	assert.equal(register.method, 'POST');
	assert.equal(register.url, 'https://ns.example.com/api/v1/webhooks');
	assert.deepEqual(register.body, {
		name: 'n8n Workflow: Welcome flow',
		url: 'https://n8n.example.com/webhook/abc/webhook',
		events: ['subscriber.created', 'sms.sent'],
	});
	assert.deepEqual(staticData, { webhookId: 7, webhookSecret: 'whsec' });

	assert.equal(heartbeat.url, 'https://ns.example.com/api/v1/plugin/heartbeat');
	assert.equal(heartbeat.body.site_url, 'https://n8n.example.com');
	assert.equal(heartbeat.body.plugin_version, NODE_VERSION);
});

test('a failing heartbeat does not stop the trigger from activating', async () => {
	const { context, staticData } = hookContext({
		respond: (options) => {
			if (options.url.endsWith('/plugin/heartbeat')) throw new Error('403');
			return { data: { id: 7, secret: 'whsec' } };
		},
	});

	assert.equal(await lifecycle().create.call(context), true);
	assert.equal(staticData.webhookId, 7);
});

test('deactivating the trigger deletes the webhook in NetSendo', async () => {
	const { context, calls, staticData, warnings } = hookContext({
		staticData: { webhookId: 7, webhookSecret: 'whsec' },
		respond: () => ({}),
	});

	assert.equal(await lifecycle().delete.call(context), true);

	assertNoManualAuth(calls[0]);
	assert.equal(calls[0].options.method, 'DELETE');
	assert.equal(calls[0].options.url, 'https://ns.example.com/api/v1/webhooks/7');
	assert.deepEqual(staticData, {});
	assert.deepEqual(warnings, []);
});

test('a webhook that cannot be deleted is logged and the trigger still deactivates', async () => {
	const { context, staticData, warnings } = hookContext({
		staticData: { webhookId: 7, webhookSecret: 'whsec' },
		respond: () => {
			throw new Error('Not Found');
		},
	});

	assert.equal(await lifecycle().delete.call(context), true);

	assert.deepEqual(staticData, {});
	assert.equal(warnings.length, 1);
	assert.match(warnings[0], /webhook 7: Not Found/);
});
