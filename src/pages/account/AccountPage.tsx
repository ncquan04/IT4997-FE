import { useEffect, useState } from "react";
import CommonButton from "../../components/common/CommonButton";
import {
  fetchMyWarranties,
  fetchPublicRepairHistory,
} from "../../services/api/api.warranty";
import { Contacts } from "../../shared/contacts";
import type {
  IWarrantyListItem,
  IPublicRepairHistoryItem,
} from "../../types/warranty.types";
import {
  getMyMemberInfo,
  getMyPointHistory,
  type IMemberInfo,
  type IPointTransaction,
} from "../../services/api/api.loyalty";
import { formatPrice } from "../../utils";

const WARRANTY_STATUS = Contacts.Status.Warranty;

const WARRANTY_LABELS: Record<number, string> = {
  [WARRANTY_STATUS.RECEIVED]: "Received",
  [WARRANTY_STATUS.DIAGNOSING]: "Diagnosing",
  [WARRANTY_STATUS.REPAIRING]: "Repairing",
  [WARRANTY_STATUS.WAITING_PARTS]: "Waiting for Parts",
  [WARRANTY_STATUS.COMPLETED]: "Repair Completed",
  [WARRANTY_STATUS.RETURNED]: "Returned to Customer",
};

const WARRANTY_STATUS_COLORS: Record<number, string> = {
  [WARRANTY_STATUS.RECEIVED]: "bg-blue-100 text-blue-700",
  [WARRANTY_STATUS.DIAGNOSING]: "bg-yellow-100 text-yellow-700",
  [WARRANTY_STATUS.REPAIRING]: "bg-orange-100 text-orange-700",
  [WARRANTY_STATUS.WAITING_PARTS]: "bg-purple-100 text-purple-700",
  [WARRANTY_STATUS.COMPLETED]: "bg-green-100 text-green-700",
  [WARRANTY_STATUS.RETURNED]: "bg-gray-100 text-gray-600",
};

