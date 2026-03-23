'use client';

import dynamic from 'next/dynamic';

const OfferPortal = dynamic(
  () => import('@/components/offer/OfferPortal').then(mod => mod.OfferPortal),
  { ssr: false }
);

export default function OfferPage() {
  return <OfferPortal />;
}
