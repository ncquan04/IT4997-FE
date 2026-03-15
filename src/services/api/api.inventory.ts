import { Contacts } from "../../shared/contacts";
import type {
  IInventoryItem,
  IInventoryListFilters,
  IInventoryListResponse,
} from "../../types/inventory.types";
import { apiService } from "./api.config";

const API_PATH = Contacts.API_CONFIG;

const buildQueryParams = (filters: IInventoryListFilters): string => {
  const params = new URLSearchParams();

  if (filters.search?.trim()) params.append("search", filters.search.trim());
  if (filters.branchId) params.append("branchId", filters.branchId);
  if (filters.productId) params.append("productId", filters.productId);
  if (filters.variantId) params.append("variantId", filters.variantId);
  if (typeof filters.inStock === "boolean") {
    params.append("inStock", String(filters.inStock));
  }
  if (filters.page) params.append("page", String(filters.page));
  if (filters.limit) params.append("limit", String(filters.limit));

  return params.toString();
};

export const fetchInventoryList = async (
  filters: IInventoryListFilters = {},
): Promise<IInventoryListResponse | null> => {
  try {
    const query = buildQueryParams(filters);
    const endpoint = query
      ? `${API_PATH.INVENTORY.GET_ALL.URL}?${query}`
      : API_PATH.INVENTORY.GET_ALL.URL;

    return await apiService.get<IInventoryListResponse>(endpoint);
  } catch (error) {
    console.log("Fetch inventory list error: ", error);
    return null;
  }
};

export const fetchInventoryById = async (
  id: string,
): Promise<IInventoryItem | null> => {
  try {
    return await apiService.get<IInventoryItem>(
      API_PATH.INVENTORY.GET_DETAIL(id).URL,
    );
  } catch (error) {
    console.log("Fetch inventory detail error: ", error);
    return null;
  }
};