type Tab = "profile" | "warranty" | "repair-check" | "loyalty";

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

  // Loyalty state
  const [memberInfo, setMemberInfo] = useState<IMemberInfo | null>(null);
  const [pointHistory, setPointHistory] = useState<IPointTransaction[]>([]);
  const [loyaltyLoading, setLoyaltyLoading] = useState(false);

  // Repair check state
  const [imeiInput, setImeiInput] = useState("");
  const [repairHistory, setRepairHistory] = useState<
    IPublicRepairHistoryItem[]
  >([]);
  const [repairSearched, setRepairSearched] = useState(false);
  const [repairFound, setRepairFound] = useState(false);
  const [repairLoading, setRepairLoading] = useState(false);
  const [searchedImei, setSearchedImei] = useState("");

  const handleRepairSearch = async () => {
    const imei = imeiInput.trim();
    if (!imei) return;
    setRepairLoading(true);
    setRepairSearched(false);
    const res = await fetchPublicRepairHistory(imei);
    setRepairLoading(false);
    setRepairSearched(true);
    setSearchedImei(imei);
    setRepairFound(res?.found ?? false);
    setRepairHistory(res?.data ?? []);
  };

  useEffect(() => {
    if (activeTab !== "warranty") return;
    setWarrantyLoading(true);
    fetchMyWarranties({ limit: 20 }).then((res) => {
      setWarranties(res?.data ?? []);
      setWarrantyLoading(false);
    });
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "loyalty") return;
    setLoyaltyLoading(true);
    Promise.all([getMyMemberInfo(), getMyPointHistory(1, 20)]).then(
      ([info, history]) => {
        if (info) setMemberInfo(info);
        if (history) setPointHistory(history.data);
        setLoyaltyLoading(false);
      },
    );
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
                <li
                  className={`cursor-pointer ${activeTab === "repair-check" ? "text-red-500" : "text-gray-500 hover:text-black"}`}
                  onClick={() => setActiveTab("repair-check")}
                >
                  Repair History Check
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="font-medium text-base text-black">Loyalty</h3>
              <ul className="flex flex-col gap-2 pl-9">
                <li
                  className={`cursor-pointer ${activeTab === "loyalty" ? "text-red-500" : "text-gray-500 hover:text-black"}`}
                  onClick={() => setActiveTab("loyalty")}
                >
                  Membership & Points
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
                  <p className="text-gray-400 text-sm">Loading...</p>
                ) : warranties.length === 0 ? (
                  <p className="text-gray-400 text-sm">
                    You have no warranty requests yet.
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
                        WARRANTY_LABELS[w.status] ?? `Status ${w.status}`;
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
                                Branch:
                              </span>{" "}
                              {branchName}
                            </span>
                            <span>
                              <span className="font-medium text-gray-700">
                                Issue:
                              </span>{" "}
                              {w.issueDescription}
                            </span>
                            {createdDate && (
                              <span>
                                <span className="font-medium text-gray-700">
                                  Received:
                                </span>{" "}
                                {createdDate}
                              </span>
                            )}
                            {w.estimatedDate && (
                              <span>
                                <span className="font-medium text-gray-700">
                                  Estimated completion:
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

            {activeTab === "repair-check" && (
              <>
                <h2 className="text-xl font-medium text-red-500 mb-2">
                  Repair History Check
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  Enter the IMEI or Serial Number of a device to view its full
                  repair and warranty history.
                </p>

                <div className="flex gap-2 mb-6">
                  <input
                    type="text"
                    value={imeiInput}
                    onChange={(e) => setImeiInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleRepairSearch()}
                    placeholder="Enter IMEI or Serial Number..."
                    className="flex-1 h-[50px] bg-secondary rounded px-4 outline-none text-black placeholder:text-gray-400 text-sm border border-gray-200 focus:border-red-300"
                  />
                  <CommonButton
                    label={repairLoading ? "Searching..." : "Search"}
                    onClick={handleRepairSearch}
                    className="!w-[110px] !h-[50px] !text-sm"
                  />
                </div>

                {repairLoading && (
                  <p className="text-sm text-gray-400 text-center py-6">
                    Searching...
                  </p>
                )}

                {!repairLoading && repairSearched && !repairFound && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No repair history found for IMEI/Serial{" "}
                    <span className="font-mono font-medium text-gray-600">
                      {searchedImei}
                    </span>
                    .
                  </div>
                )}

                {!repairLoading && repairFound && repairHistory.length > 0 && (
                  <>
                    <p className="text-xs text-gray-500 mb-4">
                      Found{" "}
                      <span className="font-semibold text-gray-700">
                        {repairHistory.length}
                      </span>{" "}
                      repair{repairHistory.length > 1 ? "s" : ""} for{" "}
                      <span className="font-mono font-medium text-gray-700">
                        {searchedImei}
                      </span>
                    </p>
                    <ol className="relative border-l-2 border-red-100 space-y-5 ml-2">
                      {repairHistory.map((item, idx) => (
                        <li key={idx} className="ml-4">
                          <span className="absolute -left-[9px] mt-1 w-4 h-4 rounded-full bg-red-400 border-2 border-white" />
                          <div className="border border-gray-100 rounded-lg p-4 flex flex-col gap-1.5">
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-black">
                                {item.action}
                              </span>
                              <span className="text-xs text-gray-400 whitespace-nowrap">
                                {new Date(item.date).toLocaleDateString(
                                  "vi-VN",
                                  {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  },
                                )}
                              </span>
                            </div>
                            {item.note && (
                              <p className="text-sm text-gray-600">
                                {item.note}
                              </p>
                            )}
                            {item.replacedParts.length > 0 && (
                              <p className="text-xs text-gray-500">
                                <span className="font-medium text-gray-700">
                                  Replaced parts:
                                </span>{" "}
                                {item.replacedParts.join(", ")}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </>
                )}
              </>
            )}

            {activeTab === "loyalty" && (
              <>
                <h2 className="text-xl font-medium text-red-500 mb-6">
                  Membership & Points
                </h2>

                {loyaltyLoading ? (
                  <p className="text-sm text-gray-400">Loading...</p>
                ) : (
                  <>
                    {/* TIER CARD */}
                    {memberInfo && (
                      <div className="rounded-xl border border-gray-100 bg-linear-to-r from-gray-50 to-white p-5 mb-6 flex flex-col gap-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
                              Hạng thành viên
                            </p>
                            <p className="text-2xl font-bold text-black">
                              {memberInfo.memberTier === "S_NEW"
                                ? "S-New"
                                : memberInfo.memberTier === "S_MEM"
                                  ? "S-Mem"
                                  : "S-Class"}
                            </p>
                          </div>
                          {memberInfo.discountPercent > 0 && (
                            <span className="bg-red-50 text-red-500 text-sm font-semibold px-3 py-1 rounded-full">
                              -{memberInfo.discountPercent}% mỗi đơn
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 text-sm">
                          <div className="flex-1 bg-white rounded-lg border border-gray-100 p-3">
                            <p className="text-gray-400 text-xs mb-1">
                              Điểm khả dụng
                            </p>
                            <p className="text-xl font-bold text-black">
                              {memberInfo.loyaltyPoints.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              = {formatPrice(memberInfo.loyaltyPoints)} khi đổi
                            </p>
                          </div>
                          <div className="flex-1 bg-white rounded-lg border border-gray-100 p-3">
                            <p className="text-gray-400 text-xs mb-1">
                              Chi tiêu kỳ này
                            </p>
                            <p className="text-lg font-semibold text-black">
                              {formatPrice(memberInfo.spentInWindow)}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Kỳ kết thúc{" "}
                              {new Date(
                                memberInfo.windowEndsAt,
                              ).toLocaleDateString("vi-VN")}
                            </p>
                          </div>
                        </div>

                        {memberInfo.nextTier && (
                          <div className="text-xs text-gray-500 bg-yellow-50 border border-yellow-100 rounded-lg px-3 py-2">
                            Còn{" "}
                            <span className="font-semibold text-yellow-700">
                              {formatPrice(memberInfo.nextTier.remaining)}
                            </span>{" "}
                            để lên hạng{" "}
                            <span className="font-semibold">
                              {memberInfo.nextTier.tier === "S_MEM"
                                ? "S-Mem"
                                : "S-Class"}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* POINT HISTORY */}
                    <h3 className="font-medium text-black mb-3">
                      Lịch sử điểm
                    </h3>
                    {pointHistory.length === 0 ? (
                      <p className="text-sm text-gray-400">
                        Chưa có giao dịch điểm nào.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {pointHistory.map((tx) => {
                          const isEarn = tx.type === "EARN";
                          const isRedeem = tx.type === "REDEEM";
                          const sign = tx.points > 0 ? "+" : "";
                          const color = isEarn
                            ? "text-green-600"
                            : isRedeem
                              ? "text-red-500"
                              : "text-gray-400";
                          const label =
                            tx.type === "EARN"
                              ? "Tích điểm"
                              : tx.type === "REDEEM"
                                ? "Đổi điểm"
                                : "Hết hạn";

                          return (
                            <div
                              key={tx._id}
                              className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3 text-sm"
                            >
                              <div className="flex flex-col gap-0.5">
                                <span className="font-medium text-black">
                                  {label}
                                </span>
                                {tx.note && (
                                  <span className="text-xs text-gray-400">
                                    {tx.note}
                                  </span>
                                )}
                                <span className="text-xs text-gray-400">
                                  {new Date(tx.createdAt).toLocaleDateString(
                                    "vi-VN",
                                  )}
                                  {isEarn && tx.expiresAt && (
                                    <>
                                      {" "}
                                      · HH{" "}
                                      {new Date(
                                        tx.expiresAt,
                                      ).toLocaleDateString("vi-VN")}
                                    </>
                                  )}
                                </span>
                              </div>
                              <span
                                className={`font-semibold text-base ${color}`}
                              >
                                {sign}
                                {tx.points.toLocaleString()} điểm
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
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
