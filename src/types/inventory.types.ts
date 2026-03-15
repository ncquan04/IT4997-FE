import type { IBranch } from "../shared/models/branch-model";

export interface IInventoryListFilters {
  search?: string;
  branchId?: string;
  productId?: string;
  variantId?: string;
  inStock?: boolean;
  page?: number;
  limit?: number;
}

export interface IInventoryVariantSummary {
  _id: string;
  variantName: string;
  sku: string;
  price: number;
  salePrice?: number;
}

export interface IInventoryProductSummary {
  _id: string;
  title: string;
  brand: string;
  isHide: number;
}

export interface IInventoryItem {
  _id: string;
  branchId: string;
  productId: string;
  variantId: string;
  quantity: number;
  imeiList?: string[];
  createdAt: string;
  updatedAt: string;
  branch?: Pick<IBranch, "_id" | "name" | "address" | "phone" | "isActive">;
  product?: IInventoryProductSummary;
  variant?: IInventoryVariantSummary;
}

export interface IInventoryPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IInventoryListResponse {
  items: IInventoryItem[];
  pagination: IInventoryPagination;
}
