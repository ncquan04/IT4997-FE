import { useI18n } from "../../../contexts/I18nContext";
import DeliveryIcon from "../../../icons/DeliveryIcon";
import ReturnIcon from "../../../icons/ReturnIcon";

const ProductOfferInfo = () => {
  const i18n = useI18n();

  return (
    <aside
      className="w-full flex flex-col gap-2 py-3 md:py-4 border-[1px] border-[#00000033] rounded-sm"
      aria-label="Product offers"
    >
      <div className="flex flex-row gap-3 md:gap-4 px-3 md:px-4 items-center">
        <DeliveryIcon
          width={32}
          height={32}
          stroke="#000"
          aria-hidden="true"
          className="sm:w-10 sm:h-10 shrink-0"
        />
        <div className="flex flex-col gap-1 md:gap-2">
          <strong className="text-sm md:text-base font-medium text-black">
            {i18n.t("Free Delivery")}
          </strong>
          <p className="text-[11px] md:text-[12px] font-medium text-black">
            {i18n.t("Enter your postal code for Delivery Availability")}
          </p>
        </div>
      </div>
      <hr className="w-full h-[1px] bg-[#00000033] border-0" />
      <div className="flex flex-row gap-3 md:gap-4 px-3 md:px-4 items-center">
        <ReturnIcon
          width={32}
          height={32}
          stroke="#000"
          aria-hidden="true"
          className="sm:w-10 sm:h-10 shrink-0"
        />
        <div className="flex flex-col gap-1 md:gap-2">
          <strong className="text-sm md:text-base font-medium text-black">
            {i18n.t("Return Delivery")}
          </strong>
          <p className="text-[11px] md:text-[12px] font-medium text-black">
            {i18n.t("Free 30 Days Delivery Returns")}
          </p>
        </div>
      </div>
    </aside>
  );
};

export default ProductOfferInfo;
