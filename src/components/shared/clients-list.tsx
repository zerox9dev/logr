"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { NewClientDialog } from "@/components/dashboard/new-client-dialog";
import { useAppData } from "@/contexts/data-context";
import { useT } from "@/i18n";

/** Clients page body: name, company, email and tags, plus the "New client"
 *  entry point. Each row links to that client's detail page. */
export function ClientsList() {
  const { clients, loading } = useAppData();
  const t = useT();
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="min-w-0 flex-1 overflow-x-hidden bg-page px-4 py-4 lg:px-2">
      <div className="card-radius flex min-w-0 flex-col border border-line bg-card p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-widget font-semibold text-heading">{t("sidebar.clients")}</h1>
          <Button size="sm" onClick={() => setCreateOpen(true)}>{t("new.newClient")}</Button>
        </div>

        <Table className="min-w-[560px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-md-minus text-muted-foreground">{t("clients.name")}</TableHead>
              <TableHead className="text-md-minus text-muted-foreground">{t("clients.company")}</TableHead>
              <TableHead className="text-md-minus text-muted-foreground">{t("clients.email")}</TableHead>
              <TableHead className="text-right text-md-minus text-muted-foreground">{t("table.tags")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading || clients.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={4} className="py-8 text-center text-base text-muted-foreground">
                  {loading ? t("common.loading") : t("clients.noClients")}
                </TableCell>
              </TableRow>
            ) : (
              clients.map((c) => (
                <TableRow
                  key={c.id}
                  onClick={() => router.push(`/app/clients/${c.id}`)}
                  className="cursor-pointer border-line hover:bg-wash"
                >
                  <TableCell className="py-2.5">
                    <Link
                      href={`/app/clients/${c.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-md font-semibold text-heading"
                    >
                      {c.name}
                    </Link>
                  </TableCell>
                  <TableCell className="py-2.5 text-md-minus text-muted-foreground">{c.company || "—"}</TableCell>
                  <TableCell className="py-2.5 text-md-minus text-muted-foreground">{c.email || "—"}</TableCell>
                  <TableCell className="py-2.5">
                    {c.tags.length > 0 ? (
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        {c.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="block text-right text-md-minus text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <NewClientDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
