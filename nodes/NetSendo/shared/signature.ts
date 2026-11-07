import { createHmac, timingSafeEqual } from 'crypto';

/** HMAC-SHA256 as lowercase or uppercase hex, without any prefix. */
const SIGNATURE_PATTERN = /^[0-9a-f]{64}$/i;

/**
 * Check the X-NetSendo-Signature header of a webhook delivery.
 *
 * NetSendo signs the exact bytes it sends:
 * `hash_hmac('sha256', json_encode($payload), $secret)`. PHP's json_encode
 * escapes "/" and every non-ASCII character ("https:\/\/…", "Zaż…"), so
 * the signature must be checked against the raw request body. Re-serialising
 * the parsed body with JSON.stringify produces different bytes for any payload
 * with a URL or a Polish name, and the check would fail.
 *
 * The comparison runs in constant time on equal-length buffers.
 *
 * @param rawBody   request body exactly as received
 * @param signature value of the X-NetSendo-Signature header
 * @param secret    signing secret NetSendo returned when the webhook was created
 */
export function isValidNetSendoSignature(
	rawBody: Buffer | string,
	signature: string | string[] | undefined,
	secret: string,
): boolean {
	if (!secret || typeof signature !== 'string') {
		return false;
	}

	const received = signature.trim();
	if (!SIGNATURE_PATTERN.test(received)) {
		return false;
	}

	const expected = createHmac('sha256', secret).update(rawBody).digest();
	const given = Buffer.from(received, 'hex');

	return given.length === expected.length && timingSafeEqual(given, expected);
}
