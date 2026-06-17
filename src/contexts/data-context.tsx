import { createContext, useContext, type ReactNode } from "react";
import { useData } from "@/lib/use-data";

type DataContextType = ReturnType<typeof useData>;

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const data = useData();
  return <DataContext.Provider value={data}>{children}</DataContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook colocated with its provider by design
export function useAppData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useAppData must be inside DataProvider");
  return ctx;
}
