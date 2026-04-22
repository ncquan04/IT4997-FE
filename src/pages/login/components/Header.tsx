import { useI18n } from "../../../contexts/I18nContext";
import { Link } from "react-router-dom";
import { AppRoutes } from "../../../navigation";

interface HeaderProps {
  action: "login" | "signup";
  variant?: "card" | "desktop";
}

const Header = ({ action, variant = "desktop" }: HeaderProps) => {
  const i18n = useI18n();
  const isCard = variant === "card";

  return (
    <header
      className={`w-full flex flex-col gap-2 ${isCard ? "text-center" : ""}`}
    >
      {!isCard && (
        <div className="flex flex-row justify-between items-baseline">
          <h1
            id="auth-heading"
            className="text-[32px] font-semibold text-black"
          >
            {i18n.t(
              action === "login" ? "Log in to Apex" : "Create an account",
            )}
          </h1>
          {action === "login" && (
            <p className="text-sm text-gray-600">
              {i18n.t("New to Apex?")}{" "}
              <Link
                to={AppRoutes.SIGNUP}
                className="text-button2 font-medium hover:underline"
              >
                {i18n.t("Sign up")}
              </Link>
            </p>
          )}
        </div>
      )}
      {isCard && (
        <h1 id="auth-heading" className="text-2xl font-semibold text-gray-900">
          {i18n.t(action === "login" ? "Log in to Apex" : "Create an account")}
        </h1>
      )}
      <p
        className={`${isCard ? "text-sm text-gray-500" : "text-base text-gray-600"}`}
      >
        {i18n.t("Enter your details below")}
      </p>
    </header>
  );
};

export default Header;
