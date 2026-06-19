import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

export default function AlternativesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-page min-h-screen flex flex-col">
      <MarketingHeader />
      <main className="flex-1 px-5 sm:px-8 py-16 flex justify-center">
        <div className="w-full max-w-[800px] flex flex-col gap-8">
          {children}
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
