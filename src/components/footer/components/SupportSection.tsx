import { useI18n } from "../../../contexts/I18nContext";

const SupportSection = () => {
  const i18n = useI18n();

  return (
    <section
      className="flex-1 md:flex-none md:max-w-40 flex flex-col gap-2 items-start"
      aria-labelledby="footer-support-heading"
    >
      <h3
        id="footer-support-heading"
        className="text-lg md:text-xl font-medium text-white pb-2"
      >
        {i18n.t("Support")}
      </h3>
      <address className="not-italic">
        <div className="flex flex-col gap-2 m-0 p-0">
          <p className="text-sm font-normal text-white">
            {i18n.t("No. 1 Dai Co Viet, Hai Ba Trung, Hanoi")}
          </p>
          <a
            href="mailto:apex@gmail.com"
            className="text-sm !font-normal !text-white !hover:underline hover:!text-white visited:!text-white"
            aria-label="Send email to apex@gmail.com"
          >
            apex@gmail.com
          </a>
          <a
            href="tel:+84123456789"
            className="text-sm !font-normal !text-white !hover:underline hover:!text-white visited:!text-white"
            aria-label="Call +84 123 456 789"
          >
            +84 123 456 789
          </a>
        </div>
      </address>
    </section>
  );
};

export default SupportSection;
