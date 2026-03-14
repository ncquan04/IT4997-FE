import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HORIZONTAL_PADDING_REM } from "../../constants";
import { useI18n } from "../../contexts/I18nContext";
import ItemCard from "./components/ItemCard";
import CommonButton from "../../components/common/CommonButton";
import CouponCode from "./components/CouponCode";
import CartTotal from "./components/CartTotal";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import cartAsync from "../../redux/async-thunk/cart.thunk";

const CartPage = () => {
  const i18n = useI18n();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { cartItems, totalPrice, isLoading } = useAppSelector(
    (state) => state.cart
  );

  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    dispatch(cartAsync.fetchCart());
  }, [dispatch]);

  const handleReturnToShop = () => {
    navigate("/");
  };

  // const handleUpdateCart = () => {
  //   dispatch(cartAsync.fetchCart());
  // };

  if (!isLoading && cartItems.length === 0) {
    return (
      <main
        className="flex flex-col items-center justify-center gap-8 px-4 md:px-8 lg:px-(--horizontal-padding) py-16"
        style={
          {
            "--horizontal-padding": `${HORIZONTAL_PADDING_REM}rem`,
          } as React.CSSProperties
        }
      >
        <span className="text-2xl font-medium text-text2">
          {i18n.t("Nothing in cart")}
        </span>
        <div className="w-[218px] h-[56px]">
          <CommonButton label="Return To Shop" onClick={handleReturnToShop} />
        </div>
      </main>
    );
  }

  return (
    <main
      className="flex flex-col gap-16 px-4 md:px-8 lg:px-(--horizontal-padding)"
      style={
        {
          "--horizontal-padding": `${HORIZONTAL_PADDING_REM}rem`,
        } as React.CSSProperties
      }
    >
      <section className="flex flex-col gap-4" aria-label="Cart Items">
        <div className="hidden md:flex flex-row min-h-[72px] justify-between items-center px-8 py-4 shadow-sm rounded-lg">
          <div className="w-4/12 flex justify-start">
            <span className="text-base font-normal text-text2">
              {i18n.t("Product")}
            </span>
          </div>
          <div className="w-2/12 flex justify-center">
            <span className="text-base font-normal text-text2">
              {i18n.t("Price")}
            </span>
          </div>
          <div className="w-3/12 flex justify-center">
            <span className="text-base font-normal text-text2">
              {i18n.t("Quantity")}
            </span>
          </div>
          <div className="w-2/12 flex justify-end">
            <span className="text-base font-normal text-text2">
              {i18n.t("Subtotal")}
            </span>
          </div>
          <div className="w-1/12 flex justify-end"></div>
        </div>
        {isLoading && cartItems.length === 0 ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          cartItems.map((item) => (
            <ItemCard
              key={`${item.product._id}-${item.product.selectedVariant?._id}`}
              item={item}
            />
          ))
        )}

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
          <div className="w-full md:w-[218px] h-[56px]">
            <CommonButton
              label="Return To Shop"
              onClick={handleReturnToShop}
              transparentBg
            />
          </div>
          {/* <div className="w-full md:w-[218px] h-[56px]">
            <CommonButton
              label="Update Cart"
              onClick={handleUpdateCart}
              transparentBg
            />
          </div> */}
        </div>
      </section>

      <div className="flex flex-col lg:flex-row justify-between gap-8 lg:gap-0 items-center lg:items-start">
        <CouponCode setDiscount={setDiscount} />
        <CartTotal total={totalPrice} discount={discount} />
      </div>
    </main>
  );
};

export default CartPage;
