import { useState } from "react";
import { Plus, Pencil, Trash2, Mail, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Client } from "@/types";

interface ClientsPageProps {
  clients: Client[];
  onAdd: (data: { name: string; email: string; company: string }) => void;
  onUpdate: (id: string, data: Partial<Client>) => void;
  onDelete: (id: string) => void;
}

export function ClientsPage({ clients, onAdd, onUpdate, onDelete }: ClientsPageProps) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");

  const resetForm = () => {
    setName("");
    setEmail("");
    setCompany("");
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editId) {
      onUpdate(editId, { name: name.trim(), email: email.trim(), company: company.trim() });
    } else {
      onAdd({ name: name.trim(), email: email.trim(), company: company.trim() });
    }
    resetForm();
  };

  const handleEdit = (client: Client) => {
    setName(client.name);
    setEmail(client.email);
    setCompany(client.company);
    setEditId(client.id);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {clients.length} client{clients.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" /> New Client
        </Button>
      </div>

      {clients.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No clients yet. Add your first one.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {clients.map((client) => (
            <Card key={client.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{client.name}</span>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {client.company && (
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" /> {client.company}
                      </span>
                    )}
                    {client.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {client.email}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(client)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(client.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showForm} onClose={resetForm} title={editId ? "Edit Client" : "New Client"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Company</label>
            <Input
              placeholder="Acme Inc."
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              placeholder="john@acme.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={resetForm}>Cancel</Button>
            <Button type="submit">{editId ? "Save" : "Create"}</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
