export const PIE_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

export const TABS = [
  { id: "revenue", label: "Revenue" },
  { id: "top-products", label: "Top Products" },
  { id: "inventory", label: "Inventory Value" },
  { id: "coupon", label: "Promotions" },
  { id: "import-cost", label: "Import Cost" },
  { id: "refund", label: "Refunds" },
  { id: "loyalty", label: "Loyalty" },
  { id: "payroll", label: "Payroll Cost" },
  { id: "rent-cost", label: "Rent Cost" },
] as const;

export type TabId = (typeof TABS)[number]["id"];

export const TIER_LABELS: Record<string, string> = {
  S_NEW: "S-New",
  S_MEM: "S-Mem",
  S_CLASS: "S-Class",
};

export const TIER_COLORS_MAP: Record<string, string> = {
  S_NEW: "bg-gray-100 text-gray-700",
  S_MEM: "bg-blue-100 text-blue-700",
  S_CLASS: "bg-yellow-100 text-yellow-700",
};
