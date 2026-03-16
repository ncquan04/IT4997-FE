import { useEffect, useMemo, useRef, useState } from "react";
import type { IProduct } from "../../shared/models/product-model";
import type { IStockImportProductSearchOption } from "../../types/stock-import.types";
import type { StockImportFormItem } from "../../components/admin/stock-import-form/types";
import { getDerivedQuantity } from "../../utils/stock-import";

interface UseStockImportItemsParams {
  onSearchProducts: (
    keyword: string,
  ) => Promise<IStockImportProductSearchOption[]>;
  onLoadProductDetail: (productId: string) => Promise<IProduct | null>;
}

export const createEmptyItem = (): StockImportFormItem => ({
  productSearch: "",
  productOptions: [],
  isSearching: false,
  isProductDropdownOpen: false,
  productId: "",
  variantId: "",
  unitCost: 0,
  imeiInputs: [""],
});

export const useStockImportItems = ({
  onSearchProducts,
  onLoadProductDetail,
}: UseStockImportItemsParams) => {
  const searchDebounceRefs = useRef<
    Record<number, ReturnType<typeof setTimeout>>
  >({});
  const [items, setItems] = useState<StockImportFormItem[]>([
    createEmptyItem(),
  ]);
  const [productDetails, setProductDetails] = useState<
    Record<string, IProduct>
  >({});

  useEffect(() => {
    return () => {
      Object.values(searchDebounceRefs.current).forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
    };
  }, []);

  const lineTotals = useMemo(
    () =>
      items.map((item) => getDerivedQuantity(item.imeiInputs) * item.unitCost),
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

  const replaceItems = (nextItems: StockImportFormItem[]) => {
    setItems(nextItems.length > 0 ? nextItems : [createEmptyItem()]);
  };

  const mergeProductDetails = (nextDetails: Record<string, IProduct>) => {
    if (Object.keys(nextDetails).length === 0) return;

    setProductDetails((prev) => ({
      ...prev,
      ...nextDetails,
    }));
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

  return {
    items,
    productDetails,
    lineTotals,
    totalCost,
    updateItem,
    addItem,
    removeItem,
    updateImeiInput,
    addImeiInput,
    removeImeiInput,
    getVariantsByProductId,
    getItemProductOptions,
    handleProductSearchChange,
    handleSelectProduct,
    handleVariantChange,
    replaceItems,
    mergeProductDetails,
  };
};
