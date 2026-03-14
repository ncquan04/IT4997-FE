import LeftArrowIcon from "../../../icons/LeftArrowIcon";
import RightArrowIcon from "../../../icons/RightArrowIcon";

interface LeftRightNavigatorProps {
    onLeftClick: () => void;
    onRightClick: () => void;
}

const LeftRightNavigator = ({
    onLeftClick,
    onRightClick,
}: LeftRightNavigatorProps) => {
    return (
        <nav className="flex flex-row gap-2" aria-label="Slider navigation">
            <button
                onClick={onLeftClick}
                className="w-10 h-10 md:w-12 md:h-12 bg-secondary rounded-full flex justify-center items-center hover:bg-gray-300 hover:cursor-pointer border-0"
                aria-label="Previous slide"
            >
                <LeftArrowIcon />
            </button>
            <button
                onClick={onRightClick}
                className="w-10 h-10 md:w-12 md:h-12 bg-secondary rounded-full flex justify-center items-center hover:bg-gray-300 hover:cursor-pointer border-0"
                aria-label="Next slide"
            >
                <RightArrowIcon />
            </button>
        </nav>
    )
}

export default LeftRightNavigator;