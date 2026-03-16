import { useState } from "react";
import * as XLSX from "xlsx";
import type { IProduct } from "../../shared/models/product-model";
import type { IStockImportProductSearchOption } from "../../types/stock-import.types";
import type { StockImportFormItem } from "../../components/admin/stock-import-form/types";
import {
  getCellStringValue,
  normalizeText,
  fileToArrayBuffer,
} from "../../utils/stock-import";

interface UseStockImportFileImportParams {
  onSearchProducts: (
    keyword: string,
  ) => Promise<IStockImportProductSearchOption[]>;
  onLoadProductDetail: (productId: string) => Promise<IProduct | null>;
  productDetails: Record<string, IProduct>;
  replaceItems: (items: StockImportFormItem[]) => void;
  mergeProductDetails: (details: Record<string, IProduct>) => void;
}

export const useStockImportFileImport = ({
  onSearchProducts,
  onLoadProductDetail,
  productDetails,
  replaceItems,
  mergeProductDetails,
}: UseStockImportFileImportParams) => {
  const [isImportingFile, setIsImportingFile] = useState(false);

  const handleImportFile = async (file: File): Promise<void> => {
    setIsImportingFile(true);

    try {
      const data = await fileToArrayBuffer(file);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];

      if (!firstSheetName) {
        alert("File has no sheet/data.");
        return;
      }

      const worksheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
        worksheet,
        {
          defval: "",
        },
      );

      if (rows.length === 0) {
        alert("File is empty.");
        return;
      }

      const loadedProductDetails: Record<string, IProduct> = {};
      const productIdByNameCache = new Map<string, string | null>();
      const imeiOwnerMap = new Map<string, number>();
      const validationErrors: string[] = [];

      const loadProductById = async (
        productId: string,
      ): Promise<IProduct | null> => {
        if (productDetails[productId]) return productDetails[productId];
        if (loadedProductDetails[productId])
          return loadedProductDetails[productId];

        const product = await onLoadProductDetail(productId);
        if (!product) return null;

        loadedProductDetails[product._id] = product;
        return product;
      };

      const resolveProductIdByName = async (
        productName: string,
      ): Promise<string | null> => {
        const cacheKey = normalizeText(productName);
        if (productIdByNameCache.has(cacheKey)) {
          return productIdByNameCache.get(cacheKey) ?? null;
        }

        const options = await onSearchProducts(productName);
        const exactMatches = options.filter(
          (option) => normalizeText(option.title) === cacheKey,
        );

        if (exactMatches.length !== 1) {
          productIdByNameCache.set(cacheKey, null);
          return null;
        }

        const resolvedId = exactMatches[0].productId;
        productIdByNameCache.set(cacheKey, resolvedId);
        return resolvedId;
      };

      const groupedRows = new Map<
        string,
        {
          product: IProduct;
          variantId: string;
          unitCost: number;
          imeiList: string[];
        }
      >();

      for (const [rowIndex, row] of rows.entries()) {
        const rowNumber = rowIndex + 2;
        const productIdRaw = getCellStringValue(row, [
          "productId",
          "ProductId",
          "product_id",
        ]);
        const productNameRaw = getCellStringValue(row, [
          "productName",
          "ProductName",
          "product",
          "Product",
          "title",
          "Title",
        ]);
        const variantIdRaw = getCellStringValue(row, [
          "variantId",
          "VariantId",
          "variant_id",
        ]);
        const variantSkuRaw = getCellStringValue(row, [
          "variantSku",
          "VariantSku",
          "sku",
          "SKU",
        ]);
        const variantNameRaw = getCellStringValue(row, [
          "variantName",
          "VariantName",
          "variant",
          "Variant",
        ]);
        const imeiRaw = getCellStringValue(row, [
          "imei",
          "IMEI",
          "serial",
          "Serial",
        ]);

        if (!productIdRaw && !productNameRaw) {
          validationErrors.push(
            `Row ${rowNumber}: missing productId or productName.`,
          );
          continue;
        }

        if (!variantIdRaw && !variantSkuRaw && !variantNameRaw) {
          validationErrors.push(
            `Row ${rowNumber}: missing variantId or variantSku or variantName.`,
          );
          continue;
        }

        if (!imeiRaw) {
          validationErrors.push(`Row ${rowNumber}: missing IMEI.`);
          continue;
        }

        const imeiKey = normalizeText(imeiRaw);
        if (imeiOwnerMap.has(imeiKey)) {
          validationErrors.push(
            `Row ${rowNumber}: duplicate IMEI with row ${imeiOwnerMap.get(imeiKey)}.`,
          );
          continue;
        }
        imeiOwnerMap.set(imeiKey, rowNumber);

        const productIdFromName = productNameRaw
          ? await resolveProductIdByName(productNameRaw)
          : null;

        const resolvedProductId = productIdRaw || productIdFromName || "";
        if (!resolvedProductId) {
          validationErrors.push(
            `Row ${rowNumber}: cannot resolve product from productName "${productNameRaw}".`,
          );
          continue;
        }

        const product = await loadProductById(resolvedProductId);
        if (!product) {
          validationErrors.push(
            `Row ${rowNumber}: productId "${resolvedProductId}" not found.`,
          );
          continue;
        }

        if (
          productNameRaw &&
          normalizeText(product.title) !== normalizeText(productNameRaw)
        ) {
          validationErrors.push(
            `Row ${rowNumber}: productName "${productNameRaw}" does not match productId "${resolvedProductId}".`,
          );
          continue;
        }

        let matchedVariant = variantIdRaw
          ? product.variants.find((variant) => variant._id === variantIdRaw)
          : undefined;

        const variantBySku = variantSkuRaw
          ? product.variants.find(
              (variant) =>
                normalizeText(variant.sku) === normalizeText(variantSkuRaw),
            )
          : undefined;

        const variantByName = variantNameRaw
          ? product.variants.find(
              (variant) =>
                normalizeText(variant.variantName) ===
                normalizeText(variantNameRaw),
            )
          : undefined;

        if (!matchedVariant) {
          matchedVariant = variantBySku ?? variantByName;
        }

        if (!matchedVariant) {
          validationErrors.push(
            `Row ${rowNumber}: cannot resolve variant for product "${product.title}".`,
          );
          continue;
        }

        if (variantIdRaw && matchedVariant._id !== variantIdRaw) {
          validationErrors.push(
            `Row ${rowNumber}: variantId does not match variantSku/variantName.`,
          );
          continue;
        }

        if (
          variantSkuRaw &&
          normalizeText(matchedVariant.sku) !== normalizeText(variantSkuRaw)
        ) {
          validationErrors.push(
            `Row ${rowNumber}: variantSku does not match variantId/variantName.`,
          );
          continue;
        }

        if (
          variantNameRaw &&
          normalizeText(matchedVariant.variantName) !==
            normalizeText(variantNameRaw)
        ) {
          validationErrors.push(
            `Row ${rowNumber}: variantName does not match variantId/variantSku.`,
          );
          continue;
        }

        const resolvedUnitCost = matchedVariant.costPrice ?? 0;
        const groupKey = `${product._id}|${matchedVariant._id}`;

        const existing = groupedRows.get(groupKey);
        if (existing) {
          existing.imeiList.push(imeiRaw);
          continue;
        }

        groupedRows.set(groupKey, {
          product,
          variantId: matchedVariant._id,
          unitCost: resolvedUnitCost,
          imeiList: [imeiRaw],
        });
      }

      if (validationErrors.length > 0) {
        const errorPreview = validationErrors.slice(0, 12).join("\n");
        const remain =
          validationErrors.length > 12
            ? `\n...and ${validationErrors.length - 12} more error(s).`
            : "";
        alert(
          `Import failed with validation errors:\n${errorPreview}${remain}`,
        );
        return;
      }

      if (groupedRows.size === 0) {
        alert("No valid rows found in file.");
        return;
      }

      const importedItems: StockImportFormItem[] = Array.from(
        groupedRows.values(),
      ).map((group) => ({
        productSearch: group.product.title,
        productOptions: [
          {
            productId: group.product._id,
            title: group.product.title,
            skuHints: group.product.variants
              .map((variant) => variant.sku)
              .filter((sku): sku is string => Boolean(sku))
              .slice(0, 3),
          },
        ],
        isSearching: false,
        isProductDropdownOpen: false,
        productId: group.product._id,
        variantId: group.variantId,
        unitCost: group.unitCost,
        imeiInputs: group.imeiList,
      }));

      mergeProductDetails(loadedProductDetails);
      replaceItems(importedItems);
      alert(`Imported ${importedItems.length} item(s) from file.`);
    } catch {
      alert("Failed to parse file. Please check format and try again.");
    } finally {
      setIsImportingFile(false);
    }
  };

  return {
    isImportingFile,
    handleImportFile,
  };
};
