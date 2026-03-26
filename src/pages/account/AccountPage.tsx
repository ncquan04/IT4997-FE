import { useEffect, useState } from "react";
import CommonButton from "../../components/common/CommonButton";
import { fetchMyWarranties } from "../../services/api/api.warranty";
import { Contacts } from "../../shared/contacts";
import type { IWarrantyListItem } from "../../types/warranty.types";

const WARRANTY_STATUS = Contacts.Status.Warranty;

const WARRANTY_LABELS: Record<number, string> = {
  [WARRANTY_STATUS.RECEIVED]: "Đã tiếp nhận",
  [WARRANTY_STATUS.DIAGNOSING]: "Đang chẩn đoán",
  [WARRANTY_STATUS.REPAIRING]: "Đang sửa chữa",
  [WARRANTY_STATUS.WAITING_PARTS]: "Chờ linh kiện",
  [WARRANTY_STATUS.COMPLETED]: "Hoàn tất sửa chữa",
  [WARRANTY_STATUS.RETURNED]: "Đã trả máy",
};

const WARRANTY_STATUS_COLORS: Record<number, string> = {
  [WARRANTY_STATUS.RECEIVED]: "bg-blue-100 text-blue-700",
  [WARRANTY_STATUS.DIAGNOSING]: "bg-yellow-100 text-yellow-700",
  [WARRANTY_STATUS.REPAIRING]: "bg-orange-100 text-orange-700",
  [WARRANTY_STATUS.WAITING_PARTS]: "bg-purple-100 text-purple-700",
  [WARRANTY_STATUS.COMPLETED]: "bg-green-100 text-green-700",
  [WARRANTY_STATUS.RETURNED]: "bg-gray-100 text-gray-600",
};

type Tab = "profile" | "warranty";

