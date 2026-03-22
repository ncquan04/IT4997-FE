import { Contacts } from "../../shared/contacts";
import type {
  ICreateStockExportPayload,
  IImeiLookupResult,
  IShipOrderPayload,
  IStockExportDetail,
  IStockExportListFilters,
  IStockExportListResponse,
  IUpdateStockExportStatusPayload,
} from "../../types/stock-export.types";
import { apiService } from "./api.config";

const API_PATH = Contacts.API_CONFIG;

const buildQueryParams = (filters: IStockExportListFilters): string => {
  const params = new URLSearchParams();
  if (filters.branchId) params.append("branchId", filters.branchId);
  if (typeof filters.status === "number") {
    params.append("status", String(filters.status));
  }
  if (filters.page) params.append("page", String(filters.page));
  if (filters.limit) params.append("limit", String(filters.limit));
  return params.toString();
};

export const createStockExport = async (
  payload: ICreateStockExportPayload,
): Promise<boolean> => {
  try {
    await apiService.post(API_PATH.STOCK_EXPORT.CREATE.URL, payload);
    return true;
  } catch (error) {
    console.log("Create stock export error: ", error);
    return false;
  }
};

export const fetchStockExportById = async (
  id: string,
): Promise<IStockExportDetail | null> => {
  try {
    return await apiService.get<IStockExportDetail>(
      API_PATH.STOCK_EXPORT.GET_DETAIL(id).URL,
    );
  } catch (error) {
    console.log("Fetch stock export detail error: ", error);
    return null;
  }
};

export const updateStockExportStatus = async (
  id: string,
  payload: IUpdateStockExportStatusPayload,
): Promise<boolean> => {
  try {
    await apiService.patch(
      API_PATH.STOCK_EXPORT.UPDATE_STATUS(id).URL,
      payload,
    );
    return true;
  } catch (error) {
    console.log("Update stock export status error: ", error);
    return false;
  }
};

export const fetchStockExportList = async (
  filters: IStockExportListFilters,
): Promise<IStockExportListResponse | null> => {
  try {
    const query = buildQueryParams(filters);
    const url = query
      ? `${API_PATH.STOCK_EXPORT.GET_ALL.URL}?${query}`
      : API_PATH.STOCK_EXPORT.GET_ALL.URL;
    return await apiService.get<IStockExportListResponse>(url);
  } catch (error) {
    console.log("Fetch stock export list error: ", error);
    return null;
  }
};

// Case 1 — ship an online order: provide IMEI assignments for each product
export const shipOrder = async (
  orderId: string,
  payload: IShipOrderPayload,
): Promise<string | true> => {
  try {
    await apiService.post(`${Contacts.ORDER_PATH}/${orderId}/ship`, payload);
    return true;
  } catch (error: any) {
    const msg: string =
      error?.response?.data?.message ??
      error?.message ??
      "Failed to ship order";
    console.error("Ship order error:", msg, error?.response?.data);
    return msg;
  }
};

export const lookupImei = async (
  branchId: string,
  imei: string,
): Promise<IImeiLookupResult | null> => {
  try {
    const url = `${API_PATH.INVENTORY.LOOKUP_IMEI.URL}?branchId=${encodeURIComponent(branchId)}&imei=${encodeURIComponent(imei)}`;
    return await apiService.get<IImeiLookupResult>(url);
  } catch (error) {
    console.log("IMEI lookup error: ", error);
    return null;
  }
};
