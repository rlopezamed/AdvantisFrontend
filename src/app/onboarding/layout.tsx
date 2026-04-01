import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clinician Onboarding",
  description: "Secure identity verification, onboarding tasks, and credentialing for Advantis Medical clinicians.",
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
