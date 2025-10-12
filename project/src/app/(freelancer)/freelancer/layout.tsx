// app/(freelancer)/layout.tsx
import type { ReactNode } from "react";
import FreelancerShell from "@/components/freelancer/FreelancerShell";

export default function FreelancerLayout({ children }: { children: ReactNode }) {
  // Server component — no <html>/<body> here.
  return <FreelancerShell>{children}</FreelancerShell>;
}
