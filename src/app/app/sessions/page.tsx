import { Suspense } from "react";
import { SessionsList } from "@/components/shared/sessions-list";

export default function Page() {
  return (
    <Suspense>
      <SessionsList />
    </Suspense>
  );
}
