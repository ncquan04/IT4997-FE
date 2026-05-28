import type { IBranch } from "../shared/models/branch-model";

export interface IStockTransferUserRef {
  _id: string;
  userName: string;
  email: string;
  role: string;
}

export interface IStockTransferItemPayload {
  productId: string;
  variantId: string;
  quantity: number;
  imeiList?: string[];
}

export interface IStockTransferItemPopulated {
  productId:
    | {
        _id: string;
        title: string;
        variants: { _id: string; variantName: string }[];
      }
    | string;
  variantId: string;
  quantity: number;
  imeiList?: string[];
}

export interface ICreateStockTransferItemPayload {
  productId: string;
  variantId: string;
  imeiList: string[];
}

export interface ICreateStockTransferPayload {
  fromBranchId: string;
  toBranchId: string;
  note?: string;
  items: ICreateStockTransferItemPayload[];
}

export interface IStockTransferListFilters {
  branchId?: string;
  status?: number;
  page?: number;
  limit?: number;
  viewOptions?: "from" | "to" | "both";
}

export interface IStockTransferListItem {
  _id: string;
  fromBranchId: IBranch;
  toBranchId: IBranch;
  createdBy?: IStockTransferUserRef | null;
  approvedBy?: IStockTransferUserRef | null;
  note: string;
  status: number;
  items: IStockTransferItemPayload[];
  orderId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IStockTransferListResponse {
  items: IStockTransferListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IStockTransferDetail {
  _id: string;
  fromBranchId: IBranch;
  toBranchId: IBranch;
  createdBy?: IStockTransferUserRef | null;
  approvedBy?: IStockTransferUserRef | null;
  note: string;
  status: number;
  items: IStockTransferItemPopulated[];
  orderId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IUpdateStockTransferStatusPayload {
  status: number;
}
