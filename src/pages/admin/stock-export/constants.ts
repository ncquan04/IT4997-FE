import { Contacts } from "../../../shared/contacts";
import type { ExportReason } from "../../../types/stock-export.types";

export const STATUS_STOCK = Contacts.Status.Stock;

export const STATUS_META: Record<number, { label: string; color: string }> = {
  [STATUS_STOCK.PENDING]: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  [STATUS_STOCK.COMPLETED]: { label: "Completed", color: "bg-green-100 text-green-800" },
  [STATUS_STOCK.CANCELLED]: { label: "Cancelled", color: "bg-red-100 text-red-800" },
};

export const ALLOWED_TRANSITIONS: Record<number, number[]> = {
  [STATUS_STOCK.PENDING]: [STATUS_STOCK.COMPLETED, STATUS_STOCK.CANCELLED],
};

export const REASON_LABELS: Record<ExportReason, string> = {
  SALE: "Bán tại quầy",
  ONLINE_SALE: "Bán online",
  RETURN_TO_SUPPLIER: "Return to Supplier",
  DAMAGED: "Damaged",
  OTHER: "Other",
};

export const REASON_COLORS: Record<ExportReason, string> = {
  SALE: "bg-blue-100 text-blue-800",
  ONLINE_SALE: "bg-indigo-100 text-indigo-800",
  RETURN_TO_SUPPLIER: "bg-purple-100 text-purple-800",
  DAMAGED: "bg-red-100 text-red-800",
  OTHER: "bg-gray-100 text-gray-700",
};

export const PAGE_SIZE = 20;

export const formatDate = (iso?: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  });
};
