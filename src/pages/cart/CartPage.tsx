import { useEffect } from "react";
import PageTransition from "../../components/common/PageTransition";
import { useNavigate } from "react-router-dom";
import { HORIZONTAL_PADDING_REM } from "../../constants";
import { useI18n } from "../../contexts/I18nContext";
import ItemCard from "./components/ItemCard";
import CommonButton from "../../components/common/CommonButton";
import CartTotal from "./components/CartTotal";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import cartAsync from "../../redux/async-thunk/cart.thunk";
import { logEvent } from "../../utils/analytics";

const CartPage = () => {
  const i18n = useI18n();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { cartItems, totalPrice, isLoading } = useAppSelector(
    (state) => state.cart,
  );

  useEffect(() => {
    dispatch(cartAsync.fetchCart());
  }, [dispatch]);

  useEffect(() => {
    if (!isLoading && cartItems.length > 0) {
      logEvent("view_cart", {
        itemCount: cartItems.length,
        totalPrice,
        items: cartItems.slice(0, 10).map((ci) => ({
          productId: ci.product._id,
          title: ci.product.title,
          quantity: ci.quantity,
        })),
      });
    }
  }, [isLoading, cartItems.length]);

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
    <PageTransition>
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

      <div className="flex flex-col lg:flex-row-reverse justify-between gap-8 lg:gap-0 items-center lg:items-start">
        <CartTotal total={totalPrice} />
      </div>
    </main>
    </PageTransition>
  );
};

export default CartPage;
