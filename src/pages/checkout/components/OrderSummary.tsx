import { useEffect, useMemo } from "react";
import bank1 from "../../../assets/images/image 30.png";
import bank2 from "../../../assets/images/image 31.png";
import bank3 from "../../../assets/images/image 32.png";
import bank4 from "../../../assets/images/image 33.png";
import { formatPrice } from "../../../utils";
import { useAppDispatch, useAppSelector, type RootState } from "../../../redux/store";
import { updateOrder } from "../../../redux/slice/payment.slice";
import { Contacts } from "../../../shared/contacts";

const bankOptionsImg = [bank1, bank2, bank3, bank4];

const PAYMENT_METHOD = Contacts.PaymentMethod;

const OrderSummary = () => {
    const dispatch = useAppDispatch();
    const method = useAppSelector((state: RootState) => state.payment.order.method);
    const products = useAppSelector((state: RootState) => state.payment.order.listProduct);
    const orderCalc = useMemo(() => {
        return products.map((item) => {
            const originalPrice = item.variant.price;
            const salePrice = item.variant.salePrice ?? originalPrice;
            const discount = originalPrice - salePrice;

            return {
                ...item,
                originalPrice,
                salePrice,
                discount,
                total: salePrice * item.quantity,
            };
        });
    }, [products]);

    const subtotal = orderCalc.reduce((sum, i) => sum + i.total, 0);
    const totalDiscount = orderCalc.reduce((sum, i) => sum + i.discount * i.quantity, 0);

    useEffect(() => {
        dispatch(updateOrder({ field: "sumPrice", value: subtotal }));
    }, [subtotal]);

    const handleChangeMethod = (method: (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD]) => {
        dispatch(updateOrder({ field: "method", value: method }));
    };

    return (
        <>
            {/* PRODUCT LIST */}
            <div className="space-y-4">
                {orderCalc.map((item) => (
                    <div
                        key={`${item.product._id}-${item.variant._id}`}
                        className="border border-gray-200 rounded-lg p-4 space-y-4"
                    >
                        {/* PRODUCT HEADER */}
                        <div className="flex gap-4">
                            <img
                                src={item.variant.images[0]}
                                alt={item.variant.sku}
                                className="w-16 h-16 object-contain border rounded"
                            />
                            <div>
                                <p className="font-medium">{item.product.title}</p>
                                <p className="text-sm text-gray-500">
                                    Variant: {item.variant.version}
                                </p>
                            </div>
                        </div>

                        {/* PRICE INFO */}
                        <div className="text-sm space-y-2">
                            <div className="flex justify-between">
                                <span>Quantity</span>
                                <span>{item.quantity}</span>
                            </div>

                            <div className="flex justify-between">
                                <span>Original price</span>
                                <span className="line-through text-gray-400">
                                    {formatPrice(item.originalPrice)}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span>Discount</span>
                                <span className="text-green-600">
                                    {item.discount > 0 ? `-${formatPrice(item.discount)}` : "-"}
                                </span>
                            </div>

                            <div className="flex justify-between font-medium">
                                <span>Item total</span>
                                <span>{formatPrice(item.total)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ORDER SUMMARY */}
            <div className="border-t pt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal + totalDiscount)}</span>
                </div>

                <div className="flex justify-between text-green-600">
                    <span>Total discount</span>
                    <span>-{formatPrice(totalDiscount)}</span>
                </div>

                <div className="flex justify-between font-semibold text-base border-t pt-3">
                    <span>Total</span>
                    <span>{formatPrice(subtotal)}</span>
                </div>
            </div>

            {/* PAYMENT */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <input
                            type="radio"
                            id="bank"
                            name="payment"
                            className="w-5 h-5 accent-black"
                            checked={method === PAYMENT_METHOD.STRIPE}
                            onChange={() => {
                                handleChangeMethod(PAYMENT_METHOD.STRIPE);
                            }}
                            style={{ colorScheme: "light" }}
                        />
                        <label htmlFor="bank" className="text-base cursor-pointer">
                            Bank
                        </label>
                    </div>
                    <div className="flex gap-2">
                        {bankOptionsImg.map((bank, index) => (
                            <div
                                key={index}
                                className="w-[42px] h-[28px] flex justify-center items-center"
                            >
                                <img src={bank} alt={`Bank ${index + 1}`} />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <input
                        type="radio"
                        id="cod"
                        name="payment"
                        className="w-5 h-5 accent-black"
                        checked={method === PAYMENT_METHOD.COD}
                        onChange={() => {
                            handleChangeMethod(PAYMENT_METHOD.COD);
                        }}
                        style={{ colorScheme: "light" }}
                    />
                    <label htmlFor="cod" className="text-base cursor-pointer">
                        Cash on delivery
                    </label>
                </div>
            </div>
        </>
    );
};

export default OrderSummary;
