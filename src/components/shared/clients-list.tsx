"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { NewClientDialog } from "@/components/dashboard/new-client-dialog";
import { useAppData } from "@/contexts/data-context";
import { useT } from "@/i18n";
import { initials } from "@/lib/format";

/** Clients page body: name, company, email and tags, plus the "New client"
 *  entry point. Each row links to that client's detail page. */
export function ClientsList() {
  const { clients, loading } = useAppData();
  const t = useT();
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="min-w-0 flex-1 overflow-x-hidden bg-page divide-y divide-line">
      <div className="flex min-w-0 flex-col bg-card px-6 py-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-[20px] font-semibold tracking-[-0.01em] text-heading">{t("sidebar.clients")}</h1>
          <Button size="sm" onClick={() => setCreateOpen(true)}>{t("new.newClient")}</Button>
        </div>

        {!loading && clients.length === 0 ? (
          <EmptyState
            icon={Users}
            headline={t("clients.noClients")}
            action={<Button onClick={() => setCreateOpen(true)}>{t("new.newClient")}</Button>}
          />
        ) : (
        <Table className="min-w-[560px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-md-minus text-muted-foreground">{t("clients.name")}</TableHead>
              <TableHead className="text-md-minus text-muted-foreground">{t("client.typeLabel")}</TableHead>
              <TableHead className="text-md-minus text-muted-foreground">{t("clients.company")}</TableHead>
              <TableHead className="text-md-minus text-muted-foreground">{t("clients.email")}</TableHead>
              <TableHead className="text-right text-md-minus text-muted-foreground">{t("table.tags")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="py-8 text-center text-base text-muted-foreground">
                  {t("common.loading")}
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
                      className="flex items-center gap-2.5 text-md font-semibold text-heading"
                    >
                      <Avatar size="sm">
                        <AvatarFallback>{initials(c.name)}</AvatarFallback>
                      </Avatar>
                      {c.name}
                    </Link>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <Badge variant={c.client_type === "employer" ? "default" : "secondary"}>
                      {c.client_type === "employer" ? t("client.type.employer") : t("client.type.client")}
                    </Badge>
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
        )}
      </div>

      <NewClientDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
