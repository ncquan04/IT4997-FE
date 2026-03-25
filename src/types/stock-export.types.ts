import type { IBranch } from "../shared/models/branch-model";

export type ExportReason =
  | "SALE"
  | "ONLINE_SALE"
  | "RETURN_TO_SUPPLIER"
  | "DAMAGED"
  | "OTHER";

export interface IImeiLookupResult {
  productId: string;
  variantId: string;
  product: { _id: string; title: string; brand?: string };
  variant: {
    _id: string;
    variantName: string;
    sku?: string;
    price?: number;
    salePrice?: number;
  };
}

export interface IStockExportItemPayload {
  productId: string;
  variantId: string;
  imeiList: string[];
}

// Populated version used in detail modal
export interface IStockExportItemPopulated {
  productId:
    | {
        _id: string;
        title: string;
        variants: { _id: string; variantName: string }[];
      }
    | string;
  variantId: string;
  quantity: number;
  imeiList: string[];
}

export interface ICreateStockExportPayload {
  branchId: string;
  reason: ExportReason;
  note?: string;
  items: IStockExportItemPayload[];
}

export interface IStockExportListFilters {
  branchId?: string;
  status?: number;
  page?: number;
  limit?: number;
}

export interface IStockExportListItem {
  _id: string;
  branchId: string | { _id: string; name: string };
  reason: ExportReason;
  orderId?: string;
  createdBy:
    | string
    | { _id: string; userName: string; email: string; role: string };
  note: string;
  status: number;
  items: {
    productId: string;
    variantId: string;
    quantity: number;
    imeiList: string[];
  }[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IStockExportListResponse {
  items: IStockExportListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Detail response after populate
export interface IStockExportDetail {
  _id: string;
  branchId: IBranch;
  reason: ExportReason;
  orderId?: string;
  createdBy: { _id: string; userName: string; email: string; role: string };
  note: string;
  status: number;
  items: IStockExportItemPopulated[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IUpdateStockExportStatusPayload {
  status: number;
}

// Payload for POST /api/orders/:id/ship
export interface IShipOrderPayload {
  branchId?: string;
  imeiAssignments: IStockExportItemPayload[];
}
