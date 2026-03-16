import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import type { IBranch } from "../../shared/models/branch-model";
import type { IProduct } from "../../shared/models/product-model";
import type { ISupplier } from "../../shared/models/supplier-model";
import type {
  ICreateStockImportPayload,
  IStockImportProductSearchOption,
} from "../../types/stock-import.types";
import StockImportFormFooter from "./stock-import-form/StockImportFormFooter";
import StockImportFormHeader from "./stock-import-form/StockImportFormHeader";
import StockImportInfoSection from "./stock-import-form/StockImportInfoSection";
import StockImportItemsSection from "./stock-import-form/StockImportItemsSection";
import type { StockImportFormItem } from "./stock-import-form/types";

interface StockImportFormProps {
  branches: IBranch[];
  suppliers: ISupplier[];
  onSearchProducts: (
    keyword: string,
  ) => Promise<IStockImportProductSearchOption[]>;
  onLoadProductDetail: (productId: string) => Promise<IProduct | null>;
  onSubmit: (payload: ICreateStockImportPayload) => Promise<boolean>;
  onCancel: () => void;
}

const createEmptyItem = (): StockImportFormItem => ({
  productSearch: "",
  productOptions: [],
  isSearching: false,
  isProductDropdownOpen: false,
  productId: "",
  variantId: "",
  unitCost: 0,
  imeiInputs: [""],
});

