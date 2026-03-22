import type { IImeiLookupResult } from "../../../types/stock-export.types";

export type ImeiEntryStatus = "idle" | "loading" | "found" | "error";

export type ImeiEntry = {
  id: number; // local unique key
  imei: string;
  status: ImeiEntryStatus;
  error?: string;
  result?: IImeiLookupResult;
};

// A group is all IMEIs that resolved to the same productId+variantId
export type StockExportGroup = {
  productId: string;
  variantId: string;
  productTitle: string;
  variantName: string;
  imeis: string[]; // resolved IMEI values belonging to this group
};
