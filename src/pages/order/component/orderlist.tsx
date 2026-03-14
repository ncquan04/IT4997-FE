export default function OrderList({ orders }: { orders: any[] }) {
    return (
        <div className="container mx-auto px-4 py-6 max-w-screen-xl">
            <h1 className="text-2xl font-semibold mb-6">Đơn hàng</h1>

            {orders.length === 0 && (
                <p className="text-gray-500 text-center">Chưa có đơn hàng nào</p>
            )}

            <div
                className="
                    grid gap-4
                    grid-cols-1
                    sm:grid-cols-2
                    lg:grid-cols-3
                    "
            >
                {orders.map((order) => (
                    <div
                        key={order._id}
                        className="
                                bg-white rounded-xl shadow-sm
                                p-4
                                hover:shadow-md transition
                                flex flex-col justify-between
                                "
                    >
                        {/* Header */}
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="font-medium text-sm">#{order._id.slice(-6)}</span>
                                <span className="text-xs text-gray-500">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            {/* Status */}
                            <div className="flex flex-wrap gap-2 text-xs mb-2">
                                <span className="px-2 py-0.5 rounded bg-green-100 text-green-600">
                                    {order.payment.method.toUpperCase()}
                                </span>
                                <span className="text-gray-600">
                                    {renderOrderStatus(order.statusOrder)}
                                </span>
                            </div>

                            {/* Product */}
                            <div className="text-sm text-gray-700 line-clamp-2">
                                {order.listProduct[0].title} x{order.listProduct[0].quantity}
                                {order.listProduct.length > 1 &&
                                    ` (+${order.listProduct.length - 1} sản phẩm)`}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-between items-center mt-4">
                            <span className="font-semibold text-red-500 text-sm">
                                {order.sumPrice.toLocaleString()} ₫
                            </span>

                            <button className="text-sm text-blue-600 hover:underline">
                                Chi tiết
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
function renderOrderStatus(status: number) {
    switch (status) {
        case 11:
            return "Đang xử lý";
        case 12:
            return "Đang giao hàng";
        case 13:
            return "Hoàn thành";
        default:
            return "Không xác định";
    }
}
