import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Traveler Assignment Confirmation",
  description: "Review and electronically sign your Advantis Medical assignment confirmation.",
};

export default function OfferLayout({ children }: { children: React.ReactNode }) {
  return children;
}