const StockImportForm = ({
  branches,
  suppliers,
  onSearchProducts,
  onLoadProductDetail,
  onSubmit,
  onCancel,
}: StockImportFormProps) => {
  const searchDebounceRefs = useRef<
    Record<number, ReturnType<typeof setTimeout>>
  >({});
  const [branchId, setBranchId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [note, setNote] = useState("");
  const [items, setItems] = useState<StockImportFormItem[]>([
    createEmptyItem(),
  ]);
  const [productDetails, setProductDetails] = useState<
    Record<string, IProduct>
  >({});
  const [isSaving, setIsSaving] = useState(false);
  const [isImportingFile, setIsImportingFile] = useState(false);

  const getImeiList = (imeiInputs: string[]): string[] => {
    return imeiInputs.map((imei) => imei.trim()).filter(Boolean);
  };

  const hasCommaSeparatedImei = (imeiInputs: string[]): boolean => {
    return imeiInputs.some((imei) => imei.includes(","));
  };

  const getDerivedQuantity = (item: StockImportFormItem): number => {
    return getImeiList(item.imeiInputs).length;
  };

  useEffect(() => {
    return () => {
      Object.values(searchDebounceRefs.current).forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
    };
  }, []);

  const lineTotals = useMemo(
    () => items.map((item) => getDerivedQuantity(item) * item.unitCost),
    [items],
  );

  const totalCost = useMemo(
    () => lineTotals.reduce((sum, line) => sum + line, 0),
    [lineTotals],
  );

  const updateItem = (index: number, patch: Partial<StockImportFormItem>) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const addItem = () => {
    setItems((prev) => [...prev, createEmptyItem()]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateImeiInput = (
    itemIndex: number,
    imeiIndex: number,
    value: string,
  ) => {
    setItems((prev) => {
      const next = [...prev];
      const item = next[itemIndex];
      if (!item) return prev;

      const imeiInputs = [...item.imeiInputs];
      imeiInputs[imeiIndex] = value;
      next[itemIndex] = { ...item, imeiInputs };
      return next;
    });
  };

  const addImeiInput = (itemIndex: number) => {
    setItems((prev) => {
      const next = [...prev];
      const item = next[itemIndex];
      if (!item) return prev;

      next[itemIndex] = {
        ...item,
        imeiInputs: [...item.imeiInputs, ""],
      };
      return next;
    });
  };

  const removeImeiInput = (itemIndex: number, imeiIndex: number) => {
    setItems((prev) => {
      const next = [...prev];
      const item = next[itemIndex];
      if (!item) return prev;

      if (item.imeiInputs.length <= 1) {
        next[itemIndex] = { ...item, imeiInputs: [""] };
        return next;
      }

      next[itemIndex] = {
        ...item,
        imeiInputs: item.imeiInputs.filter((_, idx) => idx !== imeiIndex),
      };
      return next;
    });
  };

  const getVariantsByProductId = (productId: string) => {
    const product = productDetails[productId];
    return product?.variants ?? [];
  };

  const getItemProductOptions = (item: StockImportFormItem) => {
    if (!item.productId) return item.productOptions;

    const exists = item.productOptions.some(
      (option) => option.productId === item.productId,
    );
    if (exists) return item.productOptions;

    const cachedProduct = productDetails[item.productId];
    if (!cachedProduct) return item.productOptions;

    return [
      ...item.productOptions,
      {
        productId: cachedProduct._id,
        title: cachedProduct.title,
        skuHints: cachedProduct.variants
          .map((variant) => variant.sku)
          .filter((sku): sku is string => Boolean(sku))
          .slice(0, 3),
      },
    ];
  };

  const getCellStringValue = (
    row: Record<string, unknown>,
    keys: string[],
  ): string => {
    for (const key of keys) {
      const value = row[key];
      if (value === undefined || value === null) continue;
      const normalized = String(value).trim();
      if (normalized) return normalized;
    }
    return "";
  };

  const fileToArrayBuffer = async (file: File): Promise<ArrayBuffer> => {
    return await file.arrayBuffer();
  };

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

      const normalizeText = (value: string): string =>
        value.normalize("NFC").trim().toLowerCase();

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

      if (Object.keys(loadedProductDetails).length > 0) {
        setProductDetails((prev) => ({
          ...prev,
          ...loadedProductDetails,
        }));
      }

      setItems(importedItems);
      alert(`Imported ${importedItems.length} item(s) from file.`);
    } catch {
      alert("Failed to parse file. Please check format and try again.");
    } finally {
      setIsImportingFile(false);
    }
  };

  const handleProductSearchChange = (index: number, value: string) => {
    const trimmed = value.trim();

    if (searchDebounceRefs.current[index]) {
      clearTimeout(searchDebounceRefs.current[index]);
    }

    updateItem(index, {
      productSearch: value,
      productId: "",
      variantId: "",
      isProductDropdownOpen: true,
      isSearching: trimmed.length >= 2,
      productOptions:
        trimmed.length >= 2 ? (items[index]?.productOptions ?? []) : [],
    });

    if (trimmed.length < 2) {
      return;
    }

    searchDebounceRefs.current[index] = setTimeout(async () => {
      const options = await onSearchProducts(trimmed);

      setItems((prev) => {
        if (!prev[index]) return prev;
        if (prev[index].productSearch.trim() !== trimmed) {
          return prev;
        }

        const next = [...prev];
        next[index] = {
          ...next[index],
          productOptions: options,
          isSearching: false,
          isProductDropdownOpen: true,
        };
        return next;
      });
    }, 400);
  };

  const handleSelectProduct = async (
    index: number,
    option: IStockImportProductSearchOption,
  ) => {
    updateItem(index, {
      productId: option.productId,
      productSearch: option.title,
      variantId: "",
      productOptions: [option],
      isProductDropdownOpen: false,
      isSearching: false,
    });

    const productId = option.productId;

    if (!productId || productDetails[productId]) {
      return;
    }

    const product = await onLoadProductDetail(productId);
    if (!product) {
      return;
    }

    setProductDetails((prev) => ({
      ...prev,
      [product._id]: product,
    }));
  };

  const handleVariantChange = (index: number, variantId: string) => {
    const item = items[index];
    if (!item) return;

    const variants = getVariantsByProductId(item.productId);
    const variant = variants.find(
      (itemVariant) => itemVariant._id === variantId,
    );

    updateItem(index, {
      variantId,
      unitCost:
        typeof variant?.costPrice === "number"
          ? variant.costPrice
          : item.unitCost,
    });
  };

  const validateForm = (): string | null => {
    if (!branchId) return "Branch is required";
    if (!supplierId) return "Supplier is required";
    if (items.length === 0) return "At least one item is required";

    for (const [index, item] of items.entries()) {
      if (!item.productId) return `Item ${index + 1}: Product is required`;
      if (!item.variantId) return `Item ${index + 1}: Variant is required`;
      if (hasCommaSeparatedImei(item.imeiInputs)) {
        return `Item ${index + 1}: Enter one IMEI per field, do not use commas`;
      }
      const derivedQuantity = getDerivedQuantity(item);
      if (derivedQuantity <= 0) {
        return `Item ${index + 1}: IMEI list is required`;
      }
      if (!Number.isFinite(item.unitCost) || item.unitCost < 0) {
        return `Item ${index + 1}: Unit cost must be >= 0`;
      }
    }

    return null;
  };

  const buildPayload = (): ICreateStockImportPayload => {
    return {
      branchId,
      supplierId,
      note: note.trim(),
      items: items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        unitCost: Number(item.unitCost),
        imeiList: getImeiList(item.imeiInputs),
      })),
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }

    setIsSaving(true);
    try {
      const success = await onSubmit(buildPayload());
      if (success) {
        onCancel();
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl flex flex-col max-h-[90vh]"
    >
      <StockImportFormHeader onCancel={onCancel} />

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <form
          id="stock-import-form"
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          <StockImportInfoSection
            branches={branches}
            suppliers={suppliers}
            branchId={branchId}
            supplierId={supplierId}
            note={note}
            setBranchId={setBranchId}
            setSupplierId={setSupplierId}
            setNote={setNote}
          />

          <StockImportItemsSection
            items={items}
            totalCost={totalCost}
            isImportingFile={isImportingFile}
            addItem={addItem}
            onImportFile={handleImportFile}
            removeItem={removeItem}
            updateItem={updateItem}
            getVariantsByProductId={getVariantsByProductId}
            getItemProductOptions={getItemProductOptions}
            getDerivedQuantity={getDerivedQuantity}
            handleProductSearchChange={handleProductSearchChange}
            handleSelectProduct={handleSelectProduct}
            handleVariantChange={handleVariantChange}
            updateImeiInput={updateImeiInput}
            addImeiInput={addImeiInput}
            removeImeiInput={removeImeiInput}
            lineTotals={lineTotals}
          />
        </form>
      </div>

      <StockImportFormFooter isSaving={isSaving} onCancel={onCancel} />
    </motion.div>
  );
};

export default StockImportForm;
