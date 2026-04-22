import { Link } from "react-router-dom";
import CommonButton from "../../../components/common/CommonButton";
import { useI18n } from "../../../contexts/I18nContext";
import { AppRoutes } from "../../../navigation";

interface ActionSectionProps {
  action: "login" | "signup";
  variant?: "card" | "desktop";
  handleSignUp: () => void;
  handleLogIn: () => void;
}

const ActionSection = (props: ActionSectionProps) => {
  const i18n = useI18n();
  const isCard = props.variant === "card";

  if (props.action === "login") {
    return (
      <div
        className={
          isCard
            ? "flex flex-col gap-3"
            : "w-full flex flex-row gap-4 justify-between items-center"
        }
      >
        <CommonButton
          label={i18n.t("Log In")}
          onClick={props.handleLogIn}
          type="submit"
          style={{ width: isCard ? "100%" : "40%" }}
        />
        {isCard ? (
          <div className="flex items-center justify-between text-sm">
            <p className="text-gray-500">
              {i18n.t("New to Apex?")}{" "}
              <Link
                to={AppRoutes.SIGNUP}
                className="text-button2 font-medium hover:underline"
              >
                {i18n.t("Sign up")}
              </Link>
            </p>
            <Link to="/" className="text-button2 hover:underline">
              {i18n.t("Forgot Password?")}
            </Link>
          </div>
        ) : (
          <nav aria-label="Password recovery">
            <Link to="/" className="text-base text-button2 cursor-pointer">
              {i18n.t("Forgot Password?")}
            </Link>
          </nav>
        )}
      </div>
    );
  } else {
    return (
      <div
        className={
          isCard
            ? "flex flex-col gap-3"
            : "w-full flex flex-col gap-4 items-center"
        }
      >
        <CommonButton
          label={i18n.t("Create Account")}
          onClick={props.handleSignUp}
          type="submit"
          style={isCard ? { width: "100%" } : undefined}
        />
        <p
          className={
            isCard
              ? "text-sm text-center text-gray-500"
              : "text-base text-text2"
          }
        >
          {i18n.t("Already have an account?")}{" "}
          <Link
            to={AppRoutes.LOGIN}
            className={
              isCard
                ? "text-button2 font-medium hover:underline"
                : "text-text2 underline cursor-pointer"
            }
          >
            {i18n.t("Log In")}
          </Link>
        </p>
      </div>
    );
  }
};

export default ActionSection;
