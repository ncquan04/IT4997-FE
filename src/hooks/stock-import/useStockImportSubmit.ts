import { useState } from "react";
import type { FormEvent } from "react";
import type { ICreateStockImportPayload } from "../../types/stock-import.types";
import type { StockImportFormItem } from "../../components/admin/stock-import-form/types";
import {
  getDerivedQuantity,
  getImeiList,
  hasCommaSeparatedImei,
} from "../../utils/stock-import";

interface UseStockImportSubmitParams {
  items: StockImportFormItem[];
  onSubmit: (payload: ICreateStockImportPayload) => Promise<boolean>;
  onCancel: () => void;
}

export const useStockImportSubmit = ({
  items,
  onSubmit,
  onCancel,
}: UseStockImportSubmitParams) => {
  const [branchId, setBranchId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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
      const derivedQuantity = getDerivedQuantity(item.imeiInputs);
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

  const handleSubmit = async (e: FormEvent) => {
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

  return {
    branchId,
    supplierId,
    note,
    isSaving,
    setBranchId,
    setSupplierId,
    setNote,
    handleSubmit,
  };
};
