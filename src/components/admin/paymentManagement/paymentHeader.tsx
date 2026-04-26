import { useState } from "react";
import SearchIcon from "../../../icons/SearchIcon";
import {
  useAppDispatch,
  useAppSelector,
  type RootState,
} from "../../../redux/store";
import paymentManagementAsync from "../../../redux/async-thunk/payment-management.thunk";

const PaymentManagementHeader = () => {
  const dispatch = useAppDispatch();
  const { paymentTab } = useAppSelector(
    (state: RootState) => state.paymentManagement,
  );
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    const value = input.trim();
    if (!value || value.length === 0) return;
    dispatch(
      paymentManagementAsync.ordersPaymentStatus({
        page: 1,
        paymentTab,
        search: value,
      }),
    );
  };

  return (
    <div className="bg-white border-b">
      <div className="px-4 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Payment Management
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            View and manage orders and payment details
          </p>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 sm:flex-none">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
              }}
              placeholder="Tìm theo mã đơn, SĐT..."
              className="
                                w-full pl-9 pr-3 py-2 text-sm
                                border rounded-md
                                focus:outline-none focus:ring-2 focus:ring-blue-500
                            "
            />
          </div>

          {/* Search button */}
          <button
            className="
                            px-3 py-2 text-sm
                            border rounded-md
                            hover:bg-gray-50 whitespace-nowrap
                        "
            onClick={handleSubmit}
          >
            Tìm kiếm
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentManagementHeader;
