import type { BranchFormData } from "../../../services/api/api.branches";

export const EMPTY_FORM: BranchFormData = {
  name: "",
  address: "",
  phone: "",
  managerId: "",
  isActive: true,
  rentCost: 0,
};

export const formatRentCost = (value?: number) => {
  if (!value || value === 0) return "—";
  return value.toLocaleString("vi-VN") + " ₫";
};

export const INPUT_CLS =
  "mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-button2/30 focus:border-button2";
