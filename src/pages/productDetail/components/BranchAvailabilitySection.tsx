import type { IProductBranchAvailability } from "../../../services/api/api.products";

interface BranchAvailabilitySectionProps {
  hasVariant: boolean;
  branchAvailability: IProductBranchAvailability[];
  isLoadingAvailability: boolean;
  selectedBranchId: string;
  nearestBranchId: string;
  isLocatingNearest: boolean;
  selectedBranch?: IProductBranchAvailability;
  onSelectBranch: (branchId: string) => void;
  onUseCurrentLocation: () => void;
}

const BranchAvailabilitySection = ({
  hasVariant,
  branchAvailability,
  isLoadingAvailability,
  selectedBranchId,
  nearestBranchId,
  isLocatingNearest,
  selectedBranch,
  onSelectBranch,
  onUseCurrentLocation,
}: BranchAvailabilitySectionProps) => {
  if (!hasVariant) {
    return null;
  }

  return (
    <section className="mt-6 rounded-md border border-gray-200 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="text-sm font-medium text-black">
          Sản phẩm này còn hàng tại {branchAvailability.length} chi nhánh
        </p>
        <button
          type="button"
          onClick={onUseCurrentLocation}
          disabled={isLocatingNearest || branchAvailability.length === 0}
          className="inline-flex items-center justify-center rounded border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLocatingNearest
            ? "Đang xác định vị trí..."
            : "Dùng vị trí hiện tại"}
        </button>
      </div>

      {isLoadingAvailability ? (
        <p className="mt-2 text-xs text-gray-500">
          Đang tải danh sách chi nhánh...
        </p>
      ) : branchAvailability.length === 0 ? (
        <p className="mt-2 text-xs text-gray-500">
          Hiện chưa có chi nhánh nào còn hàng cho phiên bản này.
        </p>
      ) : (
        <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
          <ul className="max-h-72 overflow-y-auto space-y-2">
            {branchAvailability.map((branch) => {
              const isSelected = branch.branchId === selectedBranchId;

              return (
                <li key={branch.branchId}>
                  <button
                    type="button"
                    onClick={() => onSelectBranch(branch.branchId)}
                    className={`w-full text-left flex items-start justify-between gap-3 rounded border p-3 transition-colors ${
                      isSelected
                        ? "border-button2 bg-red-50"
                        : "border-gray-100 hover:border-gray-300"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium text-black">
                        {branch.name}
                      </p>
                      <p className="text-xs text-gray-500">{branch.address}</p>
                      {branch.branchId === nearestBranchId && (
                        <span className="mt-1 inline-block rounded bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                          Gần bạn nhất
                        </span>
                      )}
                    </div>
                    <span className="shrink-0 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                      Còn {branch.quantity}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="rounded border border-gray-100 overflow-hidden min-h-[260px]">
            {selectedBranch ? (
              <div className="h-full flex flex-col">
                <div className="border-b border-gray-100 p-3">
                  <p className="text-sm font-semibold text-black">
                    {selectedBranch.name}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {selectedBranch.address}
                  </p>
                  <p className="mt-1 text-xs text-gray-700">
                    SĐT: {selectedBranch.phone}
                  </p>
                </div>
                <iframe
                  title={`Map - ${selectedBranch.name}`}
                  src={`https://www.google.com/maps?q=${encodeURIComponent(selectedBranch.address)}&output=embed`}
                  className="w-full h-[260px] lg:h-full min-h-[260px]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            ) : (
              <div className="w-full h-[260px] flex items-center justify-center text-sm text-gray-500">
                Chọn một chi nhánh để xem bản đồ.
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default BranchAvailabilitySection;
