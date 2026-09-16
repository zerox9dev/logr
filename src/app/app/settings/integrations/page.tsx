import { Suspense } from "react";
import { IntegrationsPanel } from "@/components/shared/integrations-panel";

export default function Page() {
  return (
    <Suspense>
      <IntegrationsPanel />
    </Suspense>
  );
}
