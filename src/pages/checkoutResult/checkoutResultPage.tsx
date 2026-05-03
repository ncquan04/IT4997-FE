import { useEffect, useState } from "react";
import PageTransition from "../../components/common/PageTransition";
import { useNavigate, useParams } from "react-router";
import { Contacts } from "../../shared/contacts";
import { CheckUpdatePayment } from "../../services/api/api.payment";

const PAYMENT_STATUS = Contacts.Status.Payment_check_update;

export default function CheckoutResultPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [status, setStatus] = useState<
        (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS] | null
    >(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const checkOrderStatus = async () => {
            try {
                const res = await CheckUpdatePayment({ id: id });
                if (res === null) {
                    throw new Error("");
                }
                setStatus(res);
            } catch (err) {
                setStatus(PAYMENT_STATUS.CANCEL);
            } finally {
                setLoading(false);
            }
        };

        checkOrderStatus();
    }, [id]);

    const renderContent = () => {
        switch (status) {
            case PAYMENT_STATUS.SUCCESS:
                return {
                    title: "🎉 Mua hàng thành công",
                    message: "Đơn hàng của bạn đã được xác nhận.",
                    color: "text-green-600",
                };

            case PAYMENT_STATUS.PROCESS:
                return {
                    title: "⏳ Đơn hàng đang xử lý",
                    message: "Bạn đã chọn COD. Vui lòng chờ xác nhận.",
                    color: "text-yellow-600",
                };

            case PAYMENT_STATUS.CANCEL:
            default:
                return {
                    title: "❌ Mua hàng thất bại",
                    message: "Đơn hàng đã bị huỷ hoặc thanh toán không thành công.",
                    color: "text-red-600",
                };
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <p className="text-gray-500">Đang kiểm tra trạng thái đơn hàng...</p>
            </div>
        );
    }

    const { title, message, color } = renderContent();

    return (
        <PageTransition>
        <div className="flex justify-center items-center h-[70vh]">
            <div className="bg-white shadow-md rounded-xl p-8 text-center max-w-md w-full">
                <h1 className={`text-2xl font-semibold mb-3 ${color}`}>{title}</h1>
                <p className="text-gray-600 mb-6">{message}</p>

                <button
                    onClick={() => navigate("/orders")}
                    className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                    Xem danh sách đơn hàng
                </button>
            </div>
        </div>
        </PageTransition>
    );
}
