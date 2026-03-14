import { useAppDispatch, useAppSelector, type RootState } from "../../../redux/store";
import { updateUserInfo, type UserInfoType } from "../../../redux/slice/payment.slice";
import InputBilling, { type IInputBillingProps } from "./inputBilling";

const BillingDetails = ({
    BillingInputData,
}: {
    BillingInputData: (IInputBillingProps & { key?: UserInfoType })[];
}) => {
    const dispatch = useAppDispatch();
    const payment = useAppSelector((state: RootState) => state.payment);
    return (
        <section className="flex flex-col gap-8 w-full lg:w-[40%] text-black">
            <h2 className="text-2xl md:text-4xl font-medium tracking-wide">Billing Details</h2>
            <div className="flex flex-col gap-6">
                {BillingInputData.map(({ label, isRequired, key, type }, idx) => {
                    const inputValue = key ? payment.userInfo?.[key] : undefined;
                    return (
                        <InputBilling
                            key={idx}
                            label={label}
                            input={inputValue}
                            type={type}
                            isRequired={isRequired}
                            onClickOutSide={(e) => {
                                if (key) {
                                    dispatch(updateUserInfo({ field: key, value: e }));
                                }
                            }}
                        />
                    );
                })}
            </div>
        </section>
    );
};

export default BillingDetails;
