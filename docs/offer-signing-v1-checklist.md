# Offer Signing V1 Checklist

This checklist tracks the first embedded-signing rollout for Travel Assignment Confirmation in the clinician portal.

## Backend

- Add `offer_signing_sessions` persistence for provider request metadata and portal status.
- Accept Power Automate handoff at `POST /api/v1/signing/signrequest-created`.
- Sync traveler signer state from SignRequest at `GET /api/v1/signing/me/session`.
- Add SignRequest env vars:
  - `SIGNREQUEST_API_KEY`
  - `SIGNREQUEST_API_BASE_URL`
  - `SIGNREQUEST_TIMEOUT_SECONDS`
- Verify the SignRequest auth header against the production account before go-live.
- Add webhook ingestion for signed and declined events.
- Persist completed PDF and signing log URLs or downloaded file references.

## Frontend

- Replace the demo signature pad with backend-driven signing session states.
- Render the provider `embedUrl` inside the offer page when ready.
- Handle `preparing`, `ready`, `signed`, `declined`, `auth-required`, and `error` states.
- Add refresh behavior after redirect or manual status checks.
- Keep a fallback “open signer in new tab” path during rollout.

## Power Automate

- Continue generating TAC and state TAC.
- After SignRequest creation, post the SignRequest UUID and traveler mapping into the backend.
- Decide whether to pass a fallback signer URL during the transition period.
- Keep SignRequest emails enabled during QA.
- Switch to Advantis portal email and `disable_emails=true` after portal flow is approved.

## QA

- Verify an authenticated traveler can load the embedded signer.
- Verify a traveler without a portal session sees the auth-required state.
- Verify signed documents move the portal to the `signed` state.
- Verify declined documents move the portal to the `declined` state.
- Verify refresh updates status after provider completion.
- Verify mobile and desktop iframe behavior.
