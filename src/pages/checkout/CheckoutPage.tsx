import PageTransition from "../../components/common/PageTransition";
import { useLocation } from "react-router";
import {
  type IProduct,
  type IProductVariant,
} from "../../shared/models/product-model";
import { HORIZONTAL_PADDING_REM } from "../../constants";
import BillingDetails from "./components/BillingDetails";
import OrderSummary from "./components/OrderSummary";
import {
  useAppDispatch,
  useAppSelector,
  type RootState,
} from "../../redux/store";
import { useEffect, useMemo, useState } from "react";
import {
  updateOrder,
  type UserInfoType,
} from "../../redux/slice/payment.slice";
import type { IInputBillingProps } from "./components/inputBilling";
import CommonButton from "../../components/common/CommonButton";
import { createOrderBuyNow } from "../../services/api/api.order";
import { createPayment } from "../../services/api/api.payment";
import { fetchProductAvailability } from "../../services/api/api.products";
import {
  getUserCoordinatesByIp,
  sortBranchesByDistance,
} from "../../utils/geo";
import CouponCode from "../cart/components/CouponCode";

interface CheckoutState {
  products: {
    product: IProduct;
    variant: IProductVariant;
    quantity: number;
  }[];
}

const BillingInputData: (IInputBillingProps & { key?: UserInfoType })[] = [
  {
    label: "First Name",
    isRequired: true,
    key: "name",
    type: "text",
  },
  {
    label: "Company Name",
    type: "text",
  },
  {
    label: "Street Address",
    isRequired: true,
    key: "streetAddress",
    type: "text",
  },
  {
    label: "Town/City",
    isRequired: true,
    key: "city",
    type: "text",
  },
  {
    label: "Phone Number",
    isRequired: true,
    key: "numberPhone",
    type: "number",
  },
];

const CheckoutPage = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { userInfo, order } = useAppSelector(
    (state: RootState) => state.payment,
  );
  const state = location.state as CheckoutState;
  // Memoize so the array reference is stable — a bare `|| []` would create a
  // new reference every render and cause the useEffect below to loop forever.
  const products = useMemo(() => state?.products ?? [], []);

  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);

  const handleCouponApply = (code: string, discountAmount: number) => {
    setCouponCode(code);
    setCouponDiscount(discountAmount);
  };

  // Derive items for product-specific coupon validation
  const couponItems = useMemo(
    () =>
      products.map((p) => ({
        productId: p.product._id,
        price:
          p.variant.effectiveDiscountPrice ??
          (p.variant.salePrice && p.variant.salePrice < p.variant.price
            ? p.variant.salePrice
            : p.variant.price),
        quantity: p.quantity,
      })),
    [products],
  );

  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const disable =
    useMemo(() => {
      return BillingInputData.some((e) => {
        if (!e.isRequired || !e.key) return false;
        return userInfo[e.key].trim() === "";
      });
    }, [userInfo, BillingInputData]) || isError;

  const handleBuyNow = async () => {
    try {
      const listProduct = order.listProduct.map((e) => ({
        productId: e.product._id,
        variantId: e.variant._id,
        variantName: e.variant.variantName ?? "",
        image: e.variant.images?.[0] ?? "",
        title: e.variant.variantName
          ? `${e.product.title} - ${e.variant.variantName}`
          : e.product.title,
        description: e.product.description || e.product.title,
        price:
          e.variant.salePrice && e.variant.salePrice < e.variant.price
            ? e.variant.salePrice
            : e.variant.price,
        costPrice: e.variant.costPrice ?? 0,
        quantity: e.quantity,
        discount: e.variant.salePrice
          ? e.variant.price - e.variant.salePrice
          : 0,
        totalMoney:
          e.variant.salePrice && e.variant.salePrice < e.variant.price
            ? e.variant.salePrice * e.quantity
            : e.variant.price * e.quantity,
      }));

      // Build branchPriority: fetch availability for all items, collect unique
      // branches, then sort by distance from user location (IP-based).
      const availabilities = await Promise.all(
        order.listProduct.map((e) =>
          fetchProductAvailability(e.product._id, e.variant._id),
        ),
      );
      const branchMap = new Map<string, string>(); // branchId -> address
      for (const avail of availabilities) {
        if (avail?.branches) {
          for (const branch of avail.branches) {
            if (!branchMap.has(branch.branchId)) {
              branchMap.set(branch.branchId, branch.address);
            }
          }
        }
      }
      const branchList = Array.from(branchMap.entries()).map(
        ([branchId, address]) => ({ branchId, address }),
      );
      const userPoint = await getUserCoordinatesByIp();
      const branchPriority =
        userPoint && branchList.length > 0
          ? await sortBranchesByDistance(branchList, userPoint)
          : branchList.map((b) => b.branchId);

      const newOrder = await createOrderBuyNow({
        listProduct,
        sumPrice: order.sumPrice,
        toAddress: `Street: ${userInfo.streetAddress}, City: ${userInfo.city}`,
        numberPhone: userInfo.numberPhone,
        userName: userInfo.name,
        branchPriority,
      });
      if (!newOrder) {
        throw new Error("order error");
      }
      const newPayment = await createPayment({
        orderId: newOrder._id,
        method: order.method,
        couponCode: couponCode || undefined,
      });
      if (!newPayment) {
        throw new Error("create payment error");
      }
      window.location.href = newPayment;
    } catch (err: any) {
      const msg: string =
        err?.message ||
        (typeof err === "object" && err !== null
          ? JSON.stringify(err)
          : "Something went wrong");
      setErrorMessage(msg);
      setIsError(true);
      setTimeout(() => {
        setIsError(false);
        setErrorMessage("");
      }, 6000);
    }
  };

  // Run once on mount: populate the Redux order with the products passed from the cart page.
  useEffect(() => {
    dispatch(updateOrder({ field: "listProduct", value: products }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <PageTransition>
      <main
        className="flex flex-col lg:flex-row justify-between gap-8 px-4 sm:px-6 md:px-8 lg:px-(--horizontal-padding) py-8 lg:py-20"
        style={
          {
            "--horizontal-padding": `${HORIZONTAL_PADDING_REM}rem`,
          } as React.CSSProperties
        }
      >
        <BillingDetails BillingInputData={BillingInputData} />
        <section className="w-full lg:w-[40%] mt-8 lg:mt-24 text-black space-y-4">
          <OrderSummary
            couponDiscount={couponDiscount}
            couponCode={couponCode}
          />
          <CouponCode
            onApply={handleCouponApply}
            orderTotal={order.sumPrice}
            items={couponItems}
          />
          {/* ACTION */}
          <CommonButton
            disable={disable}
            label="Place Order"
            onClick={() => {
              handleBuyNow();
            }}
            className="w-full"
          />
          {isError && (
            <p className="text-red-500 text-right text-sm">
              {errorMessage || "Something went wrong, please try again."}
            </p>
          )}
        </section>
      </main>
    </PageTransition>
  );
};

export default CheckoutPage;
