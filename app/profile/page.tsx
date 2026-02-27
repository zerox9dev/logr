import type { Metadata } from "next";
import LogrApp from "@/components/logr/LogrApp";

export const metadata: Metadata = {
  title: "Profile",
  description: "User profile and app settings.",
};

export default function ProfilePage() {
  return <LogrApp initialScreen="profile" />;
}
