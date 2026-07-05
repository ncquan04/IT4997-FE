import type { IBranch } from "../shared/models/branch-model";

export interface IWarrantyCustomerPopulated {
  _id: string;
  userName: string;
  email: string;
  phoneNumber: string;
}

export interface IWarrantyProductPopulated {
  _id: string;
  title: string;
}

export interface IWarrantyUserPopulated {
  _id: string;
  userName: string;
}

export interface IWarrantyListItem {
  _id: string;
  customerId: IWarrantyCustomerPopulated | string;
  orderId?: string;
  productId: IWarrantyProductPopulated | string;
  variantId: string;
  branchId: Pick<IBranch, "_id" | "name"> | string;
  imeiOrSerial: string;
  issueDescription: string;
  physicalCondition: string;
  images: string[];
  status: number;
  receivedBy: IWarrantyUserPopulated | string;
  estimatedDate?: number;
  completedDate?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface IWarrantyListFilters {
  branchId?: string;
  status?: number | "";
  imei?: string;
  page?: number;
  limit?: number;
}

export interface IWarrantyListResponse {
  data: IWarrantyListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IWarrantyDetail extends Omit<
  IWarrantyListItem,
  "productId" | "receivedBy"
> {
  productId:
    | {
        _id: string;
        title: string;
        variants: { _id: string; variantName: string }[];
      }
    | string;
  receivedBy: IWarrantyUserPopulated | string;
}

export interface IRepairLogItem {
  _id: string;
  warrantyRequestId: string;
  imeiOrSerial: string;
  action: string;
  replacedParts: string[];
  cost: number;
  technicianId: { _id: string; userName: string; email: string } | string;
  note: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IRepairLogListResponse {
  data: IRepairLogItem[];
}

export interface IRepairLogHistoryItem extends Omit<
  IRepairLogItem,
  "warrantyRequestId"
> {
  warrantyRequestId:
    | {
        _id: string;
        status: number;
        branchId: { _id: string; name: string } | string;
        createdAt?: string;
        imeiOrSerial: string;
      }
    | string;
}

export interface IRepairLogHistoryResponse {
  data: IRepairLogHistoryItem[];
}

export interface IPublicRepairHistoryItem {
  date: string;
  action: string;
  replacedParts: string[];
  note: string;
}

export interface IPublicRepairHistoryResponse {
  found: boolean;
  imei: string;
  data: IPublicRepairHistoryItem[];
}

export interface ICreateWarrantyPayload {
  customerId?: string; // optional — omit for walk-in customer
  orderId?: string;
  productId: string;
  variantId: string;
  branchId: string;
  imeiOrSerial: string;
  issueDescription: string;
  physicalCondition: string;
  images: string[];
  estimatedDate?: number;
  walkInName?: string; // required when customerId is absent
  walkInPhone?: string; // required when customerId is absent
}

export interface IUpdateWarrantyStatusPayload {
  status: number;
}

export interface ICreateRepairLogPayload {
  action: string;
  replacedParts?: string[];
  cost?: number;
  note?: string;
}

export interface IImeiLookupResponse {
  data: IWarrantyListItem[];
}
export type IImeiStockLookupResponse =
  | { found: false }
  | {
      found: true;
      productId: string;
      variantId: string;
      branchId: string;
      orderId: string | null;
      customerId: string | null;
      customerName: string | null;
      customerEmail?: string | null;
      customerPhone?: string | null;
    };
