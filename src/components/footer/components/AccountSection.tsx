import { useI18n } from "../../../contexts/I18nContext";
import { AppRoutes } from "../../../navigation";

const AccountSection = () => {
  const i18n = useI18n();

  return (
    <section
      className="flex-1 md:flex-none md:max-w-40 flex flex-col gap-2 items-start"
      aria-labelledby="footer-account-heading"
    >
      <h3
        id="footer-account-heading"
        className="text-lg md:text-xl font-medium text-white pb-2"
      >
        {i18n.t("Account")}
      </h3>
      <nav aria-label={i18n.t("Account links") as string} className="contents">
        <ul className="list-none m-0 p-0 flex flex-col gap-2 items-start">
          <li>
            <a
              href={AppRoutes.ACCOUNT}
              className="text-sm !font-normal !text-white !hover:underline hover:!text-white visited:!text-white"
            >
              {i18n.t("My Account")}
            </a>
          </li>
          <li>
            <a
              href={AppRoutes.LOGIN}
              className="text-sm !font-normal !text-white !hover:underline hover:!text-white visited:!text-white"
            >
              {i18n.t("Login / Register")}
            </a>
          </li>
          <li>
            <a
              href={AppRoutes.CART}
              className="text-sm !font-normal !text-white !hover:underline hover:!text-white visited:!text-white"
            >
              {i18n.t("Cart")}
            </a>
          </li>
          <li>
            <a
              href={AppRoutes.WISHLIST}
              className="text-sm !font-normal !text-white !hover:underline hover:!text-white visited:!text-white"
            >
              {i18n.t("Wishlist")}
            </a>
          </li>
          <li>
            <a
              href={AppRoutes.HOME}
              className="text-sm !font-normal !text-white !hover:underline hover:!text-white visited:!text-white"
            >
              {i18n.t("Shop")}
            </a>
          </li>
        </ul>
      </nav>
    </section>
  );
};

export default AccountSection;
