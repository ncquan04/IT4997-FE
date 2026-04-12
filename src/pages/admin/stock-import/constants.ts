import { Contacts } from "../../../shared/contacts";

export const STATUS_STOCK = Contacts.Status.Stock;

export const STATUS_META: Record<number, { label: string; color: string }> = {
  [STATUS_STOCK.PENDING]: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  [STATUS_STOCK.COMPLETED]: { label: "Completed", color: "bg-green-100 text-green-800" },
  [STATUS_STOCK.CANCELLED]: { label: "Cancelled", color: "bg-red-100 text-red-800" },
};

export const ALLOWED_TRANSITIONS: Record<number, number[]> = {
  [STATUS_STOCK.PENDING]: [STATUS_STOCK.COMPLETED, STATUS_STOCK.CANCELLED],
};

export const PAGE_SIZE = 20;

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);

export const formatDate = (iso?: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  });
};
