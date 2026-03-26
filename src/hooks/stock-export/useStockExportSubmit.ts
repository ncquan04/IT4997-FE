import { useState } from "react";
import { useEffect } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { UserRole } from "../../shared/models/user-model";
import type {
  ICreateStockExportPayload,
  IStockExportItemPayload,
  ExportReason,
} from "../../types/stock-export.types";

interface UseStockExportSubmitParams {
  /** Returns grouped+resolved items ready for the payload */
  buildItems: () => IStockExportItemPayload[];
  onSubmit: (payload: ICreateStockExportPayload) => Promise<boolean>;
  onCancel: () => void;
}

export const useStockExportSubmit = ({
  buildItems,
  onSubmit,
  onCancel,
}: UseStockExportSubmitParams) => {
  const { user } = useAuth();
  const [branchId, setBranchId] = useState(user?.branchId ?? "");
  const [reason, setReason] = useState<ExportReason>("OTHER");
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // sync branchId if user loads asynchronously
  useEffect(() => {
    if (user?.branchId) setBranchId(user.branchId);
  }, [user?.branchId]);

  const validateForm = (): string | null => {
    if (!branchId) return "Branch là bắt buộc";
    if (!reason) return "Lý do xuất kho là bắt buộc";
    const items = buildItems();
    if (items.length === 0) return "Cần ít nhất 1 sản phẩm (nhập IMEI hợp lệ)";
    return null;
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
      const success = await onSubmit({
        branchId,
        reason,
        note: note.trim(),
        items: buildItems(),
      });
      if (success) onCancel();
    } finally {
      setIsSaving(false);
    }
  };

  return {
    branchId,
    isBranchLocked: Boolean(user?.branchId) && user?.role !== UserRole.ADMIN,
    reason,
    note,
    isSaving,
    setBranchId,
    setReason,
    setNote,
    handleSubmit,
  };
};
