export const STATUS_META: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-600" },
  CONFIRMED: { label: "Confirmed", color: "bg-blue-100 text-blue-700" },
  PAID: { label: "Paid", color: "bg-green-100 text-green-700" },
};

export const formatCurrency = (n: number) => n.toLocaleString("vi-VN") + " ₫";

export const getEmployeeName = (emp: any) => {
  if (!emp) return "—";
  if (typeof emp === "object") return emp.userName ?? "—";
  return emp;
};
