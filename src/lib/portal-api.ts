'use client';

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

export type OfferSigningSession = {
  provider: string;
  status: 'preparing' | 'ready' | 'signed' | 'declined' | 'error';
  documents: string[];
  embedUrl: string | null;
  fallbackUrl: string | null;
  signed: boolean;
  declined: boolean;
  signedAt: string | null;
  declinedAt: string | null;
  lastSyncedAt: string | null;
};

export class PortalApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'PortalApiError';
  }
}

export async function getMyOfferSigningSession(params?: {
  signrequestUuid?: string | null;
  offerUuid?: string | null;
}): Promise<OfferSigningSession> {
  const search = new URLSearchParams();
  if (params?.offerUuid) search.set('offer_uuid', params.offerUuid);
  else if (params?.signrequestUuid) search.set('signrequest_uuid', params.signrequestUuid);

  const endpoint = search.size
    ? `${API_BASE}/signing/me/session?${search.toString()}`
    : `${API_BASE}/signing/me/session`;

  const response = await fetch(endpoint, {
    credentials: 'include',
    cache: 'no-store',
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail =
      typeof payload?.detail === 'string' ? payload.detail : 'Failed to load signing session';
    throw new PortalApiError(detail, response.status);
  }

  return payload as OfferSigningSession;
}
