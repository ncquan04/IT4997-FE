import { useNavigate } from "react-router-dom";
import CommonButton from "../../../components/common/CommonButton";
import { useI18n } from "../../../contexts/I18nContext";
import { formatPrice } from "../../../utils";

const CartTotal = ({
  total,
  discount,
}: {
  total: number;
  discount: number;
}) => {
  const i18n = useI18n();
  const navigate = useNavigate();

  const handleProceedToCheckout = () => {
    navigate("/checkout");
  };

  return (
    <section
      className="w-full md:w-[470px] flex flex-col gap-8 px-6 py-4 border border-[#00000033] rounded-lg"
      aria-label="Cart Summary"
    >
      <h2 className="text-xl font-medium text-text2">{i18n.t("Cart Total")}</h2>
      <div className="flex flex-col gap-4">
        <div className="flex flex-row justify-between items-center">
          <span className="text-base font-normal text-text2">
            {i18n.t("Subtotal")}
          </span>
          <span className="text-base font-normal text-text2">
            {formatPrice(total)}
          </span>
        </div>
        <div className="w-full h-px bg-[#00000033]" />
        <div className="flex flex-row justify-between items-center">
          <span className="text-base font-normal text-text2">
            {i18n.t("Discount")}
          </span>
          <span className="text-base font-normal text-text2">
            {formatPrice(total * (discount / 100))}
          </span>
        </div>
        <div className="w-full h-px bg-[#00000033]" />
        <div className="flex flex-row justify-between items-center">
          <span className="text-base font-normal text-text2">
            {i18n.t("Total")}
          </span>
          <span className="text-base font-normal text-text2">
            {formatPrice(total - total * (discount / 100))}
          </span>
        </div>
      </div>
      <div className="w-full md:w-[260px] h-[56px] self-center">
        <CommonButton
          label="Proceed to Checkout"
          onClick={handleProceedToCheckout}
        />
      </div>
    </section>
  );
};

export default CartTotal;