const AccountPage = () => {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  // Profile state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Warranty state
  const [warranties, setWarranties] = useState<IWarrantyListItem[]>([]);
  const [warrantyLoading, setWarrantyLoading] = useState(false);

  useEffect(() => {
    if (activeTab !== "warranty") return;
    setWarrantyLoading(true);
    fetchMyWarranties({ limit: 20 }).then((res) => {
      setWarranties(res?.data ?? []);
      setWarrantyLoading(false);
    });
  }, [activeTab]);

  const handleSaveChanges = () => {
    //
  };

  return (
    <div className="w-full flex justify-center pt-20 pb-24 px-4 md:px-0">
      <div className="w-full max-w-[1170px] flex flex-col gap-10 md:gap-20">
        <div className="flex flex-col md:flex-row w-full gap-8 md:gap-[100px]">
          <aside className="flex flex-col gap-6 w-full md:w-[250px]">
            <div className="flex flex-col gap-4">
              <h3 className="font-medium text-base text-black">
                Manage My Account
              </h3>
              <ul className="flex flex-col gap-2 pl-9">
                <li
                  className={`cursor-pointer ${activeTab === "profile" ? "text-red-500" : "text-gray-500 hover:text-black"}`}
                  onClick={() => setActiveTab("profile")}
                >
                  My Profile
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="font-medium text-base text-black">My Orders</h3>
              <ul className="flex flex-col gap-2 pl-9">
                <li className="text-gray-500 cursor-pointer hover:text-black">
                  My Returns
                </li>
                <li className="text-gray-500 cursor-pointer hover:text-black">
                  My Cancellations
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="font-medium text-base text-black">My Warranty</h3>
              <ul className="flex flex-col gap-2 pl-9">
                <li
                  className={`cursor-pointer ${activeTab === "warranty" ? "text-red-500" : "text-gray-500 hover:text-black"}`}
                  onClick={() => setActiveTab("warranty")}
                >
                  Warranty Requests
                </li>
              </ul>
            </div>
          </aside>

          <section className="flex-1 shadow-[0px_1px_13px_0px_rgba(0,0,0,0.05)] p-6 md:p-20 rounded bg-white">
            {activeTab === "profile" && (
              <>
                <h2 className="text-xl font-medium text-red-500 mb-4">
                  Edit Your Profile
                </h2>

                <form className="flex flex-col gap-6">
                  <div className="flex flex-col md:flex-row gap-4 md:gap-12 w-full">
                    <div className="flex flex-col gap-2 w-full">
                      <label
                        htmlFor="firstName"
                        className="text-base text-black"
                      >
                        First Name
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full h-[50px] bg-secondary rounded px-4 outline-none text-black placeholder:text-gray-400"
                      />
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                      <label
                        htmlFor="lastName"
                        className="text-base text-black"
                      >
                        Last Name
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full h-[50px] bg-secondary rounded px-4 outline-none text-black placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 md:gap-12 w-full">
                    <div className="flex flex-col gap-2 w-full">
                      <label htmlFor="email" className="text-base text-black">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-[50px] bg-secondary rounded px-4 outline-none text-black placeholder:text-gray-400"
                      />
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                      <label htmlFor="address" className="text-base text-black">
                        Address
                      </label>
                      <input
                        id="address"
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full h-[50px] bg-secondary rounded px-4 outline-none text-black placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 mt-2">
                    <div className="flex flex-col gap-2 w-full">
                      <label className="text-base text-black">
                        Password Changes
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full h-[50px] bg-secondary rounded px-4 outline-none text-black placeholder:text-gray-400"
                        placeholder="Current Password"
                        aria-label="Current Password"
                      />
                    </div>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full h-[50px] bg-secondary rounded px-4 outline-none text-black placeholder:text-gray-400"
                      placeholder="New Password"
                      aria-label="New Password"
                    />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-[50px] bg-secondary rounded px-4 outline-none text-black placeholder:text-gray-400"
                      placeholder="Confirm New Password"
                      aria-label="Confirm New Password"
                    />
                  </div>

                  <div className="flex justify-end items-center gap-8 mt-4">
                    <button
                      type="button"
                      className="text-black hover:text-red-500"
                    >
                      Cancel
                    </button>
                    <CommonButton
                      label="Save Changes"
                      onClick={handleSaveChanges}
                      className="!w-[214px] !h-[56px]"
                    />
                  </div>
                </form>
              </>
            )}

            {activeTab === "warranty" && (
              <>
                <h2 className="text-xl font-medium text-red-500 mb-6">
                  My Warranty Requests
                </h2>

                {warrantyLoading ? (
                  <p className="text-gray-400 text-sm">Đang tải...</p>
                ) : warranties.length === 0 ? (
                  <p className="text-gray-400 text-sm">
                    Bạn chưa có yêu cầu bảo hành nào.
                  </p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {warranties.map((w) => {
                      const productName =
                        typeof w.productId === "object"
                          ? w.productId.title
                          : w.productId;
                      const branchName =
                        typeof w.branchId === "object"
                          ? (w.branchId as any).name
                          : w.branchId;
                      const statusColor =
                        WARRANTY_STATUS_COLORS[w.status] ??
                        "bg-gray-100 text-gray-600";
                      const statusLabel =
                        WARRANTY_LABELS[w.status] ?? `Trạng thái ${w.status}`;
                      const createdDate = w.createdAt
                        ? new Date(w.createdAt).toLocaleDateString("vi-VN")
                        : "";

                      return (
                        <div
                          key={w._id}
                          className="border border-gray-100 rounded-lg p-4 flex flex-col gap-2"
                        >
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <span className="font-medium text-black text-sm">
                              {productName}
                            </span>
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor}`}
                            >
                              {statusLabel}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 flex flex-col gap-1">
                            <span>
                              <span className="font-medium text-gray-700">
                                IMEI/Serial:
                              </span>{" "}
                              {w.imeiOrSerial}
                            </span>
                            <span>
                              <span className="font-medium text-gray-700">
                                Chi nhánh:
                              </span>{" "}
                              {branchName}
                            </span>
                            <span>
                              <span className="font-medium text-gray-700">
                                Mô tả lỗi:
                              </span>{" "}
                              {w.issueDescription}
                            </span>
                            {createdDate && (
                              <span>
                                <span className="font-medium text-gray-700">
                                  Ngày tiếp nhận:
                                </span>{" "}
                                {createdDate}
                              </span>
                            )}
                            {w.estimatedDate && (
                              <span>
                                <span className="font-medium text-gray-700">
                                  Dự kiến hoàn thành:
                                </span>{" "}
                                {new Date(w.estimatedDate).toLocaleDateString(
                                  "vi-VN",
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
