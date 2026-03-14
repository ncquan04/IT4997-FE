import { useI18n } from "../../contexts/I18nContext";

interface CommonButtonProps {
    label?: string;
    onClick: () => void;
    style?: React.CSSProperties;
    type?: "button" | "submit" | "reset";
    transparentBg?: boolean;
    className?: string;
    disable?: boolean;
}

const CommonButton = (props: CommonButtonProps) => {
    const i18n = useI18n();

    return (
        <button
            disabled={props.disable}
            className={`w-full h-14 rounded-lg transition
              ${
                  props.transparentBg
                      ? "bg-transparent border border-[#00000033] text-black"
                      : "bg-button2 text-white"
              }
              ${
                  props.disable
                      ? "disabled:bg-gray-300 disabled:text-gray-500 cursor-not-allowed"
                      : "hover:bg-hoverButton cursor-pointer"
              }
              ${props.className ?? ""}
            `}
            onClick={props.onClick}
            style={props.style}
            type={props.type ?? "button"}
        >
            {i18n.t(props.label ?? "Continue")}
        </button>
    );
};

export default CommonButton;
