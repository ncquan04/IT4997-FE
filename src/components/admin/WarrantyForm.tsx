import { motion } from "framer-motion";
import { useState } from "react";
import type { IBranch } from "../../shared/models/branch-model";
import type {
  IProduct,
  IProductVariant,
} from "../../shared/models/product-model";
import type {
  ICreateWarrantyPayload,
  IImeiStockLookupResponse,
} from "../../types/warranty.types";
import {
  lookupImeiFromStock,
  uploadWarrantyImage,
} from "../../services/api/api.warranty";
import { SearchProducts } from "../../services/api/api.search";

// ─── Mode ─────────────────────────────────────────────────────────────────────
type FormMode = "store" | "walkin";

interface LookupResult {
  productId: string;
  variantId: string;
  branchId: string;
  orderId: string | null;
  customerId: string | null;
  customerName: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
}

interface WarrantyFormProps {
  branches: IBranch[];
  fixedBranchId?: string;
  onSubmit: (payload: ICreateWarrantyPayload) => Promise<boolean>;
  onCancel: () => void;
}

const fc =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent";
const lc = "block text-xs font-semibold text-gray-600 mb-1";
const ec = "text-red-500 text-xs mt-1";

// ─── InfoChip ─────────────────────────────────────────────────────────────────
const InfoChip = ({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) => (
  <div className="bg-white rounded-lg px-3 py-2 border border-green-100">
    <p className="text-xs text-gray-500 mb-0.5">{label}</p>
    <p
      className={`text-sm font-medium text-gray-800 truncate ${mono ? "font-mono text-xs" : ""}`}
    >
      {value}
    </p>
  </div>
);

// ─── WarrantyForm ─────────────────────────────────────────────────────────────
const WarrantyForm = ({
  branches,
  fixedBranchId,
  onSubmit,
  onCancel,
}: WarrantyFormProps) => {
  const [mode, setMode] = useState<FormMode>("store");

  // Mode 1 state
  const [storeImei, setStoreImei] = useState("");
  const [isLooking, setIsLooking] = useState(false);
  const [lookupResult, setLookupResult] = useState<LookupResult | null>(null);
  const [lookupNotFound, setLookupNotFound] = useState(false);

  // Mode 2 state
  const [walkinImei, setWalkinImei] = useState("");
  const [walkInCustomerName, setWalkInCustomerName] = useState("");
  const [walkInCustomerPhone, setWalkInCustomerPhone] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [productOptions, setProductOptions] = useState<IProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [selectedVariant, setSelectedVariant] =
    useState<IProductVariant | null>(null);
  const [isSearchingProduct, setIsSearchingProduct] = useState(false);
  const [walkinBranchId, setWalkinBranchId] = useState(fixedBranchId ?? "");

  // Shared
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [issueDescription, setIssueDescription] = useState("");
  const [physicalCondition, setPhysicalCondition] = useState("");
  const [estimatedDate, setEstimatedDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Image upload ───────────────────────────────────────────────────────
  const handleImageFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = 5 - images.length;
    if (remaining <= 0) return;
    const toUpload = Array.from(files).slice(0, remaining);
    setIsUploading(true);
    const urls = await Promise.all(toUpload.map(uploadWarrantyImage));
    setIsUploading(false);
    setImages((prev) => [
      ...prev,
      ...urls.filter((u): u is string => u !== null),
    ]);
  };

  const removeImage = (idx: number) =>
    setImages((prev) => prev.filter((_, i) => i !== idx));

  // ── IMEI lookup ─────────────────────────────────────────────────────────
  const handleImeiLookup = async () => {
    if (!storeImei.trim()) return;
    setIsLooking(true);
    setLookupResult(null);
    setLookupNotFound(false);
    setErrors({});

    const res: IImeiStockLookupResponse | null = await lookupImeiFromStock(
      storeImei.trim(),
    );
    setIsLooking(false);

    if (!res || !res.found) {
      setLookupNotFound(true);
      return;
    }
    setLookupResult({
      productId: res.productId,
      variantId: res.variantId,
      branchId: res.branchId,
      orderId: res.orderId,
      customerId: res.customerId,
      customerName: res.customerName,
      customerEmail: res.customerEmail,
      customerPhone: res.customerPhone,
    });
  };

  // ── Product search ─────────────────────────────────────────────────────
  const handleProductSearch = async () => {
    if (productSearch.trim().length < 2) return;
    setIsSearchingProduct(true);
    const res = await SearchProducts({
      userInput: productSearch.trim(),
      page: 1,
    });
    setIsSearchingProduct(false);
    setProductOptions(res?.products ?? []);
  };

  // ── Mode switch ────────────────────────────────────────────────────────
  const switchMode = (m: FormMode) => {
    setMode(m);
    setErrors({});
    setLookupResult(null);
    setLookupNotFound(false);
    setStoreImei("");
    setWalkinImei("");
    setWalkInCustomerName("");
    setWalkInCustomerPhone("");
    setSelectedProduct(null);
    setSelectedVariant(null);
    setProductOptions([]);
    setProductSearch("");
    setWalkinBranchId(fixedBranchId ?? "");
    setImages([]);
    setIssueDescription("");
    setPhysicalCondition("");
    setEstimatedDate("");
  };

  // ── Validation ─────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (mode === "store") {
      if (!storeImei.trim()) errs.imei = "Vui lòng nhập IMEI/Serial";
      if (!lookupResult)
        errs.lookup = "Chưa tra cứu IMEI hoặc không tìm thấy trong hệ thống";
      // Xuất thủ công: lữ lhàng không có đơn online → yêu cầu nhập thật
      if (lookupResult && !lookupResult.customerId) {
        if (!walkInCustomerName.trim())
          errs.walkInName = "Vui lòng nhập tên khách hàng";
        if (!walkInCustomerPhone.trim())
          errs.walkInPhone = "Vui lòng nhập số điện thoại";
      }
    } else {
      if (!walkinImei.trim()) errs.imei = "Vui lòng nhập IMEI/Serial";
      if (!walkInCustomerName.trim())
        errs.walkInName = "Vui lòng nhập tên khách hàng";
      if (!walkInCustomerPhone.trim())
        errs.walkInPhone = "Vui lòng nhập số điện thoại";
      if (!selectedProduct) errs.product = "Vui lòng tìm và chọn sản phẩm";
      if (!selectedVariant) errs.variant = "Vui lòng chọn phiên bản";
      if (!walkinBranchId) errs.branch = "Vui lòng chọn chi nhánh";
    }
    if (!issueDescription.trim())
      errs.issueDescription = "Vui lòng mô tả lỗi thiết bị";
    if (!physicalCondition.trim())
      errs.physicalCondition = "Vui lòng mô tả tình trạng vật lý";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSaving(true);

    let payload: ICreateWarrantyPayload;

    if (mode === "store" && lookupResult) {
      const effectiveBranchId = fixedBranchId ?? lookupResult.branchId;
      payload = {
        imeiOrSerial: storeImei.trim(),
        productId: lookupResult.productId,
        variantId: lookupResult.variantId,
        branchId: effectiveBranchId,
        issueDescription: issueDescription.trim(),
        physicalCondition: physicalCondition.trim(),
        images,
      };
      if (lookupResult.customerId) payload.customerId = lookupResult.customerId;
      if (lookupResult.orderId) payload.orderId = lookupResult.orderId;
      // Xuất thủ công: gửi thông tin của khách để backend tìm/tạo user
      if (!lookupResult.customerId) {
        payload.walkInName = walkInCustomerName.trim();
        payload.walkInPhone = walkInCustomerPhone.trim();
      }
    } else {
      payload = {
        imeiOrSerial: walkinImei.trim(),
        productId: selectedProduct!._id,
        variantId: selectedVariant!._id,
        branchId: walkinBranchId,
        issueDescription: issueDescription.trim(),
        physicalCondition: physicalCondition.trim(),
        images,
        walkInName: walkInCustomerName.trim(),
        walkInPhone: walkInCustomerPhone.trim(),
      };
    }

    if (estimatedDate)
      payload.estimatedDate = new Date(estimatedDate).getTime();

    await onSubmit(payload);
    setIsSaving(false);
  };

  // ──────────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Tiếp nhận bảo hành
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Ghi nhận thông tin thiết bị cần bảo hành
          </p>
        </div>
        <button
          onClick={onCancel}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500"
        >
          ✕
        </button>
      </div>

      {/* Mode tabs */}
      <div className="flex border-b border-gray-100 px-6 shrink-0">
        {(
          [
            { key: "store", label: "🏪 Mua tại cửa hàng" },
            { key: "walkin", label: "🚶 Khách vãng lai" },
          ] as const
        ).map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => switchMode(key)}
            className={`py-3 px-5 text-sm font-medium border-b-2 transition-colors ${
              mode === key
                ? "border-purple-500 text-purple-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <form id="warranty-form" onSubmit={handleSubmit} className="space-y-6">
          {/* ── Mode 1: Mua tại cửa hàng ── */}
          {mode === "store" && (
            <section>
              <h3 className={lc + " mb-3"}>Tra cứu IMEI / Serial</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={storeImei}
                  onChange={(e) => {
                    setStoreImei(e.target.value);
                    setLookupResult(null);
                    setLookupNotFound(false);
                  }}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), handleImeiLookup())
                  }
                  placeholder="Nhập IMEI hoặc Serial Number..."
                  className={`${fc} flex-1 font-mono`}
                />
                <button
                  type="button"
                  onClick={handleImeiLookup}
                  disabled={isLooking || !storeImei.trim()}
                  className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors shrink-0"
                >
                  {isLooking ? "..." : "Tra cứu"}
                </button>
              </div>
              {errors.imei && <p className={ec}>{errors.imei}</p>}
              {errors.lookup && <p className={ec}>{errors.lookup}</p>}

              {lookupNotFound && (
                <div className="mt-3 bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 flex items-start gap-2">
                  <span className="text-orange-500 shrink-0 mt-0.5">⚠</span>
                  <div>
                    <p className="text-sm font-semibold text-orange-800">
                      Không tìm thấy IMEI trong kho xuất
                    </p>
                    <p className="text-xs text-orange-600 mt-0.5">
                      Thiết bị có thể chưa được bán qua hệ thống. Hãy chuyển
                      sang chế độ <strong>Khách vãng lai</strong>.
                    </p>
                  </div>
                </div>
              )}

              {lookupResult && (
                <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-bold text-green-700 uppercase tracking-wide">
                    Đã tìm thấy — thông tin tự động điền
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <InfoChip
                      label="Khách hàng"
                      value={
                        lookupResult.customerName
                          ? `${lookupResult.customerName}${lookupResult.customerPhone ? " · " + lookupResult.customerPhone : ""}`
                          : "Không xác định"
                      }
                    />
                    <InfoChip
                      label="Đơn hàng"
                      value={
                        lookupResult.orderId
                          ? `...${lookupResult.orderId.slice(-8)}`
                          : "Xuất thủ công"
                      }
                    />
                    <InfoChip
                      label="Product ID"
                      value={`...${lookupResult.productId.slice(-8)}`}
                      mono
                    />
                    <InfoChip
                      label="Variant ID"
                      value={`...${lookupResult.variantId.slice(-8)}`}
                      mono
                    />
                    <InfoChip
                      label="Chi nhánh"
                      value={(() => {
                        const bid = fixedBranchId ?? lookupResult.branchId;
                        return (
                          branches.find((b) => b._id === bid)?.name ??
                          `...${bid.slice(-6)}`
                        );
                      })()}
                    />
                  </div>
                </div>
              )}

              {/* Xuất thủ công: không có đơn online → nhập thông tin khách */}
              {lookupResult && !lookupResult.customerId && (
                <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                    Xuất thủ công — vui lòng nhập thông tin khách
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lc}>
                        Tên khách hàng <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={walkInCustomerName}
                        onChange={(e) => setWalkInCustomerName(e.target.value)}
                        placeholder="Nguyễn Văn A"
                        className={fc}
                      />
                      {errors.walkInName && (
                        <p className={ec}>{errors.walkInName}</p>
                      )}
                    </div>
                    <div>
                      <label className={lc}>
                        Số điện thoại <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={walkInCustomerPhone}
                        onChange={(e) => setWalkInCustomerPhone(e.target.value)}
                        placeholder="09xxxxxxxx"
                        className={fc}
                      />
                      {errors.walkInPhone && (
                        <p className={ec}>{errors.walkInPhone}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ── Mode 2: Khách vãng lai ── */}
          {mode === "walkin" && (
            <>
              <section>
                <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">
                  Thông tin khách hàng
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lc}>
                      Tên khách hàng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={walkInCustomerName}
                      onChange={(e) => setWalkInCustomerName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className={fc}
                    />
                    {errors.walkInName && (
                      <p className={ec}>{errors.walkInName}</p>
                    )}
                  </div>
                  <div>
                    <label className={lc}>
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={walkInCustomerPhone}
                      onChange={(e) => setWalkInCustomerPhone(e.target.value)}
                      placeholder="09xxxxxxxx"
                      className={fc}
                    />
                    {errors.walkInPhone && (
                      <p className={ec}>{errors.walkInPhone}</p>
                    )}
                  </div>
                </div>
              </section>

              <section>
                <label className={lc}>
                  IMEI / Serial Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={walkinImei}
                  onChange={(e) => setWalkinImei(e.target.value)}
                  placeholder="Nhập số IMEI hoặc Serial Number"
                  className={`${fc} font-mono`}
                />
                {errors.imei && <p className={ec}>{errors.imei}</p>}
              </section>

              <section>
                <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">
                  Sản phẩm
                </h3>
                {!selectedProduct ? (
                  <>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), handleProductSearch())
                        }
                        placeholder="Tìm tên sản phẩm..."
                        className={`${fc} flex-1`}
                      />
                      <button
                        type="button"
                        onClick={handleProductSearch}
                        disabled={isSearchingProduct}
                        className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50 shrink-0"
                      >
                        {isSearchingProduct ? "..." : "Tìm"}
                      </button>
                    </div>
                    {productOptions.length > 0 && (
                      <ul className="mt-2 border border-gray-200 rounded-lg divide-y divide-gray-100 bg-white shadow-sm max-h-44 overflow-y-auto">
                        {productOptions.map((p) => (
                          <li
                            key={p._id}
                            onClick={() => {
                              setSelectedProduct(p);
                              setSelectedVariant(null);
                              setProductOptions([]);
                            }}
                            className="px-3 py-2 text-sm cursor-pointer hover:bg-purple-50 transition-colors"
                          >
                            <span className="font-medium text-gray-800">
                              {p.title}
                            </span>
                            <span className="text-gray-400 text-xs ml-2">
                              {p.brand}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {errors.product && <p className={ec}>{errors.product}</p>}
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
                      <div>
                        <span className="text-sm font-semibold text-purple-800">
                          {selectedProduct.title}
                        </span>
                        <span className="text-xs text-purple-500 ml-2">
                          {selectedProduct.brand}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProduct(null);
                          setSelectedVariant(null);
                        }}
                        className="text-purple-400 hover:text-purple-600 text-xs"
                      >
                        Đổi
                      </button>
                    </div>
                    <div>
                      <label className={lc}>
                        Phiên bản <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedVariant?._id ?? ""}
                        onChange={(e) => {
                          const v =
                            selectedProduct.variants.find(
                              (v) => v._id === e.target.value,
                            ) ?? null;
                          setSelectedVariant(v);
                        }}
                        className={fc}
                      >
                        <option value="">-- Chọn phiên bản --</option>
                        {selectedProduct.variants.map((v) => (
                          <option key={v._id} value={v._id}>
                            {v.variantName}
                          </option>
                        ))}
                      </select>
                      {errors.variant && <p className={ec}>{errors.variant}</p>}
                    </div>
                  </div>
                )}
              </section>

              <section>
                <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">
                  Chi nhánh tiếp nhận
                </h3>
                {fixedBranchId ? (
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                    {branches.find((b) => b._id === fixedBranchId)?.name ??
                      fixedBranchId}
                  </p>
                ) : (
                  <>
                    <select
                      value={walkinBranchId}
                      onChange={(e) => setWalkinBranchId(e.target.value)}
                      className={fc}
                    >
                      <option value="">-- Chọn chi nhánh --</option>
                      {branches.map((b) => (
                        <option key={b._id} value={b._id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                    {errors.branch && <p className={ec}>{errors.branch}</p>}
                  </>
                )}
              </section>
            </>
          )}

          {/* ── Shared: tình trạng ── */}
          <section>
            <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">
              Tình trạng tiếp nhận
            </h3>
            <div className="space-y-4">
              <div>
                <label className={lc}>
                  Mô tả lỗi <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="Khách mô tả lỗi, triệu chứng..."
                  className={`${fc} resize-none`}
                />
                {errors.issueDescription && (
                  <p className={ec}>{errors.issueDescription}</p>
                )}
              </div>
              <div>
                <label className={lc}>
                  Tình trạng vật lý <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={physicalCondition}
                  onChange={(e) => setPhysicalCondition(e.target.value)}
                  placeholder="VD: Màn hình trầy xước nhẹ, vỏ nguyên vẹn..."
                  className={`${fc} resize-none`}
                />
                {errors.physicalCondition && (
                  <p className={ec}>{errors.physicalCondition}</p>
                )}
              </div>
              <div>
                <label className={lc}>Ngày dự kiến trả (tuỳ chọn)</label>
                <input
                  type="date"
                  value={estimatedDate}
                  onChange={(e) => setEstimatedDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className={fc}
                />
              </div>
              {/* Image upload */}
              <div>
                <label className={lc}>Ảnh thiết bị (tối đa 5 ảnh)</label>
                <label
                  className={`flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors ${
                    images.length >= 5
                      ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                      : "border-purple-200 hover:border-purple-400 hover:bg-purple-50"
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={images.length >= 5 || isUploading}
                    className="hidden"
                    onChange={(e) => handleImageFiles(e.target.files)}
                  />
                  {isUploading ? (
                    <span className="text-sm text-purple-500">
                      Đang tải lên...
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">
                      {images.length >= 5 ? "Đã đủ 5 ảnh" : "Nhấn để chọn ảnh"}
                    </span>
                  )}
                </label>
                {images.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {images.map((url, idx) => (
                      <div
                        key={url}
                        className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group"
                      >
                        <img
                          src={url}
                          alt={`ảnh ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity text-lg"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </form>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 shrink-0">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-5 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Huỷ
        </button>
        <button
          type="submit"
          form="warranty-form"
          disabled={isSaving || isUploading}
          className="px-6 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving && (
            <svg
              className="animate-spin h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
          )}
          {isSaving ? "Đang lưu..." : "Tiếp nhận"}
        </button>
      </div>
    </motion.div>
  );
};

export default WarrantyForm;
