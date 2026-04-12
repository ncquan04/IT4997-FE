import { Contacts } from "../../../shared/contacts";

export const SW = Contacts.Status.Warranty;

export const STATUS_META: Record<number, { label: string; color: string }> = {
  [SW.RECEIVED]: { label: "Đã tiếp nhận", color: "bg-blue-100 text-blue-800" },
  [SW.DIAGNOSING]: { label: "Đang chẩn đoán", color: "bg-indigo-100 text-indigo-800" },
  [SW.REPAIRING]: { label: "Đang sửa chữa", color: "bg-yellow-100 text-yellow-800" },
  [SW.WAITING_PARTS]: { label: "Chờ linh kiện", color: "bg-orange-100 text-orange-800" },
  [SW.COMPLETED]: { label: "Hoàn thành", color: "bg-green-100 text-green-800" },
  [SW.RETURNED]: { label: "Đã trả khách", color: "bg-gray-100 text-gray-600" },
};

export const TRANSITIONS: Record<number, number[]> = {
  [SW.RECEIVED]: [SW.DIAGNOSING],
  [SW.DIAGNOSING]: [SW.REPAIRING, SW.WAITING_PARTS, SW.COMPLETED],
  [SW.REPAIRING]: [SW.WAITING_PARTS, SW.COMPLETED],
  [SW.WAITING_PARTS]: [SW.REPAIRING, SW.COMPLETED],
  [SW.COMPLETED]: [SW.RETURNED],
  [SW.RETURNED]: [],
};

export const PAGE_SIZE = 20;

export const formatDate = (value?: string | number) => {
  if (value === undefined || value === null || value === "") return "—";
  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const formatDateTime = (iso?: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

export const getPopulatedName = (
  field: unknown,
  fallback: (id: string) => string,
): string => {
  if (typeof field === "object" && field !== null) {
    const obj = field as Record<string, unknown>;
    if (typeof obj.name === "string") return obj.name;
    if (typeof obj.userName === "string") return obj.userName;
    if (typeof obj._id === "string") return fallback(obj._id);
  }
  if (typeof field === "string") return fallback(field);
  return "—";
};
