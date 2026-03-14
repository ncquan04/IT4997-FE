import { useI18n } from "../../../contexts/I18nContext";
import { Link } from "react-router-dom";
import { AppRoutes } from "../../../navigation";

interface HeaderProps {
  action: "login" | "signup";
}

const Header = (props: HeaderProps) => {
  const i18n = useI18n();

  return (
    <header className="w-full h-auto flex flex-col gap-2">
      <div className="flex flex-row justify-between items-baseline">
        <h1 id="auth-heading" className="text-[32px] font-semibold text-black">
          {i18n.t(
            props.action === "login" ? "Log in to Apex" : "Create an account"
          )}
        </h1>
        {props.action === "login" && (
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
      <p className="text-base text-gray-600">
        {i18n.t("Enter your details below")}
      </p>
    </header>
  );
};

export default Header;
