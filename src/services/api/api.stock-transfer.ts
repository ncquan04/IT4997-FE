import { Contacts } from "../../shared/contacts";
import type {
  ICreateStockTransferPayload,
  IStockTransferDetail,
  IStockTransferListFilters,
  IStockTransferListResponse,
  IUpdateStockTransferStatusPayload,
} from "../../types/stock-transfer.types";
import { apiService } from "./index";

const API_PATH = Contacts.API_CONFIG;

const buildQueryParams = (filters: IStockTransferListFilters): string => {
  const params = new URLSearchParams();

  if (filters.branchId) params.append("branchId", filters.branchId);
  if (typeof filters.status === "number") {
    params.append("status", String(filters.status));
  }
  if (filters.viewOptions) params.append("viewOptions", filters.viewOptions);
  if (filters.page) params.append("page", String(filters.page));
  if (filters.limit) params.append("limit", String(filters.limit));

  return params.toString();
};

export const createStockTransfer = async (
  payload: ICreateStockTransferPayload,
): Promise<boolean> => {
  try {
    await apiService.post(API_PATH.STOCK_TRANSFER.CREATE.URL, payload);
    return true;
  } catch (error) {
    console.log("Create stock transfer error: ", error);
    return false;
  }
};

export const fetchStockTransferById = async (
  id: string,
): Promise<IStockTransferDetail | null> => {
  try {
    return await apiService.get<IStockTransferDetail>(
      API_PATH.STOCK_TRANSFER.GET_DETAIL(id).URL,
    );
  } catch (error) {
    console.log("Fetch stock transfer detail error: ", error);
    return null;
  }
};

export const updateStockTransferStatus = async (
  id: string,
  payload: IUpdateStockTransferStatusPayload,
): Promise<boolean> => {
  try {
    await apiService.patch(
      API_PATH.STOCK_TRANSFER.UPDATE_STATUS(id).URL,
      payload,
    );
    return true;
  } catch (error) {
    console.log("Update stock transfer status error: ", error);
    return false;
  }
};

export const fetchStockTransferList = async (
  filters: IStockTransferListFilters = {},
): Promise<IStockTransferListResponse | null> => {
  try {
    const query = buildQueryParams(filters);
    const endpoint = query
      ? `${API_PATH.STOCK_TRANSFER.GET_ALL.URL}?${query}`
      : API_PATH.STOCK_TRANSFER.GET_ALL.URL;

    return await apiService.get<IStockTransferListResponse>(endpoint);
  } catch (error) {
    console.log("Fetch stock transfer list error: ", error);
    return null;
  }
};
