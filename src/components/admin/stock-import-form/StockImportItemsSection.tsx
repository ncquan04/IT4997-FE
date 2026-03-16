import type { ChangeEvent } from "react";
import type { IProduct } from "../../../shared/models/product-model";
import type { IStockImportProductSearchOption } from "../../../types/stock-import.types";
import { formatPrice } from "../../../utils";
import StockImportItemRow from "./StockImportItemRow";
import type { StockImportFormItem } from "./types";

interface StockImportItemsSectionProps {
  items: StockImportFormItem[];
  totalCost: number;
  isImportingFile: boolean;
  addItem: () => void;
  onImportFile: (file: File) => Promise<void>;
  removeItem: (index: number) => void;
  updateItem: (index: number, patch: Partial<StockImportFormItem>) => void;
  getVariantsByProductId: (productId: string) => IProduct["variants"];
  getItemProductOptions: (
    item: StockImportFormItem,
  ) => IStockImportProductSearchOption[];
  getDerivedQuantity: (item: StockImportFormItem) => number;
  handleProductSearchChange: (index: number, value: string) => void;
  handleSelectProduct: (
    index: number,
    option: IStockImportProductSearchOption,
  ) => void;
  handleVariantChange: (index: number, variantId: string) => void;
  updateImeiInput: (
    itemIndex: number,
    imeiIndex: number,
    value: string,
  ) => void;
  addImeiInput: (itemIndex: number) => void;
  removeImeiInput: (itemIndex: number, imeiIndex: number) => void;
  lineTotals: number[];
}

const StockImportItemsSection = ({
  items,
  totalCost,
  isImportingFile,
  addItem,
  onImportFile,
  removeItem,
  updateItem,
  getVariantsByProductId,
  getItemProductOptions,
  getDerivedQuantity,
  handleProductSearchChange,
  handleSelectProduct,
  handleVariantChange,
  updateImeiInput,
  addImeiInput,
  removeImeiInput,
  lineTotals,
}: StockImportItemsSectionProps) => {
  const handleImportFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await onImportFile(file);
    e.target.value = "";
  };

  return (
    <section className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Import Items</h3>
        <div className="flex items-center gap-2">
          <label className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium cursor-pointer text-sm">
            {isImportingFile ? "Importing..." : "Import CSV/XLSX"}
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={handleImportFileChange}
              disabled={isImportingFile}
            />
          </label>
          <button
            type="button"
            onClick={addItem}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 font-medium"
          >
            + Add item
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-4">
        File format: one row per IMEI. Required:
        <span className="font-semibold"> imei</span>,
        <span className="font-semibold"> productId/productName</span>,
        <span className="font-semibold"> variantId/variantSku/variantName</span>
      </p>

      <div className="space-y-4">
        {items.map((item, index) => {
          const variants = getVariantsByProductId(item.productId);
          const selectedVariant = variants.find(
            (variant) => variant._id === item.variantId,
          );

          return (
            <StockImportItemRow
              key={index}
              item={item}
              index={index}
              variants={variants}
              selectedVariant={selectedVariant}
              productOptions={getItemProductOptions(item)}
              lineTotal={lineTotals[index] || 0}
              quantity={getDerivedQuantity(item)}
              canRemoveItem={items.length > 1}
              updateItem={updateItem}
              handleProductSearchChange={handleProductSearchChange}
              handleSelectProduct={handleSelectProduct}
              handleVariantChange={handleVariantChange}
              updateImeiInput={updateImeiInput}
              addImeiInput={addImeiInput}
              removeImeiInput={removeImeiInput}
              removeItem={removeItem}
            />
          );
        })}
      </div>

      <div className="mt-4 flex justify-end">
        <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-2 text-sm font-semibold text-red-700">
          Total Cost: {formatPrice(totalCost)}
        </div>
      </div>
    </section>
  );
};

export default StockImportItemsSection;
