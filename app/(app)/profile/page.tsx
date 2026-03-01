import type { Metadata } from "next";
import LogrApp from "@/components/logr/LogrApp";

export const metadata: Metadata = {
  title: "Profile",
  description: "Edit your profile, company details, and app preferences.",
  robots: { index: false },
};

export default function ProfilePage() {
  return <LogrApp initialScreen="profile" />;
}
