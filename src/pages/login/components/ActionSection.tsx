import { Link } from "react-router-dom";
import CommonButton from "../../../components/common/CommonButton";
import { useI18n } from "../../../contexts/I18nContext";
import { AppRoutes } from "../../../navigation";

interface ActionSectionProps {
  action: "login" | "signup";
  handleSignUp: () => void;
  handleLogIn: () => void;
}

const ActionSection = (props: ActionSectionProps) => {
  const i18n = useI18n();

  if (props.action === "login") {
    return (
      <div className="w-full flex flex-row gap-4 justify-between items-center">
        <CommonButton
          label={i18n.t("Log In")}
          onClick={props.handleLogIn}
          type="submit"
          style={{ width: "40%" }}
        />
        <nav aria-label="Password recovery">
          <Link to="/" className="text-base text-button2 cursor-pointer">
            {i18n.t("Forgot Password?")}
          </Link>
        </nav>
      </div>
    );
  } else {
    return (
      <div className="w-full flex flex-col gap-4 items-center">
        <CommonButton
          label={i18n.t("Create Account")}
          onClick={props.handleSignUp}
          type="submit"
        />
        <p className="text-base text-text2">
          {i18n.t("Already have an account?")}{" "}
          <Link
            to={AppRoutes.LOGIN}
            className="text-text2 underline cursor-pointer"
          >
            {i18n.t("Log In")}
          </Link>
        </p>
      </div>
    );
  }
};

export default ActionSection;
