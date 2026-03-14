import { Contacts } from "../../../shared/contacts";

const ORDER_STATUS = Contacts.Status.Order;

const FILTERS = [
    { key: ORDER_STATUS.PROCESSING, label: "Đã đặt" },
    { key: ORDER_STATUS.CANCELLED, label: "Thất bại" },
    { key: ORDER_STATUS.DELIVERED, label: "Hoàn thành" },
    { key: ORDER_STATUS.RETURNED, label: "Hoàn hàng" },
];

export default function OrderSidebar({ active, onChange }: any) {
    return (
        <>
            {/* MOBILE: horizontal tabs */}
            <div className="md:hidden mb-4">
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {FILTERS.map((item) => (
                        <button
                            key={item.key}
                            onClick={() => onChange(item.key)}
                            className={`
                whitespace-nowrap
                px-4 py-2 rounded-full text-sm
                ${active === item.key ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}
              `}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* DESKTOP: sidebar */}
            <div className="hidden md:block w-64 border-r pr-4">
                <h3 className="font-semibold mb-4">Đơn hàng</h3>

                <ul className="space-y-2">
                    {FILTERS.map((item) => (
                        <li key={item.key}>
                            <button
                                onClick={() => onChange(item.key)}
                                className={`
                  w-full text-left px-3 py-2 rounded
                  ${active === item.key ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"}
                `}
                            >
                                {item.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}
