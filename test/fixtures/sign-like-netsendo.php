<?php

/*
 * Signs a webhook payload exactly the way NetSendo does, and prints it as the
 * test fixture:
 *
 *   php test/fixtures/sign-like-netsendo.php > test/fixtures/netsendo-signed.json
 *
 * Mirrors App\Services\WebhookDispatcher::send() and App\Models\Webhook::sign()
 * in the NetSendo app: json_encode() with PHP's default flags (which escape "/"
 * and every non-ASCII character), then hash_hmac('sha256', ...) over that
 * string. The secret is a fixed 64-character stand-in for Str::random(64).
 */

$secret = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01';

$payload = [
    'event' => 'subscriber.created',
    'timestamp' => '2026-11-07T10:15:30.123456Z',
    'data' => [
        'subscriber_id' => 42,
        'email' => 'jan.kowalski@example.com',
        'first_name' => 'Zażółć',
        'last_name' => 'Gęślą Jaźń',
        'source_url' => 'https://example.com/zapisz-sie?ref=n8n&utm=a/b',
        'list' => ['id' => 7, 'name' => 'Newsletter — €uro'],
    ],
];

$body = json_encode($payload);

echo json_encode([
    'secret' => $secret,
    'body' => $body,
    'signature' => hash_hmac('sha256', $body, $secret),
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), "\n";
