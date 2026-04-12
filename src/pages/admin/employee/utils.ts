export const formatDate = (ts?: number) => {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-GB");
};

export const formatCurrency = (n?: number) => {
  if (n === undefined || n === null) return "—";
  return n.toLocaleString("vi-VN") + " ₫";
};

export const getBranchName = (branchId: any): string => {
  if (!branchId) return "—";
  if (typeof branchId === "object") return branchId.name ?? "—";
  return branchId;
};
