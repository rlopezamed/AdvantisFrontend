'use client';

import dynamic from 'next/dynamic';

const OfferSigningComplete = dynamic(
  () => import('@/components/offer/OfferSigningComplete').then((mod) => mod.OfferSigningComplete),
  { ssr: false },
);

export default function OfferSigningCompletePage() {
  return <OfferSigningComplete />;
}
