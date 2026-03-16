import type { IStockImportProductSearchOption } from "../../../types/stock-import.types";

export type StockImportFormItem = {
  productSearch: string;
  productOptions: IStockImportProductSearchOption[];
  isSearching: boolean;
  isProductDropdownOpen: boolean;
  productId: string;
  variantId: string;
  unitCost: number;
  imeiInputs: string[];
};
