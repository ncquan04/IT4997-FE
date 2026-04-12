export const fmt = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

export const fmtNum = (n: number) => new Intl.NumberFormat("vi-VN").format(n);

export const fmtTooltip = (
  v: number | string | readonly (string | number)[] | undefined,
): string => (typeof v === "number" ? fmt(v) : String(v ?? ""));
