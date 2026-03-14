import type { Dispatch, SetStateAction } from "react";
import { useI18n } from "../../../contexts/I18nContext";
import CommonButton from "../../../components/common/CommonButton";

const CouponCode = ({
  setDiscount,
}: {
  setDiscount: Dispatch<SetStateAction<number>>;
}) => {
  const i18n = useI18n();

  const handleApplyCoupon = () => {
    // get sale
  };

  return (
    <form
      className="flex flex-col sm:flex-row gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        handleApplyCoupon();
      }}
    >
      <input
        type="text"
        placeholder="Coupon Code"
        className="w-full sm:w-[300px] h-[56px] border border-[#00000033] rounded-md px-4 py-2 text-text2"
      />
      <div className="w-full sm:w-[211px] h-[56px]">
        <CommonButton label="Apply" onClick={() => {}} type="submit" />
      </div>
    </form>
  );
};

export default CouponCode;
