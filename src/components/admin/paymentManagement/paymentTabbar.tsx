import { setPaymentTab } from "../../../redux/slice/payment-management.slice";
import { useAppDispatch, useAppSelector, type RootState } from "../../../redux/store";
import { Contacts } from "../../../shared/contacts";

const PAYMENT_STATUS = Contacts.Status.Payment;

const PAYMENT_TABS = [
    { key: "PAID", label: "Đã thanh toán", status: PAYMENT_STATUS.PAID },
    { key: "PENDING", label: "Chưa thanh toán", status: PAYMENT_STATUS.UNPAID },
    { key: "REFUNDED", label: "Đã refund", status: PAYMENT_STATUS.REFUNDED },
];

const PaymentStatusTabs = () => {
    const dispatch = useAppDispatch();
    const { paymentTab } = useAppSelector((state: RootState) => state.paymentManagement);

    return (
        <div className="bg-white">
            <div className="flex gap-2 px-4 py-3">
                {PAYMENT_TABS.map((tab) => {
                    const active = paymentTab === tab.status;

                    return (
                        <button
                            key={tab.key}
                            onClick={() => dispatch(setPaymentTab(tab.status))}
                            className={`
                                px-4 py-2 text-sm font-medium rounded-lg
                                transition-all
                                ${
                                    active
                                        ? "bg-blue-50 text-blue-600"
                                        : "text-gray-600 hover:bg-gray-100"
                                }
                            `}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
export default PaymentStatusTabs;
