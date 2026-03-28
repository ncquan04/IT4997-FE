import { apiService } from "./api.config";
import { Contacts } from "../../shared/contacts";
import type { ICoupon } from "../../shared/models/coupon-model";

const API_PATH = Contacts.API_CONFIG;

export const validateCoupon = async ({
  code,
  orderTotal,
}: {
  code: string;
  orderTotal: number;
}): Promise<{ discountAmount: number; couponId: string } | null> => {
  try {
    const response = await apiService.post<{
      discountAmount: number;
      couponId: string;
    }>(API_PATH.COUPON.VALIDATE.URL, { code, orderTotal });
    return response;
  } catch (err: any) {
    throw err;
  }
};

// ── Admin ────────────────────────────────────────────────────────────────────

export const getAllCoupons = async (): Promise<ICoupon[]> => {
  try {
    const response = await apiService.get<ICoupon[]>(
      API_PATH.COUPON.GET_ALL.URL,
    );
    return response ?? [];
  } catch (err) {
    console.log("getAllCoupons error:", err);
    return [];
  }
};

export const createCoupon = async (
  data: Omit<ICoupon, "_id" | "usedCount">,
): Promise<ICoupon | null> => {
  try {
    const response = await apiService.post<ICoupon>(
      API_PATH.COUPON.CREATE.URL,
      data,
    );
    return response;
  } catch (err) {
    console.log("createCoupon error:", err);
    return null;
  }
};

export const updateCoupon = async (
  id: string,
  data: Partial<ICoupon>,
): Promise<ICoupon | null> => {
  try {
    const response = await apiService.put<ICoupon>(
      API_PATH.COUPON.UPDATE(id).URL,
      data,
    );
    return response;
  } catch (err) {
    console.log("updateCoupon error:", err);
    return null;
  }
};

export const deleteCoupon = async (id: string): Promise<boolean> => {
  try {
    await apiService.delete(API_PATH.COUPON.DELETE(id).URL);
    return true;
  } catch (err) {
    console.log("deleteCoupon error:", err);
    return false;
  }
};
