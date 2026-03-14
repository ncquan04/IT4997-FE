import PageTransition from "../../components/common/PageTransition";
import CommonButton from "../../components/common/CommonButton";
import { useI18n } from "../../contexts/I18nContext";

const NotFoundPage = () => {
  const i18n = useI18n();

  const handleGoHome = () => {
    window.location.href = "/";
  };

  return (
    <PageTransition>
      <div className="flex flex-1 w-full flex-col gap-8 md:gap-12 lg:gap-16 justify-center items-center px-4 md:px-8 py-8 md:py-12">
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-medium text-black text-center">
          {i18n.t("404 Not Found")}
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-black font-normal text-center max-w-md md:max-w-lg px-4">
          {i18n.t(
            "Your visited page not found. You may go back to the homepage."
          )}
        </p>
        <div className="w-full max-w-xs sm:max-w-sm md:w-auto px-4">
          <CommonButton
            label={i18n.t("Back to Home Page")}
            onClick={handleGoHome}
            style={{ width: 254, height: 56 }}
          />
        </div>
      </div>
    </PageTransition>
  );
};

export default NotFoundPage;
