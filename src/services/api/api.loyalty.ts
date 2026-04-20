import { apiService } from "./index";

const BASE = "api/loyalty";

export interface IMemberInfo {
  memberTier: "S_NEW" | "S_MEM" | "S_CLASS";
  loyaltyPoints: number;
  totalSpent: number;
  spentInWindow: number;
  windowStartAt: number;
  windowEndsAt: number;
  discountPercent: number;
  nextTier: { tier: string; remaining: number } | null;
}

export interface IPointTransaction {
  _id: string;
  type: "EARN" | "REDEEM" | "EXPIRE";
  points: number;
  orderId?: { _id: string; sumPrice: number } | string | null;
  expiresAt?: number | null;
  expired?: boolean;
  note?: string;
  createdAt: string;
}

export interface ITierConfig {
  _id: string;
  tier: "S_NEW" | "S_MEM" | "S_CLASS";
  minSpent: number;
  discountPercent: number;
  isActive: boolean;
}

/** Lấy thông tin hạng thành viên của user hiện tại */
export const getMyMemberInfo = async (): Promise<IMemberInfo | null> => {
  try {
    const res = await apiService.get<{ data: IMemberInfo }>(`${BASE}/me`);
    return res.data;
  } catch {
    return null;
  }
};

/** Lấy lịch sử tích/đổi điểm */
export const getMyPointHistory = async (
  page = 1,
  limit = 20,
): Promise<{ data: IPointTransaction[]; total: number } | null> => {
  try {
    const res = await apiService.get<{
      data: IPointTransaction[];
      pagination: { total: number };
    }>(`${BASE}/me/history?page=${page}&limit=${limit}`);
    return { data: res.data, total: res.pagination.total };
  } catch {
    return null;
  }
};

/** Preview đổi điểm: kiểm tra hợp lệ + số tiền được giảm */
export const previewRedemption = async (
  points: number,
): Promise<{
  valid: boolean;
  discountAmount: number;
  message?: string;
} | null> => {
  try {
    const res = await apiService.post<{
      data: { valid: boolean; discountAmount: number };
    }>(`${BASE}/me/redeem-preview`, { points });
    return res.data;
  } catch {
    return null;
  }
};

/** Lấy danh sách cấu hình các hạng (public) */
export const getTierConfigs = async (): Promise<ITierConfig[]> => {
  try {
    const res = await apiService.get<{ data: ITierConfig[] }>(`${BASE}/tiers`);
    return res.data;
  } catch {
    return [];
  }
};

/** Admin: cập nhật cấu hình hạng */
export const updateTierConfig = async (
  tier: string,
  body: Partial<Pick<ITierConfig, "minSpent" | "discountPercent" | "isActive">>,
): Promise<ITierConfig | null> => {
  try {
    const res = await apiService.put<{ data: ITierConfig }>(
      `${BASE}/tiers/${tier}`,
      body,
    );
    return res.data;
  } catch {
    return null;
  }
};

export interface IAdminMember {
  _id: string;
  userName: string;
  email: string;
  phoneNumber?: string;
  memberTier: "S_NEW" | "S_MEM" | "S_CLASS";
  loyaltyPoints: number;
  totalSpent: number;
  spentInWindow: number;
  windowStartAt: number;
}

/** Admin: lấy danh sách thành viên */
export const getAdminMemberList = async (
  page = 1,
  limit = 20,
  tier?: string,
): Promise<{
  data: IAdminMember[];
  total: number;
  totalPages: number;
} | null> => {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (tier) params.set("tier", tier);
    const res = await apiService.get<{
      data: IAdminMember[];
      pagination: { total: number; totalPages: number };
    }>(`${BASE}/admin/users?${params.toString()}`);
    return {
      data: res.data,
      total: res.pagination.total,
      totalPages: res.pagination.totalPages,
    };
  } catch {
    return null;
  }
};