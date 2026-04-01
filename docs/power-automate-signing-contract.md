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
  "application_id": 100123,
  "external_id": "20691280",
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

At minimum, the backend needs enough information to map the SignRequest to an application and traveler.

Send one of:

- `application_id`
- `external_id`
- `clinician_email`

And also send:

- `uuid` or `signrequest_uuid`

## Recommended matching strategy

Use this priority order when composing the payload:

1. `application_id`
2. `external_id`
3. `clinician_email`

That makes backend matching deterministic even if multiple applications share the same clinician email historically.

## Notes

- `documents` is optional but recommended. Use `["tac", "state_tac"]` when both are represented in the signing package.
- `fallback_url` is optional and is only for transition/QA. The portal should prefer the provider `embedUrl`.
- The backend will infer `clinician_email` from the signer with `needs_to_sign=true` if you omit it, but sending it explicitly is safer.
- The backend currently assumes the SignRequest API key uses token auth and fetches the latest signer `embedUrl` server-side.

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
  "return_to": "/offer?signrequest_uuid=2527b529-552b-4a25-9118-39166122843f",
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
  "magic_link": "https://portal.advantismed.com/onboarding?challenge_id=ch_abc123&magic_token=...&return_to=%2Foffer%3Fsignrequest_uuid%3D2527b529-552b-4a25-9118-39166122843f",
  "sent": false
}
```

### Recommended flow

1. Call `/api/v1/signing/signrequest-created`.
2. Call `/api/v1/auth/magic-link` with the traveler email and exact offer destination.
3. Use the returned `magic_link` in your Advantis email or SMS workflow.

### Notes

- This endpoint only supports email identifiers.
- `send_email=false` is the recommended Power Automate mode so Advantis controls the candidate-facing email.
- Set `send_email=true` only if you want the backend to send the generic auth email immediately.
