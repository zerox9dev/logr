import { MarketingPage } from "@/components/marketing/marketing-page";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <MarketingPage>{children}</MarketingPage>;
}
