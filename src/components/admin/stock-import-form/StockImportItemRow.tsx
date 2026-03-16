import type { IProductVariant } from "../../../shared/models/product-model";
import type { IStockImportProductSearchOption } from "../../../types/stock-import.types";
import { formatPrice } from "../../../utils";
import type { StockImportFormItem } from "./types";

interface StockImportItemRowProps {
  item: StockImportFormItem;
  index: number;
  variants: IProductVariant[];
  selectedVariant?: IProductVariant;
  productOptions: IStockImportProductSearchOption[];
  lineTotal: number;
  quantity: number;
  canRemoveItem: boolean;
  updateItem: (index: number, patch: Partial<StockImportFormItem>) => void;
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
  removeItem: (index: number) => void;
}

const StockImportItemRow = ({
  item,
  index,
  variants,
  selectedVariant,
  productOptions,
  lineTotal,
  quantity,
  canRemoveItem,
  updateItem,
  handleProductSearchChange,
  handleSelectProduct,
  handleVariantChange,
  updateImeiInput,
  addImeiInput,
  removeImeiInput,
  removeItem,
}: StockImportItemRowProps) => {
  return (
    <div className="rounded-lg border border-gray-100 p-4 bg-gray-50/50">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="lg:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Search Product (name/SKU)
          </label>
          <div className="relative">
            <input
              type="text"
              value={item.productSearch}
              onChange={(e) => handleProductSearchChange(index, e.target.value)}
              onFocus={() => updateItem(index, { isProductDropdownOpen: true })}
              onBlur={() => {
                setTimeout(() => {
                  updateItem(index, { isProductDropdownOpen: false });
                }, 120);
              }}
              placeholder="Type at least 2 characters..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-button2 focus:border-button2 outline-none"
            />

            {item.isProductDropdownOpen && (
              <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-56 overflow-y-auto">
                {item.isSearching ? (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    Searching...
                  </div>
                ) : item.productSearch.trim().length < 2 ? (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    Type at least 2 characters to search.
                  </div>
                ) : productOptions.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    No products found.
                  </div>
                ) : (
                  productOptions.map((option) => (
                    <button
                      type="button"
                      key={option.productId}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelectProduct(index, option)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="text-sm font-medium text-gray-800">
                        {option.title}
                      </div>
                      {option.skuHints.length > 0 && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          SKU: {option.skuHints.join(", ")}
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          {item.productId && (
            <p className="mt-1 text-xs text-gray-500">
              Selected: {item.productSearch}
            </p>
          )}
        </div>

        <div className="lg:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Variant
          </label>
          <select
            value={item.variantId}
            onChange={(e) => handleVariantChange(index, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-button2 focus:border-button2 outline-none"
            disabled={!item.productId}
          >
            <option value="">Select variant</option>
            {variants.map((variant) => (
              <option key={variant._id} value={variant._id}>
                {variant.variantName} • {variant.sku}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Quantity
          </label>
          <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-700 text-sm">
            {quantity}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Unit Cost
          </label>
          <input
            type="number"
            min={0}
            value={item.unitCost}
            onChange={(e) =>
              updateItem(index, {
                unitCost: Number(e.target.value || 0),
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-button2 focus:border-button2 outline-none"
          />
        </div>

        <div className="lg:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            IMEI List
          </label>
          <div className="space-y-2">
            {item.imeiInputs.map((imeiValue, imeiIndex) => (
              <div key={imeiIndex} className="flex gap-2">
                <input
                  type="text"
                  value={imeiValue}
                  onChange={(e) =>
                    updateImeiInput(index, imeiIndex, e.target.value)
                  }
                  placeholder={`IMEI ${imeiIndex + 1}`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-button2 focus:border-button2 outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeImeiInput(index, imeiIndex)}
                  className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
                  aria-label="Remove IMEI input"
                >
                  -
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addImeiInput(index)}
              className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm"
            >
              + Add IMEI
            </button>
          </div>
        </div>

        <div className="flex items-end">
          <div className="w-full rounded-lg bg-white border border-gray-200 px-3 py-2 text-sm text-gray-700">
            Line Total: {formatPrice(lineTotal)}
          </div>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={() => removeItem(index)}
            disabled={!canRemoveItem}
            className="w-full px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockImportItemRow;
