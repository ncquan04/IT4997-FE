import { Contacts } from "../../shared/contacts";
import type {
  ICreateStockImportPayload,
  IStockImportDetail,
  IStockImportListFilters,
  IStockImportListResponse,
  IUpdateStockImportStatusPayload,
} from "../../types/stock-import.types";
import { apiService } from "./api.config";

const API_PATH = Contacts.API_CONFIG;

const buildQueryParams = (filters: IStockImportListFilters): string => {
  const params = new URLSearchParams();

  if (filters.branchId) params.append("branchId", filters.branchId);
  if (typeof filters.status === "number") {
    params.append("status", String(filters.status));
  }
  if (filters.page) params.append("page", String(filters.page));
  if (filters.limit) params.append("limit", String(filters.limit));

  return params.toString();
};

export const createStockImport = async (
  payload: ICreateStockImportPayload,
): Promise<boolean> => {
  try {
    await apiService.post(API_PATH.STOCK_IMPORT.CREATE.URL, payload);
    return true;
  } catch (error) {
    console.log("Create stock import error: ", error);
    return false;
  }
};

export const fetchStockImportById = async (
  id: string,
): Promise<IStockImportDetail | null> => {
  try {
    return await apiService.get<IStockImportDetail>(
      API_PATH.STOCK_IMPORT.GET_DETAIL(id).URL,
    );
  } catch (error) {
    console.log("Fetch stock import detail error: ", error);
    return null;
  }
};

export const updateStockImportStatus = async (
  id: string,
  payload: IUpdateStockImportStatusPayload,
): Promise<boolean> => {
  try {
    await apiService.patch(
      API_PATH.STOCK_IMPORT.UPDATE_STATUS(id).URL,
      payload,
    );
    return true;
  } catch (error) {
    console.log("Update stock import status error: ", error);
    return false;
  }
};

export const fetchStockImportList = async (
  filters: IStockImportListFilters = {},
): Promise<IStockImportListResponse | null> => {
  try {
    const query = buildQueryParams(filters);
    const endpoint = query
      ? `${API_PATH.STOCK_IMPORT.GET_ALL.URL}?${query}`
      : API_PATH.STOCK_IMPORT.GET_ALL.URL;

    return await apiService.get<IStockImportListResponse>(endpoint);
  } catch (error) {
    console.log("Fetch stock import list error: ", error);
    return null;
  }
};
