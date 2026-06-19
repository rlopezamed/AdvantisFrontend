# Power Automate Signing Contract

This is the preferred handoff from Power Automate into the Advantis backend for Travel Assignment Confirmation signing.

## Endpoint

`POST {BACKEND_API_BASE}/api/v1/signing/signrequest-created`

## Headers

```http
Content-Type: application/json
X-API-Key: {INTERNAL_API_KEY}
```

## Recommended payload

This shape works with the backend as implemented and stays close to the SignRequest connector output.

```json
{
  "offer_external_id": "20691280",
  "clinician_email": "kristynwakefield@yahoo.com",
  "documents": ["tac", "state_tac"],
  "fallback_url": "https://amedhr.signrequest.com/r/document/.../signer_token=...",
  "uuid": "2527b529-552b-4a25-9118-39166122843f",
  "url": "https://signrequest.com/api/v1/signrequests/2527b529-552b-4a25-9118-39166122843f/",
  "document": "https://signrequest.com/api/v1/documents/22ba8705-3778-4adb-9754-99108f660973/",
  "is_being_prepared": true,
  "prepare_url": "https://amedhr.signrequest.com/r/document/.../prepare_doc/?signer_token=...",
  "redirect_url": "https://portal.advantismed.com/offer/signing/complete",
  "subject": "Kristyn Hall: Welcome to Advantis Medical - Review Travel Assignment at Procare - Lakewood Emergency Room",
  "message": "Hello & welcome to Advantis Medical!...",
  "signers": [
    {
      "email": "hr@advantismed.com",
      "display_name": "Advantis Medical (hr@advantismed.com)",
      "needs_to_sign": false,
      "redirect_url": "https://portal.advantismed.com/offer/signing/complete"
    },
    {
      "email": "kristynwakefield@yahoo.com",
      "display_name": "Kristyn Hall (kristynwakefield@yahoo.com)",
      "needs_to_sign": true,
      "redirect_url": "https://portal.advantismed.com/offer/signing/complete"
    }
  ]
}
```

## Required fields

At minimum, the backend needs enough information to map the SignRequest to an offer or traveler.

Send one of:

- `offer_uuid`
- `offer_external_id` or `external_id`
- `application_id`
- `clinician_email`

And also send:

- `uuid` or `signrequest_uuid`

## Recommended matching strategy

Use this priority order when composing the payload:

1. `offer_uuid`
2. `offer_external_id` or `external_id`
3. `application_id`
4. `clinician_email`

That makes backend matching deterministic even if multiple applications or offers share the same clinician email historically.

## Notes

- `documents` is optional but recommended. Use `["tac", "state_tac"]` when both are represented in the signing package.
- `fallback_url` is optional and is only for transition/QA. The portal should prefer the provider `embedUrl`.
- The backend will infer `clinician_email` from the signer with `needs_to_sign=true` if you omit it, but sending it explicitly is safer.
- The backend currently assumes the SignRequest API key uses token auth and fetches the latest signer `embedUrl` server-side.

## Recommended live sequence

Use this order in Power Automate for the portal-first signing flow:

1. Generate TAC and state TAC.
2. Create the SignRequest in preparation mode if needed.
3. Add signers and notifiers.
4. Finalize/send the SignRequest.
5. Call `/api/v1/signing/signrequest-created`.
6. Read the returned `offer_uuid`.
7. Call `/api/v1/auth/magic-link` with that exact `offer_uuid`.
8. Email the returned `magic_link` to the traveler from your Advantis workflow.

Important:

- If you register the SignRequest before finalize/send, the portal will usually show `preparing`.
- The embedded signer appears only after the provider returns a real signer `embedUrl`.
- The safest user experience is to send the portal email only after SignRequest has been finalized.

## Optional direct-to-offer magic link

If you want Power Automate to send a one-click portal link instead of a generic sign-in prompt, call the auth service after `signrequest-created`.

### Endpoint

`POST {BACKEND_API_BASE}/api/v1/auth/magic-link`

### Headers

```http
Content-Type: application/json
X-API-Key: {INTERNAL_API_KEY}
```

### Payload

```json
{
  "identifier": "kristynwakefield@yahoo.com",
  "offer_uuid": "off_1234567890abcdef",
  "return_to": "/offer?offer_uuid=off_1234567890abcdef",
  "send_email": false
}
```

### Response

```json
{
  "challenge_id": "ch_abc123",
  "method": "email",
  "masked_destination": "kr***@yahoo.com",
  "expires_at": "2026-04-01T18:30:00+00:00",
  "magic_link": "https://portal.advantismed.com/onboarding?challenge_id=ch_abc123&magic_token=...&return_to=%2Foffer%3Foffer_uuid%3Doff_1234567890abcdef",
  "sent": false
}
```

### Recommended flow

1. Call `/api/v1/signing/signrequest-created` after the SignRequest has been finalized.
2. Read `offer_uuid` from the response.
3. Call `/api/v1/auth/magic-link` with the traveler email, that same `offer_uuid`, and `return_to=/offer?offer_uuid=...`.
4. Use the returned `magic_link` in your Advantis email or SMS workflow.

### Notes

- This endpoint only supports email identifiers.
- `send_email=false` is the recommended Power Automate mode so Advantis controls the candidate-facing email.
- Set `send_email=true` only if you want the backend to send the generic auth email immediately.
