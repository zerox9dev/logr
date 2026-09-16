"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NewClientDialog } from "@/components/dashboard/new-client-dialog";
import { useAppData } from "@/contexts/data-context";
import { useT } from "@/i18n";

/** Clients page body: name, company, email and tags, plus the "New client"
 *  entry point. Each row links to that client's detail page. */
export function ClientsList() {
  const { clients, loading } = useAppData();
  const t = useT();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="min-w-0 flex-1 overflow-x-hidden bg-page px-4 py-4 lg:px-2">
      <div className="card-radius flex min-w-0 flex-col border border-line bg-card p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-widget font-semibold text-heading">{t("sidebar.clients")}</h1>
          <Button size="sm" onClick={() => setCreateOpen(true)}>{t("new.newClient")}</Button>
        </div>

        {loading ? (
          <p className="py-8 text-center text-base text-muted-foreground">{t("common.loading")}</p>
        ) : clients.length === 0 ? (
          <p className="py-8 text-center text-base text-muted-foreground">{t("clients.noClients")}</p>
        ) : (
          <div className="flex flex-col gap-px">
            {clients.map((c) => (
              <Link
                key={c.id}
                href={`/app/clients/${c.id}`}
                className="flex flex-wrap items-center gap-3 border-b border-line py-2.5 transition-colors last:border-0 hover:bg-wash"
              >
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-md font-semibold text-heading">{c.name}</span>
                  <span className="truncate text-md-minus text-muted-foreground">
                    {[c.company, c.email].filter(Boolean).join(" · ") || "—"}
                  </span>
                </div>
                {c.tags.length > 0 && (
                  <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                    {c.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      <NewClientDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
