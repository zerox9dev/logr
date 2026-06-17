import type { InvoiceStatus } from "@/types/database";
import { encodeShareData, decodeShareData } from "@/lib/base64";

export interface SharedInvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface SharedInvoicePayload {
  version: 1;
  invoiceNumber: string;
  status: InvoiceStatus;
  currency: string;
  clientName: string;
  issuedAt: string;
  dueDate: string | null;
  notes: string | null;
  items: SharedInvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}

export function encodeSharedInvoice(payload: SharedInvoicePayload): string {
  return encodeShareData(payload);
}

export function decodeSharedInvoice(value: string): SharedInvoicePayload | null {
  const parsed = decodeShareData<SharedInvoicePayload>(value);
  return parsed?.version === 1 ? parsed : null;
}
