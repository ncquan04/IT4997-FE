import { Contacts } from "../../shared/contacts";
import type {
  ICreateRepairLogPayload,
  ICreateWarrantyPayload,
  IImeiLookupResponse,
  IImeiStockLookupResponse,
  IRepairLogListResponse,
  IUpdateWarrantyStatusPayload,
  IWarrantyDetail,
  IWarrantyListFilters,
  IWarrantyListResponse,
} from "../../types/warranty.types";
import { apiService } from "./api.config";

const API_PATH = Contacts.API_CONFIG;

const buildQueryParams = (filters: IWarrantyListFilters): string => {
  const params = new URLSearchParams();
  if (filters.branchId) params.append("branchId", filters.branchId);
  if (typeof filters.status === "number")
    params.append("status", String(filters.status));
  if (filters.imei?.trim()) params.append("imei", filters.imei.trim());
  if (filters.page) params.append("page", String(filters.page));
  if (filters.limit) params.append("limit", String(filters.limit));
  return params.toString();
};

// ─── Danh sách yêu cầu bảo hành ───────────────────────────────────────────────
export const fetchWarrantyList = async (
  filters: IWarrantyListFilters = {},
): Promise<IWarrantyListResponse | null> => {
  try {
    const query = buildQueryParams(filters);
    const endpoint = query
      ? `${API_PATH.WARRANTY.GET_ALL.URL}?${query}`
      : API_PATH.WARRANTY.GET_ALL.URL;
    return await apiService.get<IWarrantyListResponse>(endpoint);
  } catch (error) {
    console.log("Fetch warranty list error: ", error);
    return null;
  }
};

// ─── Chi tiết yêu cầu bảo hành ────────────────────────────────────────────────
export const fetchWarrantyById = async (
  id: string,
): Promise<IWarrantyDetail | null> => {
  try {
    const res = await apiService.get<{ data: IWarrantyDetail }>(
      API_PATH.WARRANTY.GET_DETAIL(id).URL,
    );
    return (res as any).data ?? res;
  } catch (error) {
    console.log("Fetch warranty detail error: ", error);
    return null;
  }
};

// ─── Tiếp nhận bảo hành mới ───────────────────────────────────────────────────
export const createWarrantyRequest = async (
  payload: ICreateWarrantyPayload,
): Promise<boolean> => {
  try {
    await apiService.post(API_PATH.WARRANTY.CREATE.URL, payload);
    return true;
  } catch (error) {
    console.log("Create warranty request error: ", error);
    return false;
  }
};

// ─── Cập nhật trạng thái ──────────────────────────────────────────────────────
export const updateWarrantyStatus = async (
  id: string,
  payload: IUpdateWarrantyStatusPayload,
): Promise<boolean> => {
  try {
    await apiService.patch(API_PATH.WARRANTY.UPDATE_STATUS(id).URL, payload);
    return true;
  } catch (error) {
    console.log("Update warranty status error: ", error);
    return false;
  }
};

// ─── Tra cứu lịch sử theo IMEI/Serial ────────────────────────────────────────
export const lookupWarrantyByImei = async (
  imei: string,
): Promise<IImeiLookupResponse | null> => {
  try {
    const params = new URLSearchParams({ imei });
    return await apiService.get<IImeiLookupResponse>(
      `${API_PATH.WARRANTY.LOOKUP_IMEI.URL}?${params.toString()}`,
    );
  } catch (error) {
    console.log("Lookup warranty by IMEI error: ", error);
    return null;
  }
};

// ─── Upload ảnh thiết bị ──────────────────────────────────────────────────────
export const uploadWarrantyImage = async (
  file: File,
): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiService.post<{ url: string; publicId: string }>(
      "upload/image",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } } as any,
    );
    return res?.url ?? null;
  } catch (error) {
    console.log("Upload warranty image error: ", error);
    return null;
  }
};

// ─── Tra cứu thông tin sản phẩm từ IMEI trong kho xuất ──────────────────────────────────
export const lookupImeiFromStock = async (
  imei: string,
): Promise<IImeiStockLookupResponse | null> => {
  try {
    const params = new URLSearchParams({ imei });
    return await apiService.get<IImeiStockLookupResponse>(
      `${API_PATH.WARRANTY.IMEI_STOCK_LOOKUP.URL}?${params.toString()}`,
    );
  } catch (error) {
    console.log("IMEI stock lookup error: ", error);
    return null;
  }
};

// ─── Lịch sử sửa chữa — xem ───────────────────────────────────────────────────
export const fetchRepairLogs = async (
  warrantyId: string,
): Promise<IRepairLogListResponse | null> => {
  try {
    return await apiService.get<IRepairLogListResponse>(
      API_PATH.WARRANTY.GET_REPAIR_LOGS(warrantyId).URL,
    );
  } catch (error) {
    console.log("Fetch repair logs error: ", error);
    return null;
  }
};

// ─── Lịch sử sửa chữa — thêm mới ─────────────────────────────────────────────
export const addRepairLog = async (
  warrantyId: string,
  payload: ICreateRepairLogPayload,
): Promise<boolean> => {
  try {
    await apiService.post(
      API_PATH.WARRANTY.ADD_REPAIR_LOG(warrantyId).URL,
      payload,
    );
    return true;
  } catch (error) {
    console.log("Add repair log error: ", error);
    return false;
  }
};
