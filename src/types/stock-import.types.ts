import type { ISupplier } from "../shared/models/supplier-model";

export interface IStockImportItemPayload {
  productId: string;
  variantId: string;
  quantity: number;
  unitCost: number;
  imeiList?: string[];
}

export interface ICreateStockImportItemPayload {
  productId: string;
  variantId: string;
  unitCost: number;
  imeiList: string[];
}

export interface IStockImportProductSearchOption {
  productId: string;
  title: string;
  skuHints: string[];
}

export interface ICreateStockImportPayload {
  branchId: string;
  supplierId: string;
  note?: string;
  items: ICreateStockImportItemPayload[];
}

export interface IStockImportListFilters {
  branchId?: string;
  status?: number;
  page?: number;
  limit?: number;
}

export interface IStockImportListItem {
  _id: string;
  branchId: string;
  supplierId: string;
  createdBy: string;
  note: string;
  status: number;
  totalCost: number;
  items: IStockImportItemPayload[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IStockImportListResponse {
  items: IStockImportListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type ISupplierListResponse = ISupplier[];
