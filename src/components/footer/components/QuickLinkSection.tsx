import { useI18n } from "../../../contexts/I18nContext";
import { AppRoutes } from "../../../navigation";

const QuickLinkSection = () => {
  const i18n = useI18n();

  return (
    <section
      className="flex-1 md:flex-none md:max-w-40 flex flex-col gap-2 items-start"
      aria-labelledby="footer-quick-links-heading"
    >
      <h3
        id="footer-quick-links-heading"
        className="text-lg md:text-xl font-medium text-white pb-2"
      >
        {i18n.t("Quick Link")}
      </h3>
      <nav aria-label={i18n.t("Quick links") as string} className="contents">
        <ul className="list-none m-0 p-0 flex flex-col gap-2 items-start">
          <li>
            <a
              href={AppRoutes.PRIVACY_POLICY}
              className="text-sm !font-normal !text-white !hover:underline hover:!text-white visited:!text-white"
            >
              {i18n.t("Privacy Policy")}
            </a>
          </li>
          <li>
            <a
              href={AppRoutes.TERMS_OF_USE}
              className="text-sm !font-normal !text-white !hover:underline hover:!text-white visited:!text-white"
            >
              {i18n.t("Terms of Use")}
            </a>
          </li>
          <li>
            <a
              href={AppRoutes.FAQ}
              className="text-sm !font-normal !text-white !hover:underline hover:!text-white visited:!text-white"
            >
              {i18n.t("FAQ")}
            </a>
          </li>
          <li>
            <a
              href={AppRoutes.CONTACT}
              className="text-sm !font-normal !text-white !hover:underline hover:!text-white visited:!text-white"
            >
              {i18n.t("Contact")}
            </a>
          </li>
        </ul>
      </nav>
    </section>
  );
};

export default QuickLinkSection;
