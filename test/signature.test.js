'use strict';

/*
 * Webhook signature verification against payloads signed the way NetSendo
 * signs them. Runs on the compiled output: `npm test` builds first.
 *
 * The fixture comes from test/fixtures/sign-like-netsendo.php, which mirrors
 * NetSendo's WebhookDispatcher (PHP json_encode + hash_hmac sha256).
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { createHmac } = require('node:crypto');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

const { isValidNetSendoSignature } = require('../dist/nodes/NetSendo/shared/signature.js');
const { NetSendoTrigger } = require('../dist/nodes/NetSendo/NetSendoTrigger.node.js');

const fixture = require('./fixtures/netsendo-signed.json');
const { secret, body, signature } = fixture;

/** Flip the last hex digit of a signature. */
const flipLastHexDigit = (hex) => hex.slice(0, -1) + (hex.endsWith('0') ? '1' : '0');

test('fixture is what PHP produces today', (t) => {
	let output;
	try {
		output = execFileSync('php', [path.join(__dirname, 'fixtures', 'sign-like-netsendo.php')], {
			encoding: 'utf8',
		});
	} catch (error) {
		if (error.code === 'ENOENT') {
			t.skip('php is not installed');
			return;
		}
		throw error;
	}

	assert.deepEqual(JSON.parse(output), fixture);
});

test('fixture carries the bytes that broke 1.3.2: escaped slashes and \\u escapes', () => {
	assert.ok(body.includes('https:\\/\\/example.com\\/'), 'PHP escapes "/"');
	assert.ok(body.includes('Za\\u017c\\u00f3\\u0142\\u0107'), 'PHP escapes non-ASCII');
	assert.equal(JSON.parse(body).data.first_name, 'Zażółć');
	assert.equal(JSON.parse(body).data.source_url, 'https://example.com/zapisz-sie?ref=n8n&utm=a/b');
});

test('1.3.2 algorithm (HMAC of JSON.stringify(parsed body)) rejects a genuine delivery', () => {
	const reserialised = JSON.stringify(JSON.parse(body));
	assert.notEqual(reserialised, body);

	const oldExpected = createHmac('sha256', secret).update(reserialised).digest('hex');
	assert.notEqual(oldExpected, signature);
});

test('accepts a NetSendo-signed payload with a URL and Polish characters', () => {
	assert.equal(isValidNetSendoSignature(Buffer.from(body, 'utf8'), signature, secret), true);
	assert.equal(isValidNetSendoSignature(body, signature, secret), true);
	assert.equal(isValidNetSendoSignature(body, signature.toUpperCase(), secret), true);
	assert.equal(isValidNetSendoSignature(body, ` ${signature}\n`, secret), true);
});

test('rejects a tampered body', () => {
	const tampered = body.replace('jan.kowalski@example.com', 'attacker@example.com');
	assert.notEqual(tampered, body);
	assert.equal(isValidNetSendoSignature(Buffer.from(tampered, 'utf8'), signature, secret), false);

	// Even a change that keeps the same JSON value is a different byte string.
	const unescaped = JSON.stringify(JSON.parse(body));
	assert.equal(isValidNetSendoSignature(unescaped, signature, secret), false);
});

test('rejects a wrong, missing or malformed signature', () => {
	assert.equal(isValidNetSendoSignature(body, flipLastHexDigit(signature), secret), false);
	assert.equal(isValidNetSendoSignature(body, signature, secret.replace('0', 'x')), false);
	assert.equal(isValidNetSendoSignature(body, undefined, secret), false);
	assert.equal(isValidNetSendoSignature(body, '', secret), false);
	assert.equal(isValidNetSendoSignature(body, signature.slice(0, 62), secret), false);
	assert.equal(isValidNetSendoSignature(body, `${signature}00`, secret), false);
	assert.equal(isValidNetSendoSignature(body, `sha256=${signature}`, secret), false);
	assert.equal(isValidNetSendoSignature(body, 'z'.repeat(64), secret), false);
	assert.equal(isValidNetSendoSignature(body, [signature, signature], secret), false);
	assert.equal(isValidNetSendoSignature(body, signature, ''), false);
});

/**
 * Minimal stand-in for n8n's IWebhookFunctions: the request carries the raw
 * body the way n8n's body parser leaves it (req.rawBody), and the response
 * records what the node writes.
 */
function webhookContext({ raw, headers = {}, staticData = {}, lazyRawBody = false }) {
	const rawBuffer = Buffer.from(raw, 'utf8');
	const req = { headers };
	if (lazyRawBody) {
		req.readRawBody = async () => {
			req.rawBody = rawBuffer;
		};
	} else {
		req.rawBody = rawBuffer;
	}

	const res = {
		statusCode: undefined,
		sent: undefined,
		writeHead(code) {
			this.statusCode = code;
			return this;
		},
		end(chunk) {
			this.sent = chunk;
			return this;
		},
	};

	const context = {
		getRequestObject: () => req,
		getResponseObject: () => res,
		getWorkflowStaticData: () => staticData,
		getBodyData: () => JSON.parse(raw),
		helpers: { returnJsonArray: (data) => [{ json: data }] },
	};

	return { context, res };
}

const runTrigger = (context) => new NetSendoTrigger().webhook.call(context);
const registered = { webhookId: 1, webhookSecret: secret };

test('trigger starts the workflow for a genuine delivery', async () => {
	const { context, res } = webhookContext({
		raw: body,
		headers: { 'x-netsendo-signature': signature },
		staticData: registered,
	});

	const result = await runTrigger(context);

	assert.equal(res.statusCode, undefined);
	assert.equal(result.noWebhookResponse, undefined);
	assert.equal(result.workflowData[0][0].json.data.first_name, 'Zażółć');
	assert.equal(
		result.workflowData[0][0].json.data.source_url,
		'https://example.com/zapisz-sie?ref=n8n&utm=a/b',
	);
});

test('trigger reads the raw body itself when n8n has not read it yet', async () => {
	const { context } = webhookContext({
		raw: body,
		headers: { 'x-netsendo-signature': signature },
		staticData: registered,
		lazyRawBody: true,
	});

	const result = await runTrigger(context);

	assert.ok(result.workflowData, 'workflow should start');
});

test('trigger answers 401 and does not start the workflow for a tampered body', async () => {
	const { context, res } = webhookContext({
		raw: body.replace('"subscriber_id":42', '"subscriber_id":43'),
		headers: { 'x-netsendo-signature': signature },
		staticData: registered,
	});

	const result = await runTrigger(context);

	assert.deepEqual(result, { noWebhookResponse: true });
	assert.equal(res.statusCode, 401);
	assert.equal(res.sent, 'Invalid signature');
});

test('trigger answers 401 when the signature header is missing', async () => {
	const { context, res } = webhookContext({ raw: body, staticData: registered });

	const result = await runTrigger(context);

	assert.deepEqual(result, { noWebhookResponse: true });
	assert.equal(res.statusCode, 401);
});

test('trigger without a stored secret passes the delivery through, as before', async () => {
	const { context, res } = webhookContext({ raw: body, staticData: {} });

	const result = await runTrigger(context);

	assert.equal(res.statusCode, undefined);
	assert.ok(result.workflowData, 'workflow should start');
});
