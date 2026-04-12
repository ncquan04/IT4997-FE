import { useState } from "react";
import { useToast } from "../../../../contexts/ToastContext";
import { addRepairLog } from "../../../../services/api/api.warranty";
import type { ICreateRepairLogPayload } from "../../../../types/warranty.types";

interface AddRepairLogFormProps {
  warrantyId: string;
  onSuccess: () => void;
}

const AddRepairLogForm = ({ warrantyId, onSuccess }: AddRepairLogFormProps) => {
  const { showToast } = useToast();
  const [action, setAction] = useState("");
  const [note, setNote] = useState("");
  const [cost, setCost] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!action.trim()) return;
    setIsSaving(true);

    const payload: ICreateRepairLogPayload = {
      action: action.trim(),
      replacedParts: [],
    };
    if (note.trim()) payload.note = note.trim();
    if (cost && !isNaN(Number(cost))) payload.cost = Number(cost);

    const ok = await addRepairLog(warrantyId, payload);
    setIsSaving(false);

    if (!ok) {
      showToast("Không thể thêm nhật ký", "error");
      return;
    }

    setAction("");
    setNote("");
    setCost("");
    showToast("Đã thêm nhật ký sửa chữa", "success");
    onSuccess();
  };

  const fieldClass =
    "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300";

  return (
    <form onSubmit={handleSubmit} className="bg-purple-50 rounded-xl p-4 space-y-3">
      <p className="text-xs font-bold text-purple-700 uppercase tracking-wide">
        Thêm nhật ký sửa chữa
      </p>
      <input
        value={action}
        onChange={(e) => setAction(e.target.value)}
        placeholder="Mô tả hành động *"
        className={fieldClass}
        required
      />
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Ghi chú (tuỳ chọn)"
        className={fieldClass}
      />
      <input
        type="number"
        value={cost}
        onChange={(e) => setCost(e.target.value)}
        placeholder="Chi phí (VND)"
        className={fieldClass}
        min={0}
      />
      <button
        type="submit"
        disabled={isSaving || !action.trim()}
        className="w-full py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors"
      >
        {isSaving ? "Đang lưu..." : "Thêm nhật ký"}
      </button>
    </form>
  );
};

export default AddRepairLogForm;
