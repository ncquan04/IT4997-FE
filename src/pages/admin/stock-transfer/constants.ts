import { Contacts } from "../../../shared/contacts";

export const STATUS_TRANSFER = Contacts.Status.Transfer;

export const STATUS_META: Record<number, { label: string; color: string }> = {
  [STATUS_TRANSFER.PENDING]: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  [STATUS_TRANSFER.IN_TRANSIT]: { label: "In Transit", color: "bg-blue-100 text-blue-800" },
  [STATUS_TRANSFER.COMPLETED]: { label: "Completed", color: "bg-green-100 text-green-800" },
  [STATUS_TRANSFER.CANCELLED]: { label: "Cancelled", color: "bg-red-100 text-red-800" },
};

export const ALLOWED_TRANSITIONS: Record<number, number[]> = {
  [STATUS_TRANSFER.PENDING]: [STATUS_TRANSFER.IN_TRANSIT, STATUS_TRANSFER.CANCELLED],
  [STATUS_TRANSFER.IN_TRANSIT]: [STATUS_TRANSFER.COMPLETED, STATUS_TRANSFER.CANCELLED],
};

export const PAGE_SIZE = 20;

export const formatDate = (iso?: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  });
};
