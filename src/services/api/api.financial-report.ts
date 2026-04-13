import { Contacts } from "../../shared/contacts";
import { apiService } from "./api.config";

const BASE = Contacts.FINANCIAL_REPORT_PATH;

export interface FinancialReportParams {
  from?: number; // Unix ms timestamp
  to?: number; // Unix ms timestamp
  branchId?: string;
  granularity?: "day" | "month" | "year";
  limit?: number;
  groupBy?: "supplier" | "branch";
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TopProductItem {
  _id: string;
  title: string;
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  grossMarginPct: number;
  totalQuantity: number;
  orderCount: number;
}

export interface InventoryBranchItem {
  _id: string;
  branchName: string;
  totalCostValue: number;
  totalSaleValue: number;
  totalItems: number;
  uniqueVariants: number;
}

export interface InventoryValueResponse {
  summary: {
    totalCostValue: number;
    totalSaleValue: number;
    totalItems: number;
  };
  byBranch: InventoryBranchItem[];
}

export interface RevenueTimeItem {
  _id: string; // e.g. "2026-04"
  totalRevenue: number;
  totalDiscount: number;
  grossProfit: number;
  orderCount: number;
}

export interface RevenueBranchItem {
  _id: string | null;
  branchName: string;
  totalRevenue: number;
  grossProfit: number;
  orderCount: number;
  totalDiscount: number;
}

export interface CouponSummary {
  totalRevenue: number;
  totalCouponDiscount: number;
  totalMemberDiscount: number;
  totalPointsDiscount: number;
  ordersWithCoupon: number;
  ordersWithMemberDiscount: number;
  ordersWithPointsDiscount: number;
  orderCount: number;
}

export interface CouponItem {
  _id: string;
  usedCount: number;
  totalDiscount: number;
  totalRevenue: number;
}

export interface ImportCostItem {
  _id: string;
  name: string;
  totalCost: number;
  importCount: number;
  totalItems: number;
}

export interface RefundSummary {
  totalRefundAmount: number;
  refundCount: number;
}

export interface PayrollCostSummary {
  totalBaseSalary: number;
  totalAllowances: number;
  totalDeductions: number;
  totalActualSalary: number;
  employeeCount: number;
}

export interface PayrollCostBranchItem {
  _id: string;
  branchName: string;
  totalActualSalary: number;
  employeeCount: number;
}

export interface PayrollCostTimeItem {
  _id: string; // "YYYY-MM"
  totalActualSalary: number;
  employeeCount: number;
}

export interface LoyaltySummary {
  byType: { _id: string; totalPoints: number; transactionCount: number }[];
  overTime: { _id: string; pointsEarned: number; count: number }[];
  tierDist: {
    _id: string;
    userCount: number;
    totalLoyaltyPoints: number;
    avgTotalSpent: number;
  }[];
  tierConfigs: { tier: string; minSpent: number; discountPercent: number }[];
}

export interface RentCostSummary {
  totalRentCost: number;
  totalActiveRentCost: number;
  branchCount: number;
  activeBranchCount: number;
}

export interface RentCostBranchItem {
  _id: string;
  branchName: string;
  rentCost: number;
  isActive: boolean;
}

// ─── API calls ───────────────────────────────────────────────────────────────

function toParams(p: FinancialReportParams): Record<string, string> {
  const out: Record<string, string> = {};
  if (p.from !== undefined) out.from = String(p.from);
  if (p.to !== undefined) out.to = String(p.to);
  if (p.branchId) out.branchId = p.branchId;
  if (p.granularity) out.granularity = p.granularity;
  if (p.limit !== undefined) out.limit = String(p.limit);
  if (p.groupBy) out.groupBy = p.groupBy;
  return out;
}

export const financialReportApi = {
  getTopProducts: async (
    params: FinancialReportParams = {},
  ): Promise<{ data: TopProductItem[] }> =>
    apiService.get(`${BASE}/top-products`, { params: toParams(params) }),

  getInventoryValue: async (
    params: FinancialReportParams = {},
  ): Promise<InventoryValueResponse> =>
    apiService.get(`${BASE}/inventory-value`, { params: toParams(params) }),

  getRevenueOverTime: async (
    params: FinancialReportParams = {},
  ): Promise<{ granularity: string; data: RevenueTimeItem[] }> =>
    apiService.get(`${BASE}/revenue-over-time`, { params: toParams(params) }),

  getRevenueByBranch: async (
    params: FinancialReportParams = {},
  ): Promise<{ data: RevenueBranchItem[] }> =>
    apiService.get(`${BASE}/revenue-by-branch`, { params: toParams(params) }),

  getCouponImpact: async (
    params: FinancialReportParams = {},
  ): Promise<{ summary: CouponSummary; byCoupon: CouponItem[] }> =>
    apiService.get(`${BASE}/coupon-impact`, { params: toParams(params) }),

  getImportCost: async (
    params: FinancialReportParams = {},
  ): Promise<{
    groupBy: string;
    summary: { totalCost: number; importCount: number };
    data: ImportCostItem[];
  }> => apiService.get(`${BASE}/import-cost`, { params: toParams(params) }),

  getRefundSummary: async (
    params: FinancialReportParams = {},
  ): Promise<{
    summary: RefundSummary;
    byReason: { _id: string; totalAmount: number; count: number }[];
    byBranch: {
      _id: string;
      branchName: string;
      totalAmount: number;
      count: number;
    }[];
    overTime: { _id: string; totalAmount: number; count: number }[];
  }> => apiService.get(`${BASE}/refund-summary`, { params: toParams(params) }),

  getLoyaltySummary: async (
    params: FinancialReportParams = {},
  ): Promise<LoyaltySummary> =>
    apiService.get(`${BASE}/loyalty-summary`, { params: toParams(params) }),

  getPayrollCost: async (params: FinancialReportParams & {
    month?: number;
    year?: number;
  } = {}): Promise<{
    summary: PayrollCostSummary;
    byBranch: PayrollCostBranchItem[];
    overTime: PayrollCostTimeItem[];
  }> => {
    const p: Record<string, string> = { ...toParams(params) };
    if (params.month !== undefined) p.month = String(params.month);
    if (params.year !== undefined) p.year = String(params.year);
    return apiService.get(`${BASE}/payroll-cost`, { params: p });
  },

  getRentCost: async (params: FinancialReportParams = {}): Promise<{
    summary: RentCostSummary;
    byBranch: RentCostBranchItem[];
  }> => apiService.get(`${BASE}/rent-cost`, { params: toParams(params) }),
};
